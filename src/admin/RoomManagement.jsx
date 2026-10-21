import Pagination from './components/Pagination';
import { useEffect, useRef, useState } from 'react';
import { Plus, Search, RotateCcw, X, ImagePlus, ChevronRight, BedDouble, Check } from 'lucide-react';
import roomPhoto from '../assets/room_1.jpg';
import './rooms.css';

const categories = ['Standard Room', 'Deluxe Room', 'Executive Suite', 'Family Room'];
const statusDescriptions = {
  Available: 'Cleaned, inspected, and ready for guest check-in',
  Occupied: 'Guest is currently registered and staying',
  'Needs Cleaning': 'Guest checked out or requested housekeeping',
  Vacant: 'Unoccupied and awaiting readiness inspection',
  Maintenance: 'Out of order due to plumbing, HVAC, or repair work',
};
const amenities = ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Balcony View', 'Coffee Maker'];
const initialRooms = [
  ['204', 'Deluxe Room', 3500, 'Available'], ['101', 'Standard Room', 2400, 'Occupied'],
  ['305', 'Executive Suite', 5800, 'Available'], ['108', 'Standard Room', 2400, 'Needs Cleaning'],
  ['402', 'Family Room', 4600, 'Vacant'], ['210', 'Deluxe Room', 3500, 'Maintenance'],
].map(([number, category, price, status]) => ({
  id: number, name: 'Room ' + number, category, price, status,
  amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning'], photos: [roomPhoto],
  description: 'A comfortable ' + category.toLowerCase() + ' with a welcoming interior and space to relax.',
  floor: number[0] + 'F', sanitized: 'Not recorded', note: '',
}));
const currency = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value);
const statusClass = status => status.toLowerCase().replaceAll(' ', '-');
const roomKey = name => name.trim().toLowerCase().replace(/^room\s*/, '').replace(/\s+/g, ' ');
function StatusBadge({ status }) { return <span className={'room-status ' + statusClass(status)}>{status}</span>; }

function Modal({ title, subtitle, children, onClose, compact = false }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className={'room-modal' + (compact ? ' compact' : '')} aria-labelledby="room-dialog-title" onCancel={onClose}>
    <header><div><h2 id="room-dialog-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" aria-label="Close dialog" className="admin-icon-button" onClick={onClose}><X size={21} /></button></header>{children}
  </dialog>;
}

