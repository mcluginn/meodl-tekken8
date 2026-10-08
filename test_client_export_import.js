// test_client_export_import.js
// Verification of offline export/import and event idempotency

import fs from 'fs';

// Setup browser globals simulation for Node environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k) => { store[k] = String(arguments[1] !== undefined ? arguments[1] : ''); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.localStorage.setItem = (k, v) => { store[k] = String(v); };

global.window = {
  localStorage: global.localStorage,
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


// Load meodl_data.js
const dataCode = fs.readFileSync('./assets/meodl_data.js', 'utf8');
new Function(dataCode)();

// Load meodl_attendance.js
const code = fs.readFileSync('./assets/meodl_attendance.js', 'utf8');
new Function(code)();

const engine = global.window.MEODL_ATTENDANCE;

async function runClientTests() {
  console.log('--- TESTING CLIENT-SIDE OFFLINE ENGINE & EXPORT/IMPORT ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  assert(engine !== undefined, 'MeodlAttendanceEngine loaded');
  assert(engine.deviceId && engine.deviceId.startsWith('MARSHAL-'), `Device ID created and persistent: ${engine.deviceId}`);

  // Test Check-In (Immediate zero-latency local commit)
  const student = engine.getStudents()[0];
  assert(student !== undefined, `Found student ${student.studentCode}`);

  const checkInResult = engine.recordCheckIn(student.id, {
    performedBy: 'Gate Marshal Alpha',
    method: 'qr_scan'
  });

  assert(checkInResult.success === true, 'Local check-in returned success instantly');
  assert(student.status === 'INSIDE', 'Student state updated to INSIDE immediately');
  assert(student.totalVisits === 1, 'Total visits incremented to 1');

  // Verify event created with required fields
  const event = checkInResult.event;
  assert(event.eventId && event.eventId.length > 5, 'Event has unique eventId');
  assert(event.studentId === student.id, 'Event matches studentId');
  assert(event.action === 'check_in', 'Event has action: check_in');
  assert(event.localSequence === 1, 'Event has monotonic localSequence: 1');
  assert(event.occurredAt && event.createdAt, 'Event has valid timestamps');

  // Test Check-Out
  const checkOutResult = engine.recordCheckOut(student.id, {
    reason: 'Lunch break',
    expectedReturn: '12:30',
    performedBy: 'Gate Marshal Alpha',
    method: 'qr_scan'
  });

  assert(checkOutResult.success === true, 'Local check-out returned success instantly');
  assert(student.status === 'OUTSIDE', 'Student state updated to OUTSIDE immediately');
  assert(checkOutResult.event.localSequence === 2, 'Monotonic localSequence incremented to 2');

  // Test Export Events to JSON
  let exportedJSON = null;
  engine.downloadFile = (filename, content, type) => {
    exportedJSON = content;
    assert(filename.endsWith('.json'), `Export filename is JSON: ${filename}`);
  };
  await engine.exportAttendanceEventsJSON();
  assert(exportedJSON !== null, 'JSON export produced valid output');

  const parsedPayload = JSON.parse(exportedJSON);
  assert(parsedPayload && Array.isArray(parsedPayload.events), 'Exported JSON contains events array');
  assert(parsedPayload.events.length === 2, `Exported exactly 2 events (got ${parsedPayload.events.length})`);

  // Test Export Events to CSV
  let exportedCSV = null;
  engine.downloadFile = (filename, content, type) => {
    exportedCSV = content;
    assert(filename.endsWith('.csv'), `Export filename is CSV: ${filename}`);
  };
  await engine.exportAttendanceEventsCSV();
  assert(exportedCSV !== null, 'CSV export produced valid output');
  assert(exportedCSV.includes('Event ID,Student ID,Student Code,Student Name'), 'CSV has correct header columns');
  assert(exportedCSV.includes('check_in') && exportedCSV.includes('check_out'), 'CSV contains event actions');

  // Test Import & Deduplication
  const importResult = await engine.importAttendanceEvents(exportedJSON);
  assert(importResult.imported === 0, 'Re-importing identical events imports 0 duplicates (100% idempotent)');

  console.log('\n----------------------------------------------------');
  console.log(`CLIENT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 CLIENT OFFLINE ENGINE & EXPORT/IMPORT VERIFICATION COMPLETE!');
  } else {
    process.exit(1);
  }
}

runClientTests();
