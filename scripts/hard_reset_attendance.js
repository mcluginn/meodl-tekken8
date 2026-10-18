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
console.log('  ENGINEERING DAYS 2026 - HARD RESET ZERO-WIPE UTILITY');
console.log('=====================================================');

try {
  const nowIso = new Date().toISOString();
  console.log(`Hard Reset Execution Timestamp: ${nowIso}`);

  let initialEventsCount = 0;

  // 1. Hard wipe events file down to empty array []
  if (fs.existsSync(EVENTS_FILE)) {
    const rawEvents = fs.readFileSync(EVENTS_FILE, 'utf8');
    const events = JSON.parse(rawEvents || '[]');
    initialEventsCount = events.length;
    fs.writeFileSync(EVENTS_FILE, '[]\n', 'utf8');
    console.log(`✓ Wiped ${initialEventsCount} historical events from ${path.basename(EVENTS_FILE)} down to 0.`);
  }

  // 2. Hard wipe state file while preserving roster & sessions
  if (fs.existsSync(STATE_FILE)) {
    const rawState = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(rawState);

    state.lastHardResetTimestamp = nowIso;
    state.hardResetSequence = (state.hardResetSequence || 0) + 1;
    state.lastResetTimestamp = nowIso;
    state.resetSequence = (state.resetSequence || 0) + 1;
    state.version = (state.version || 1) + 20;
    state.lastUpdated = nowIso;

    state.auditLog = [];
    state.scanLogs = [];
    state.attendance = {};

    let studentCount = 0;
    const resetStudentGames = (s) => {
      studentCount++;
      s.status = 'OUTSIDE';
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
        evt.lastHardResetTimestamp = nowIso;
        evt.hardResetSequence = (evt.hardResetSequence || 0) + 1;
        evt.lastResetTimestamp = nowIso;
        evt.resetSequence = (evt.resetSequence || 0) + 1;
        evt.updatedAt = nowIso;
        evt.auditLog = [];
        evt.scanLogs = [];
        evt.attendance = {};

        if (evt.students && typeof evt.students === 'object') {
          Object.values(evt.students).forEach(s => {
            s.status = 'OUTSIDE';
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
    console.log(`✓ Roster of ${studentCount} students and all sessions preserved at zero check-ins.`);
  }

  // 3. Notify running server if available
  const serverUrl = process.env.ENGDAY_SERVER_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${serverUrl}/api/engday/attendance/hard-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'HARD_RESET',
        confirmation: 'HARD_RESET_ENGDAY_ATTENDANCE',
        pin: '2026',
        eventKey: 'engday_2026',
        resetTimestamp: nowIso
      }),
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      console.log(`✓ Notified running server (${serverUrl}) and broadcasted hard reset to all devices.`);
    }
  } catch (netErr) {
    console.log(`ℹ Server not running locally; changes are saved to disk.`);
  }

  console.log('\n✅ Attendance HARD RESET complete! Ready for live event scanning.');
  process.exit(0);
} catch (err) {
  console.error('❌ Hard reset failed:', err);
  process.exit(1);
}
