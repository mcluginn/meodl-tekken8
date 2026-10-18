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
const ENGDAY_EVENTS_FILE = path.join(DATA_DIR, 'engday_attendance_events.json');
const ENGDAY_STATE_FILE = path.join(DATA_DIR, 'engday_attendance_state.json');

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

function formatManilaTime(dateOrIso, options = {}) {
  if (!dateOrIso) return '--:--';
  const d = (dateOrIso instanceof Date) ? dateOrIso : new Date(dateOrIso);
  if (isNaN(d.getTime())) return String(dateOrIso);
  try {
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    });
  } catch (e) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, ...options });
  }
}

function formatManilaDate(dateOrIso, options = {}) {
  if (!dateOrIso) return '';
  const d = (dateOrIso instanceof Date) ? dateOrIso : new Date(dateOrIso);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options
    });
  } catch (e) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', ...options });
  }
}

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
    { id: 'ee', name: 'TEAM EE', shortCode: 'EE' },
    { id: 'cpe', name: 'TEAM CPE', shortCode: 'CPE' },
    { id: 'ece', name: 'TEAM ECE', shortCode: 'ECE' },
    { id: 'ie', name: 'TEAM IE', shortCode: 'IE' },
    { id: 'ce', name: 'TEAM CE', shortCode: 'CE' }
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
    const teamKey = (team.shortCode || team.id).toUpperCase();
    const members = rosters[teamKey] || rosters[team.id.toUpperCase()] || [];
    members.forEach((item, idx) => {
      const isObj = typeof item === 'object' && item !== null;
      const name = isObj ? item.name : item;
      const code = (isObj && item.code) ? item.code : (teamKey + '-' + String(idx + 1).padStart(3, '0'));
      const id = 'student-' + code.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const token = deterministicToken(studentIndex, team.id);

      students[id] = {
        id: id,
        name: name,
        team: team.id.toLowerCase(),
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

function getBundledJson(relPath, defaultVal) {
  try {
    const p = fileURLToPath(new URL(relPath, import.meta.url));
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {}
  return defaultVal;
}

let attendanceEvents = safeReadJson(EVENTS_FILE, getBundledJson('./attendance_events.json', []));
let attendanceEventsMap = new Map();
attendanceEvents.forEach(ev => {
  if (ev && ev.eventId) attendanceEventsMap.set(ev.eventId, ev);
});

let attendanceState = safeReadJson(STATE_FILE, getBundledJson('./attendance_state.json', null));
if (!attendanceState || !attendanceState.students || Object.keys(attendanceState.students).length === 0) {
  attendanceState = {
    students: buildDefaultStudentsRoster(),
    version: 1,
    lastUpdated: new Date().toISOString()
  };
  try { atomicWriteJson(STATE_FILE, attendanceState); } catch(e) {}
}

// -------------------------------------------------------------------------
// ENGINEERING DAYS 2026 — TRACK A (8 MAJOR GATE CHECKPOINTS)
// UPHSD Calamba • College of Engineering • Oct 19–20, 2026
// -------------------------------------------------------------------------
const SCHEMA_VERSION = '2026.5';
const ENGDAY_GAMES_LIST = [
  'd1-reg',
  'd1-am-block',
  'd1-pm-block',
  'd1-finals',
  'd2-am-palaro',
  'd2-esports',
  'd2-pageant',
  'd2-colorfest'
];

const DEFAULT_ENGDAY_SESSIONS = [
  {
    id: 'd1-reg',
    shortName: 'D1 REG',
    name: 'D1 Morning Registration & Opening Program',
    label: 'D1 Morning Registration & Opening Program',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '7:30 AM – 8:40 AM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'check_in_only',
    allowExit: false
  },
  {
    id: 'd1-am-block',
    shortName: 'D1 AM SPORTS',
    name: 'D1 Morning Sports, Booths & Board Games (WBB, VB, Racket, Chess/Dama)',
    label: 'D1 Morning Sports, Booths & Board Games (WBB, VB, Racket, Chess/Dama)',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '8:40 AM – 1:00 PM',
    court: 'Gymnasium & EE Lab (Rm 115)',
    location: 'Gymnasium & EE Lab (Rm 115)',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd1-pm-block',
    shortName: 'D1 PM BLOCK',
    name: 'D1 Afternoon Sports, Quiz Bee & Valorant',
    label: 'D1 Afternoon Sports, Quiz Bee & Valorant',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '1:00 PM – 5:30 PM',
    court: 'Gymnasium & ECE Lab (Rm 116)',
    location: 'Gymnasium & ECE Lab (Rm 116)',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd1-finals',
    shortName: 'D1 FINALS',
    name: 'D1 Finals Night (Volleyball & Basketball Championships)',
    label: 'D1 Finals Night (Volleyball & Basketball Championships)',
    category: 'Day 1 (Oct 19)',
    sport: 'Day 1 (Oct 19)',
    date: '2026-10-19',
    day: 'Day 1',
    time: '5:30 PM – 8:00 PM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-am-palaro',
    shortName: 'D2 PALARO',
    name: 'D2 Morning Registration, Palarong Pinoy & Booths',
    label: 'D2 Morning Registration, Palarong Pinoy & Booths',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '8:00 AM – 12:00 NN',
    court: 'Gymnasium / Oval',
    location: 'Gymnasium / Oval',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-esports',
    shortName: 'D2 ESPORTS',
    name: 'D2 E-Sports Tournaments (MLBB, CODM, Magic Chess, Tekken)',
    label: 'D2 E-Sports Tournaments (MLBB, CODM, Magic Chess, Tekken)',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '9:30 AM – 2:00 PM',
    court: 'ECE Room & ME Room',
    location: 'ECE Room & ME Room',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-pageant',
    shortName: 'D2 PAGEANT',
    name: 'D2 Pageant Screening',
    label: 'D2 Pageant Screening',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '1:00 PM – 3:00 PM',
    court: 'Room 218',
    location: 'Room 218',
    mode: 'entry_exit',
    allowExit: true
  },
  {
    id: 'd2-colorfest',
    shortName: 'D2 COLORFEST',
    name: 'D2 College Hours, Awarding & Colorfest / Rave',
    label: 'D2 College Hours, Awarding & Colorfest / Rave',
    category: 'Day 2 (Oct 20)',
    sport: 'Day 2 (Oct 20)',
    date: '2026-10-20',
    day: 'Day 2',
    time: '3:00 PM – 8:00 PM',
    court: 'Gymnasium',
    location: 'Gymnasium',
    mode: 'entry_exit',
    allowExit: true
  }
];

function buildDefaultEngDayRoster(sessionIds = ENGDAY_GAMES_LIST) {
  const baseStudents = buildDefaultStudentsRoster();
  const students = {};
  for (const [id, s] of Object.entries(baseStudents)) {
    const gm = {};
    sessionIds.forEach(g => {
      gm[g] = {
        gameId: g,
        status: 'OUTSIDE',
        lastAction: null,
        checkInTime: null,
        checkOutTime: null,
        displayCheckIn: null,
        displayCheckOut: null,
        visits: 0,
        history: []
      };
    });
    students[id] = {
      id: s.id,
      name: s.name,
      team: s.team,
      teamName: s.teamName,
      studentCode: s.studentCode,
      games: gm
    };
  }
  return students;
}

function ensureStudentsHaveSessions(studentsMap, sessionIds = ENGDAY_GAMES_LIST) {
  if (!studentsMap || typeof studentsMap !== 'object') return buildDefaultEngDayRoster(sessionIds);
  Object.values(studentsMap).forEach(s => {
    if (!s.games || typeof s.games !== 'object') s.games = {};
    sessionIds.forEach(gId => {
      if (!s.games[gId]) {
        s.games[gId] = {
          gameId: gId,
          status: 'OUTSIDE',
          lastAction: null,
          checkInTime: null,
          checkOutTime: null,
          displayCheckIn: null,
          displayCheckOut: null,
          visits: 0,
          history: []
        };
      }
    });
  });
  return studentsMap;
}

let engdayEvents = safeReadJson(ENGDAY_EVENTS_FILE, getBundledJson('./engday_attendance_events.json', []));
let engdayEventsMap = new Map();
engdayEvents.forEach(ev => {
  if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
});

let engdayState = safeReadJson(ENGDAY_STATE_FILE, getBundledJson('./engday_attendance_state.json', null));
if (!engdayState || !engdayState.students || Object.keys(engdayState.students).length === 0) {
  const defaultStudents = buildDefaultEngDayRoster();
  engdayState = {
    schemaVersion: SCHEMA_VERSION,
    activeEventId: 'engday_2026',
    eventsCatalog: {
      engday_2026: {
        id: 'engday_2026',
        schemaVersion: SCHEMA_VERSION,
        title: 'ENGINEERING DAYS 2026',
        subtitle: 'UPHSD Calamba • College of Engineering (Oct 19–20, 2026)',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        sessions: DEFAULT_ENGDAY_SESSIONS,
        students: defaultStudents,
        updatedAt: new Date().toISOString()
      }
    },
    students: defaultStudents,
    version: 1,
    lastUpdated: new Date().toISOString()
  };
  try { atomicWriteJson(ENGDAY_STATE_FILE, engdayState); } catch(e) {}
} else {
  if (!engdayState.activeEventId) engdayState.activeEventId = 'engday_2026';
  if (!engdayState.eventsCatalog || typeof engdayState.eventsCatalog !== 'object') {
    engdayState.eventsCatalog = {
      engday_2026: {
        id: 'engday_2026',
        schemaVersion: SCHEMA_VERSION,
        title: 'ENGINEERING DAYS 2026',
        subtitle: 'UPHSD Calamba • College of Engineering (Oct 19–20, 2026)',
        venueName: 'Gymnasium / Oval & Engineering Labs',
        staffPin: '2026',
        sessions: DEFAULT_ENGDAY_SESSIONS,
        students: ensureStudentsHaveSessions(engdayState.students, ENGDAY_GAMES_LIST),
        updatedAt: engdayState.lastUpdated || new Date().toISOString()
      }
    };
  }
  // Force migration to SCHEMA_VERSION = '2026.4' if cached state used older 7-game basketball schedule
  const defaultEvt = engdayState.eventsCatalog.engday_2026;
  const hasLegacyGames = defaultEvt && Array.isArray(defaultEvt.sessions) && defaultEvt.sessions.some(
    s => s && (String(s.id).startsWith('vb_') || String(s.id).startsWith('bb_'))
  );
  if (engdayState.schemaVersion !== SCHEMA_VERSION || !defaultEvt || defaultEvt.schemaVersion !== SCHEMA_VERSION || hasLegacyGames) {
    engdayState.schemaVersion = SCHEMA_VERSION;
    const preservedStudents = ensureStudentsHaveSessions(
      (defaultEvt && defaultEvt.students && Object.keys(defaultEvt.students).length > 0)
        ? defaultEvt.students
        : engdayState.students,
      ENGDAY_GAMES_LIST
    );
    engdayState.eventsCatalog.engday_2026 = {
      ...(defaultEvt || {}),
      id: 'engday_2026',
      schemaVersion: SCHEMA_VERSION,
      title: 'ENGINEERING DAYS 2026',
      subtitle: 'UPHSD Calamba • College of Engineering (Oct 19–20, 2026)',
      venueName: 'Gymnasium / Oval & Engineering Labs',
      staffPin: (defaultEvt && defaultEvt.staffPin) || '2026',
      sessions: (!hasLegacyGames && defaultEvt && Array.isArray(defaultEvt.sessions) && defaultEvt.sessions.length > 0)
        ? defaultEvt.sessions
        : DEFAULT_ENGDAY_SESSIONS,
      students: preservedStudents,
      updatedAt: new Date().toISOString()
    };
    if (engdayState.activeEventId === 'engday_2026') {
      engdayState.students = preservedStudents;
    }
    try { atomicWriteJson(ENGDAY_STATE_FILE, engdayState); } catch(e) {}
  }
}

function getActiveSessionIdsForEvent(eventKey = 'engday_2026') {
  const evt = engdayState.eventsCatalog && engdayState.eventsCatalog[eventKey];
  if (evt && Array.isArray(evt.sessions) && evt.sessions.length > 0) {
    return evt.sessions.map(s => s.id).filter(Boolean);
  }
  return ENGDAY_GAMES_LIST.slice();
}

function rederiveEngDayStudentState(student, studentEvents, sessionIds = ENGDAY_GAMES_LIST) {
  const sorted = studentEvents.slice().sort(compareEvents);
  const allGameKeys = new Set([
    ...sessionIds,
    ...Object.keys(student.games || {}),
    ...sorted.map(e => e.gameId).filter(Boolean)
  ]);

  const updated = {
    ...student,
    games: {}
  };
  allGameKeys.forEach(g => {
    updated.games[g] = {
      gameId: g,
      status: 'OUTSIDE',
      lastAction: null,
      checkInTime: null,
      checkOutTime: null,
      displayCheckIn: null,
      displayCheckOut: null,
      visits: 0,
      history: []
    };
  });

  for (const ev of sorted) {
    const gId = ev.gameId;
    if (!gId) continue;
    if (!updated.games[gId]) {
      updated.games[gId] = {
        gameId: gId,
        status: 'OUTSIDE',
        lastAction: null,
        checkInTime: null,
        checkOutTime: null,
        displayCheckIn: null,
        displayCheckOut: null,
        visits: 0,
        history: []
      };
    }
    const gRecord = updated.games[gId];
    const action = String(ev.action || '').toLowerCase();
    const timeStr = formatManilaTime(ev.occurredAt);

    if (action === 'check_in') {
      gRecord.status = 'INSIDE';
      gRecord.lastAction = 'check_in';
      gRecord.checkInTime = ev.occurredAt;
      gRecord.displayCheckIn = timeStr;
      gRecord.visits = (gRecord.visits || 0) + 1;
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'check_in',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        court: ev.court,
        deviceId: ev.deviceId
      });
    } else if (action === 'check_out') {
      gRecord.status = 'OUTSIDE';
      gRecord.lastAction = 'check_out';
      gRecord.checkOutTime = ev.occurredAt;
      gRecord.displayCheckOut = timeStr;
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'check_out',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        court: ev.court,
        deviceId: ev.deviceId,
        reason: ev.reason
      });
    } else if (action === 'manual_override') {
      const isInside = ev.reason && ev.reason.includes('INSIDE');
      gRecord.status = isInside ? 'INSIDE' : 'OUTSIDE';
      gRecord.lastAction = isInside ? 'check_in' : 'check_out';
      if (isInside) {
        gRecord.checkInTime = ev.occurredAt;
        gRecord.displayCheckIn = timeStr;
        gRecord.visits = (gRecord.visits || 0) + 1;
      } else {
        gRecord.checkOutTime = ev.occurredAt;
        gRecord.displayCheckOut = timeStr;
      }
      gRecord.history.push({
        eventId: ev.eventId,
        action: 'manual_override',
        timestamp: ev.occurredAt,
        displayTime: timeStr,
        performedBy: ev.marshalId,
        reason: ev.reason
      });
    }
  }

  return updated;
}

