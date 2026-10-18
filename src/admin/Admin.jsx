import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, ChartColumn, Users, Star, KeyRound, DoorOpen } from 'lucide-react';
import logo from '../assets/logo.svg';
import { ReservationsAndStatus } from './components/components';
import UserManagement from './UserManagement';
import RoomManagement from './RoomManagement';
import ReservationManagement from './ReservationManagement';
import './admin.css';

export default function AdminPage({ role = 'admin' }) {
  const path = useLocation().pathname;
  const staff = role === 'staff';
  const base = staff ? '/staff' : '/admin';
  const supportPage = staff && path === base + '/support';
  const usersPage = !staff && path === base + '/users';
  const roomsPage = path === base + '/rooms';
  const reservationsPage = path === base + '/reservations';
  return <div className="admin-app">
    <aside className="admin-sidebar">
      <NavLink to="/" className="admin-brand"><img src={logo} alt="StayEase Hospitality Suite" /></NavLink>
      <nav aria-label={staff ? "Staff navigation" : "Admin navigation"}>
        <NavLink to={base} end><LayoutDashboard size={22} />Dashboard</NavLink>
        <NavLink to={base + "/rooms"}><BedDouble size={22} />Room Management</NavLink>
        <NavLink to={base + "/reservations"}><CalendarDays size={22} />Reservations</NavLink>
        {!staff && <><span title="Coming soon"><ChartColumn size={22} />Reports</span>
        <NavLink to="/admin/users"><Users size={22} />User Management</NavLink>
        <span title="Coming soon"><Star size={22} />Reviews & ratings</span></>}
        {staff && <NavLink to={base + "/support"}><Users size={22} />Customer Support</NavLink>}
      </nav>
      <div className="admin-profile"><span className="admin-avatar">SA</span><div><strong>StayEase {staff ? "Staff" : "Admin"}</strong><small>{staff ? "Staff" : "Administrator"} · Demo</small></div></div>
    </aside>
    <div className="admin-main">
      <header className="admin-heading"><h1>{usersPage ? 'User Management' : roomsPage ? 'Room Management' : reservationsPage ? 'Reservations' : supportPage ? 'Customer Support' : 'Dashboard'}</h1><p>{usersPage ? 'Manage guest and staff accounts, roles, and access across properties.' : roomsPage ? (staff ? 'View room statuses, availability, and housekeeping information.' : 'Manage room details, availability, and rates in one place.') : reservationsPage ? (staff ? 'View guest bookings and their status.' : 'Track and manage all guest bookings and their status.') : supportPage ? 'Customer support workspace.' : 'An overview of your property, reservations, and room availability.'}</p></header>
      <main className="admin-content">{usersPage ? <UserManagement /> : roomsPage ? <RoomManagement key={role} readOnly={staff} /> : reservationsPage ? <ReservationManagement key={role} readOnly={staff} /> : supportPage ? <section className="admin-room-section"><h2 className="text-lg font-semibold">Customer Support</h2><p className="mt-3 text-sm text-slate-500">No support conversations are connected yet.</p></section> : <>
        <div className="admin-section-heading"><h2>Property overview</h2><span>Sample property data</span></div>
        <div className="admin-stats dashboard-stats">{[
          ['Total rooms', 50, BedDouble], ['Occupied rooms', 40, Users], ['Available rooms', 5, KeyRound], ['Pending rooms', 5, CalendarDays], ['Check-outs', 1, DoorOpen],
        ].map(([label, value, Icon]) => <div className="admin-stat" key={label}><div><span>{label}</span><Icon size={20} /></div><strong>{value}</strong></div>)}</div>
        <section className="admin-room-section"><div className="admin-section-heading"><h2>Room availability</h2><span>By room type</span></div><div className="admin-room-grid">{[
          ['Standard', 16, 2, 2], ['Deluxe', 12, 1, 2], ['Executive Suite', 6, 1, 0], ['Family', 6, 1, 1],
        ].map(([name, occupied, available, pending]) => <article className="admin-room" key={name}><BedDouble size={26} /><h3>{name}</h3><p>{occupied + available + pending} rooms total</p><div className="admin-occupancy"><span style={{ width: `${occupied / (occupied + available + pending) * 100}%` }} /></div><footer><span>{occupied} occupied</span><span>{available} available</span></footer></article>)}</div></section>
        <ReservationsAndStatus />
      </>}</main>
    </div>
  </div>;
}



