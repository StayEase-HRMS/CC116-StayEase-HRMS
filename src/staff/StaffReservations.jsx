import { useState } from 'react';
import { Check, Eye, KeyRound, LogIn, LogOut, Printer, RotateCcw, ShieldCheck } from 'lucide-react';
import { control, panel, ManagementDialog, Pagination, SearchField, StatusBadge } from '../admin/ManagementUI';
import { nightsBetween } from '../admin/reservation-data';
import './staff-print.css';

const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
const date = value => new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const initialBookings = [
  { id: 'SE-8495', name: 'Elena Rostova', room: '402', type: 'Family Suite', guests: 3, checkIn: '2024-10-24', checkOut: '2024-10-28', status: 'Pending', rate: 4600, paid: 18400 },
  { id: 'SE-8491', name: 'Marcus Vance', room: '305', type: 'Executive Suite', guests: 1, checkIn: '2024-10-24', checkOut: '2024-10-27', status: 'Confirmed', rate: 5800, paid: 17400 },
  { id: 'SE-8492', name: 'Sofia Laurent', room: '204', type: 'Deluxe Ocean View', guests: 2, checkIn: '2024-10-21', checkOut: '2024-10-24', status: 'Checked In', rate: 3500, paid: 10500 },
  { id: 'SE-8493', name: 'Daniel Lee', room: '210', type: 'Deluxe Room', guests: 2, checkIn: '2024-10-22', checkOut: '2024-10-25', status: 'Checked In', rate: 3500, paid: 10500 },
  { id: 'SE-8488', name: 'Claire Dubois', room: '108', type: 'Standard Room', guests: 1, checkIn: '2024-10-20', checkOut: '2024-10-24', status: 'Checked Out', rate: 2400, paid: 9600 },
  { id: 'SE-8500', name: 'Ana Cruz', room: '401', type: 'Family Suite', guests: 4, checkIn: '2024-10-25', checkOut: '2024-10-28', status: 'Pending', rate: 4600, paid: 13800 },
];
const actions = {
  Pending: { mode: 'confirm', label: 'Confirm', icon: ShieldCheck, tone: 'bg-[#d5a657]' },
  Confirmed: { mode: 'checkin', label: 'Check-in', icon: LogIn, tone: 'bg-[#256d48]' },
  'Checked In': { mode: 'checkout', label: 'Checkout', icon: LogOut, tone: 'bg-[#202d38]' },
};
const titles = { confirm: 'Confirm Reservation', checkin: 'Guest Check-In', checkout: 'Guest Check-Out & Room Turnover', view: 'Reservation Details', receipt: 'Receipt Preview', decline: 'Decline Reservation?' };
const descriptions = { confirm: 'Staff verification required before guest arrival.', checkin: 'Issue room key access and register arrival.', checkout: 'Finalize departure and release room to housekeeping.', view: 'Guest reservation and payment details.', receipt: 'Payment summary; no payment has been processed.', decline: 'Confirm that this pending reservation should be declined.' };