function calculateEngDayStats(eventKey = null) {
  const targetKey = eventKey || engdayState.activeEventId || 'engday_2026';
  const evtObj = engdayState.eventsCatalog && engdayState.eventsCatalog[targetKey];
  const studentsMap = (evtObj && evtObj.students) ? evtObj.students : (engdayState.students || {});
  const students = Object.values(studentsMap);
  const totalStudents = students.length;
  const sessionIds = getActiveSessionIdsForEvent(targetKey);
  const gameStats = {};
  sessionIds.forEach(g => {
    gameStats[g] = {
      totalCheckIns: 0,
      insideCount: 0,
      outsideCount: 0,
      byTeam: {
        ie: { inside: 0, total: 0 },
        me: { inside: 0, total: 0 },
        ce: { inside: 0, total: 0 },
        ee: { inside: 0, total: 0 },
        ece: { inside: 0, total: 0 },
        cpe: { inside: 0, total: 0 },
        rankine: { inside: 0, total: 0 },
        otto: { inside: 0, total: 0 },
        brayton: { inside: 0, total: 0 },
        diesel: { inside: 0, total: 0 }
      }
    };
  });

  let totalUniqueAttendees = 0;
  students.forEach(s => {
    let attendedAny = false;
    sessionIds.forEach(g => {
      const gr = s.games && s.games[g];
      const st = gameStats[g];
      if (!st) return;
      const teamKey = String(s.team || 'general').toLowerCase();
      if (!st.byTeam[teamKey]) st.byTeam[teamKey] = { inside: 0, total: 0 };
      if (gr && gr.visits > 0) {
        st.totalCheckIns++;
        attendedAny = true;
        st.byTeam[teamKey].total++;
      }
      if (gr && gr.status === 'INSIDE') {
        st.insideCount++;
        st.byTeam[teamKey].inside++;
      } else if (gr && gr.visits > 0) {
        st.outsideCount++;
      }
    });
    if (attendedAny) totalUniqueAttendees++;
  });

  return { totalStudents, totalUniqueAttendees, gameStats };
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
    const timeStr = formatManilaTime(ev.occurredAt);

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

// Helper: get primary LAN IPv4 address for instant mobile pairing
function getPrimaryLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return 'localhost';
}

