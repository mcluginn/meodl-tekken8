// test_engday_attendance.js
import fs from 'fs';

console.log('--- TESTING ENGINEERING DAY SPORTS ATTENDANCE SYSTEM (7 ME MATCHES) ---');

// Setup browser globals simulation for Node environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.window = {
  localStorage: global.localStorage,
  location: { origin: 'http://localhost:3333' },
  addEventListener: () => {},
  document: {
    createElement: () => ({ click: () => {}, setAttribute: () => {} }),
    body: { appendChild: () => {}, removeChild: () => {} }
  }
};

global.URL = {
  createObjectURL: () => 'blob:mock',
  revokeObjectURL: () => {}
};

try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    configurable: true,
    writable: true
  });
} catch(e) {}

// 1. Load meodl_data.js
const dataCode = fs.readFileSync('./assets/meodl_data.js', 'utf8');
new Function(dataCode)();

// 2. Load engday_attendance.js
const engDayCode = fs.readFileSync('./assets/engday_attendance.js', 'utf8');
new Function(engDayCode)();

const engine = global.window.ENGDAY_ATTENDANCE;
const ENGDAY_GAMES = global.window.ENGDAY_GAMES;

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log(`✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${desc}`);
    failed++;
  }
}

// Test 1: 7 ME Games defined (4 Mixed Volleyball, 3 Men's Basketball)
assert(Array.isArray(ENGDAY_GAMES) && ENGDAY_GAMES.length === 7, 'Exactly 7 ME games registered in specification');
assert(ENGDAY_GAMES.filter(g => g.sport === 'volleyball').length === 4, '4 Mixed Volleyball games defined (VB 1, VB 3, VB 6, VB 8)');
assert(ENGDAY_GAMES.filter(g => g.sport === 'basketball').length === 3, '3 Men\'s Basketball games defined (BB 1, BB 4, BB 6)');

// Test 2: Student roster initialized
const students = Object.values(engine.state.students);
assert(students.length === 175, `All 175 students initialized in roster (got ${students.length})`);

// Test 3: Student structure has all 7 games
const testStudent = students[0];
assert(testStudent && testStudent.games, 'Student has games attendance container');
assert(Object.keys(testStudent.games).length === 7, 'Student has records for all 7 games');
assert(testStudent.games.bb_g1.status === 'OUTSIDE', 'Student initially outside Basketball Game 1 (bb_g1)');
assert(testStudent.games.vb_g1.status === 'OUTSIDE', 'Student initially outside Volleyball Game 1 (vb_g1)');

// Test 4: Check-in to Basketball Game 1 (bb_g1)
engine.setActiveGame('bb_g1');
const checkInRes = engine.recordCheckIn(testStudent.id, 'bb_g1', { performedBy: 'Marshal Kirstine Ballesteros' });
assert(checkInRes.success === true, 'Check-in to Basketball Game 1 succeeded');
assert(testStudent.games.bb_g1.status === 'INSIDE', 'Student status is INSIDE for Basketball Game 1');
assert(testStudent.games.bb_g1.visits === 1, 'Visits incremented to 1 for bb_g1');
assert(testStudent.games.bb_g1.displayCheckIn !== null, 'Display check-in timestamp formatted in Manila time');

// Test 5: Verify per-game isolation: other 6 games remain OUTSIDE
const otherGameIds = ['vb_g1', 'vb_g3', 'vb_g6', 'vb_g8', 'bb_g4', 'bb_g6'];
const allOthersOutside = otherGameIds.every(gid => testStudent.games[gid].status === 'OUTSIDE');
assert(allOthersOutside, 'Student remains OUTSIDE for all other 6 matches while INSIDE bb_g1');

// Test 6: Check-out of Basketball Game 1 (bb_g1)
const checkOutRes = engine.recordCheckOut(testStudent.id, 'bb_g1', { reason: 'Game Concluded' });
assert(checkOutRes.success === true, 'Check-out of Basketball Game 1 succeeded');
assert(testStudent.games.bb_g1.status === 'OUTSIDE', 'Student status is OUTSIDE for Basketball Game 1');
assert(testStudent.games.bb_g1.displayCheckOut !== null, 'Display check-out timestamp formatted in Manila time');

