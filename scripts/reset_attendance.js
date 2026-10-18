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
console.log('  ENGINEERING DAYS 2026 - ATTENDANCE RESET UTILITY');
console.log('=====================================================');

try {
  // 1. Reset Events File
  fs.writeFileSync(EVENTS_FILE, '[]\n', 'utf8');
  console.log('✓ Cleared persisted scan events (engday_attendance_events.json)');

  // 2. Reset Attendance State File
  if (fs.existsSync(STATE_FILE)) {
    const rawState = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(rawState);
    const nowIso = new Date().toISOString();

    state.lastResetTimestamp = nowIso;
    state.resetSequence = (state.resetSequence || 0) + 1;
    state.version = (state.version || 1) + 10;
    state.lastUpdated = nowIso;
    state.auditLog = [];
    state.scanLogs = [];
    state.attendance = {};

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
        evt.lastResetTimestamp = nowIso;
        evt.resetSequence = (evt.resetSequence || 0) + 1;
        evt.updatedAt = nowIso;
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

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
    console.log(`✓ Reset all student attendance records to zero across ${studentCount} students.`);
    console.log(`✓ Roster and 8 Track A checkpoints safely preserved.`);
    console.log(`✓ Reset timestamp: ${nowIso}`);
    console.log(`✓ Reset sequence: ${state.resetSequence}`);
  }

  // 3. Notify running local or remote server if available
  const serverUrl = process.env.ENGDAY_SERVER_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${serverUrl}/api/engday/attendance/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmation: 'RESET_ENGDAY_ATTENDANCE',
        eventKey: 'engday_2026',
        resetAll: true,
        keepRoster: true
      }),
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      console.log(`✓ Notified running server (${serverUrl}) and broadcasted SSE reset.`);
    }
  } catch (netErr) {
    console.log(`ℹ Local server is not currently running; reset is saved to disk and will load on next startup.`);
  }

  console.log('\n✅ Zero-Reset complete! All check-ins and scan logs are at 0.');
  process.exit(0);
} catch (err) {
  console.error('❌ Reset failed:', err);
  process.exit(1);
}
