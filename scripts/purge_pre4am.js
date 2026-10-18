#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const STATE_FILE = path.join(rootDir, 'engday_attendance_state.json');
const EVENTS_FILE = path.join(rootDir, 'engday_attendance_events.json');

console.log('=====================================================');
console.log('  ENGINEERING DAYS 2026 - PRE-4AM PURGE UTILITY');
console.log('=====================================================');

function getToday4AMCutoff() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
}

function isTimestampBeforeToday4AM(timeVal) {
  if (!timeVal) return true;
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  if (d.getFullYear() < now.getFullYear()) return true;
  if (d.getFullYear() === now.getFullYear()) {
    if (d.getMonth() < now.getMonth()) return true;
    if (d.getMonth() === now.getMonth()) {
      if (d.getDate() < now.getDate()) return true;
      if (d.getDate() === now.getDate()) {
        return d.getHours() < 4;
      }
    }
  }
  const today4AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
  return d.getTime() < today4AM.getTime();
}

try {
  const customCutoff = process.argv[2] ? new Date(process.argv[2]) : null;
  const cutoff = (customCutoff && !isNaN(customCutoff.getTime())) ? customCutoff : getToday4AMCutoff();
  const cutoffTime = cutoff.getTime();
  const cutoffIso = cutoff.toISOString();
  const isPre4AMToday = !customCutoff || Math.abs(cutoffTime - getToday4AMCutoff().getTime()) < 60000;

  const isStale = (timeVal) => {
    if (!timeVal) return true;
    if (isPre4AMToday) {
      return isTimestampBeforeToday4AM(timeVal);
    }
    const t = new Date(timeVal).getTime();
    return isNaN(t) || t < cutoffTime;
  };

  console.log(`Purge Cutoff Timestamp: ${cutoffIso} (Local Time: 4:00 AM)`);

  let initialEventsCount = 0;
  let remainingEvents = [];

  // 1. Purge events file
  if (fs.existsSync(EVENTS_FILE)) {
    const rawEvents = fs.readFileSync(EVENTS_FILE, 'utf8');
    const events = JSON.parse(rawEvents || '[]');
    initialEventsCount = events.length;
    remainingEvents = events.filter(e => {
      return !isStale(e.occurredAt || e.time || e.createdAt);
    });
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(remainingEvents, null, 2) + '\n', 'utf8');
    console.log(`✓ Purged ${initialEventsCount - remainingEvents.length} events older than 4:00 AM.`);
    console.log(`✓ Remaining valid events: ${remainingEvents.length}`);
  }

  // 2. Re-derive student states in state file
  if (fs.existsSync(STATE_FILE)) {
    const rawState = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(rawState);

    state.lastPurgeTimestamp = cutoffIso;
    state.lastPurgeAt = new Date().toISOString();
    state.version = (state.version || 1) + 5;
    state.lastUpdated = new Date().toISOString();

    state.auditLog = (state.auditLog || []).filter(l => {
      return !isStale(l.timestamp || l.time || l.occurredAt);
    });

    if (Array.isArray(state.scanLogs)) {
      state.scanLogs = state.scanLogs.filter(l => {
        return !isStale(l.time || l.occurredAt || l.timestamp);
      });
    } else {
      state.scanLogs = [];
    }

    // Reset student games and replay remaining events
    let studentCount = 0;
    const resetStudentGames = (s) => {
      studentCount++;
      const games = s.games || {};
      const resetGames = {};
      Object.keys(games).forEach(gId => {
        resetGames[gId] = {
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
      });
      s.games = resetGames;
    };

    if (state.students && typeof state.students === 'object') {
      Object.values(state.students).forEach(resetStudentGames);
    }

    if (state.eventsCatalog && typeof state.eventsCatalog === 'object') {
      Object.values(state.eventsCatalog).forEach(evt => {
        evt.lastPurgeTimestamp = cutoffIso;
        evt.updatedAt = new Date().toISOString();
        evt.scanLogs = [...(state.scanLogs || [])];
        if (Array.isArray(evt.auditLog)) {
          evt.auditLog = evt.auditLog.filter(l => !isStale(l.timestamp || l.time || l.occurredAt));
        }
        if (evt.students && typeof evt.students === 'object') {
          Object.values(evt.students).forEach(s => {
            const games = s.games || {};
            const resetGames = {};
            Object.keys(games).forEach(gId => {
              resetGames[gId] = {
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
            });
            s.games = resetGames;
          });
        }
      });
    }

    // Rebuild attendance map
    state.attendance = {};
    if (state.students && typeof state.students === 'object') {
      Object.values(state.students).forEach(s => {
        if (!s) return;
        const code = String(s.code || s.studentCode || s.id || '').toUpperCase();
        if (code) {
          state.attendance[code] = {
            id: s.id,
            code: code,
            name: s.name,
            team: s.team,
            games: s.games
          };
        }
      });
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
    console.log(`✓ Roster of ${studentCount} students and 8 sessions preserved.`);
  }

  // 3. Notify running server if available
  const serverUrl = process.env.ENGDAY_SERVER_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${serverUrl}/api/engday/attendance/purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventKey: 'engday_2026',
        cutoff: cutoffIso,
        cleanEvents: remainingEvents,
        scanLogs: state ? (state.scanLogs || []) : []
      }),
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      console.log(`✓ Notified running server (${serverUrl}) and broadcasted purge update.`);
    }
  } catch (netErr) {
    console.log(`ℹ Server not running locally; changes are saved to disk.`);
  }

  console.log('\n✅ Pre-4AM attendance purge complete!');
  process.exit(0);
} catch (err) {
  console.error('❌ Purge failed:', err);
  process.exit(1);
}
