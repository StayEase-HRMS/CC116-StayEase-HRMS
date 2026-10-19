import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

export const control = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-40';
export const panel = 'rounded-2xl border border-slate-200 bg-white';

export function SearchField({ value, onChange, placeholder }) {
  return <label className={`${control} flex min-w-0 flex-1 items-center gap-3 text-slate-400`}><Search size={18} /><input className="w-full min-w-0 bg-transparent text-slate-800 outline-none" aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></label>;
}

export function Pagination({ page, total, size, onChange, noun }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm text-slate-500"><span>Showing {total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)} of {total} {noun}</span><div className="flex items-center gap-2"><button className={control} aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button><span aria-current="page" className="rounded-md bg-[#d5a657] px-3 py-2 text-white">{page}</span><span>of {pages}</span><button className={control} aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button></div></footer>;
}

export function StatusBadge({ status }) {
  const tone = { Pending: 'bg-amber-50 text-amber-700 ring-amber-200', Confirmed: 'bg-blue-50 text-blue-700 ring-blue-200', 'Checked In': 'bg-emerald-50 text-emerald-700 ring-emerald-200', Open: 'bg-emerald-50 text-emerald-700 ring-emerald-200', 'In Progress': 'bg-amber-50 text-amber-700 ring-amber-200' }[status] || 'bg-slate-100 text-slate-500 ring-slate-200';
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${tone}`}>● {status}</span>;
}

export function ManagementDialog({ title, description, icon: Icon, children, footer, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="management-dialog-title" className="management-dialog m-auto max-h-[90dvh] w-[min(680px,94vw)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-[#202d38] shadow-2xl backdrop:bg-black/45"><header className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">{Icon && <Icon size={38} className="shrink-0 rounded-xl bg-slate-100 p-2" />}<div className="flex-1"><h2 id="management-dialog-title" className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div><button className="rounded p-2 text-slate-400" aria-label="Close dialog" onClick={onClose}><X /></button></header><div className="space-y-5 p-6 sm:p-8">{children}</div>{footer && <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5">{footer}</footer>}</dialog>;
}
