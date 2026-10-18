import { useState, useRef, useEffect } from 'react';
import { Users, Briefcase, BadgeCheck, Ban, Plus, Search, RotateCcw, Eye, X } from 'lucide-react';

const initialUsers = [
  { id: 'G001', name: 'Elena Rostova', email: 'elena.rostova@gmail.com', role: 'Guest', status: 'Active', created: '2023-11-04' },
  { id: 'S001', name: 'David Chen', email: 'david.chen@stayease.com', role: 'Staff', status: 'Active', created: '2023-09-18' },
  { id: 'G002', name: 'Mark Denina', email: 'mark.denina@example.com', role: 'Guest', status: 'Active', created: '2023-11-10' },
  { id: 'G003', name: 'Josh Dayapera', email: 'josh.dayapera@example.com', role: 'Guest', status: 'Suspended', created: '2023-11-10' },
];
const dateLabel = value => new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export default function UserManagement() {
  const [accounts, setAccounts] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All Roles');
  const [status, setStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const modal = useRef(null);
  useEffect(() => { if (selected) modal.current?.showModal(); else modal.current?.close(); }, [selected]);
  const filtered = accounts.filter(a => [a.name, a.id, a.email].join(' ').toLowerCase().includes(search.toLowerCase()) && (role === 'All Roles' || a.role === role) && (status === 'All Statuses' || a.status === status));
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  function reset() { setSearch(''); setRole('All Roles'); setStatus('All Statuses'); setPage(1); }
  function addStaff(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    if (!name) return setError('Please enter a staff name.');
    if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) return setError('An account with this email already exists.');
    const today = new Date();
    const created = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    setAccounts([...accounts, { id: 'S-' + Date.now(), name, email, role: 'Staff', status: 'Active', created }]);
    reset(); setSelected(null);
  }
  return <>
    <div className="admin-toolbar"><span>Demo accounts · changes reset on refresh</span><button className="admin-primary" onClick={() => { setError(''); setSelected('add'); }}><Plus size={19} />Add Staff</button></div>
    <div className="admin-stats">{[
      ['Total accounts', accounts.length, Users], ['Guest accounts', accounts.filter(a => a.role === 'Guest').length, Briefcase], ['Staff accounts', accounts.filter(a => a.role === 'Staff').length, BadgeCheck], ['Suspended', accounts.filter(a => a.status === 'Suspended').length, Ban],
    ].map(([label, value, Icon]) => <div className="admin-stat" key={label}><div><span>{label}</span><Icon size={20} /></div><strong>{value}</strong></div>)}</div>
    <section className="admin-accounts" aria-label="User accounts">
      <div className="admin-filters"><label className="admin-search"><Search size={20} /><input aria-label="Search accounts" placeholder="Search by name, ID or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><select aria-label="Filter by role" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>{['All Roles', 'Guest', 'Staff'].map(v => <option key={v}>{v}</option>)}</select><select aria-label="Filter by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['All Statuses', 'Active', 'Suspended'].map(v => <option key={v}>{v}</option>)}</select><button className="admin-icon-button" aria-label="Reset filters" onClick={reset}><RotateCcw size={19} /></button></div>
      <div className="admin-table-scroll"><table className="admin-user-table"><thead><tr>{['Account', 'Email', 'Role', 'Status', 'Date created', 'Actions'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(a => <tr key={a.id}><td><strong>{a.name}</strong></td><td>{a.email}</td><td><span className={'admin-badge ' + a.role.toLowerCase()}>{a.role}</span></td><td><span className={'admin-badge ' + a.status.toLowerCase()}>• {a.status}</span></td><td>{dateLabel(a.created)}</td><td><button className="admin-icon-button" aria-label={'View ' + a.name} onClick={() => setSelected(a)}><Eye size={18} /></button></td></tr>)}</tbody></table>{!visible.length && <p className="admin-empty">No accounts match your search. Try changing the filters.</p>}</div>
      <footer className="admin-pagination"><span>Showing {filtered.length ? (currentPage - 1) * 10 + 1 : 0}–{Math.min(currentPage * 10, filtered.length)} of {filtered.length} accounts</span><div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Previous</button><span className="admin-page-number">{currentPage}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next ›</button></div></footer>
    </section>
    <dialog ref={modal} className="admin-modal" aria-labelledby="account-dialog-title" onCancel={() => setSelected(null)}>
      {selected && <><div className="admin-section-heading"><h2 id="account-dialog-title">{selected === 'add' ? 'Add staff account' : 'Account details'}</h2><button className="admin-icon-button" aria-label="Close dialog" onClick={() => setSelected(null)}><X size={20} /></button></div>{selected === 'add' ? <form onSubmit={addStaff}><p>Create a demo staff record. No invitation is sent.</p><label>Full name<input name="name" required maxLength={100} /></label><label>Email address<input name="email" type="email" required /></label>{error && <p role="alert" className="admin-error">{error}</p>}<button className="admin-primary" type="submit">Add Staff</button></form> : <><dl>{[['Account ID', selected.id], ['Name', selected.name], ['Email', selected.email], ['Role', selected.role], ['Status', selected.status], ['Date created', dateLabel(selected.created)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className="admin-primary" onClick={() => { setAccounts(accounts.map(a => a.id === selected.id ? { ...a, status: a.status === 'Active' ? 'Suspended' : 'Active' } : a)); setSelected(null); }}>{selected.status === 'Active' ? 'Suspend account' : 'Reactivate account'}</button></>}</>}
    </dialog>
  </>;
}
