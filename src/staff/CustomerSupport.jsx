import { useManagementCollection, managementActions } from '../state/management-store';
import { useLayoutEffect, useRef, useState } from 'react';
import { panel, control, StatusBadge, Pagination } from '../admin/ManagementUI';

const initials = name => name.split(' ').map(s => s[0]).join('');

function Conversation({ ticket, onSend, onStatus }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const messagePanel = useRef(null);
  const nearBottom = useRef(true);
  useLayoutEffect(() => {
    const panel = messagePanel.current;
    if (nearBottom.current) panel.scrollTop = panel.scrollHeight;
  }, [ticket.messages]);

  return <section className={`${panel} support-conversation flex min-w-0 flex-col`} aria-label={`Conversation with ${ticket.name}`}><header className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5"><span className="flex size-10 items-center justify-center rounded-full bg-amber-500 font-semibold text-white">{initials(ticket.name)}</span><div className="flex-1"><h2 className="font-bold">{ticket.name} <span className="font-normal text-slate-400">· Room {ticket.room}</span></h2><p className="text-sm text-slate-400">{ticket.stay}</p></div><StatusBadge status={ticket.status} /><button className={control} onClick={onStatus}>{ticket.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}</button></header><div className="flex-1 space-y-4 bg-slate-50/30 p-5" ref={messagePanel} tabIndex={0} aria-label="Conversation messages" onScroll={e => { const panel = e.currentTarget; nearBottom.current = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 64; }} role="log" aria-live="polite">{ticket.messages.map((m, i) => <div key={i} className={`flex gap-3 ${m.staff ? 'flex-row-reverse' : ''}`}><span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${m.staff ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{m.staff ? 'ST' : initials(ticket.name)}</span><div className="max-w-[85%]"><p className={`whitespace-pre-wrap break-words rounded-2xl p-4 text-sm leading-6 ${m.staff ? 'rounded-tr-none bg-[#db7d00] text-white' : 'rounded-tl-none border border-slate-200 bg-white text-slate-700'}`}>{m.text}</p><p className={`mt-2 text-xs text-slate-400 ${m.staff ? 'text-right' : ''}`}>{m.time}</p></div></div>)}</div>{error && <p role="alert" className="p-2 text-red-700">{error}</p>}<form className="flex gap-3 border-t border-slate-100 p-4" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; nearBottom.current = true; const message = onSend(draft.trim()); if (message) { setError(message); return; } setError(''); setDraft(''); }}><input className={`${control} min-w-0 flex-1 bg-slate-50`} aria-label="Type a reply" placeholder={ticket.status === 'Resolved' ? 'Reopen this ticket to reply' : 'Type a reply...'} value={draft} maxLength={2000} disabled={ticket.status === 'Resolved'} onChange={e => setDraft(e.target.value)} /><button className="rounded-lg bg-[#db7d00] px-5 py-2 text-white disabled:opacity-40" disabled={!draft.trim() || ticket.status === 'Resolved'}>Send</button></form></section>;
}

export default function CustomerSupport() {
  const [tickets, setTickets] = useManagementCollection('tickets');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(1);
  const [page, setPage] = useState(1);
  const filtered = tickets.filter(t => filter === 'All' || (filter === 'Open' ? t.status !== 'Resolved' : t.status === 'Resolved'));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 4)));
  const visible = filtered.slice((currentPage - 1) * 4, currentPage * 4);
  const ticket = visible.find(t => t.id === selected) || visible[0];
  const update = changes => setTickets(tickets.map(t => t.id === ticket.id ? { ...t, ...changes } : t));
  return <div className="support-layout grid items-stretch gap-3 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.2fr)]"><section className={`${panel} support-inquiries flex flex-col`} aria-label="Support inquiries"><div className="flex items-center gap-1 border-b border-slate-100 p-4">{['All', 'Open', 'Resolved'].map(value => <button key={value} aria-pressed={filter === value} className={`rounded-lg px-3 py-2 text-sm ${filter === value ? 'bg-slate-900 text-white' : 'text-slate-500'}`} onClick={() => { setFilter(value); setPage(1); }}>{value}</button>)}<span className="ml-auto text-xs text-slate-400">{tickets.filter(t => t.status !== 'Resolved').length} open</span></div><div className="flex-1">{visible.map(t => <button key={t.id} aria-pressed={ticket?.id === t.id} onClick={() => setSelected(t.id)} className={`block w-full border-b border-slate-100 p-5 text-left ${ticket?.id === t.id ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}><div className="flex flex-wrap gap-2"><strong className="text-sm">{t.name}</strong><span className="text-sm text-slate-400">Room {t.room}</span><span className="ml-auto text-xs text-slate-400">{t.messages.at(-1).time}</span></div><p className="my-2 truncate text-sm text-slate-500">{t.messages.at(-1).text}</p><StatusBadge status={t.status} /></button>)}{!filtered.length && <p className="p-6 text-slate-500">No {filter.toLowerCase()} inquiries.</p>}</div><Pagination page={currentPage} total={filtered.length} size={4} onChange={setPage} noun="inquiries" /></section>{ticket ? <Conversation key={ticket.id} ticket={ticket} onStatus={() => update({ status: ticket.status === 'Resolved' ? 'Open' : 'Resolved' })} onSend={text => managementActions.sendSupportMessage(ticket.id, text)} /> : <section className={`${panel} p-10 text-center text-slate-500`}>Select an inquiry to view the conversation.</section>}</div>;
}
