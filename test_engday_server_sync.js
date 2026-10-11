// test_engday_server_sync.js
import { handleRequest } from './server.js';
import http from 'http';

console.log('--- TESTING ENGINEERING DAY SERVER SYNC ENDPOINTS ---');

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

// Mock request / response helper
function dispatch(method, url, body = null) {
  return new Promise((resolve) => {
    let responseData = '';
    let responseStatus = 200;
    let responseHeaders = {};

    const req = {
      method: method,
      url: url,
      headers: { 'content-type': 'application/json' },
      body: body,
      on(event, handler) {
        if (event === 'data' && body) handler(Buffer.from(JSON.stringify(body)));
        if (event === 'end') handler();
        return this;
      }
    };

    const res = {
      writeHead(status, headers) {
        responseStatus = status;
        responseHeaders = headers;
      },
      end(chunk) {
        if (chunk) responseData += chunk;
        try {
          resolve({ status: responseStatus, data: JSON.parse(responseData) });
        } catch(e) {
          resolve({ status: responseStatus, data: responseData });
        }
      }
    };

    handleRequest(req, res);
  });
}

async function runServerTests() {
  // Test 1: Health
  const healthRes = await dispatch('GET', '/api/engday/attendance/health');
  assert(healthRes.status === 200, 'EngDay health check returns HTTP 200');
  assert(healthRes.data.ok === true, 'Health reports ok: true');
  assert(healthRes.data.totalStudents === 175, 'Health reports 175 total students');
  assert(healthRes.data.games.length === 6, 'Health reports 6 games');

  // Test 2: State
  const stateRes = await dispatch('GET', '/api/engday/attendance/state');
  assert(stateRes.status === 200, 'EngDay state returns HTTP 200');
  assert(stateRes.data.students['student-0001'] !== undefined, 'State contains student-0001');
  assert(stateRes.data.students['student-0001'].games.bb1 !== undefined, 'Student has bb1 game record');

  // Test 3: Sync batch
  const testEventId = 'test_evt_' + Date.now() + '_1';
  const syncBatch = {
    deviceId: 'TEST-MARSHAL-1',
    events: [
      {
        eventId: testEventId,
        studentId: 'student-0001',
        gameId: 'bb1',
        action: 'check_in',
        occurredAt: new Date().toISOString(),
        marshalId: 'Referee A',
        court: 'Basketball Court'
      }
    ]
  };

  const syncRes = await dispatch('POST', '/api/engday/attendance/sync', syncBatch);
  assert(syncRes.status === 200, 'Sync endpoint returns HTTP 200');
  assert(syncRes.data.accepted.includes(testEventId), 'Event accepted by server');
  assert(syncRes.data.duplicate.length === 0, 'No duplicates in first batch');

  // Test 4: Idempotent duplicate re-submission
  const dupeRes = await dispatch('POST', '/api/engday/attendance/sync', syncBatch);
  assert(dupeRes.status === 200, 'Re-submitting batch returns HTTP 200');
  assert(dupeRes.data.duplicate.includes(testEventId), 'Re-submitted event flagged as duplicate');
  assert(dupeRes.data.accepted.length === 0, 'Zero new events accepted on duplicate batch');

  // Test 5: Verify student state updated on server
  const stateCheck = await dispatch('GET', '/api/engday/attendance/state');
  assert(stateCheck.data.students['student-0001'].games.bb1.status === 'INSIDE', 'Server updated student-0001 to INSIDE for bb1');
  assert(stateCheck.data.students['student-0001'].games.vb1.status === 'OUTSIDE', 'Student-0001 remains OUTSIDE for vb1');

  // Clean up: Reset test event
  await dispatch('POST', '/api/engday/attendance/reset', { confirmation: 'RESET_ENGDAY_ATTENDANCE' });
  const resetCheck = await dispatch('GET', '/api/engday/attendance/state');
  assert(resetCheck.data.students['student-0001'].games.bb1.status === 'OUTSIDE', 'Reset successfully restored clean state');

  console.log('----------------------------------------------------');
  console.log(`TOTAL SERVER TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL ENGINEERING DAY SERVER SYNC TESTS PASSED!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runServerTests();
