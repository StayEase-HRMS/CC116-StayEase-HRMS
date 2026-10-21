import { useState } from "react";
import { CalendarX, Pen, Key } from "lucide-react";
import { reservations, recommendedRooms } from "./mock-data-reservation";
import room_1 from "../assets/room_1.jpg";

const toDate = (iso) => new Date(`${iso}T00:00:00`);

const formatDate = (iso) =>
  toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const countNights = (checkIn, checkOut) =>
  Math.round((toDate(checkOut) - toDate(checkIn)) / 86_400_000);

// In-stay = today falls within the booking's check-in / check-out dates (inclusive).
const isInStay = ({ checkInDate, checkOutDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDate(checkInDate) <= today && today <= toDate(checkOutDate);
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

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
function BookingCard({ booking, tag }) {
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
          style={{ backgroundImage: `url(${room_1})` }}
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
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-300 px-3 py-1 text-amber-800 shadow-sm hover:bg-amber-200"
          >
            <Key size={15} strokeWidth={3} />
            Access digital key
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-300 px-3 py-1 hover:bg-blue-200"
          >
            <Pen size={15} strokeWidth={3} />
            Modify stay
          </button>
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
      {/* Placeholder — swap for <img src={...} alt={room.name} className="h-40 w-full object-cover" /> */}
      <div className="h-40 w-full bg-gray-300" />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold">{room.name}</p>
        <p className="text-sm text-gray-500">{room.view}</p>
        <p className="mt-2 text-sm text-gray-600">{room.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="font-bold">
            {formatPrice(room.pricePerNight)}{" "}
            <span className="text-xs font-normal text-gray-400">/ night</span>
          </p>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500" >
            View room
          </button>
        </div>
      </div>
    </article>
  );
}

function RecommendedRooms({ rooms }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-xl font-bold">Recommended rooms</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rooms.map((room) => (
          <RecommendedRoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function CustomerReservations() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // The current stay is pinned at the top, so it's kept out of the tabbed list below.
  const currentStay = reservations.find((r) => r.status === "confirmed" && isInStay(r));
  const listed = reservations.filter((r) => r !== currentStay);
  const byStatus = (status) => listed.filter((r) => r.status === status);

  const activeStatus = TABS.find((tab) => tab.key === activeTab).status;
  const visibleReservations = byStatus(activeStatus);

  return (
    <section className="min-w-0 flex-1 bg-slate-100 p-4">
      {reservations.length === 0 ? (
        <>
          <EmptyReservations />
          <RecommendedRooms rooms={recommendedRooms} />
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
              <BookingCard booking={currentStay} tag="Current stay" />
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
                <BookingCard key={booking.ref} booking={booking} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}