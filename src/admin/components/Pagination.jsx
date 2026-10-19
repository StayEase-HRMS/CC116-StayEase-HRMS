import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, total, pageSize, onChange, noun }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <footer className="admin-pagination">
    <span>Showing {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total} {noun}</span>
    <nav aria-label={`${noun} pagination`}>
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <span className="admin-page-number" aria-current="page">{page}</span>
      <span>of {pages}</span>
      <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </nav>
  </footer>;
}
