// test_attendance_remove.js
import http from 'http';

const BASE_URL = 'http://localhost:3333';

async function post(url, data) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return { status: res.status, body: await res.json() };
}

async function get(url) {
  const res = await fetch(`${BASE_URL}${url}`);
  return { status: res.status, body: await res.json() };
}

async function run() {
  console.log('Testing attendance removal & reset endpoints...');

  // 1. Sync 2 events for student-0010 (1 check-in, 1 check-out)
  const ev1 = 'del-test-1-' + Date.now();
  const ev2 = 'del-test-2-' + Date.now();

  const syncRes = await post('/api/attendance/sync', {
    deviceId: 'TEST-DEV',
    events: [
      {
        eventId: ev1,
        studentId: 'student-0010',
        studentCode: 'MEODL-0010',
        studentName: 'TEST STUDENT',
        team: 'rankine',
        action: 'check_in',
        occurredAt: new Date(Date.now() - 30000).toISOString()
      },
      {
        eventId: ev2,
        studentId: 'student-0010',
        studentCode: 'MEODL-0010',
        studentName: 'TEST STUDENT',
        team: 'rankine',
        action: 'check_out',
        reason: 'Lunch Break',
        occurredAt: new Date().toISOString()
      }
    ]
  });

  console.log('Events sync status:', syncRes.status, 'accepted:', syncRes.body.accepted);

  // Check state: student should be OUTSIDE
  let state = await get('/api/attendance/state');
  let st = state.body.students['student-0010'];
  console.log('Student status after check-in + check-out:', st.status, 'exitReason:', st.exitReason);
  if (st.status !== 'OUTSIDE') throw new Error('Expected OUTSIDE');

  // 2. Delete event 2 (check-out) -> student should revert to INSIDE!
  console.log('Deleting event 2 (checkout)...');
  const delEvRes = await post('/api/attendance/reset', { eventId: ev2 });
  console.log('Delete event 2 status:', delEvRes.status, delEvRes.body);

  state = await get('/api/attendance/state');
  st = state.body.students['student-0010'];
  console.log('Student status after checkout deleted:', st.status);
  if (st.status !== 'INSIDE') throw new Error('Expected INSIDE after checkout deleted');

  // 3. Clear student attendance completely
  console.log('Clearing all attendance for student-0010...');
  const clearStRes = await post('/api/attendance/reset', { studentId: 'student-0010' });
  console.log('Clear student status:', clearStRes.status, clearStRes.body);

  state = await get('/api/attendance/state');
  st = state.body.students['student-0010'];
  console.log('Student status after complete clear:', st.status, 'visits:', st.totalVisits);
  if (st.status !== 'OUTSIDE' || st.totalVisits !== 0) throw new Error('Expected OUTSIDE and 0 visits');

  // 4. Test Master Reset
  console.log('Testing master reset confirmation...');
  const masterRes = await post('/api/attendance/reset', { confirmation: 'RESET_ATTENDANCE' });
  console.log('Master reset status:', masterRes.status, masterRes.body);
  if (masterRes.body.ok !== true) throw new Error('Expected ok: true on master reset');

  console.log('🎉 ALL ATTENDANCE REMOVAL ENDPOINTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
