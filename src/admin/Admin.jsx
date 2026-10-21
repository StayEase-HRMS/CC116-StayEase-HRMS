import { useLocation } from "react-router-dom";
import { BedDouble, CalendarDays, DoorOpen, KeyRound, Users } from "lucide-react";
import { AdminSideBar, StaffSideBar } from "../components/sidebar";
import PageHeader from "../components/header";
import { ReservationsAndStatus } from "./components/components";
import UserManagement from "./UserManagement";
import RoomManagement from "./RoomManagement";
import ReservationManagement from "./ReservationManagement";
import ReviewsManagement from "./ReviewsManagement";
import Reports from "./Reports";
import StaffReservations from "../staff/StaffReservations";
import CustomerSupport from "../staff/CustomerSupport";
import AccountManagement from "./AccountManagement";
// Still needed by UserManagement / RoomManagement / ReservationManagement until they're migrated to Tailwind.
import "./admin.css";

/* ---------- data ---------- */

const STAT_ICON_TONES = {
  default: "bg-[#eef4ff] text-[#4b6b95]",
  amber: "bg-[#fff4df] text-[#956719]",
  red: "bg-[#fff0f1] text-[#bd3343]",
};

const STATS_DATA = [
  { label: "Total rooms", value: 50, icon: BedDouble, tone: "default" },
  { label: "Occupied rooms", value: 40, icon: Users, tone: "default" },
  { label: "Available rooms", value: 5, icon: KeyRound, tone: "amber" },
  { label: "Pending rooms", value: 5, icon: CalendarDays, tone: "red" },
  { label: "Check-outs", value: 1, icon: DoorOpen, tone: "default" },
];

const ROOM_TYPES = [
  { name: "Standard", occupied: 16, available: 2, pending: 2 },
  { name: "Deluxe", occupied: 12, available: 1, pending: 2 },
  { name: "Executive Suite", occupied: 6, available: 1, pending: 0 },
  { name: "Family", occupied: 6, available: 1, pending: 1 },
];

/* ---------- helpers ---------- */

const getPage = (pathname, basePath, isStaff) => {
  if (pathname === `${basePath}/rooms`) return "rooms";
  if (pathname === `${basePath}/reservations`) return "reservations";
  if (!isStaff && pathname === `${basePath}/reviews`) return "reviews";
  if (!isStaff && pathname === `${basePath}/reports`) return "reports";
  if (!isStaff && pathname === `${basePath}/users`) return "users";
  if (isStaff && pathname === `${basePath}/support`) return "support";
  if (pathname === `${basePath}/account`) return "account";
  return "dashboard";
};

const getHeader = (page, isStaff) =>
  ({
    reviews: { title: "Reviews & Ratings", desc: "Monitor guest feedback and respond to keep service quality high." },
    reports: { title: "Reports", desc: "Review performance insights on bookings, occupancy, and revenue." },
    users: {
      title: "User Management",
      desc: "Manage guest and staff accounts, roles, and access across properties.",
    },
    account: {
      title: "Account management",
      desc: "Manage operational profile, floor access, security credentials, and alert preferences.",
    },
    rooms: {
      title: "Room Management",
      desc: isStaff
        ? "View room statuses, availability, and housekeeping information."
        : "Manage room details, availability, and rates in one place.",
    },
    reservations: {
      title: "Reservations",
      desc: isStaff
        ? "Handle check-ins, check-outs, and upcoming guest bookings."
        : "Track and manage all guest bookings and their status.",
    },
    support: {
      title: "Customer Support",
      desc: "Respond to guest inquiries and resolve concerns promptly.",
    },
    dashboard: {
      title: "Dashboard",
      desc: "An overview of your property, reservations, and room availability.",
    },
  })[page];

/* ---------- components ---------- */

function SectionHeading({ title, note }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {note && <span className="text-xs text-[#697589]">{note}</span>}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-[15px] bg-white p-4 min-[1201px]:px-6 min-[1201px]:py-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-[0.07em] text-[#574d40] uppercase min-[601px]:text-xs">
          {label}
        </span>
        <Icon
          className={`box-content size-4 shrink-0 rounded-[10px] p-1.5 min-[601px]:size-5 min-[601px]:p-2.25 ${STAT_ICON_TONES[tone]}`}
        />
      </div>
      <strong className="mt-2.5 block text-[32px] leading-[1.2] font-bold min-[601px]:text-[44px]">
        {value}
      </strong>
    </div>
  );
}

function RoomTypeCard({ name, occupied, available, pending }) {
  const totalRooms = occupied + available + pending;
  const occupancyPercentage = (occupied / totalRooms) * 100;

  return (
    <article className="rounded-xl border border-[#e5e9ef] p-4.5">
      <BedDouble size={26} className="text-[#bb904d]" />
      <h3 className="mt-2.5 text-[17px] font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-[#7c8590]">{totalRooms} rooms total</p>

      <div className="mt-4.5 mb-3 h-1.5 overflow-hidden rounded-lg bg-[#e3f3e9]">
        <span className="block h-full bg-[#d7ac67]" style={{ width: `${occupancyPercentage}%` }} />
      </div>

      <footer className="flex justify-between gap-2 text-[11px] text-[#706148]">
        <span>{occupied} occupied</span>
        <span>{available} available</span>
      </footer>
    </article>
  );
}

function DashboardOverview() {
  return (
    <>
      <SectionHeading title="Property overview" />

      <div className="grid grid-cols-2 gap-4.5 min-[901px]:grid-cols-3 min-[1201px]:grid-cols-5">
        {STATS_DATA.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="rounded-[15px] bg-white p-5">
        <SectionHeading title="Room availability" note="By room type" />

        <div className="mt-4.5 grid grid-cols-1 gap-4 min-[601px]:grid-cols-2 min-[1201px]:grid-cols-4">
          {ROOM_TYPES.map((room) => (
            <RoomTypeCard key={room.name} {...room} />
          ))}
        </div>
      </section>

      <ReservationsAndStatus />
    </>
  );
}

export default function AdminPage({ role = "admin" }) {
  const { pathname } = useLocation();
  const isStaff = role === "staff";
  const basePath = isStaff ? "/staff" : "/admin";

  const page = getPage(pathname, basePath, isStaff);
  const header = getHeader(page, isStaff);

  return (
    <main className="management-shell flex min-h-screen flex-col">
      <PageHeader title={header.title} desc={header.desc} />

      <section className="flex flex-1">
        {isStaff ? <StaffSideBar /> : <AdminSideBar />}

        <div className="flex w-full min-w-0 flex-col gap-4.5 bg-[#eef1ff] p-4 text-[#15212b] min-[901px]:p-6">
          {page === "dashboard" && <DashboardOverview />}
          {page === "users" && <UserManagement />}
          {page === "account" && <AccountManagement role={role} />}
          {page === "rooms" && <RoomManagement key={role} readOnly={isStaff} />}
          {page === "reservations" && (isStaff ? <StaffReservations /> : <ReservationManagement />)}
          {page === "reviews" && <ReviewsManagement />}
          {page === "reports" && <Reports />}
          {page === "support" && <CustomerSupport />}
        </div>
      </section>
    </main>
  );
}
