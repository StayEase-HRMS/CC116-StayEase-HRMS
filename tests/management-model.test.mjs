import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBooking, transitionBooking, saveRoom, removeRoom, reportRecords, sortRecords, sendSupportMessage } from '../src/state/management-model.js';

const fixture = () => ({
  rooms: [
    { id: '101', name: 'Room 101', category: 'Standard Room', price: 2400, status: 'Available' },
    { id: '204', name: 'Room 204', category: 'Deluxe Room', price: 3500, status: 'Available' },
  ],
  reservations: [{ id: 'A', name: 'Guest', contact: 'guest@example.com', roomId: '101', checkIn: '2026-10-23', checkOut: '2026-10-26', guests: 2, status: 'Pending', payment: 'Paid in Full', amount: 7200, rate: 2400 }],
  tickets: [{ id: 1, status: 'Open', messages: [] }],
});
const today = '2026-10-23';

test('confirmation, check-in and checkout atomically update shared records', () => {
  const original = fixture();
  let state = transitionBooking(original, 'A', 'Confirmed', today);
  assert.equal(state.rooms[0].status, 'Available');
  state = transitionBooking(state, 'A', 'Checked-in', today);
  assert.equal(state.rooms[0].status, 'Occupied');
  state = transitionBooking(state, 'A', 'Checked-out', today);
  assert.equal(state.rooms[0].status, 'Needs Cleaning');
  assert.equal(state.reservations[0].departedOn, today);
  assert.equal(original.reservations[0].status, 'Pending');
  assert.throws(() => transitionBooking(state, 'A', 'Checked-out', today), /already/);
});

test('duplicate confirmation and skipped or reversed transitions are rejected', () => {
  const state = transitionBooking(fixture(), 'A', 'Confirmed', today);
  assert.throws(() => transitionBooking(state, 'A', 'Confirmed', today), /already/);
  assert.throws(() => transitionBooking(fixture(), 'A', 'Checked-in', today), /not allowed/);
  assert.throws(() => transitionBooking(state, 'A', 'Pending', today), /not allowed/);
});

test('check-in requires a ready room and a current stay', () => {
  const state = transitionBooking(fixture(), 'A', 'Confirmed', today);
  for (const status of ['Maintenance', 'Needs Cleaning', 'Vacant', 'Occupied']) {
    const blocked = { ...state, rooms: state.rooms.map(r => r.id === '101' ? { ...r, status } : r) };
    assert.throws(() => transitionBooking(blocked, 'A', 'Checked-in', today), /clean and available/);
  }
  assert.throws(() => transitionBooking(state, 'A', 'Checked-in', '2026-10-22'), /stay dates/);
  assert.throws(() => transitionBooking(state, 'A', 'Checked-in', '2026-10-26'), /stay dates/);
});

test('unpaid arrivals and departures cannot claim settlement', () => {
  const state = fixture();
  state.reservations[0] = { ...state.reservations[0], status: 'Confirmed', payment: 'Unpaid', amount: 0 };
  assert.throws(() => transitionBooking(state, 'A', 'Checked-in', today), /Settle/);
  state.reservations[0].status = 'Checked-in';
  state.rooms[0].status = 'Occupied';
  assert.throws(() => transitionBooking(state, 'A', 'Checked-out', today), /Settle/);
});

test('overlapping active bookings and invalid capacity are rejected', () => {
  const state = fixture();
  state.reservations.push({ ...state.reservations[0], id: 'B' });
  assert.throws(() => saveBooking(state, state.reservations[0], today), /overlapping/);
  assert.throws(() => saveBooking(fixture(), { ...fixture().reservations[0], guests: 3 }, today), /capacity/);
});

test('adjacent stays do not overlap and cancelled stays release availability', () => {
  const state = fixture();
  state.reservations.push({ ...state.reservations[0], id: 'B', checkIn: '2026-10-26', checkOut: '2026-10-29' });
  assert.doesNotThrow(() => saveBooking(state, state.reservations[0], today));
  const cancelled = transitionBooking(state, 'A', 'Cancelled', today);
  assert.equal(cancelled.rooms[0].status, 'Available');
  assert.throws(() => transitionBooking(cancelled, 'A', 'Confirmed', today), /not allowed|cannot be edited/);
});

test('invalid dates and inconsistent payments are rejected', () => {
  const state = fixture();
  for (const patch of [{ checkOut: '2026-02-30' }, { checkOut: today }, { amount: NaN }, { payment: 'Unpaid', amount: 5 }, { amount: 1 }]) {
    assert.throws(() => saveBooking(state, { ...state.reservations[0], ...patch }, today));
  }
});

