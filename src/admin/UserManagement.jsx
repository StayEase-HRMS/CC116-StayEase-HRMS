import Pagination from './components/Pagination';
import { useState } from 'react';
import AccountModal from './AccountModal';
import { Users, Briefcase, BadgeCheck, Ban, Plus, Search, RotateCcw, Eye, Pencil } from 'lucide-react';

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
  const [mode, setMode] = useState('view');
  const filtered = accounts.filter(a => [a.name, a.id, a.email].join(' ').toLowerCase().includes(search.toLowerCase()) && (role === 'All Roles' || a.role === role) && (status === 'All Statuses' || a.status === status));
  const pages = Math.max(1, Math.ceil(filtered.length / 7));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 7, currentPage * 7);
  function reset() { setSearch(''); setRole('All Roles'); setStatus('All Statuses'); setPage(1); }
  function saveAccount(values) {
    const editingId = mode === 'edit' ? selected.id : null;
    if (accounts.some(a => a.id !== editingId && a.email.toLowerCase() === values.email.toLowerCase())) return 'An account with this email already exists.';
    if (values.employeeId && accounts.some(a => a.id !== editingId && a.employeeId?.toLowerCase() === values.employeeId.toLowerCase())) return 'This employee ID is already in use.';
    if (mode === 'edit') {
      setAccounts(accounts.map(a => a.id === selected.id ? { ...a, ...values } : a));
    } else {
      const today = new Date();
      const created = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      setAccounts([...accounts, { ...values, id: 'S-' + crypto.randomUUID(), role: 'Staff', status: 'Active', created }]);
      reset();
    }
    setSelected(null);
    return null;
  }
  return <>
    <div className="admin-toolbar"><button className="admin-primary" onClick={() => { setMode('add'); setSelected('add'); }}><Plus size={19} />Add Staff</button></div>
    <div className="admin-stats">{[
      ['Total accounts', accounts.length, Users], ['Guest accounts', accounts.filter(a => a.role === 'Guest').length, Briefcase], ['Staff accounts', accounts.filter(a => a.role === 'Staff').length, BadgeCheck], ['Suspended', accounts.filter(a => a.status === 'Suspended').length, Ban],
    ].map(([label, value, Icon]) => <div className="admin-stat" key={label}><div><span>{label}</span><Icon size={20} /></div><strong>{value}</strong></div>)}</div>
    <section className="admin-accounts" aria-label="User accounts">
      <div className="admin-filters"><label className="admin-search"><Search size={20} /><input aria-label="Search accounts" placeholder="Search by name, ID or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><select aria-label="Filter by role" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>{['All Roles', 'Guest', 'Staff'].map(v => <option key={v}>{v}</option>)}</select><select aria-label="Filter by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['All Statuses', 'Active', 'Suspended'].map(v => <option key={v}>{v}</option>)}</select><button className="admin-icon-button" aria-label="Reset filters" onClick={reset}><RotateCcw size={19} /></button></div>
      <div className="admin-table-scroll"><table className="admin-user-table"><thead><tr>{['Account', 'Email', 'Role', 'Status', 'Date created', 'Actions'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(a => <tr key={a.id}><td><strong>{a.name}</strong></td><td>{a.email}</td><td><span className={'admin-badge ' + a.role.toLowerCase()}>{a.role}</span></td><td><span className={'admin-badge ' + a.status.toLowerCase()}>• {a.status}</span></td><td>{dateLabel(a.created)}</td><td><button className="admin-icon-button" aria-label={'View ' + a.name} onClick={() => { setMode('view'); setSelected(a); }}><Eye size={18} /></button><button className="admin-icon-button" aria-label={'Edit ' + a.name} onClick={() => { setMode('edit'); setSelected(a); }}><Pencil size={17} /></button></td></tr>)}</tbody></table>{!visible.length && <p className="admin-empty">No accounts match your search. Try changing the filters.</p>}</div>
      <Pagination page={currentPage} total={filtered.length} pageSize={7} onChange={setPage} noun="accounts" />
    </section>
    {selected && <AccountModal key={mode + (selected.id ?? 'new')} mode={mode} account={selected === 'add' ? null : selected} onClose={() => setSelected(null)} onSave={saveAccount} onEdit={() => setMode('edit')} onToggleStatus={() => {
      setAccounts(accounts.map(a => a.id === selected.id ? { ...a, status: a.status === 'Active' ? 'Suspended' : 'Active' } : a));
      setSelected(null);
    }} />}
  </>;
}