function RoomForm({ room, onSave, onClose }) {
  const [photos, setPhotos] = useState(room?.photos ?? []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);
  async function upload(files) {
    const selected = Array.from(files);
    if (!selected.length) return;
    if (photos.length + selected.length > 5) return setError('Choose up to 5 photos per room.');
    if (selected.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) return setError('Use JPG, PNG, or WebP images up to 5 MB each.');
    setError(''); setLoading(true);
    try {
      const images = await Promise.all(selected.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
      setPhotos(previous => [...previous, ...images]);
    } catch { setError('Could not read the selected photos. Please try again.'); }
    finally { setLoading(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name').trim();
    const price = Number(form.get('price'));
    if (!name || !roomKey(name)) return setError('Enter a room name or number.');
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a price greater than zero.');
    const message = onSave({
      name, price, category: form.get('category'), status: form.get('status'),
      amenities: form.getAll('amenities'), description: form.get('description').trim(), photos,
    });
    if (message) setError(message);
  }
  return <Modal title={room ? 'Edit Room' : 'Add New Room'} subtitle={room ? 'Update room details, amenities, and photos.' : 'Fill in details to register a room to StayEase inventory'} onClose={onClose}>
    <form onSubmit={submit}>
      <div className="room-modal-body">
        <div className="room-form-grid">
          <label>Room Name / Number <em>*</em><input name="name" placeholder="e.g. Room 305" required maxLength={80} defaultValue={room?.name ?? ''} /></label>
          <label>Category <em>*</em><select name="category" defaultValue={room?.category ?? categories[0]}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Price per Night (₱) <em>*</em><input name="price" type="number" min="0.01" step="0.01" required placeholder="3500" defaultValue={room?.price ?? ''} /></label>
          <label>{room ? 'Status' : 'Initial Status'}<select name="status" defaultValue={room?.status ?? 'Available'}>{Object.keys(statusDescriptions).map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <fieldset className="room-amenities"><legend>Amenities</legend><div>{amenities.map(a => <label key={a}><input type="checkbox" name="amenities" value={a} defaultChecked={(room?.amenities ?? []).includes(a)} />{a}</label>)}</div></fieldset>
        <label className="room-description-label">Room Description<textarea name="description" placeholder="Describe view, bed size, features..." maxLength={2000} defaultValue={room?.description ?? ''} /></label>
        <div className="room-photo-label">Room Photos</div>
        <button className="room-upload" type="button" disabled={loading} onClick={() => fileInput.current.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!loading) upload(event.dataTransfer.files); }}><ImagePlus size={27} /><span><b>{loading ? 'Reading photos…' : 'Click to upload photo'}</b> or drag and drop</span><small>JPG, PNG, WebP · up to 5 photos · 5 MB each</small></button>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden aria-label="Upload room photos" onChange={e => upload(e.target.files)} />
        {!!photos.length && <div className="room-photo-previews">{photos.map((photo, i) => <div key={i}><img src={photo} alt={'Room photo ' + (i + 1)} /><button type="button" aria-label={'Remove photo ' + (i + 1)} disabled={loading} onClick={() => setPhotos(photos.filter((_, index) => index !== i))}><X size={14} /></button></div>)}</div>}
        {error && <p className="room-error" role="alert">{error}</p>}
      </div>
      <footer><button type="button" className="account-secondary" onClick={onClose}>Cancel</button><button type="submit" className="account-submit" disabled={loading}>{room ? 'Save Changes' : 'Add Room'}</button></footer>
    </form>
  </Modal>;
}

function RoomView({ room, onClose, onEdit, onStatus, onRemove, readOnly }) {
  const [photo, setPhoto] = useState(0);
  return <Modal title={room.name} subtitle="ROOM OVERVIEW" onClose={onClose}>
    <div className="room-modal-body">
      <div className="room-hero-photo">{room.photos.length ? <img src={room.photos[photo]} alt={room.name} /> : <BedDouble size={64} />}<div className="room-hero-badges"><StatusBadge status={room.status} /><span>{room.category}</span></div><div className="room-hero-price"><strong>{currency(room.price)}</strong> / night</div></div>
      {room.photos.length > 1 && <div className="room-photo-previews">{room.photos.map((src, i) => <button key={i} className={photo === i ? 'selected' : ''} aria-label={'Show photo ' + (i + 1)} aria-pressed={photo === i} onClick={() => setPhoto(i)}><img src={src} alt="" /></button>)}</div>}
      <h3>Description</h3><p className="room-detail-copy">{room.description || 'No description provided.'}</p>
      <h3>Amenities Included</h3><div className="room-detail-amenities">{room.amenities.length ? room.amenities.map(a => <span key={a}><Check size={15} />{a}</span>) : <p>No amenities specified.</p>}</div>
      <div className="room-meta"><span><b>Floor:</b> {room.floor || 'Not recorded'}</span><span><b>Last Sanitized:</b> {room.sanitized || 'Not recorded'}</span></div>
      {room.note && <p className="room-detail-copy"><b>Status note:</b> {room.note}</p>}
    </div>
    {!readOnly && <footer><button className="account-secondary room-status-action" onClick={onStatus}><RotateCcw size={16} />Update Operational Status</button><button className="room-danger" onClick={onRemove}>Remove Room</button><button className="account-submit" onClick={onEdit}>Edit Room</button></footer>}
  </Modal>;
}

function StatusForm({ room, onSave, onClose }) {
  return <Modal title="Update Operational Status" subtitle={'Change status for ' + room.name + ' (' + room.category + ')'} onClose={onClose} compact>
    <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave(data.get('status'), data.get('note').trim()); }}>
      <div className="room-modal-body"><div className="room-status-options">{Object.entries(statusDescriptions).map(([status, description]) => <label className={statusClass(status)} key={status}><input type="radio" name="status" value={status} defaultChecked={room.status === status} required /><span><strong>{status}</strong><small>{description}</small></span><span className="room-status-dot" /></label>)}</div><label className="room-status-note">Status Note (Optional):<input name="note" placeholder="e.g., Linens refreshed, AC inspected OK" maxLength={500} defaultValue={room.note} /></label></div>
      <footer><button type="button" className="account-secondary" onClick={onClose}>Cancel</button><button className="account-submit" type="submit">Save Status</button></footer>
    </form>
  </Modal>;
}