// Test 7: Check-in to Volleyball Game 1 (vb_g1)
engine.setActiveGame('vb_g1');
const vbInRes = engine.recordCheckIn(testStudent.id, 'vb_g1', { performedBy: 'Marshal Princess Doroja' });
assert(vbInRes.success === true, 'Check-in to Volleyball Game 1 succeeded');
assert(testStudent.games.vb_g1.status === 'INSIDE', 'Student is INSIDE Volleyball Game 1');
assert(testStudent.games.bb_g1.status === 'OUTSIDE', 'Student remains OUTSIDE Basketball Game 1 while INSIDE Volleyball Game 1');

// Test 8: QR resolution
const qrRes = engine.resolveScanPayload(testStudent.studentCode);
assert(qrRes.success === true, 'Resolves student by studentCode string');
assert(qrRes.student.id === testStudent.id, 'Resolved student matches ID');
assert(qrRes.statusInGame === 'INSIDE', 'Returns current status in active game (vb_g1)');

// Test 9: Stats computation
const stats = engine.calculateStats();
assert(stats.totalStudents === 175, 'Stats reports 175 total students');
assert(stats.totalUniqueAttendees === 1, 'Stats reports 1 unique attendee');
assert(stats.allGamesStats.bb_g1.totalCheckIns === 1, 'bb_g1 has 1 total check-in');
assert(stats.allGamesStats.bb_g1.insideCount === 0, 'bb_g1 has 0 inside count (checked out)');
assert(stats.allGamesStats.vb_g1.insideCount === 1, 'vb_g1 has 1 inside count');

// Test 10: CSV export
const csv = engine.exportCSV();
assert(csv.includes('Student ID,Full Name,Team'), 'CSV contains correct header columns');
assert(csv.includes('BB 1 (CE vs ME) Status'), 'CSV contains BB 1 (CE vs ME) column');
assert(csv.includes('VB 1 (CPE/ECE vs ME) Status'), 'CSV contains VB 1 (CPE/ECE vs ME) column');
assert(csv.includes(testStudent.studentCode), 'CSV contains test student record');

// Test 11: JSON export
const jsonStr = engine.exportJSON();
assert(typeof jsonStr === 'string' && jsonStr.length > 500, 'JSON export generates complete valid string');
const parsedBackup = JSON.parse(jsonStr);
assert(parsedBackup.state && parsedBackup.state.students, 'JSON backup contains full student state');
assert(parsedBackup.state.students[testStudent.id].games.vb_g1.status === 'INSIDE', 'JSON backup reflects up-to-the-second scan states');

// Test 12: Direct Local File Handle integration
let mockDiskBuffer = '';
const mockHandle = {
  name: 'EngDay_Backup_Test.json',
  createWritable: async () => ({
    write: async (content) => { mockDiskBuffer = content; },
    close: async () => {}
  })
};
engine.setLocalFileHandle(mockHandle);
assert(engine.getLocalFileHandle() === mockHandle, 'Local file handle registered');
await engine.writeToLocalFileHandle();
// Test 13: Online Auto-Sync Methods
const syncStatus = engine.getSyncStatus();
assert(typeof syncStatus === 'object', 'getSyncStatus returns status object');
assert('pendingCount' in syncStatus, 'Sync status includes pending count');
assert(typeof engine.syncNow === 'function', 'syncNow method is defined');
assert(typeof engine.setServerUrl === 'function', 'setServerUrl method is defined');
engine.setServerUrl('http://127.0.0.1:3000');
// Test 14: JSON import / restore
assert(typeof engine.importJSON === 'function', 'importJSON method is defined');
const simulatedBackup = {
  exportedAt: new Date().toISOString(),
  state: {
    students: {
      [testStudent.id]: {
        ...testStudent,
        games: {
          ...testStudent.games,
          vb_g3: {
            gameId: 'vb_g3',
            status: 'INSIDE',
            lastAction: 'check_in',
            checkInTime: new Date().toISOString(),
            checkOutTime: null,
            displayCheckIn: '9:15 AM',
            displayCheckOut: null,
            visits: 1,
            history: []
          }
        }
      }
    }
  }
};
const importRes = engine.importJSON(simulatedBackup);
assert(importRes.success === true, 'importJSON successfully parsed and applied backup');
assert(importRes.mergedScans >= 1, 'importJSON reported merged scans');
assert(engine.state.students[testStudent.id].games.vb_g3.status === 'INSIDE', 'Imported student reflects INSIDE status for vb_g3');

console.log('----------------------------------------------------');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed === 0) {
  console.log('🎉 ALL ENGINEERING DAY ATTENDANCE TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
