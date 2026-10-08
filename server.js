import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3333;
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp' : __dirname;
const EVENTS_FILE = path.join(DATA_DIR, 'attendance_events.json');
const STATE_FILE = path.join(DATA_DIR, 'attendance_state.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// -------------------------------------------------------------------------
// PERSISTENT DATA LAYER (ATOMIC SAFE WRITES)
// -------------------------------------------------------------------------
function atomicWriteJson(filePath, data) {
  const tempPath = filePath + '.tmp.' + Date.now() + Math.random().toString(36).substring(2, 6);
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

function safeReadJson(filePath, defaultVal) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (content) return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[Server DB] Failed to read ${filePath}:`, err);
  }
  return defaultVal;
}

// Deterministic token helper matching client
function deterministicToken(index, teamId) {
  let hash = 0x811c9dc5;
  const str = `meodl_official_2026_${teamId}_student_${index}_secure`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const hex1 = ('00000000' + hash.toString(16)).slice(-8);
  const hex2 = ('00000000' + (hash ^ 0x5a5a5a5a).toString(16)).slice(-8);
  const hex3 = ('00000000' + (hash ^ 0xa5a5a5a5).toString(16)).slice(-8);
  const hex4 = ('00000000' + (hash ^ 0x3c3c3c3c).toString(16)).slice(-8);
  return `tok_${hex1}${hex2}${hex3}${hex4}`;
}

// Generate default 175 registered students from assets/meodl_data.js
function buildDefaultStudentsRoster() {
  const dataPath = path.join(__dirname, 'assets', 'meodl_data.js');
  let rosters = {};
  let teams = [
    { id: 'rankine', name: 'TEAM RANKINE' },
    { id: 'otto', name: 'TEAM OTTO' },
    { id: 'brayton', name: 'TEAM BRAYTON' },
    { id: 'diesel', name: 'TEAM DIESEL' }
  ];

  try {
    if (fs.existsSync(dataPath)) {
      const code = fs.readFileSync(dataPath, 'utf8');
      const sandbox = { window: {} };
      sandbox.window = sandbox;
      vm.runInNewContext(code, sandbox);
      if (sandbox.MEODL_DATA && sandbox.MEODL_DATA.rosters) {
        rosters = sandbox.MEODL_DATA.rosters;
      }
      if (sandbox.MEODL_DATA && sandbox.MEODL_DATA.teams) {
        teams = sandbox.MEODL_DATA.teams;
      }
    }
  } catch (err) {
    console.warn('[Server DB] Could not extract rosters from meodl_data.js, using fallback structure.', err);
  }

  const students = {};
  let studentIndex = 1;

  teams.forEach(team => {
    const members = rosters[team.id.toUpperCase()] || [];
    members.forEach(name => {
      const code = 'MEODL-' + String(studentIndex).padStart(4, '0');
      const id = 'student-' + String(studentIndex).padStart(4, '0');
      const token = deterministicToken(studentIndex, team.id);

      students[id] = {
        id: id,
        name: name,
        team: team.id,
        teamName: team.name,
        studentCode: code,
        activeToken: token,
        revokedTokens: [],
        status: 'OUTSIDE',
        currentAction: null,
        lastCheckIn: null,
        lastCheckOut: null,
        exitReason: null,
        expectedReturn: null,
        totalVisits: 0,
        totalMinutesInside: 0,
        history: []
      };
      studentIndex++;
    });
  });

  return students;
}

// In-memory working state
let attendanceEvents = safeReadJson(EVENTS_FILE, safeReadJson(path.join(__dirname, 'attendance_events.json'), []));
let attendanceEventsMap = new Map();
attendanceEvents.forEach(ev => {
  if (ev && ev.eventId) attendanceEventsMap.set(ev.eventId, ev);
});

let attendanceState = safeReadJson(STATE_FILE, safeReadJson(path.join(__dirname, 'attendance_state.json'), null));
if (!attendanceState || !attendanceState.students || Object.keys(attendanceState.students).length === 0) {
  attendanceState = {
    students: buildDefaultStudentsRoster(),
    version: 1,
    lastUpdated: new Date().toISOString()
  };
  atomicWriteJson(STATE_FILE, attendanceState);
}

// Deterministic event ordering comparator
function compareEvents(a, b) {
  const timeA = new Date(a.occurredAt || 0).getTime();
  const timeB = new Date(b.occurredAt || 0).getTime();
  if (timeA !== timeB) return timeA - timeB;

  if (a.deviceId && a.deviceId === b.deviceId && typeof a.localSequence === 'number' && typeof b.localSequence === 'number') {
    return a.localSequence - b.localSequence;
  }

  const createdA = new Date(a.createdAt || a.occurredAt || 0).getTime();
  const createdB = new Date(b.createdAt || b.occurredAt || 0).getTime();
  if (createdA !== createdB) return createdA - createdB;

  return String(a.eventId || '').localeCompare(String(b.eventId || ''));
}

// Deterministic student status derivation from events
function rederiveStudentState(student, studentEvents) {
  const sorted = studentEvents.slice().sort(compareEvents);
  const updated = {
    ...student,
    status: 'OUTSIDE',
    currentAction: null,
    lastCheckIn: null,
    lastCheckOut: null,
    exitReason: null,
    expectedReturn: null,
    totalVisits: 0,
    totalMinutesInside: 0,
    history: []
  };

  let currentCheckInTime = null;

  for (const ev of sorted) {
    const action = String(ev.action || '').toLowerCase();
    const timeStr = new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'check_in') {
      updated.status = 'INSIDE';
      updated.lastCheckIn = ev.occurredAt;
      updated.exitReason = null;
      updated.expectedReturn = null;
      updated.totalVisits = (updated.totalVisits || 0) + 1;
      currentCheckInTime = new Date(ev.occurredAt);

      updated.history.push({
        eventId: ev.eventId,
        action: 'check_in',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        method: ev.method || 'qr_scan',
        performedBy: ev.marshalId || 'Marshal',
        deviceId: ev.deviceId
      });
    } else if (action === 'check_out') {
      updated.status = 'OUTSIDE';
      updated.lastCheckOut = ev.occurredAt;
      updated.exitReason = ev.reason || 'Not specified';
      updated.expectedReturn = ev.expectedReturn || null;

      if (currentCheckInTime) {
        const diffMs = new Date(ev.occurredAt) - currentCheckInTime;
        const mins = Math.max(1, Math.round(diffMs / 60000));
        updated.totalMinutesInside = (updated.totalMinutesInside || 0) + mins;
        currentCheckInTime = null;
      }

      updated.history.push({
        eventId: ev.eventId,
        action: 'check_out',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        reason: ev.reason,
        expectedReturn: ev.expectedReturn,
        method: ev.method || 'qr_scan',
        performedBy: ev.marshalId || 'Marshal',
        deviceId: ev.deviceId
      });
    } else if (action === 'manual_override') {
      const target = (ev.newStatus || ev.status || 'INSIDE').toUpperCase();
      updated.status = target;
      if (target === 'INSIDE') {
        updated.lastCheckIn = ev.occurredAt;
        updated.exitReason = null;
        updated.expectedReturn = null;
      } else {
        updated.lastCheckOut = ev.occurredAt;
        updated.exitReason = ev.reason || 'Manual override';
      }
      updated.history.push({
        eventId: ev.eventId,
        action: 'manual_override',
        status: target,
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        method: 'manual',
        performedBy: ev.marshalId || 'Admin',
        deviceId: ev.deviceId
      });
    }

    updated.lastEventId = ev.eventId;
    updated.lastAction = action;
    updated.currentAction = action;
    updated.lastOccurredAt = ev.occurredAt;
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

// Compute live metrics
function calculateAttendanceStats() {
  const all = Object.values(attendanceState.students || {});
  const total = all.length;
  let inside = 0;
  let outside = 0;
  let overdue = 0;

  const byTeam = {
    rankine: { name: 'TEAM RANKINE', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#ef4444' },
    otto: { name: 'TEAM OTTO', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#f59e0b' },
    brayton: { name: 'TEAM BRAYTON', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#06b6d4' },
    diesel: { name: 'TEAM DIESEL', total: 0, inside: 0, outside: 0, overdue: 0, hex: '#10b981' }
  };

  const now = new Date();

  all.forEach(s => {
    const t = byTeam[s.team] || byTeam['rankine'];
    t.total++;

    let isOver = false;
    if (s.status === 'OUTSIDE' && s.expectedReturn) {
      if (/^\d{1,2}:\d{2}$/.test(s.expectedReturn)) {
        const [h, m] = s.expectedReturn.split(':').map(Number);
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
        isOver = now > target;
      } else {
        const parsed = new Date(s.expectedReturn);
        if (!isNaN(parsed.getTime())) isOver = now > parsed;
      }
    }

    if (isOver) {
      overdue++;
      t.overdue++;
    }

    if (s.status === 'INSIDE') {
      inside++;
      t.inside++;
    } else {
      outside++;
      t.outside++;
    }
  });

  return { total, inside, outside, overdue, byTeam };
}

// Helper: send JSON with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// Helper: read request body
function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) {}
  }
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// -------------------------------------------------------------------------
// HTTP SERVER & ROUTING
// -------------------------------------------------------------------------
export async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const [reqPath, queryString] = req.url.split('?');
  const urlParams = new URLSearchParams(queryString || '');

  // -----------------------------------------------------------------------
  // ATTENDANCE API ENDPOINTS
  // -----------------------------------------------------------------------
  if (reqPath === '/api/attendance/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      eventsCount: attendanceEvents.length,
      totalStudents: Object.keys(attendanceState.students || {}).length
    });
  }

  if (reqPath === '/api/attendance/state' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      students: attendanceState.students,
      stats: calculateAttendanceStats(),
      version: attendanceState.version || 1,
      lastUpdated: attendanceState.lastUpdated
    });
  }

  if (reqPath === '/api/attendance/events' && req.method === 'GET') {
    const since = urlParams.get('since');
    let results = attendanceEvents;
    if (since) {
      const sinceDate = new Date(since).getTime();
      if (!isNaN(sinceDate)) {
        results = attendanceEvents.filter(e => new Date(e.occurredAt || 0).getTime() > sinceDate);
      }
    }
    const limit = parseInt(urlParams.get('limit') || '500', 10);
    if (results.length > limit) {
      results = results.slice(-limit);
    }
    return sendJson(res, 200, {
      ok: true,
      events: results,
      total: attendanceEvents.length,
      serverTime: new Date().toISOString()
    });
  }

  if (reqPath === '/api/attendance/sync' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const incoming = Array.isArray(payload.events) ? payload.events : [];
      const deviceId = payload.deviceId || 'UNKNOWN_DEVICE';

      const accepted = [];
      const duplicate = [];
      const rejected = [];
      const affectedStudentIds = new Set();

      for (const ev of incoming) {
        if (!ev || typeof ev !== 'object') {
          rejected.push({ eventId: ev?.eventId || 'unknown', reason: 'Invalid event object' });
          continue;
        }

        const eventId = String(ev.eventId || '').trim();
        const studentId = String(ev.studentId || '').trim();
        const action = String(ev.action || '').trim().toLowerCase();

        // Validation
        if (!eventId) {
          rejected.push({ eventId: 'missing', reason: 'Missing eventId' });
          continue;
        }
        if (!studentId || !attendanceState.students[studentId]) {
          rejected.push({ eventId, reason: `Unknown studentId: ${studentId}` });
          continue;
        }
        if (!['check_in', 'check_out', 'manual_override'].includes(action)) {
          rejected.push({ eventId, reason: `Invalid action: ${action}` });
          continue;
        }
        if (!ev.occurredAt || isNaN(new Date(ev.occurredAt).getTime())) {
          rejected.push({ eventId, reason: 'Invalid or missing occurredAt ISO timestamp' });
          continue;
        }

        // Idempotency check
        if (attendanceEventsMap.has(eventId)) {
          duplicate.push(eventId);
          continue;
        }

        // Valid new event
        const normalized = {
          eventId: eventId,
          studentId: studentId,
          action: action,
          occurredAt: new Date(ev.occurredAt).toISOString(),
          deviceId: String(ev.deviceId || deviceId),
          marshalId: String(ev.marshalId || 'Marshal'),
          gateId: String(ev.gateId || 'Main Gate'),
          sessionId: String(ev.sessionId || 'session_default'),
          localSequence: typeof ev.localSequence === 'number' ? ev.localSequence : 0,
          createdAt: ev.createdAt ? new Date(ev.createdAt).toISOString() : new Date().toISOString(),
          reason: ev.reason || null,
          expectedReturn: ev.expectedReturn || null,
          method: ev.method || 'qr_scan',
          studentName: attendanceState.students[studentId].name,
          studentCode: attendanceState.students[studentId].studentCode,
          team: attendanceState.students[studentId].team
        };

        attendanceEvents.push(normalized);
        attendanceEventsMap.set(eventId, normalized);
        accepted.push(eventId);
        affectedStudentIds.add(studentId);
      }

      // If any events accepted, rederive state for affected students & persist
      if (accepted.length > 0) {
        // Group all events by student for affected students
        affectedStudentIds.forEach(stId => {
          const studentAllEvents = attendanceEvents.filter(e => e.studentId === stId);
          attendanceState.students[stId] = rederiveStudentState(attendanceState.students[stId], studentAllEvents);
        });

        attendanceState.version = (attendanceState.version || 1) + 1;
        attendanceState.lastUpdated = new Date().toISOString();

        // Atomic file writes
        atomicWriteJson(EVENTS_FILE, attendanceEvents);
        atomicWriteJson(STATE_FILE, attendanceState);
      }

      return sendJson(res, 200, {
        ok: true,
        accepted,
        duplicate,
        rejected,
        serverTime: new Date().toISOString(),
        stats: calculateAttendanceStats()
      });
    } catch (err) {
      console.error('[Server Sync Error]:', err);
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/attendance/reset' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (payload.confirmation !== 'RESET_ATTENDANCE') {
        return sendJson(res, 400, { ok: false, error: 'Confirmation required: RESET_ATTENDANCE' });
      }

      attendanceEvents = [];
      attendanceEventsMap.clear();
      attendanceState.students = buildDefaultStudentsRoster();
      attendanceState.version = (attendanceState.version || 1) + 1;
      attendanceState.lastUpdated = new Date().toISOString();

      atomicWriteJson(EVENTS_FILE, attendanceEvents);
      atomicWriteJson(STATE_FILE, attendanceState);

      return sendJson(res, 200, { ok: true, message: 'Attendance reset successful', serverTime: new Date().toISOString() });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // -----------------------------------------------------------------------
  // STATIC ASSETS FILE SERVING (PRESERVED)
  // -----------------------------------------------------------------------
  let normalizedPath = decodeURI(reqPath);
  if (normalizedPath === '/') normalizedPath = '/index.html';

  const safePath = path.normalize(path.join(__dirname, normalizedPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
}

const server = http.createServer(handleRequest);

if (!IS_VERCEL) {
  server.listen(PORT, () => {
    console.log(`MEODL Esports & Attendance Server active on port ${PORT}:`);
    console.log(`  • Localhost:       http://localhost:${PORT}`);
    try {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`  • Mobile (LAN):    http://${iface.address}:${PORT}/scanner.html`);
          }
        }
      }
    } catch(e) {}
  });
}

export default handleRequest;
