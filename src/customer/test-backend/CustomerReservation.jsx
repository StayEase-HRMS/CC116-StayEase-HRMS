import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarX, Pen, Key, XCircle } from "lucide-react";
import { useMyReservations } from "../api/useMyReservations";
import { useRooms } from "../api/rooms";
import { formatPrice } from "../components/RoomCard";
import BookingModal from "./BookingModal";
import room_1 from "../assets/room_1.jpg";

/* ---------- helpers ---------- */

const toDate = (iso) => new Date(`${iso}T00:00:00`);

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (iso) =>
  toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const countNights = (checkIn, checkOut) =>
  Math.round((toDate(checkOut) - toDate(checkIn)) / 86_400_000);

// In-stay = today falls within the booking's check-in / check-out dates (inclusive).
const isInStay = ({ checkInDate, checkOutDate }) => {
  const today = startOfToday();
  return toDate(checkInDate) <= today && today <= toDate(checkOutDate);
};

// The server only lets guests modify / cancel confirmed bookings that haven't started.
const canManage = (booking) =>
  booking.status === "confirmed" && toDate(booking.checkInDate) >= startOfToday();

const STATUS_STYLES = {
  confirmed: { label: "Confirmed", className: "bg-green-200 text-green-800" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelled", className: "bg-red-200 text-red-800" },
};

const TABS = [
  { key: "upcoming", label: "Upcoming", status: "confirmed" },
  { key: "past", label: "Past stays", status: "completed" },
  { key: "cancelled", label: "Cancelled", status: "cancelled" },
];

/* ---------- components ---------- */

function Detail({ label, children }) {
  return (
    <div className="flex-1 text-center">
      <p className="mb-1 border-b border-gray-300">{label}</p>
      {children}
    </div>
  );
}

// `tag` is an optional highlight label (e.g. "Current stay") shown before the status.
function BookingCard({ booking, tag, onModify, onCancel }) {
  const {
    ref,
    status,
    location,
    roomDetails,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    roomNumber,
    guests,
    image,
  } = booking;

  const nights = countNights(checkInDate, checkOutDate);
  const statusStyle = STATUS_STYLES[status];

  return (
    <article
      className={`h-auto w-full rounded-xl bg-white p-4 shadow-sm ${tag ? "ring-2 ring-blue-500" : ""}`}
    >
      <section>
        <div className="flex flex-wrap items-center gap-3">
          {tag && (
            <p className="w-fit rounded-xl bg-blue-600 px-5 py-1 text-sm font-bold text-white">
              {tag}
            </p>
          )}
          <p className={`w-fit rounded-xl px-5 py-1 text-sm font-bold ${statusStyle.className}`}>
            {statusStyle.label}
          </p>
          <p>Ref: {ref}</p>
        </div>

        <div
          className="relative mt-3 flex h-48 w-full items-end justify-between overflow-hidden rounded-lg bg-cover bg-center p-4"
          style={{ backgroundImage: `url(${image || room_1})` }}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute top-4 right-4 z-10 text-right text-white">
            <p className="text-sm tracking-wide uppercase">Total duration</p>
            <p className="mt-1 text-2xl font-bold">
              {nights} {nights === 1 ? "night" : "nights"}
            </p>
          </div>

          <div className="relative z-10 text-white">
            <p className="text-2xl font-bold">{location}</p>
            <p className="mt-1 text-base text-gray-200">{roomDetails}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 flex justify-between rounded-xl bg-slate-100 px-7 py-3">
        <Detail label="Check-in">
          <p className="text-sm font-bold">{formatDate(checkInDate)}</p>
          <p>From <span className="text-sm font-bold">{checkInTime}</span></p>
        </Detail>

        <Detail label="Check-out">
          <p className="text-sm font-bold">{formatDate(checkOutDate)}</p>
          <p>Until <span className="text-sm font-bold">{checkOutTime}</span></p>
        </Detail>

        <Detail label="Room">
          <p className="text-sm font-bold">{roomNumber}</p>
        </Detail>

        <Detail label="Guests">
          <p className="text-sm font-bold">{guests}</p>
        </Detail>
      </section>

      {status === "confirmed" && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-300 px-3 py-1 text-amber-800 shadow-sm hover:bg-amber-200"
          >
            <Key size={15} strokeWidth={3} />
            Access digital key
          </button>

          {canManage(booking) && (
            <>
              <button
                type="button"
                onClick={() => onModify(booking)}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-300 px-3 py-1 hover:bg-blue-200"
              >
                <Pen size={15} strokeWidth={3} />
                Modify stay
              </button>
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
              >
                <XCircle size={15} strokeWidth={3} />
                Cancel stay
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function ReservationFilters({ activeTab, onTabChange, countFor }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 shadow-sm">
      <input
        className="w-100 rounded-xl border border-gray-300 p-2"
        type="text"
        placeholder="Search your record here"
        aria-label="Search reservations"
      />

      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`cursor-pointer rounded-xl p-2 ${
              activeTab === tab.key ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
          >
            {tab.label} ({countFor(tab.status)})
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyReservations() {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <CalendarX size={40} className="mx-auto text-gray-400" />
      <p className="mt-3 text-2xl font-bold">No reservations yet</p>
      <p className="mt-1 text-gray-500">
        When you book a stay, it will show up here. In the meantime, here are some rooms you might like.
      </p>
    </div>
  );
}

function RecommendedRoomCard({ room }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      {room.image ? (
        <img src={room.image} alt={room.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gray-300" />
      )}

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold">{room.name}</p>
        <p className="text-sm text-gray-500">{room.subtitle}</p>
        <p className="mt-2 text-sm text-gray-600">{room.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="font-bold">
            {formatPrice(room.pricePerNight)}{" "}
            <span className="text-xs font-normal text-gray-400">/ night</span>
          </p>
          <Link
            to="/rooms"
            className="rounded-xl bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
          >
            View room
          </Link>
        </div>
      </div>
    </article>
  );
}

// Fetches the room catalog itself, so the request only happens when it's actually shown.
function RecommendedRooms() {
  const { rooms, loading } = useRooms();
  const picks = rooms.filter((room) => room.status === "available").slice(0, 4);

  if (loading || picks.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-xl font-bold">Recommended rooms</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {picks.map((room) => (
          <RecommendedRoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function CustomerReservations() {
  const { reservations, loading, error, isDemo, update, cancel } = useMyReservations();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);

  // The current stay is pinned at the top, so it's kept out of the tabbed list below.
  const currentStay = reservations.find((r) => r.status === "confirmed" && isInStay(r));
  const listed = reservations.filter((r) => r !== currentStay);
  const byStatus = (status) => listed.filter((r) => r.status === status);

  const activeStatus = TABS.find((tab) => tab.key === activeTab).status;
  const visibleReservations = byStatus(activeStatus);

  // Demo rows have no `id`, so fall back to the reference code to target just one booking.
  const idOf = (booking) => booking.id ?? booking.ref;

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel your stay at ${booking.location} (${booking.ref})?`)) return;
    setActionError(null);
    try {
      await cancel(idOf(booking));
    } catch (err) {
      setActionError(err.message || "Couldn't cancel this reservation. Please try again.");
    }
  };

  const notices = (
    <>
      {isDemo && (
        <p className="mb-4 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-800">
          Demo mode: Supabase isn't configured, so sample reservations are shown.
        </p>
      )}
      {(error || actionError) && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError || error}
        </p>
      )}
    </>
  );

  if (loading) {
    return (
      <section className="min-w-0 flex-1 bg-slate-100 p-4">
        <p className="py-10 text-center text-gray-500">Loading your reservations…</p>
      </section>
    );
  }

  return (
    <section className="min-w-0 flex-1 bg-slate-100 p-4">
      {notices}

      {reservations.length === 0 ? (
        <>
          <EmptyReservations />
          <RecommendedRooms />
        </>
      ) : (
        <>
          <ReservationFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            countFor={(status) => byStatus(status).length}
          />

          {currentStay && (
            <div className="mt-4">
              <BookingCard
                booking={currentStay}
                tag="Current stay"
                onModify={setEditing}
                onCancel={handleCancel}
              />
            </div>
          )}

          <p className="mt-4 font-bold text-lg">Upcoming stay</p>

          {visibleReservations.length === 0 ? (
            <p className="mt-6 text-center text-gray-500">
              {currentStay ? "No other reservations to show." : "No reservations to show."}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {visibleReservations.map((booking) => (
                <BookingCard
                  key={booking.ref}
                  booking={booking}
                  onModify={setEditing}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <BookingModal
          mode="edit"
          booking={editing}
          onClose={() => setEditing(null)}
          onSubmit={(values) => update(idOf(editing), values)}
        />
      )}
    </section>
  );
}
