// Pure business rules shared by Admin and Staff; no network or persistence.
export const activeStatuses = ['Pending', 'Confirmed', 'Checked-in'];
export const roomStatuses = ['Available', 'Occupied', 'Needs Cleaning', 'Vacant', 'Maintenance'];
export const categoryCapacity = { 'Standard Room': 2, 'Deluxe Room': 3, 'Executive Suite': 3, 'Family Room': 4 };
export const todayInManila = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const roomKey = name => name.trim().toLowerCase().replace(/^room\s*/, '').replace(/\s+/g, ' ');
export const nightsBetween = (start, end) => (Date.parse(end) - Date.parse(start)) / 86400000;
export const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const asReservationRooms = rooms => rooms.map(r => ({ ...r, rate: r.price, capacity: r.capacity ?? categoryCapacity[r.category] ?? 2 }));

const transitions = {
  Pending: ['Confirmed', 'Cancelled', 'Declined'],
  Confirmed: ['Checked-in', 'Cancelled'],
  'Checked-in': ['Checked-out'],
  'Checked-out': [], Cancelled: [], Declined: [],
};

export function validateBooking(value, state) {
  if (!value.name?.trim() || !value.contact?.trim()) return 'Enter the guest name and contact details.';
  if (!validDate(value.checkIn) || !validDate(value.checkOut) || nightsBetween(value.checkIn, value.checkOut) <= 0) return 'Check-out must be after a valid check-in date.';
  const room = asReservationRooms(state.rooms).find(r => r.id === value.roomId);
  if (!room) return 'The assigned room no longer exists.';
  if (!Number.isInteger(value.guests) || value.guests < 1 || value.guests > room.capacity) return 'Guest count exceeds the selected room capacity.';
  if (!Object.hasOwn(transitions, value.status)) return 'Select a valid reservation status.';
  if (!['Unpaid', 'Partially Paid', 'Paid in Full', 'Settled'].includes(value.payment) || !Number.isFinite(value.amount) || value.amount < 0) return 'Enter valid payment details.';
  const total = Math.round(nightsBetween(value.checkIn, value.checkOut) * (value.rate ?? room.rate) * 100) / 100;
  if (value.payment === 'Unpaid' && value.amount !== 0) return 'Unpaid reservations must have a payment amount of zero.';
  if (value.payment === 'Partially Paid' && !(value.amount > 0 && value.amount < total)) return 'Partial payment must be between zero and the booking total.';
  if (['Paid in Full', 'Settled'].includes(value.payment) && Math.abs(value.amount - total) > 0.001) return 'Full payment must match the booking total.';
  if (activeStatuses.includes(value.status) && state.reservations.some(r => r.id !== value.id && r.roomId === value.roomId && activeStatuses.includes(r.status) && value.checkIn < r.checkOut && value.checkOut > r.checkIn)) return 'This room already has an overlapping reservation.';
  return '';
}

export function saveBooking(state, value, today = todayInManila()) {
  const previous = state.reservations.find(r => r.id === value.id);
  if (!previous) throw new Error('Reservation no longer exists.');
  const room = state.rooms.find(r => r.id === value.roomId);
  const rate = previous.roomId === value.roomId ? previous.rate ?? room?.price : room?.price;
  const updated = { ...value, rate };
  const error = validateBooking(updated, state);
  if (error) throw new Error(error);
  if (previous.status !== updated.status && !transitions[previous.status]?.includes(updated.status)) throw new Error('This reservation status change is not allowed.');
  if (['Checked-out', 'Cancelled', 'Declined'].includes(previous.status)) throw new Error('Completed reservations cannot be edited.');
  if (previous.status === 'Checked-in' && (previous.roomId !== updated.roomId || previous.checkIn !== updated.checkIn)) throw new Error('An occupied reservation cannot change its room or arrival date.');
  if (updated.status === 'Checked-in' && previous.status !== 'Checked-in') {
    if (!(updated.checkIn <= today && today < updated.checkOut)) throw new Error('Check-in is only available during the reserved stay dates.');
    if (room.status !== 'Available') throw new Error('The room must be clean and available before check-in.');
  }
  if (previous.status !== updated.status && ['Checked-in', 'Checked-out'].includes(updated.status) && !['Paid in Full', 'Settled'].includes(updated.payment)) throw new Error('Settle the reservation payment before check-in or checkout.');
  if (previous.status !== updated.status && updated.status === 'Checked-in') updated.arrivedOn = today;
  if (previous.status !== updated.status && updated.status === 'Checked-out') updated.departedOn = today;
  const rooms = state.rooms.map(r => r.id === updated.roomId && previous.status !== updated.status
    ? { ...r, status: updated.status === 'Checked-in' ? 'Occupied' : updated.status === 'Checked-out' ? 'Needs Cleaning' : r.status }
    : r);
  return { ...state, rooms, reservations: state.reservations.map(r => r.id === updated.id ? updated : r) };
}