test('booking rates are retained when the room price changes', () => {
  const state = saveRoom(fixture(), { ...fixture().rooms[0], price: 3000 });
  const saved = saveBooking(state, { ...state.reservations[0], name: 'Updated Guest' }, today);
  assert.equal(saved.reservations[0].rate, 2400);
  assert.equal(saved.reservations[0].amount, 7200);
});

test('room reassignment uses the new rate and occupied stays cannot move', () => {
  const state = fixture();
  const saved = saveBooking(state, { ...state.reservations[0], roomId: '204', amount: 10500 }, today);
  assert.equal(saved.reservations[0].rate, 3500);
  const checkedIn = transitionBooking(transitionBooking(state, 'A', 'Confirmed', today), 'A', 'Checked-in', today);
  assert.throws(() => saveBooking(checkedIn, { ...checkedIn.reservations[0], roomId: '204', amount: 10500 }, today), /cannot change/);
});

test('room CRUD enforces unique names, occupancy, and historical references', () => {
  const state = fixture();
  assert.throws(() => saveRoom(state, { ...state.rooms[1], name: '  ROOM 101 ' }), /already exists/);
  assert.throws(() => saveRoom(state, { ...state.rooms[0], status: 'Occupied' }), /check-in/);
  assert.throws(() => removeRoom(state, '101'), /history/);
  const removed = removeRoom(state, '204');
  assert.equal(removed.rooms.length, 1);
  assert.equal(saveRoom(removed, state.rooms[1]).rooms.length, 2);
  const checkedIn = transitionBooking(transitionBooking(state, 'A', 'Confirmed', today), 'A', 'Checked-in', today);
  assert.throws(() => saveRoom(checkedIn, { ...checkedIn.rooms[0], status: 'Available' }), /Check out/);
});

test('reports derive their totals from reservations and respect empty/invalid periods', () => {
  const state = fixture();
  const records = reportRecords(state, '2026-10-23', '2026-10-24');
  assert.equal(records.length, 2);
  assert.equal(records.reduce((sum, r) => sum + r.bookings, 0), 1);
  assert.equal(records.reduce((sum, r) => sum + r.guests, 0), 2);
  assert.equal(records[0].pending, 1);
  assert.equal(reportRecords(state, '2026-09-01', '2026-09-02')[0].bookings, 0);
  assert.deepEqual(reportRecords(state, 'bad', today), []);
  assert.deepEqual(reportRecords(state, '2026-10-24', today), []);
  assert.deepEqual(reportRecords(state, '2025-01-01', '2026-12-01'), []);
});

test('checkout changes historical occupancy at the actual departure date', () => {
  let state = transitionBooking(transitionBooking(fixture(), 'A', 'Confirmed', today), 'A', 'Checked-in', today);
  assert.equal(reportRecords(state, today, today)[0].occupied, 1);
  state = transitionBooking(state, 'A', 'Checked-out', '2026-10-24');
  const records = reportRecords(state, today, '2026-10-25');
  assert.deepEqual(records.map(r => r.occupied), [1, 0, 0]);
});

test('sorting is numeric, reversible, and does not mutate the source', () => {
  const rows = [{ room: 'Room 10', rating: 5 }, { room: 'Room 2', rating: 1 }];
  assert.deepEqual(sortRecords(rows, 'room').map(r => r.room), ['Room 2', 'Room 10']);
  assert.deepEqual(sortRecords(rows, 'rating', 'desc').map(r => r.rating), [5, 1]);
  assert.equal(rows[0].room, 'Room 10');
});

test('support preserves history and orders messages chronologically', () => {
  const first = sendSupportMessage(fixture(), 1, ' First reply ', '2026-10-23T10:00:00Z');
  const second = sendSupportMessage(first, 1, 'Earlier reply', '2026-10-23T09:00:00Z');
  assert.equal(first.tickets[0].messages.length, 1);
  assert.deepEqual(second.tickets[0].messages.map(m => m.text), ['Earlier reply', 'First reply']);
  assert.equal(second.tickets[0].status, 'In Progress');
  const offset = sendSupportMessage(second, 1, 'Earlier local time', '2026-10-23T10:00:00+08:00');
  assert.equal(offset.tickets[0].messages[0].text, 'Earlier local time');
  assert.throws(() => sendSupportMessage(second, 1, ' '), /Enter a message/);
  assert.throws(() => sendSupportMessage(second, 1, 'x'.repeat(2001)), /2000/);
  second.tickets[0].status = 'Resolved';
  assert.throws(() => sendSupportMessage(second, 1, 'Reply'), /Reopen/);
});
