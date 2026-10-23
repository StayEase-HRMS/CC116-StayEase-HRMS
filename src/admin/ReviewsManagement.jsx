import { useTableSort } from '../state/useTableSort';
import { useManagementCollection } from '../state/management-store';
import { useState } from 'react';
import { Star } from 'lucide-react';
import roomImage from '../assets/room_1.jpg';
import { control, panel, SearchField, Pagination, ManagementDialog } from './ManagementUI';

const REVIEWS_PER_PAGE = 7;

export default function ReviewsManagement() {
  const { sort, toggleSort, sortRows } = useTableSort('day');
  const [reviews, setReviews] = useManagementCollection('reviews');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState(null);
  const [notice, setNotice] = useState('');
  const filtered = sortRows(reviews.filter(r => (!rating || r.rating === Number(rating)) && `${r.name} ${r.text}`.toLowerCase().includes(search.toLowerCase().trim())));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / REVIEWS_PER_PAGE)));
  return <><div className="flex flex-wrap gap-3"><SearchField value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search reviews by guest name or keyword..." /><select aria-label="Filter by rating" className={control} value={rating} onChange={e => { setRating(e.target.value); setPage(1); }}><option value="">All Ratings</option>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}</select><select aria-label="Sort reviews" className={control} value={sort.key} onChange={e => { toggleSort(e.target.value); setPage(1); }}><option value="day">Review date</option><option value="rating">Rating</option><option value="name">Guest name</option></select><button className={control} onClick={() => toggleSort(sort.key)} aria-label="Reverse review sort">{sort.direction === 'asc' ? 'Ascending' : 'Descending'}</button></div>
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    <div className="grid gap-4">{filtered.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE).map(r => <article key={r.id} className={`${panel} flex flex-wrap items-center gap-4 p-4 lg:p-5`}><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 font-semibold text-slate-600">{r.name[0]}</span><div className="min-w-0 flex-1 basis-48"><div className="flex flex-wrap items-center gap-x-3"><h2 className="font-bold">{r.name}</h2><time className="text-sm text-slate-400" dateTime={`2026-09-${String(r.day).padStart(2, '0')}`}>Sep {r.day}, 2026</time></div><div className="my-1 flex gap-1" aria-label={`${r.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={16} aria-hidden="true" className={n <= r.rating ? 'fill-[#eab156] text-[#eab156]' : 'fill-slate-300 text-slate-300'} />)}</div><p className="text-sm text-slate-500">{r.text}</p></div><img src={roomImage} alt="Guest's hotel room" className="h-14 w-20 rounded-lg object-cover" /><div className="grid w-24 gap-1.5"><button disabled={r.kept} className="rounded-md bg-[#206b43] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60" onClick={() => { setReviews(reviews.map(item => item.id === r.id ? { ...item, kept: true } : item)); setNotice(`Review by ${r.name} kept.`); }}>{r.kept ? 'Kept' : 'Keep'}</button><button className="rounded-md border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-600" onClick={() => setRemoving(r)}>Remove</button></div></article>)}</div>
    {!filtered.length && <p className={`${panel} p-10 text-center text-slate-500`}>No reviews match your filters.</p>}
    <Pagination page={currentPage} size={REVIEWS_PER_PAGE} total={filtered.length} onChange={setPage} noun="reviews" />
    {removing && <ManagementDialog title="Remove review?"  onClose={() => setRemoving(null)} footer={<><button className={control} onClick={() => setRemoving(null)}>Cancel</button><button className="rounded-lg bg-rose-600 px-4 py-2 text-white" onClick={() => { setReviews(reviews.filter(r => r.id !== removing.id)); setNotice(`Review by ${removing.name} removed.`); setRemoving(null); }}>Remove Review</button></>}><p>Remove the review by <strong>{removing.name}</strong>?</p><p className="text-slate-500">{removing.text}</p></ManagementDialog>}
  </>;
}
