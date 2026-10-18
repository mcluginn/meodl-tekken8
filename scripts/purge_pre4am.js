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
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value || now.getFullYear();
    const month = parts.find(p => p.type === 'month')?.value || String(now.getMonth() + 1).padStart(2, '0');
    const day = parts.find(p => p.type === 'day')?.value || String(now.getDate()).padStart(2, '0');
    const isoManila = `${year}-${month}-${day}T04:00:00+08:00`;
    const d = new Date(isoManila);
    if (!isNaN(d.getTime())) return d;
  } catch (e) {}
  const local = new Date();
  local.setHours(4, 0, 0, 0);
  return local;
}

try {
  const cutoff = process.argv[2] ? new Date(process.argv[2]) : getToday4AMCutoff();
  const cutoffTime = cutoff.getTime();
  const cutoffIso = cutoff.toISOString();

  console.log(`Purge Cutoff Timestamp: ${cutoffIso} (Asia/Manila: 4:00 AM)`);

  let initialEventsCount = 0;
  let remainingEvents = [];

  // 1. Purge events file
  if (fs.existsSync(EVENTS_FILE)) {
    const rawEvents = fs.readFileSync(EVENTS_FILE, 'utf8');
    const events = JSON.parse(rawEvents || '[]');
    initialEventsCount = events.length;
    remainingEvents = events.filter(e => {
      const t = new Date(e.occurredAt || e.time || e.createdAt || 0).getTime();
      return t >= cutoffTime;
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
      const t = new Date(l.timestamp || l.time || l.occurredAt || 0).getTime();
      return t >= cutoffTime;
    });

    if (Array.isArray(state.scanLogs)) {
      state.scanLogs = state.scanLogs.filter(l => {
        const t = new Date(l.time || l.occurredAt || l.timestamp || 0).getTime();
        return t >= cutoffTime;
      });
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
        cutoff: cutoffIso
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
