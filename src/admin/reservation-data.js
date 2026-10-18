export const reservationRooms = [
  { id: '204', category: 'Deluxe Room', rate: 3500, capacity: 3 },
  { id: '305', category: 'Executive Suite', rate: 5800, capacity: 3 },
  { id: '210', category: 'Deluxe Room', rate: 3500, capacity: 3 },
  { id: '402', category: 'Family Room', rate: 4600, capacity: 4 },
  { id: '101', category: 'Standard Room', rate: 2400, capacity: 2 },
];
export const initialReservations = [
  { id: 'SE-8492', name: 'Dayapera', contact: 'dayapera@example.com', roomId: '204', checkIn: '2026-10-23', checkOut: '2026-10-26', guests: 2, status: 'Checked-in', payment: 'Paid in Full', amount: 10500 },
  { id: 'SE-8493', name: 'Zantua', contact: 'zantua@example.com', roomId: '305', checkIn: '2026-10-24', checkOut: '2026-10-27', guests: 3, status: 'Checked-in', payment: 'Paid in Full', amount: 17400 },
  { id: 'SE-8494', name: 'Denina', contact: 'denina@example.com', roomId: '210', checkIn: '2026-10-24', checkOut: '2026-10-27', guests: 3, status: 'Checked-in', payment: 'Paid in Full', amount: 10500 },
  { id: 'SE-8495', name: 'Puerta', contact: 'puerta@example.com', roomId: '402', checkIn: '2026-10-25', checkOut: '2026-10-28', guests: 4, status: 'Pending', payment: 'Paid in Full', amount: 13800 },
  { id: 'SE-8496', name: 'Fabi', contact: 'fabi@example.com', roomId: '101', checkIn: '2026-10-20', checkOut: '2026-10-23', guests: 1, status: 'Checked-out', payment: 'Settled', amount: 7200 },
];
export const reservationStatuses = ['Pending', 'Checked-in', 'Checked-out', 'Cancelled'];
export const paymentStatuses = ['Unpaid', 'Partially Paid', 'Paid in Full', 'Settled'];
export const nightsBetween = (start, end) => (Date.parse(end) - Date.parse(start)) / 86400000;
export function validateReservation(value, records) {
  if (!value.name.trim() || !value.contact.trim()) return 'Enter the guest name and contact details.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(value.checkOut) || !(nightsBetween(value.checkIn, value.checkOut) > 0)) return 'Check-out must be after check-in.';
  const room = reservationRooms.find(r => r.id === value.roomId);
  if (!room || !Number.isInteger(value.guests) || value.guests < 1 || value.guests > room.capacity) return 'Guest count exceeds the selected room capacity.';
  if (!Number.isFinite(value.amount) || value.amount < 0) return 'Enter a valid non-negative payment amount.';
  if (!reservationStatuses.includes(value.status) || !paymentStatuses.includes(value.payment)) return 'Select valid reservation and payment statuses.';
  const total = nightsBetween(value.checkIn, value.checkOut) * room.rate;
  if (value.payment === 'Unpaid' && value.amount !== 0) return 'Unpaid reservations must have a payment amount of zero.';
  if (value.payment === 'Partially Paid' && !(value.amount > 0 && value.amount < total)) return 'Partial payment must be greater than zero and less than the booking total.';
  if (['Paid in Full', 'Settled'].includes(value.payment) && value.amount !== total) return 'For full or settled payment, the amount must match the booking total.';
  if (['Pending', 'Checked-in'].includes(value.status) && records.some(r => r.id !== value.id && r.roomId === value.roomId && ['Pending', 'Checked-in'].includes(r.status) && value.checkIn < r.checkOut && value.checkOut > r.checkIn)) return 'This room already has a reservation overlapping these dates.';
  return '';
}
