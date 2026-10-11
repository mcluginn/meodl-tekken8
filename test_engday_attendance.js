// test_engday_attendance.js
import fs from 'fs';

console.log('--- TESTING ENGINEERING DAY SPORTS ATTENDANCE SYSTEM ---');

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

// Test 1: 6 Games defined
assert(Array.isArray(ENGDAY_GAMES) && ENGDAY_GAMES.length === 6, 'Exactly 6 games registered in specification');
assert(ENGDAY_GAMES.filter(g => g.sport === 'basketball').length === 3, '3 Basketball games defined (BB1, BB2, BB3)');
assert(ENGDAY_GAMES.filter(g => g.sport === 'volleyball').length === 3, '3 Volleyball games defined (VB1, VB2, VB3)');

// Test 2: Student roster initialized
const students = Object.values(engine.state.students);
assert(students.length === 175, `All 175 students initialized in roster (got ${students.length})`);

// Test 3: Student structure has all 6 games
const testStudent = students[0];
assert(testStudent && testStudent.games, 'Student has games attendance container');
assert(Object.keys(testStudent.games).length === 6, 'Student has records for all 6 games');
assert(testStudent.games.bb1.status === 'OUTSIDE', 'Student initially outside Basketball Game 1');
assert(testStudent.games.vb1.status === 'OUTSIDE', 'Student initially outside Volleyball Game 1');

// Test 4: Check-in to Basketball Game 1
engine.setActiveGame('bb1');
const checkInRes = engine.recordCheckIn(testStudent.id, 'bb1', { performedBy: 'Marshal Court A' });
assert(checkInRes.success === true, 'Check-in to Basketball Game 1 succeeded');
assert(testStudent.games.bb1.status === 'INSIDE', 'Student status is INSIDE for Basketball Game 1');
assert(testStudent.games.bb1.visits === 1, 'Visits incremented to 1 for BB1');
assert(testStudent.games.bb1.displayCheckIn !== null, 'Display check-in timestamp formatted in Manila time');

// Test 5: Verify per-game isolation: other 5 games remain OUTSIDE
assert(testStudent.games.bb2.status === 'OUTSIDE', 'Student remains OUTSIDE for Basketball Game 2');
assert(testStudent.games.bb3.status === 'OUTSIDE', 'Student remains OUTSIDE for Basketball Game 3');
assert(testStudent.games.vb1.status === 'OUTSIDE', 'Student remains OUTSIDE for Volleyball Game 1');
assert(testStudent.games.vb2.status === 'OUTSIDE', 'Student remains OUTSIDE for Volleyball Game 2');
assert(testStudent.games.vb3.status === 'OUTSIDE', 'Student remains OUTSIDE for Volleyball Game 3');

// Test 6: Check-out of Basketball Game 1
const checkOutRes = engine.recordCheckOut(testStudent.id, 'bb1', { reason: 'Game Concluded' });
assert(checkOutRes.success === true, 'Check-out of Basketball Game 1 succeeded');
assert(testStudent.games.bb1.status === 'OUTSIDE', 'Student status is OUTSIDE for Basketball Game 1');
assert(testStudent.games.bb1.displayCheckOut !== null, 'Display check-out timestamp formatted in Manila time');

// Test 7: Check-in to Volleyball Game 1
engine.setActiveGame('vb1');
const vbInRes = engine.recordCheckIn(testStudent.id, 'vb1', { performedBy: 'Marshal Court V' });
assert(vbInRes.success === true, 'Check-in to Volleyball Game 1 succeeded');
assert(testStudent.games.vb1.status === 'INSIDE', 'Student is INSIDE Volleyball Game 1');
assert(testStudent.games.bb1.status === 'OUTSIDE', 'Student remains OUTSIDE Basketball Game 1 while INSIDE Volleyball Game 1');

// Test 8: QR resolution
const qrRes = engine.resolveScanPayload(testStudent.studentCode);
assert(qrRes.success === true, 'Resolves student by studentCode string');
assert(qrRes.student.id === testStudent.id, 'Resolved student matches ID');
assert(qrRes.statusInGame === 'INSIDE', 'Returns current status in active game (vb1)');

// Test 9: Stats computation
const stats = engine.calculateStats();
assert(stats.totalStudents === 175, 'Stats reports 175 total students');
assert(stats.totalUniqueAttendees === 1, 'Stats reports 1 unique attendee');
assert(stats.allGamesStats.bb1.totalCheckIns === 1, 'BB1 has 1 total check-in');
assert(stats.allGamesStats.bb1.insideCount === 0, 'BB1 has 0 inside count (checked out)');
assert(stats.allGamesStats.vb1.insideCount === 1, 'VB1 has 1 inside count');

// Test 10: CSV export
const csv = engine.exportCSV();
assert(csv.includes('Student ID,Full Name,Team'), 'CSV contains correct header columns');
assert(csv.includes('BB Game 1 Status'), 'CSV contains BB Game 1 column');
assert(csv.includes('VB Game 1 Status'), 'CSV contains VB Game 1 column');
assert(csv.includes(testStudent.studentCode), 'CSV contains test student record');

console.log('----------------------------------------------------');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed === 0) {
  console.log('🎉 ALL ENGINEERING DAY ATTENDANCE TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