export function transitionBooking(state, id, next, today) {
  const booking = state.reservations.find(r => r.id === id);
  if (!booking || booking.status === next) throw new Error('This action has already been completed or the reservation is unavailable.');
  return saveBooking(state, { ...booking, status: next }, today);
}

export function saveRoom(state, value) {
  const previous = state.rooms.find(r => r.id === value.id);
  if (!value.name?.trim() || !roomKey(value.name) || !Number.isFinite(value.price) || value.price <= 0 || !Object.hasOwn(categoryCapacity, value.category) || !roomStatuses.includes(value.status)) throw new Error('Enter valid room details.');
  if (state.rooms.some(r => r.id !== value.id && roomKey(r.name) === roomKey(value.name))) throw new Error('A room with this name or number already exists.');
  const occupied = state.reservations.some(r => r.roomId === value.id && r.status === 'Checked-in');
  if (occupied !== (value.status === 'Occupied')) throw new Error(occupied ? 'Check out the guest before changing the occupied room status.' : 'Use reservation check-in to mark a room occupied.');
  if (previous && previous.category !== value.category && state.reservations.some(r => r.roomId === value.id && activeStatuses.includes(r.status) && r.guests > categoryCapacity[value.category])) throw new Error('The new category cannot accommodate an active reservation.');
  const room = { ...previous, ...value, capacity: categoryCapacity[value.category] };
  return { ...state, rooms: previous ? state.rooms.map(r => r.id === value.id ? room : r) : [...state.rooms, room] };
}

export function removeRoom(state, id) {
  if (!state.rooms.some(r => r.id === id)) throw new Error('Room no longer exists.');
  if (state.reservations.some(r => r.roomId === id)) throw new Error('Rooms with reservation history cannot be removed.');
  return { ...state, rooms: state.rooms.filter(r => r.id !== id) };
}

export function reportRecords(state, start, end, today = todayInManila()) {
  if (!validDate(start) || !validDate(end) || end < start || nightsBetween(start, end) > 365) return [];
  const records = [];
  const blocked = state.rooms.filter(r => r.status === 'Maintenance').length;
  for (let timestamp = Date.parse(start); timestamp <= Date.parse(end); timestamp += 86400000) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const arrivals = state.reservations.filter(r => r.checkIn === date && !['Cancelled', 'Declined'].includes(r.status));
    const occupied = new Set(state.reservations.filter(r => ['Checked-in', 'Checked-out'].includes(r.status) && (r.arrivedOn ?? r.checkIn) <= date && date < (r.departedOn ?? r.checkOut)).map(r => r.roomId)).size;
    records.push({ date, bookings: arrivals.length, guests: arrivals.reduce((sum, r) => sum + r.guests, 0), pending: arrivals.filter(r => r.status === 'Pending').length, occupied, available: date === today ? state.rooms.filter(r => r.status === 'Available').length : Math.max(0, state.rooms.length - occupied - blocked) });
  }
  return records;
}

export function sortRecords(records, key, direction = 'asc') {
  return [...records].sort((a, b) => (typeof a[key] === 'number' ? a[key] - b[key] : String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true })) * (direction === 'asc' ? 1 : -1));
}

export function sendSupportMessage(state, id, text, now = new Date().toISOString()) {
  const ticket = state.tickets.find(t => t.id === id);
  if (!ticket || ticket.status === 'Resolved') throw new Error('Reopen this ticket before replying.');
  if (!text.trim() || text.trim().length > 2000) throw new Error('Enter a message of up to 2000 characters.');
  const message = { text: text.trim(), staff: true, createdAt: now, time: new Date(now).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }) };
  return { ...state, tickets: state.tickets.map(t => t.id === id ? { ...t, status: 'In Progress', messages: [...t.messages, message].sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0)) } : t) };
}
