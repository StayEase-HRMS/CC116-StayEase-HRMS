import { useManagement } from '../state/management-store';
import { reportRecords, todayInManila, validDate } from '../state/management-model';
import { useState } from 'react';
import { BedDouble, CalendarDays, ChevronDown, KeyRound, Users } from 'lucide-react';
import { control, panel } from './ManagementUI';

const DAY = 86400000;
const iso = timestamp => new Date(timestamp).toISOString().slice(0, 10);
const dateLabel = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function BookingsChart({ records }) {
  const width = 1100;
  const height = 235;
  const maximum = Math.max(4, ...records.map(r => r.bookings));
  const step = width / records.length;
  const barWidth = Math.max(1, Math.min(12, step * 0.6));
  const interval = Math.max(1, Math.ceil(records.length / 7));
  return <div className="overflow-x-auto pt-5"><svg className="h-[280px] w-full min-w-[560px]" viewBox="0 0 1200 300" role="img" aria-labelledby="bookings-chart-title bookings-chart-description">
    <title id="bookings-chart-title">Bookings per Period</title>
    <desc id="bookings-chart-description">Daily bookings from {dateLabel(records[0].date)} to {dateLabel(records.at(-1).date)}. {records.reduce((sum, r) => sum + r.bookings, 0)} total bookings. Each bar includes its date and count.</desc>
    {[0, 1, 2, 3, 4].map(tick => tick * maximum / 4).map(value => <g key={value}><line x1="55" x2="1170" y1={250 - value / maximum * height} y2={250 - value / maximum * height} stroke="#edf2f7" strokeDasharray="5 5" /><text x="42" y={255 - value / maximum * height} textAnchor="end" fill="#94a3b8" fontSize="17">{Number(value.toFixed(1))}</text></g>)}
    {records.map((record, index) => <g key={record.date}><rect x={55 + step * (index + 0.5) - barWidth / 2} y={250 - record.bookings / maximum * height} width={barWidth} height={record.bookings / maximum * height} rx="2" fill={record.bookings >= 32 ? '#b97b25' : '#cda358'}><title>{dateLabel(record.date)}: {record.bookings} bookings</title></rect>{(index === 0 || index === records.length - 1 || (index + 1) % interval === 0 && index < records.length - 2) && <text x={55 + step * (index + 0.5)} y="279" textAnchor="middle" fill="#94a3b8" fontSize="16">{dateLabel(record.date)}</text>}</g>)}
  </svg></div>;
}

export default function Reports() {
  const state = useManagement();
  const [start, setStart] = useState(() => todayInManila().slice(0, 7) + '-01');
  const [end, setEnd] = useState(todayInManila);
  const [preset, setPreset] = useState('');
  const [expanded, setExpanded] = useState(true);
  const days = (Date.parse(end) - Date.parse(start)) / DAY + 1;
  const error = !validDate(start) || !validDate(end) ? 'Choose a valid start and end date.' : days <= 0 ? 'End date must be on or after start date.' : days > 366 ? 'Choose a date range of up to 366 days.' : '';
  const records = error ? [] : reportRecords(state, start, end);
  const totals = records.reduce((sum, r) => ({ bookings: sum.bookings + r.bookings, guests: sum.guests + r.guests, pending: sum.pending + r.pending, occupied: sum.occupied + r.occupied }), { bookings: 0, guests: 0, pending: 0, occupied: 0 });
  const occupancy = records.length && state.rooms.length ? Math.round(totals.occupied / (records.length * state.rooms.length) * 100) : 0;
  const previousEnd = error ? '' : iso(Date.parse(start) - DAY);
  const previous = error ? [] : reportRecords(state, iso(Date.parse(start) - days * DAY), previousEnd);
  const previousOccupancy = previous.length && state.rooms.length ? previous.reduce((sum, r) => sum + r.occupied, 0) / (previous.length * state.rooms.length) * 100 : 0;
  const difference = occupancy - previousOccupancy;
  const stats = [
    { label: 'Occupancy Rate', value: `${occupancy}%`, detail: `${difference >= 0 ? '+' : ''}${difference.toFixed(1)} pp`, title: 'Change versus the preceding period', icon: BedDouble, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Bookings', value: totals.bookings, detail: `${totals.pending} pending`, icon: CalendarDays, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Total Guests', value: totals.guests, detail: `Avg ${totals.bookings ? (totals.guests / totals.bookings).toFixed(1) : '0'} / booking`, icon: Users, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Available Rooms', value: records.length ? records.at(-1).available : 0, detail: `/ ${state.rooms.length} total`, title: 'Current readiness for today; other dates estimate inventory less occupied rooms and maintenance', icon: KeyRound, tone: 'bg-emerald-50 text-emerald-600' },
  ];
  function choosePreset(value) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setStart(value === 'month' ? `${today.slice(0, 7)}-01` : iso(Date.parse(today) - 6 * DAY));
    setEnd(value === 'month' ? iso(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0)) : today);
    setPreset(value);
  }
  return <>
    <div className={`${panel} flex flex-wrap items-center gap-3 p-3 text-sm`}>
      <CalendarDays className="text-amber-600" size={21} /><span className="font-semibold text-slate-600">Date Range:</span>
      <input className={`${control} bg-slate-50`} type="date" aria-label="Report start date" value={start} onChange={e => { setStart(e.target.value); setPreset(''); }} />
      <span className="text-slate-400">to</span><input className={`${control} bg-slate-50`} type="date" aria-label="Report end date" value={end} onChange={e => { setEnd(e.target.value); setPreset(''); }} />
      <div className="flex gap-2 sm:border-l sm:border-slate-200 sm:pl-3">{[['week', 'Last 7 Days'], ['month', 'This Month']].map(([value, label]) => <button key={value} aria-pressed={preset === value} className={`rounded-lg px-3 py-1.5 ${preset === value ? 'bg-[#e7b257] text-white' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => choosePreset(value)}>{label}</button>)}</div>
    </div>
    {error ? <p role="alert" className={`${panel} p-5 text-red-700`}>{error}</p> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, detail, title, icon: Icon, tone }) => <article key={label} title={title} className={`${panel} flex items-center justify-between gap-3 p-4`}><div><h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</h2><div className="mt-1 flex flex-wrap items-baseline gap-2"><strong className="text-2xl font-bold">{value}</strong><span className="text-xs text-slate-500">{detail}</span></div></div><span className={`rounded-xl border border-current/10 p-3 ${tone}`}><Icon size={20} /></span></article>)}</div>
      <section className={`${panel} report-chart-panel mt-3 p-4`}><button className="flex w-full items-center justify-between gap-4 text-left" aria-expanded={expanded} aria-controls="report-chart" onClick={() => setExpanded(!expanded)}><span><span className="block font-bold">Bookings per Period</span><span className="text-xs text-slate-400">Total reservations recorded per calendar date</span></span><ChevronDown size={18} className={`text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`} /></button>{expanded && <div id="report-chart" className="mt-3 border-t border-slate-100"><BookingsChart records={records} /></div>}</section>
    </>}
  </>;
}
