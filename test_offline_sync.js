// test_offline_sync.js
// Automated verification for Offline-First Distributed Attendance System

const BASE_URL = 'http://localhost:3333';

async function runTests() {
  console.log('--- STARTING OFFLINE-FIRST ATTENDANCE SYSTEM TESTS ---');
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

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/health`);
    assert(res.ok, 'Health check HTTP 200');
    const health = await res.json();
    assert(health.ok === true, 'Health check reports ok: true');
    assert(typeof health.serverTime === 'string', 'Health check returns serverTime');
    assert(typeof health.eventsCount === 'number', 'Health check returns eventsCount');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 2. Fetch Initial State
  let initialEventsCount = 0;
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/state`);
    assert(res.ok, 'State endpoint HTTP 200');
    const state = await res.json();
    assert(state.students && Object.keys(state.students).length >= 170, 'State contains registered students roster');
    initialEventsCount = state.stats ? state.stats.eventsCount : 0;
  } catch (err) {
    assert(false, `State check failed: ${err.message}`);
  }

  // 3. Batch Event Sync (New Events)
  const dev1 = 'MARSHAL-GATE-A';
  const dev2 = 'MARSHAL-GATE-B';
  const testEventId1 = 'test-evt-' + Date.now() + '-1';
  const testEventId2 = 'test-evt-' + Date.now() + '-2';
  const time1 = new Date(Date.now() - 60000).toISOString();
  const time2 = new Date().toISOString();

  const batch1 = {
    deviceId: dev1,
    marshalId: 'Marshal Alex',
    gateId: 'Gate 1 North',
    events: [
      {
        eventId: testEventId1,
        studentId: 'student-0005',
        action: 'check_in',
        occurredAt: time1,
        deviceId: dev1,
        marshalId: 'Marshal Alex',
        gateId: 'Gate 1 North',
        localSequence: 1,
        createdAt: time1,
        method: 'qr_scan'
      },
      {
        eventId: testEventId2,
        studentId: 'student-0006',
        action: 'check_in',
        occurredAt: time2,
        deviceId: dev1,
        marshalId: 'Marshal Alex',
        gateId: 'Gate 1 North',
        localSequence: 2,
        createdAt: time2,
        method: 'qr_scan'
      }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch1)
    });
    assert(res.ok, 'Sync endpoint HTTP 200 for batch 1');
    const syncRes = await res.json();
    assert(syncRes.accepted.includes(testEventId1), 'Event 1 accepted by server');
    assert(syncRes.accepted.includes(testEventId2), 'Event 2 accepted by server');
    assert(syncRes.duplicate.length === 0, 'No duplicates in first batch');
    assert(syncRes.rejected.length === 0, 'No rejections in valid batch');
  } catch (err) {
    assert(false, `Sync batch 1 failed: ${err.message}`);
  }

  // 4. Idempotency Test (Submit Same Batch Again)
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch1)
    });
    assert(res.ok, 'Sync endpoint HTTP 200 for re-submitted duplicate batch');
    const syncRes = await res.json();
    assert(syncRes.accepted.length === 0, 'Zero accepted on identical duplicate batch');
    assert(syncRes.duplicate.includes(testEventId1), 'Event 1 flagged as duplicate');
    assert(syncRes.duplicate.includes(testEventId2), 'Event 2 flagged as duplicate');
  } catch (err) {
    assert(false, `Idempotency re-submit failed: ${err.message}`);
  }

  // 5. Mixed Batch (1 Duplicate + 1 New)
  const testEventId3 = 'test-evt-' + Date.now() + '-3';
  const batchMixed = {
    deviceId: dev1,
    events: [
      batch1.events[0], // Duplicate (testEventId1)
      {
        eventId: testEventId3,
        studentId: 'student-0007',
        action: 'check_in',
        occurredAt: new Date().toISOString(),
        deviceId: dev1,
        localSequence: 3,
        createdAt: new Date().toISOString(),
        method: 'qr_scan'
      }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchMixed)
    });
    const syncRes = await res.json();
    assert(syncRes.accepted.includes(testEventId3), 'New Event 3 accepted');
    assert(syncRes.duplicate.includes(testEventId1), 'Duplicate Event 1 reported as duplicate');
  } catch (err) {
    assert(false, `Mixed batch failed: ${err.message}`);
  }

  // 6. Multi-Device Sequential Check-In / Check-Out & Deterministic Resolution
  // Student 0010: Check-In on Device A at T1, Check-Out on Device B at T2
  const tStudent = 'student-0010';
  const timeA = new Date(Date.now() - 30000).toISOString();
  const timeB = new Date(Date.now() - 10000).toISOString();
  const evA = {
    eventId: 'evt-devA-' + Date.now(),
    studentId: tStudent,
    action: 'check_in',
    occurredAt: timeA,
    deviceId: 'DEVICE-A',
    marshalId: 'Marshal A',
    localSequence: 1,
    createdAt: timeA
  };
  const evB = {
    eventId: 'evt-devB-' + Date.now(),
    studentId: tStudent,
    action: 'check_out',
    reason: 'Lunch Break',
    expectedReturn: '13:00',
    occurredAt: timeB,
    deviceId: 'DEVICE-B',
    marshalId: 'Marshal B',
    localSequence: 1,
    createdAt: timeB
  };

  try {
    // Send Device A scan
    await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'DEVICE-A', events: [evA] })
    });

    // Send Device B scan
    await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'DEVICE-B', events: [evB] })
    });

    // Verify derived state
    const resState = await fetch(`${BASE_URL}/api/attendance/state`);
    const stData = await resState.json();
    const st10 = stData.students[tStudent];
    assert(st10.status === 'OUTSIDE', `Multi-device reconciliation: student 10 status is OUTSIDE (was ${st10.status})`);
    assert(st10.exitReason === 'Lunch Break', 'Multi-device exitReason preserved correctly');
    assert(st10.expectedReturn === '13:00', 'Multi-device expectedReturn preserved correctly');
    assert(st10.lastAction === 'check_out', 'Multi-device lastAction is check_out');
  } catch (err) {
    assert(false, `Multi-device reconciliation failed: ${err.message}`);
  }

  // 7. Validation: Malformed Event Rejection
  const malformedBatch = {
    deviceId: 'DEV-TEST',
    events: [
      {
        // Missing eventId
        studentId: 'student-0015',
        action: 'check_in'
      },
      {
        eventId: 'invalid-action-' + Date.now(),
        studentId: 'student-0016',
        action: 'FLY_TO_SPACE', // Invalid action
        occurredAt: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/attendance/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(malformedBatch)
    });
    const syncRes = await res.json();
    assert(syncRes.rejected.length === 2, 'Malformed events properly rejected without corrupting state');
    assert(syncRes.accepted.length === 0, 'No malformed events accepted');
  } catch (err) {
    assert(false, `Malformed event test failed: ${err.message}`);
  }

  // 8. Audit Log Events Query
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/events?limit=5`);
    assert(res.ok, 'Query events endpoint HTTP 200');
    const evData = await res.json();
    assert(Array.isArray(evData.events), 'Events list returned as array');
    assert(evData.events.length > 0, 'Event log contains persisted events');
    const firstEv = evData.events[0];
    assert(firstEv.eventId && firstEv.studentId && firstEv.occurredAt, 'Events contain eventId, studentId, occurredAt');
  } catch (err) {
    assert(false, `Query events failed: ${err.message}`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL OFFLINE-FIRST DISTRIBUTED ATTENDANCE TESTS PASSED!');
  } else {
    console.error('⚠️ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTests();
