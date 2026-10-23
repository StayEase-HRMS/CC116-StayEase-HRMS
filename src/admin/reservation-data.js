export const initialReservations = [
  { id: 'SE-8492', name: 'Dayapera', contact: 'dayapera@example.com', roomId: '204', checkIn: '2026-10-23', checkOut: '2026-10-26', guests: 2, status: 'Checked-in', payment: 'Paid in Full', amount: 10500 },
  { id: 'SE-8493', name: 'Zantua', contact: 'zantua@example.com', roomId: '305', checkIn: '2026-10-24', checkOut: '2026-10-27', guests: 3, status: 'Confirmed', payment: 'Paid in Full', amount: 17400 },
  { id: 'SE-8494', name: 'Denina', contact: 'denina@example.com', roomId: '210', checkIn: '2026-10-24', checkOut: '2026-10-27', guests: 3, status: 'Pending', payment: 'Paid in Full', amount: 10500 },
  { id: 'SE-8495', name: 'Puerta', contact: 'puerta@example.com', roomId: '402', checkIn: '2026-10-25', checkOut: '2026-10-28', guests: 4, status: 'Pending', payment: 'Paid in Full', amount: 13800 },
  { id: 'SE-8496', name: 'Fabi', contact: 'fabi@example.com', roomId: '101', checkIn: '2026-10-20', checkOut: '2026-10-23', guests: 1, status: 'Checked-out', payment: 'Settled', amount: 7200 },
];
export const reservationStatuses = ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'Declined'];
export const paymentStatuses = ['Unpaid', 'Partially Paid', 'Paid in Full', 'Settled'];
export { nightsBetween } from '../state/management-model';
