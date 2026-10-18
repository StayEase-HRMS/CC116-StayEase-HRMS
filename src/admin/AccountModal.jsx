import { useEffect, useRef, useState } from 'react';
import { UserRoundPlus, X } from 'lucide-react';

const properties = ['Main Resort', 'East Wing', 'Villas & Suites'];
const staffRoles = ['Front Desk Staff', 'Property Manager', 'Housekeeping', 'Maintenance'];

export default function AccountModal({ mode, account, onClose, onSave, onEdit, onToggleStatus }) {
  const dialog = useRef(null);
  const [error, setError] = useState('');
  const readOnly = mode === 'view';
  const isStaff = !account || account.role === 'Staff';
  const title = mode === 'add' ? 'Add New Staff Member' : mode === 'edit' ? 'Edit Account' : 'Account Details';

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: data.get('name').trim(),
      email: data.get('email').trim(),
      systemRole: data.get('systemRole'),
      department: data.get('department').trim(),
      employeeId: data.get('employeeId').trim(),
      properties: data.getAll('properties'),
    };
    if (!values.name) return setError('Please enter a full name.');
    const message = onSave(values);
    if (message) setError(message);
  }

  return <dialog ref={dialog} className="account-modal" aria-labelledby="account-modal-title" aria-describedby="account-modal-description" onCancel={onClose}>
    <header className="account-modal-header">
      <span className="account-modal-icon"><UserRoundPlus size={19} /></span>
      <div><h2 id="account-modal-title">{title}</h2><p id="account-modal-description">{readOnly ? 'Review account details, role, and property access.' : 'Manage profile details, system role, and property access.'}</p></div>
      <button type="button" className="account-close" aria-label="Close dialog" onClick={onClose}><X size={21} /></button>
    </header>
    <form onSubmit={submit}>
      <div className="account-form-body">
        <div className="account-form-grid">
          <label>Full Name {!readOnly && <span>*</span>}<input name="name" required maxLength={100} placeholder="e.g. Marcus Vance" defaultValue={account?.name ?? ''} readOnly={readOnly} /></label>
          <label>{isStaff ? 'Staff Email' : 'Email'} {!readOnly && <span>*</span>}<input name="email" type="email" required placeholder="m.vance@stayease.com" defaultValue={account?.email ?? ''} readOnly={readOnly} /></label>
          <label>System Role {!readOnly && <span>*</span>}<select name="systemRole" required defaultValue={account?.systemRole ?? (isStaff ? 'Front Desk Staff' : 'Guest')} disabled={readOnly}>{(isStaff ? staffRoles : ['Guest']).map(role => <option key={role}>{role}</option>)}</select></label>
          <div className="account-department"><span>Department &amp; Employee ID</span><div><input name="department" aria-label="Department" placeholder={isStaff ? 'Operations' : 'Not applicable'} defaultValue={account?.department ?? ''} readOnly={readOnly || !isStaff} maxLength={100} /><input name="employeeId" aria-label="Employee ID" placeholder={isStaff ? '#STF-025' : 'N/A'} defaultValue={account?.employeeId ?? ''} readOnly={readOnly || !isStaff} maxLength={40} /></div></div>
        </div>
        <fieldset className="account-properties" disabled={readOnly}><legend>Property Access Scope</legend><div>{properties.map(property => <label key={property}><input type="checkbox" name="properties" value={property} defaultChecked={(account?.properties ?? []).includes(property)} />{property}</label>)}</div></fieldset>
        {account && <p className="account-meta">Account {account.id} · {account.status}</p>}
        {error && <p className="account-form-error" role="alert">{error}</p>}
      </div>
      <footer className="account-modal-footer">
        {readOnly && <button type="button" className="account-status-action" onClick={onToggleStatus}>{account.status === 'Active' ? 'Suspend account' : 'Reactivate account'}</button>}
        <button type="button" className="account-secondary" onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</button>
        {readOnly ? <button type="button" className="account-submit" onClick={onEdit}>Edit Account</button> : <button type="submit" className="account-submit">{mode === 'add' ? 'Create Staff Account' : 'Save Changes'}</button>}
      </footer>
    </form>
  </dialog>;
}
