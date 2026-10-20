import Pagination from './components/Pagination';
import { useEffect, useRef, useState } from 'react';
import { Search, RotateCcw, Eye, Pencil, Trash2, X, TriangleAlert } from 'lucide-react';
import { initialReservations, reservationRooms, reservationStatuses, paymentStatuses, nightsBetween, validateReservation } from './reservation-data';
import './reservations.css';

const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value);
const date = value => new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const roomFor = booking => reservationRooms.find(room => room.id === booking.roomId);
const badgeClass = status => 'booking-badge ' + status.toLowerCase();
function BookingDialog({ title, children, onClose, compact, edit }) {
  const ref = useRef(null);
  useEffect(() => { const element = ref.current; element.showModal(); return () => element.close(); }, []);
  return <dialog ref={ref} className={'booking-modal' + (compact ? ' compact' : '') + (edit ? ' editing' : '')} aria-labelledby="booking-modal-title" onCancel={onClose}><header><h2 id="booking-modal-title">{title}</h2><button className="admin-icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></header>{children}</dialog>;
}
function EditReservation({ booking, onSave, onClose }) {
  const [draft, setDraft] = useState(booking);
  const [error, setError] = useState('');
  const room = roomFor(draft);
  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const total = nights > 0 ? nights * room.rate : 0;
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  return <BookingDialog title="Edit Reservation" onClose={onClose} edit><form onSubmit={event => { event.preventDefault(); setError(onSave({ ...draft, name: draft.name.trim(), contact: draft.contact.trim() }) || ''); }}>
    <div className="booking-body"><div className="booking-form-grid">
      <label>Guest Full Name<input required maxLength={100} value={draft.name} onChange={e => update('name', e.target.value)} /></label>
      <label>Contact Email / Phone<input required maxLength={150} value={draft.contact} onChange={e => update('contact', e.target.value)} /></label>
      <label>Assigned Room<select value={draft.roomId} onChange={e => update('roomId', e.target.value)}>{reservationRooms.map(r => <option key={r.id} value={r.id}>Room {r.id} ({r.category} – {money(r.rate)}/night)</option>)}</select></label>
      <label>Number of Guests<div className="booking-guests"><input type="number" min="1" max={room.capacity} step="1" required value={draft.guests} onChange={e => update('guests', Number(e.target.value))} /><span>Room capacity: {room.capacity}</span></div></label>
      <label>Check-in Date<input type="date" required value={draft.checkIn} onChange={e => update('checkIn', e.target.value)} /></label>
      <label>Check-out Date<input type="date" required min={draft.checkIn} value={draft.checkOut} onChange={e => update('checkOut', e.target.value)} /></label>
      <label>Reservation Status<select value={draft.status} onChange={e => update('status', e.target.value)}>{reservationStatuses.filter(s => s !== 'Cancelled').map(s => <option key={s}>{s}</option>)}</select></label>
      <div><label>Payment Status<select value={draft.payment} onChange={e => update('payment', e.target.value)}>{paymentStatuses.map(s => <option key={s}>{s}</option>)}</select></label><label className="booking-amount">Amount Paid (₱)<input type="number" min="0" step="0.01" required value={draft.amount} onChange={e => update('amount', Number(e.target.value))} /></label></div>
    </div><p className="booking-total">Booking total: <strong>{money(total)}</strong> · {Math.max(0, nights) || 0} nights. Adjust payment amount if dates or room change.</p>{error && <p className="booking-error" role="alert">{error}</p>}</div>
    <footer><button type="button" className="account-secondary" onClick={onClose}>Cancel</button><button className="account-submit" type="submit">Save Changes</button></footer>
  </form></BookingDialog>;
}
function ViewReservation({ booking, onClose, onEdit, onCancel, onStatus, readOnly }) {
  const room = roomFor(booking);
  const [error, setError] = useState('');
  const active = ['Pending', 'Checked-in'].includes(booking.status);
  return <BookingDialog title={<><span>#{booking.id}</span><span className={badgeClass(booking.status)}>{booking.status}</span></>} onClose={onClose}>
    <div className="booking-body"><div className="booking-overview-grid">
      <section><h3>Guest Information</h3><strong>{booking.name}</strong><p>{booking.contact}</p><small>Identity verification: Not recorded</small></section>
      <section><h3>Room Assignment</h3><strong>Room {room.id} — {room.category}</strong><p>Capacity: {room.capacity} guests · {money(room.rate)} / night</p><small>{booking.status === 'Checked-in' ? 'Booking occupancy: Checked-in' : 'Booking status: ' + booking.status}</small></section>
    </div><div className="booking-summary">{[
      ['Check-in', date(booking.checkIn), '2:00 PM'], ['Check-out', date(booking.checkOut), '12:00 PM'], ['Duration', nightsBetween(booking.checkIn, booking.checkOut) + ' Nights', booking.guests + ' Guests'], ['Total Paid', money(booking.amount), booking.payment],
    ].map(([label, value, detail]) => <div key={label}><small>{label}</small><strong>{value}</strong><small>{detail}</small></div>)}</div>{error && <p className="booking-error" role="alert">{error}</p>}</div>
    {!readOnly && <footer><div className="booking-operational"><span>Operational Status:</span><button className="booking-checkin" disabled={booking.status !== 'Pending'} onClick={() => setError(onStatus('Checked-in') || '')}>Check-in</button><button className="booking-checkout" disabled={booking.status !== 'Checked-in'} onClick={() => setError(onStatus('Checked-out') || '')}>Check-out</button></div>{active && <><button className="booking-edit" onClick={onEdit}>Edit Reservation</button><button className="booking-cancel" onClick={onCancel}>Cancel Reservation</button></>}</footer>}
  </BookingDialog>;
}
function CancelReservation({ booking, onClose, onConfirm }) {
  const room = roomFor(booking);
  return <BookingDialog title={<><span className="booking-warning"><TriangleAlert size={21} /></span>Cancel Reservation?</>} onClose={onClose} compact>
    <div className="booking-body"><p className="booking-cancel-copy">Are you sure you want to cancel reservation <strong>#{booking.id}</strong> for <strong>{booking.name}</strong>? This removes the booking from active reservations and releases its dates in this demo booking list.</p><dl className="booking-cancel-details"><div><dt>Dates:</dt><dd>{date(booking.checkIn)} – {date(booking.checkOut)}</dd></div><div><dt>Room:</dt><dd>Room {room.id} ({room.category})</dd></div><div><dt>Refund Policy:</dt><dd>Review required</dd></div></dl><p className="booking-disclaimer">No refund is processed. The cancelled record remains available through the status filter.</p></div><footer><button className="account-secondary" onClick={onClose}>Keep Reservation</button><button className="booking-confirm-cancel" onClick={onConfirm}>Cancel Reservation</button></footer>
  </BookingDialog>;
}
export default function ReservationManagement({ readOnly = false }) {
  const [bookings, setBookings] = useState(initialReservations);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [stayDate, setStayDate] = useState('');
  const [roomId, setRoomId] = useState('All Rooms');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const selected = bookings.find(b => b.id === modal?.id);
  const filtered = bookings.filter(b => (b.id + ' ' + b.name + ' Room ' + b.roomId).toLowerCase().includes(search.trim().toLowerCase()) && (status === 'All Statuses' ? b.status !== 'Cancelled' : b.status === status) && (!stayDate || b.checkIn <= stayDate && stayDate < b.checkOut) && (roomId === 'All Rooms' || b.roomId === roomId));
  const pages = Math.max(1, Math.ceil(filtered.length / 7));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 7, currentPage * 7);
  const close = () => setModal(null);
  function save(value) {
    if (readOnly) return 'Staff access is view-only.';
    const error = validateReservation(value, bookings);
    if (error) return error;
    setBookings(bookings.map(b => b.id === value.id ? value : b));
    setNotice('Reservation #' + value.id + ' updated.');
    close(); return '';
  }
  function changeStatus(next) {
    if (readOnly) return 'Staff access is view-only.';
    const updated = { ...selected, status: next };
    const error = validateReservation(updated, bookings);
    if (error) return error;
    setBookings(bookings.map(b => b.id === selected.id ? updated : b));
    setNotice('Reservation #' + selected.id + ' marked ' + next.toLowerCase() + '.');
    return '';
  }
  return <>
    <p className="booking-demo">Demo reservations · changes reset when you leave this page · room inventory is not synchronized</p>
    <div className="booking-filters"><label className="admin-search"><Search size={18} /><input aria-label="Search reservations" placeholder="Search reservation, guest name, or room..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><label>Status:<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['All Statuses', ...reservationStatuses].map(s => <option key={s}>{s}</option>)}</select></label><label>Stay date:<input type="date" value={stayDate} onChange={e => { setStayDate(e.target.value); setPage(1); }} /></label><label>Room:<select value={roomId} onChange={e => { setRoomId(e.target.value); setPage(1); }}><option>All Rooms</option>{reservationRooms.map(r => <option key={r.id} value={r.id}>Room {r.id}</option>)}</select></label><button className="admin-icon-button" aria-label="Reset reservation filters" onClick={() => { setSearch(''); setStatus('All Statuses'); setStayDate(''); setRoomId('All Rooms'); setPage(1); }}><RotateCcw size={18} /></button></div>
    {notice && <p className="booking-notice" role="status">{notice}</p>}
    <section className="booking-table-panel" aria-label="Reservations"><div className="booking-table-scroll"><table><thead><tr>{['Guest Name', 'Room', 'Check-in', 'Check-out', 'Guests', 'Payment', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(b => <tr key={b.id}><td><strong>{b.name}</strong><small>#{b.id}</small></td><td>Room {b.roomId}<small>{roomFor(b).category}</small></td><td>{date(b.checkIn)}<small>2:00 PM</small></td><td>{date(b.checkOut)}<small>12:00 PM</small></td><td>{b.guests}</td><td className={b.payment === 'Paid in Full' ? 'booking-paid' : ''}>{b.payment} ({money(b.amount)})</td><td><span className={badgeClass(b.status)}>{b.status}</span></td><td><div className="booking-row-actions"><button aria-label={'View ' + b.id} onClick={() => setModal({ mode: 'view', id: b.id })}><Eye size={17} /></button>{!readOnly && ['Pending', 'Checked-in'].includes(b.status) && <><button aria-label={'Edit ' + b.id} onClick={() => setModal({ mode: 'edit', id: b.id })}><Pencil size={17} /></button><button aria-label={'Cancel ' + b.id} onClick={() => setModal({ mode: 'cancel', id: b.id })}><Trash2 size={17} /></button></>}</div></td></tr>)}</tbody></table>{!visible.length && <p className="admin-empty">No reservations match your filters.</p>}</div><Pagination page={currentPage} total={filtered.length} pageSize={7} onChange={setPage} noun="reservations" /></section>
    {selected && modal.mode === 'view' && <ViewReservation readOnly={readOnly} booking={selected} onClose={close} onEdit={() => setModal({ mode: 'edit', id: selected.id })} onCancel={() => setModal({ mode: 'cancel', id: selected.id })} onStatus={changeStatus} />}
    {!readOnly && selected && modal.mode === 'edit' && <EditReservation booking={selected} onSave={save} onClose={close} />}
    {!readOnly && selected && modal.mode === 'cancel' && <CancelReservation booking={selected} onClose={close} onConfirm={() => { setBookings(bookings.map(b => b.id === selected.id ? { ...b, status: 'Cancelled' } : b)); setNotice('Reservation #' + selected.id + ' cancelled. View it using the Cancelled status filter.'); close(); }} />}
  </>;
}