export default function RoomManagement({ readOnly = false }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All Categories');
  const [modal, setModal] = useState(null);
  const [removed, setRemoved] = useState(null);
  const selected = rooms.find(room => room.id === modal?.id);
  const filtered = rooms.filter(room => (room.name + ' ' + room.category).toLowerCase().includes(search.trim().toLowerCase()) && (status === 'All' || room.status === status) && (category === 'All Categories' || room.category === category));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const close = () => setModal(null);
  function save(values) {
    if (readOnly) return 'Staff access is view-only.';
    if (rooms.some(room => room.id !== selected?.id && roomKey(room.name) === roomKey(values.name))) return 'A room with this name or number already exists.';
    if (selected) setRooms(rooms.map(room => room.id === selected.id ? { ...room, ...values } : room));
    else {
      setRooms([...rooms, { ...values, id: crypto.randomUUID(), floor: '', sanitized: 'Not recorded', note: '' }]);
      setSearch(''); setStatus('All'); setCategory('All Categories'); setPage(1);
    }
    close(); return null;
  }
  return <>
    {!readOnly && <div className="admin-toolbar"><button className="admin-primary" onClick={() => setModal({ mode: 'add' })}><Plus size={18} />Add Room</button></div>}
    <div className="room-filters"><label className="admin-search"><Search size={18} /><input aria-label="Search rooms" placeholder="Search room number or category..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><label>Status:<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['All', ...Object.keys(statusDescriptions)].map(s => <option key={s}>{s}</option>)}</select></label><label>Category:<select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>{['All Categories', ...categories].map(c => <option key={c}>{c}</option>)}</select></label><button className="admin-icon-button" aria-label="Reset room filters" onClick={() => { setSearch(''); setStatus('All'); setCategory('All Categories'); setPage(1); }}><RotateCcw size={18} /></button></div>
    {removed && <div className="room-undo" role="status"><span>{removed.name} removed.</span><button onClick={() => { setRooms([...rooms, removed]); setRemoved(null); }}>Undo</button></div>}
    <section className="room-paged-section" aria-label="Room inventory"><div className="room-page-body"><div className="room-inventory">{visible.map(room => <article className="room-inventory-card" key={room.id}><div className="room-card-summary">{room.photos[0] ? <img src={room.photos[0]} alt={room.name} /> : <div className="room-no-photo"><BedDouble size={30} /></div>}<div><h2>{room.name}</h2><p>{room.category}</p><strong>{currency(room.price)}</strong><small> / night</small></div><StatusBadge status={room.status} /></div><footer><button aria-label={'View ' + room.name} onClick={() => setModal({ mode: 'view', id: room.id })}>View <ChevronRight size={14} /></button></footer></article>)}</div>
    {!visible.length && <p className="admin-empty">No rooms match your filters.</p>}
    </div><Pagination page={currentPage} total={filtered.length} pageSize={pageSize} onChange={setPage} noun="rooms" /></section>
    {!readOnly && (modal?.mode === 'add' || (modal?.mode === 'edit' && selected)) && <RoomForm key={modal.mode + (selected?.id ?? '')} room={selected} onSave={save} onClose={close} />}
    {modal?.mode === 'view' && selected && <RoomView readOnly={readOnly} room={selected} onClose={close} onEdit={() => setModal({ mode: 'edit', id: selected.id })} onStatus={() => setModal({ mode: 'status', id: selected.id })} onRemove={() => setModal({ mode: 'remove', id: selected.id })} />}
    {!readOnly && modal?.mode === 'status' && selected && <StatusForm room={selected} onClose={() => setModal({ mode: 'view', id: selected.id })} onSave={(nextStatus, note) => { setRooms(rooms.map(room => room.id === selected.id ? { ...room, status: nextStatus, note } : room)); setModal({ mode: 'view', id: selected.id }); }} />}
    {!readOnly && modal?.mode === 'remove' && selected && <Modal title={'Remove ' + selected.name + '?'} onClose={close} compact><div className="room-modal-body"><p>You can undo the removal from the room list.</p></div><footer><button className="account-secondary" onClick={() => setModal({ mode: 'view', id: selected.id })}>Cancel</button><button className="room-danger" onClick={() => { setRemoved(selected); setRooms(rooms.filter(room => room.id !== selected.id)); close(); }}>Remove Room</button></footer></Modal>}
  </>;
}