function BookingSummary({ booking: b }) {
  return <div className="grid gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">{[['Guest Name', b.name], ['Reservation ID', '#' + b.id], ['Assigned Room', `Room ${b.room} — ${b.type}`], ['Number of Guests', `${b.guests} ${b.guests === 1 ? 'Adult' : 'Adults'}`]].map(([label, value]) => <div key={label}><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div>;
}

function ReservationDialog({ booking: b, mode, onClose, onAction, onDecline }) {
  const nights = nightsBetween(b.checkIn, b.checkOut);
  const total = nights * b.rate;
  const receipt = mode === 'receipt';
  const primary = { confirm: ['Confirm Reservation', 'bg-[#d5a657]'], checkin: ['Complete Check-In', 'bg-[#256d48]'], checkout: ['Complete Check-Out', 'bg-[#202d38]'], decline: ['Decline Reservation', 'bg-red-700'] }[mode];
  return <ManagementDialog title={titles[mode]} description={descriptions[mode]} icon={mode === 'checkin' ? KeyRound : mode === 'confirm' ? ShieldCheck : LogOut} onClose={onClose} footer={<>{mode === 'confirm' && <button className="mr-auto text-red-700" onClick={onDecline}>Reject / Decline</button>}<button className={control} onClick={onClose}>{primary ? 'Cancel' : 'Close'}</button>{primary && <button className={`flex items-center gap-2 rounded-lg px-5 py-3 font-semibold text-white ${primary[1]}`} onClick={onAction}><Check size={18} />{primary[0]}</button>}{receipt && <button className="flex items-center gap-2 rounded-lg bg-[#202d38] px-4 py-2 text-white" onClick={() => window.print()}><Printer size={18} />Print Receipt</button>}</>}>
    <div className={receipt ? 'staff-receipt space-y-5' : 'space-y-5'}>
      {receipt && <div className="border-b border-slate-200 pb-4"><h3 className="text-xl font-bold">StayEase · Guest Receipt</h3><p className="text-sm text-slate-500">Receipt DEMO-{b.id} · Checked Out</p><p className="text-xs text-slate-500">Preview only — not an official receipt</p></div>}
      {['checkin', 'checkout'].includes(mode) ? <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5"><div><h3 className="text-xl font-bold">{b.name}</h3><p className="font-semibold text-[#234462]">#{b.id}</p></div><div className="sm:text-right">{mode === 'checkin' ? <><p className="text-xs uppercase tracking-wide text-slate-500">Check-in Schedule</p><p className="mt-1 font-semibold">{date(b.checkIn)} (2:00 PM)</p><p className="text-sm text-slate-500">{b.guests} {b.guests === 1 ? 'Adult' : 'Adults'}</p></> : <><h3 className="text-xl font-bold">Room {b.room}</h3><p className="text-slate-500">{date(b.checkOut)} (12:00 PM)</p></>}</div></div> : <BookingSummary booking={b} />}
      {mode === 'decline' ? <p className="text-red-700">This reservation will be marked Declined. No refund will be processed.</p> : <>
        {!['checkin', 'checkout'].includes(mode) && <div className="grid gap-3 sm:grid-cols-3">{[['Check-in Date', date(b.checkIn)], ['Check-out Date', date(b.checkOut)], ['Payment Status', `Paid in Full (${money(b.paid)})`]].map(([label, value]) => <div className="rounded-lg border border-slate-200 p-3" key={label}><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-sm font-semibold ${label === 'Payment Status' ? 'text-emerald-800' : ''}`}>{value}</p></div>)}</div>}
        {mode === 'checkin' && <div className="rounded-xl border border-slate-200 p-5"><p className="text-xs uppercase text-slate-500">Assigned Room · Clean & Ready</p><p className="mt-2 text-lg font-semibold">Room {b.room} — {b.type}</p><p className="text-slate-500">Floor {b.room[0]} · Check-in at 2:00 PM</p></div>}
        {['checkout', 'receipt', 'view'].includes(mode) && <section className="rounded-xl border border-slate-200 p-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stay & Billing Summary</h3><p className="my-4">{nights} Nights · {b.type} · Incidental charges: {money(0)}</p>{receipt && <dl className="mb-4 space-y-2 text-sm">{[['Room rate / night', money(b.rate)], ['Room subtotal', money(total)], ['Total paid', money(b.paid)]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<div className="flex justify-between gap-4 border-t border-slate-100 pt-4"><span className="text-slate-500">Balance:</span><strong className="text-emerald-800">{money(total - b.paid)} (Fully Settled)</strong></div></section>}
        {mode === 'view' && <StatusBadge status={b.status} />}
      </>}
    </div>
  </ManagementDialog>;
}

export default function StaffReservations() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stayDate, setStayDate] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const filtered = bookings.filter(b => `${b.id} ${b.name} Room ${b.room}`.toLowerCase().includes(search.trim().toLowerCase()) && (!status || status === b.status) && (!stayDate || b.checkIn <= stayDate && stayDate <= b.checkOut));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 7)));
  const selected = bookings.find(b => b.id === modal?.id);
  function transition() {
    const next = { confirm: 'Confirmed', checkin: 'Checked In', checkout: 'Checked Out', decline: 'Declined' }[modal.mode];
    setBookings(bookings.map(b => b.id === selected.id ? { ...b, status: next } : b));
    setNotice(`${selected.name}: ${next}.${next === 'Checked Out' ? ' Room marked for cleaning.' : ''}`);
    setModal(modal.mode === 'checkout' ? { ...modal, mode: 'receipt' } : null);
  }
  return <><div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 p-3"><SearchField value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by guest name, reservation ID, or room..." /><select aria-label="Reservation status" className={control} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All Statuses ({bookings.length})</option>{['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Declined'].map(s => <option key={s}>{s}</option>)}</select><input type="date" aria-label="Filter by stay date" className={control} value={stayDate} onChange={e => { setStayDate(e.target.value); setPage(1); }} /><button className={control} aria-label="Reset reservation filters" onClick={() => { setSearch(''); setStatus(''); setStayDate(''); setPage(1); }}><RotateCcw size={18} /></button></div>
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    <section className={`${panel} staff-booking-panel flex flex-col`} aria-label="Staff reservations"><div className="flex-1 overflow-x-auto"><table className="management-table w-full min-w-[980px]"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['ID', 'Guest Name', 'Room', 'Check-in', 'Check-out', 'Guests', 'Payment', 'Status', 'Staff Action'].map(h => <th className="px-4 py-4" key={h}>{h}</th>)}</tr></thead><tbody>{filtered.slice((currentPage - 1) * 7, currentPage * 7).map(b => { const action = actions[b.status]; const Icon = action?.icon; return <tr key={b.id} className="border-b border-slate-100"><td className="px-4 py-6 font-semibold text-[#234462]">#{b.id}</td><td className="px-4 py-6 font-medium">{b.name}</td><td className="px-4 py-6">Room {b.room}<small className={`mt-1 block ${b.status === 'Confirmed' ? 'text-emerald-700' : b.status === 'Checked Out' ? 'text-amber-700' : 'text-slate-500'}`}>{b.status === 'Confirmed' ? '● Clean & Ready' : b.status === 'Checked Out' ? '● Cleaning Progress' : b.type}</small></td><td className="px-4 py-6 text-slate-500">{date(b.checkIn)}</td><td className="px-4 py-6 text-slate-500">{date(b.checkOut)}</td><td className="px-4 py-6 text-center">{b.guests}</td><td className="px-4 py-6"><span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-800">{b.status === 'Checked Out' ? 'Invoice Closed' : b.status === 'Checked In' ? 'Settled' : 'Paid In Full'}</span></td><td className="px-4 py-6"><StatusBadge status={b.status} /></td><td className="px-4 py-6"><div className="flex justify-end gap-2">{action && <button title={action.label} aria-label={`${action.label} ${b.id}`} className={`rounded-lg p-2.5 text-white ${action.tone}`} onClick={() => setModal({ id: b.id, mode: action.mode })}><Icon size={18} /></button>}<button className={`${control} !p-2.5 text-slate-500`} aria-label={`View ${b.id}`} onClick={() => setModal({ id: b.id, mode: b.status === 'Checked Out' ? 'receipt' : 'view' })}><Eye size={18} /></button></div></td></tr>; })}</tbody></table>{!filtered.length && <p className="p-10 text-center text-slate-500">No reservations match your filters.</p>}</div><Pagination page={currentPage} size={7} total={filtered.length} onChange={setPage} noun="operational reservations" /></section>
    {selected && <ReservationDialog booking={selected} mode={modal.mode} onClose={() => setModal(null)} onAction={transition} onDecline={() => setModal({ ...modal, mode: 'decline' })} />}
  </>;
}
