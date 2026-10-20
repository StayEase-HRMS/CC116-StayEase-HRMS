import { useEffect, useState } from "react";
import { Clock, KeyRound, Mail, MapPin, Pencil, Phone, Users } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

/* ---------- placeholder data: replace with your logged-in user / API data ---------- */

const PROFILE = {
  name: "Joshybels",
  employeeId: "SE-6821",
  title: "Senior Front Desk & Guest Relations Specialist",
  shift: "Morning (07:00 - 15:30)",
  email: "marcus.vance@stayease.com",
  phone: "+1 (555) 234-8901",
  avatar: null,
  fullName: "Marcus Elliott Vance",
  preferredName: "Marcus",
  department: "Front Desk Operations & Concierge",
  supervisor: "Helena Brandt (GM)",
  languages: "English (Native), Spanish (C1)",
  joined: "March 14, 2022 (2+ Years)",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  rfid: "Master Staff RFID #4409",
  permittedFloors: "Floors 1 – 6, Service Level & Roof",
  pmsLevel: "Supervisor (Tier 2)",
  terminal: "Terminal Front-Desk-02",
  emergency: {
    name: "Sarah Vance",
    relation: "Spouse",
    phone: "+1 (555) 890-4321",
    address: "452 Oakcrest Ave, Suite 4B, Metropolis",
  },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---------- small pieces ---------- */

function Card({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-[15px] bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#15212b]">{title}</h2>
        {Icon && <Icon size={20} className="text-[#b3832c]" aria-hidden="true" />}
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md px-3 py-2.5 text-sm odd:bg-[#f3f4f6]">
      <dt className="text-[#697589]">{label}</dt>
      <dd className="text-right font-semibold text-[#15212b]">{value}</dd>
    </div>
  );
}

/* ---------- page ---------- */

export default function AccountManagement({ role = "admin", user: initialUser = PROFILE }) {
  // Local copy so edits show immediately (they reset on refresh until you connect a backend).
  const [user, setUser] = useState(initialUser);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const personalDetails = [
    ["Full Legal Name", user.fullName],
    ["Preferred Name / Alias", user.preferredName],
    ["Department", user.department],
    ["Supervisor / Lead", user.supervisor],
    ["Languages Spoken", user.languages],
    ["Date Joined StayEase", user.joined],
  ];
  const stationAccess = [
    ["Permitted Floors", user.permittedFloors],
    ["PMS Override Level", user.pmsLevel],
    ["Station Terminal", user.terminal],
  ];
  const emergency = user.emergency;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {notice && (
        <p role="status" className="rounded-lg bg-[#dff3e6] px-4 py-2.5 text-sm font-semibold text-[#1f6b3a]">
          {notice}
        </p>
      )}

      {showEdit && (
        <EditProfileModal
          profile={user}
          canEditAccess={role === "admin"}
          onClose={() => setShowEdit(false)}
          onSave={(values) => {
            setUser((prev) => ({ ...prev, ...values }));
            setNotice("Profile updated.");
          }}
        />
      )}
      {showPassword && (
        <ChangePasswordModal
          onClose={() => setShowPassword(false)}
          onSuccess={() => setNotice("Password updated.")}
        />
      )}

      {/* Profile header */}
      <section className="flex flex-col gap-5 rounded-[15px] bg-white p-5 min-[901px]:flex-row min-[901px]:items-start min-[901px]:justify-between">
        <div className="flex gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-16 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#b3832c] text-lg font-bold text-white">
              {initials}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#15212b]">{user.name}</h2>
              <span className="rounded bg-[#e8ecf2] px-2 py-0.5 text-[11px] font-semibold text-[#574d40]">
                ID #{user.employeeId}
              </span>
            </div>
            <p className="mt-1 max-w-xs text-sm text-[#574d40]">{user.title}</p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#574d40]">
              <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true" />{user.shift}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} aria-hidden="true" />{user.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} aria-hidden="true" />{user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 min-[901px]:flex-col">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#d4a04a] px-4 py-2.5 text-sm font-semibold text-[#3d2c0e] transition-colors hover:bg-[#c8922f] focus-visible:outline-2 focus-visible:outline-[#4b6b95]"
          >
            <Pencil size={14} aria-hidden="true" /> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e3e8ef] px-4 py-2.5 text-sm font-semibold text-[#574d40] transition-colors hover:bg-[#d5dce6] focus-visible:outline-2 focus-visible:outline-[#4b6b95]"
          >
            <KeyRound size={14} aria-hidden="true" /> Change Password
          </button>
        </div>
      </section>

      <div className="grid gap-4.5 min-[1201px]:grid-cols-2">
        {/* Personal & Department Details */}
        <Card title="Personal & Department Details" icon={Users}>
          <dl className="grid gap-0.5">
            {personalDetails.map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </dl>

          <div className="mt-6">
            <p className="mb-2 text-[10px] font-bold tracking-[0.07em] text-[#697589] uppercase">
              Shift schedule coverage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <span
                  key={day}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                    user.workingDays.includes(day) ? "bg-[#d4a04a] text-[#3d2c0e]" : "bg-[#e8ecf2] text-[#697589]"
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid content-start gap-4.5">
          {/* Station & NFC Access */}
          <Card title="Station & NFC Access" icon={KeyRound}>
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-[#f3f4f6] px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-[#15212b]">{user.rfid}</p>
                <p className="text-xs text-[#697589]">Active • Validated today 06:55 AM</p>
              </div>
              <span className="shrink-0 rounded bg-[#dff3e6] px-2 py-0.5 text-[11px] font-semibold text-[#1f6b3a]">
                Authorized
              </span>
            </div>
            <dl className="grid gap-0.5">
              {stationAccess.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </dl>
          </Card>

          {/* Emergency Contact */}
          <Card title="Emergency Contact" icon={Users}>
            <div className="rounded-lg bg-[#f3f4f6] p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#15212b]">{emergency.name}</p>
                <span className="text-[11px] font-semibold text-[#697589] uppercase">{emergency.relation}</span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-[#574d40]">
                <Phone size={14} aria-hidden="true" /> {emergency.phone}
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-xs text-[#574d40]">
                <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {emergency.address}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