// Live Real-Time SSE clients pool for instant sub-50ms dashboard updates
const engdaySseClients = new Set();

function broadcastEngDayUpdate() {
  if (engdaySseClients.size === 0) return;
  const activeKey = engdayState.activeEventId || 'engday_2026';
  const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === activeKey).length;
  const stateWithMeta = {
    ...engdayState,
    schemaVersion: SCHEMA_VERSION,
    eventsCount: activeEventsCount
  };
  const payload = `data: ${JSON.stringify({ type: 'state_update', state: stateWithMeta, stats: calculateEngDayStats() })}\n\n`;
  for (const client of engdaySseClients) {
    try {
      client.write(payload);
    } catch (e) {
      engdaySseClients.delete(client);
    }
  }
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

      // A. Reset Individual Student Attendance
      if (payload.studentId) {
        const studentId = String(payload.studentId).trim();
        if (attendanceState.students[studentId]) {
          attendanceEvents = attendanceEvents.filter(e => e.studentId !== studentId);
          attendanceEventsMap.forEach((v, k) => {
            if (v.studentId === studentId) attendanceEventsMap.delete(k);
          });
          const defaultStudents = buildDefaultStudentsRoster();
          if (defaultStudents[studentId]) {
            attendanceState.students[studentId] = defaultStudents[studentId];
          }
          attendanceState.version = (attendanceState.version || 1) + 1;
          attendanceState.lastUpdated = new Date().toISOString();

          atomicWriteJson(EVENTS_FILE, attendanceEvents);
          atomicWriteJson(STATE_FILE, attendanceState);

          return sendJson(res, 200, {
            ok: true,
            message: `Attendance cleared for ${studentId}`,
            serverTime: new Date().toISOString(),
            stats: calculateAttendanceStats()
          });
        }
      }

      // B. Delete Specific Scan Event
      if (payload.eventId) {
        const eventId = String(payload.eventId).trim();
        const targetEvent = attendanceEventsMap.get(eventId);
        if (targetEvent) {
          attendanceEvents = attendanceEvents.filter(e => e.eventId !== eventId);
          attendanceEventsMap.delete(eventId);

          const stId = targetEvent.studentId;
          const studentAllEvents = attendanceEvents.filter(e => e.studentId === stId);
          const defaultStudent = buildDefaultStudentsRoster()[stId];
          attendanceState.students[stId] = rederiveStudentState(defaultStudent, studentAllEvents);
          attendanceState.version = (attendanceState.version || 1) + 1;
          attendanceState.lastUpdated = new Date().toISOString();

          atomicWriteJson(EVENTS_FILE, attendanceEvents);
          atomicWriteJson(STATE_FILE, attendanceState);

          return sendJson(res, 200, {
            ok: true,
            message: `Event ${eventId} deleted`,
            serverTime: new Date().toISOString(),
            stats: calculateAttendanceStats()
          });
        }
      }

      // C. Reset All Attendance
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

      return sendJson(res, 200, {
        ok: true,
        message: 'Attendance reset successful',
        serverTime: new Date().toISOString(),
        stats: calculateAttendanceStats()
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  // -----------------------------------------------------------------------
  // ENGINEERING DAY 2026 ATTENDANCE API ENDPOINTS
  // -----------------------------------------------------------------------
  if (reqPath === '/api/engday/attendance/health' && req.method === 'GET') {
    const primaryIp = getPrimaryLanIp();
    const activeKey = engdayState.activeEventId || 'engday_2026';
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      activeEventId: activeKey,
      eventsCount: engdayEvents.length,
      totalStudents: Object.keys(engdayState.students || {}).length,
      games: getActiveSessionIdsForEvent(activeKey),
      lanIp: primaryIp,
      lanPort: PORT,
      lanScannerUrl: `http://${primaryIp}:${PORT}/engday_scanner.html`,
      lanDashboardUrl: `http://${primaryIp}:${PORT}/engday_attendance.html`,
      liveSubscribers: engdaySseClients.size
    });
  }

  // Real-Time Server-Sent Events (SSE) Stream for Instant Live Sync (< 50ms)
  if (reqPath === '/api/engday/attendance/stream' && req.method === 'GET') {
    const activeKey = engdayState.activeEventId || 'engday_2026';
    const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === activeKey).length;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({
      type: 'init',
      state: { ...engdayState, schemaVersion: SCHEMA_VERSION, eventsCount: activeEventsCount },
      stats: calculateEngDayStats()
    })}\n\n`);
    engdaySseClients.add(res);
    req.on('close', () => {
      engdaySseClients.delete(res);
    });
    return;
  }

  if (reqPath === '/api/engday/attendance/state' && req.method === 'GET') {
    const reqEventKey = urlParams.get('eventKey') || engdayState.activeEventId || 'engday_2026';
    const evtObj = engdayState.eventsCatalog && engdayState.eventsCatalog[reqEventKey];
    const studentsMap = (evtObj && evtObj.students) ? evtObj.students : engdayState.students;
    const activeEventsCount = engdayEvents.filter(e => (e.eventKey || 'engday_2026') === reqEventKey).length;
    return sendJson(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      activeEventId: engdayState.activeEventId || 'engday_2026',
      eventsCatalog: engdayState.eventsCatalog || {},
      students: studentsMap,
      stats: calculateEngDayStats(reqEventKey),
      eventsCount: activeEventsCount,
      totalEventsCount: engdayEvents.length,
      version: engdayState.version || 1,
      lastUpdated: engdayState.lastUpdated
    });
  }

  if (reqPath === '/api/engday/attendance/config' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};

      if (payload.event && payload.event.id) {
        const evtId = String(payload.event.id).trim();
        const existingEvt = engdayState.eventsCatalog[evtId] || {};
        const mergedStudents = {
          ...(existingEvt.students || {}),
          ...(payload.event.students || {})
        };

        // Re-derive student states from server event history for this eventKey while preserving any richer incoming client state
        const sessionIds = Array.isArray(payload.event.sessions) && payload.event.sessions.length > 0
          ? payload.event.sessions.map(s => s.id)
          : getActiveSessionIdsForEvent(evtId);

        for (const [stId, stObj] of Object.entries(mergedStudents)) {
          const stEvents = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === evtId);
          if (stEvents.length > 0) {
            mergedStudents[stId] = rederiveEngDayStudentState(stObj, stEvents, sessionIds);
          } else {
            ensureStudentsHaveSessions({ [stId]: stObj }, sessionIds);
          }
        }

        engdayState.eventsCatalog[evtId] = {
          ...existingEvt,
          ...payload.event,
          schemaVersion: SCHEMA_VERSION,
          students: mergedStudents,
          updatedAt: new Date().toISOString()
        };
      }

      if (payload.activeEventId && engdayState.eventsCatalog[payload.activeEventId]) {
        engdayState.activeEventId = payload.activeEventId;
        engdayState.students = engdayState.eventsCatalog[payload.activeEventId].students || {};
      } else if (payload.event && payload.event.id === engdayState.activeEventId) {
        engdayState.students = engdayState.eventsCatalog[payload.event.id].students || {};
      }

      engdayState.schemaVersion = SCHEMA_VERSION;
      engdayState.version = (engdayState.version || 1) + 1;
      engdayState.lastUpdated = new Date().toISOString();

      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        schemaVersion: SCHEMA_VERSION,
        activeEventId: engdayState.activeEventId,
        version: engdayState.version,
        serverTime: new Date().toISOString()
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/events' && req.method === 'GET') {
    const gameId = urlParams.get('gameId');
    const eventKey = urlParams.get('eventKey');
    const since = urlParams.get('since');
    let results = engdayEvents;
    if (eventKey) {
      results = results.filter(e => (e.eventKey || 'engday_2026') === eventKey);
    }
    if (gameId) {
      results = results.filter(e => e.gameId === gameId);
    }
    if (since) {
      const sinceDate = new Date(since).getTime();
      if (!isNaN(sinceDate)) {
        results = results.filter(e => new Date(e.occurredAt || 0).getTime() > sinceDate);
      }
    }
    const limit = parseInt(urlParams.get('limit') || '500', 10);
    if (results.length > limit) {
      results = results.slice(-limit);
    }
    return sendJson(res, 200, {
      ok: true,
      events: results,
      total: engdayEvents.length,
      serverTime: new Date().toISOString()
    });
  }

  if (reqPath === '/api/engday/attendance/sync' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const incoming = Array.isArray(payload.events) ? payload.events : [];
      const deviceId = payload.deviceId || 'UNKNOWN_DEVICE';
      const reqActiveEventId = payload.activeEventId || engdayState.activeEventId || 'engday_2026';

      const accepted = [];
      const duplicate = [];
      const rejected = [];
      const affectedByEventAndStudent = new Map();

      for (const ev of incoming) {
        if (!ev || typeof ev !== 'object') {
          rejected.push({ eventId: ev?.eventId || 'unknown', reason: 'Invalid event object' });
          continue;
        }

        const eventId = String(ev.eventId || '').trim();
        const eventKey = String(ev.eventKey || reqActiveEventId || 'engday_2026').trim();
        const studentId = String(ev.studentId || '').trim();
        const gameId = String(ev.gameId || '').trim();
        const action = String(ev.action || '').trim().toLowerCase();

        if (!eventId) {
          rejected.push({ eventId: 'missing', reason: 'Missing eventId' });
          continue;
        }
        if (!gameId) {
          rejected.push({ eventId, reason: 'Missing gameId / sessionId' });
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

        // Ensure event entry exists in eventsCatalog
        if (!engdayState.eventsCatalog) engdayState.eventsCatalog = {};
        if (!engdayState.eventsCatalog[eventKey]) {
          engdayState.eventsCatalog[eventKey] = {
            id: eventKey,
            title: eventKey === 'engday_2026' ? 'Engineering Day 2026' : eventKey,
            students: eventKey === 'engday_2026' ? (engdayState.students || buildDefaultEngDayRoster()) : {},
            sessions: [],
            updatedAt: new Date().toISOString()
          };
        }
        const targetEvt = engdayState.eventsCatalog[eventKey];
        if (!targetEvt.students) targetEvt.students = {};

        let validStudentId = studentId;
        if (!validStudentId || !targetEvt.students[validStudentId]) {
          const match = Object.values(targetEvt.students).find(s =>
            (s.studentCode && s.studentCode.toUpperCase() === String(studentId || ev.studentCode || '').toUpperCase()) ||
            (s.id && s.id.toLowerCase() === String(studentId || '').toLowerCase())
          );
          if (match) {
            validStudentId = match.id;
            ev.studentId = match.id;
          } else if (studentId || ev.studentCode) {
            // Auto-register dynamically imported student so custom roster scans are never rejected!
            validStudentId = studentId || ('stu_' + String(ev.studentCode).toLowerCase().replace(/[^a-z0-9]+/g, '_'));
            targetEvt.students[validStudentId] = {
              id: validStudentId,
              name: ev.studentName || ev.studentCode || validStudentId,
              team: String(ev.team || 'general').toLowerCase(),
              teamName: ev.teamName || String(ev.team || 'GENERAL').toUpperCase(),
              studentCode: String(ev.studentCode || validStudentId).toUpperCase(),
              games: {}
            };
          } else {
            rejected.push({ eventId, reason: `Unknown studentId: ${studentId}` });
            continue;
          }
        }

        // Idempotency check
        if (engdayEventsMap.has(eventId)) {
          duplicate.push(eventId);
          continue;
        }

        const studentRef = targetEvt.students[validStudentId];
        const normalized = {
          eventId: eventId,
          eventKey: eventKey,
          gameId: gameId,
          studentId: validStudentId,
          action: action,
          occurredAt: new Date(ev.occurredAt).toISOString(),
          deviceId: String(ev.deviceId || deviceId),
          marshalId: String(ev.marshalId || 'Marshal'),
          court: String(ev.court || 'Court'),
          sessionId: String(ev.sessionId || 'engday_session'),
          localSequence: typeof ev.localSequence === 'number' ? ev.localSequence : 1,
          createdAt: ev.createdAt ? new Date(ev.createdAt).toISOString() : new Date().toISOString(),
          reason: ev.reason || null,
          method: ev.method || 'qr_scan',
          studentName: studentRef.name,
          studentCode: studentRef.studentCode,
          team: studentRef.team
        };

        engdayEvents.push(normalized);
        engdayEventsMap.set(eventId, normalized);
        accepted.push(eventId);
        affectedByEventAndStudent.set(`${eventKey}|${validStudentId}`, { eventKey, studentId: validStudentId });
      }

      if (accepted.length > 0) {
        for (const { eventKey, studentId } of affectedByEventAndStudent.values()) {
          const targetEvt = engdayState.eventsCatalog[eventKey];
          if (!targetEvt || !targetEvt.students) continue;
          const studentAllEvents = engdayEvents.filter(
            e => e.studentId === studentId && (e.eventKey || 'engday_2026') === eventKey
          );
          const baseStudent = targetEvt.students[studentId] || buildDefaultEngDayRoster()[studentId];
          const sessionIds = getActiveSessionIdsForEvent(eventKey);
          if (baseStudent) {
            targetEvt.students[studentId] = rederiveEngDayStudentState(baseStudent, studentAllEvents, sessionIds);
          }
          targetEvt.updatedAt = new Date().toISOString();
          if (eventKey === (engdayState.activeEventId || 'engday_2026')) {
            engdayState.students = targetEvt.students;
          }
        }
        engdayState.version = (engdayState.version || 1) + 1;
        engdayState.lastUpdated = new Date().toISOString();

        atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
        atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
        broadcastEngDayUpdate();
      }

      return sendJson(res, 200, {
        ok: true,
        accepted: accepted,
        duplicate: duplicate,
        rejected: rejected,
        serverTime: new Date().toISOString(),
        version: engdayState.version || 1,
        stats: calculateEngDayStats(reqActiveEventId)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (reqPath === '/api/engday/attendance/reset' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (payload.confirmation !== 'RESET_ENGDAY_ATTENDANCE') {
        return sendJson(res, 400, { ok: false, error: 'Confirmation required: RESET_ENGDAY_ATTENDANCE' });
      }

      const targetEventKey = payload.eventKey || engdayState.activeEventId || 'engday_2026';
      const sessionFilter = payload.sessionId || null;

      // Filter out only events matching targetEventKey (and optional sessionFilter)
      engdayEvents = engdayEvents.filter(e => {
        const ek = e.eventKey || 'engday_2026';
        if (ek !== targetEventKey) return true;
        if (sessionFilter && e.gameId !== sessionFilter) return true;
        return false;
      });
      engdayEventsMap.clear();
      engdayEvents.forEach(ev => {
        if (ev && ev.eventId) engdayEventsMap.set(ev.eventId, ev);
      });

      const sessionIds = getActiveSessionIdsForEvent(targetEventKey);
      const evtObj = engdayState.eventsCatalog && engdayState.eventsCatalog[targetEventKey];

      if (evtObj && evtObj.students && payload.keepRoster !== false) {
        Object.keys(evtObj.students).forEach(stId => {
          const remaining = engdayEvents.filter(e => e.studentId === stId && (e.eventKey || 'engday_2026') === targetEventKey);
          evtObj.students[stId] = rederiveEngDayStudentState(evtObj.students[stId], remaining, sessionIds);
        });
        evtObj.updatedAt = new Date().toISOString();
        if (targetEventKey === (engdayState.activeEventId || 'engday_2026')) {
          engdayState.students = evtObj.students;
        }
      } else if (targetEventKey === 'engday_2026') {
        engdayState.students = buildDefaultEngDayRoster(sessionIds);
        if (evtObj) evtObj.students = engdayState.students;
      }

      engdayState.version = (engdayState.version || 1) + 1;
      engdayState.lastUpdated = new Date().toISOString();

      atomicWriteJson(ENGDAY_EVENTS_FILE, engdayEvents);
      atomicWriteJson(ENGDAY_STATE_FILE, engdayState);
      broadcastEngDayUpdate();

      return sendJson(res, 200, {
        ok: true,
        message: `Attendance reset successful for ${targetEventKey}`,
        serverTime: new Date().toISOString(),
        stats: calculateEngDayStats(targetEventKey)
      });
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

const isDirectExecution = Boolean(
  process.argv[1] && (
    process.argv[1].endsWith('server.js') || 
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  )
);

if (isDirectExecution && !IS_VERCEL) {
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
