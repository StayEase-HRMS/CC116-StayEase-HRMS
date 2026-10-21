import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { calcNights, estimateTotal } from "../api/reservations";
import { StatusBadge, formatPrice, guestLabel } from "../components/RoomCard";

/* ---------- helpers ---------- */

const pad = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const inputClass =
  "mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

/* ---------- component ---------- */

// mode "create": `room` is the room being booked.
// mode "edit":   `booking` is the reservation being modified.
// `onSubmit({ checkIn, checkOut, numGuests, specialRequests })` must return a promise.
export default function BookingModal({
  mode = "create",
  room,
  booking,
  onSubmit,
  onClose,
  onViewReservations,
}) {
  const isEdit = mode === "edit";
  const todayISO = toISODate(new Date());

  const [checkIn, setCheckIn] = useState(isEdit ? booking.checkInDate : todayISO);
  const [checkOut, setCheckOut] = useState(isEdit ? booking.checkOutDate : addDays(todayISO, 1));
  const [guests, setGuests] = useState(isEdit ? booking.guests : 1);
  const [requests, setRequests] = useState(isEdit ? booking.specialRequests : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pricePerNight = isEdit ? booking.raw?.room?.price : room.pricePerNight;
  const maxGuests = isEdit ? null : room.guests;
  const bookable = isEdit || room.status !== "maintenance";
  const nights = calcNights(checkIn, checkOut);
  const total = pricePerNight && nights > 0 ? estimateTotal(pricePerNight, checkIn, checkOut) : null;

  const handleCheckIn = (value) => {
    setCheckIn(value);
    if (value && checkOut <= value) setCheckOut(addDays(value, 1));
  };

  const validate = () => {
    if (!checkIn || !checkOut) return "Please choose your check-in and check-out dates.";
    if (checkIn < todayISO) return "Check-in date cannot be in the past.";
    if (checkOut <= checkIn) return "Check-out date must be after check-in date.";
    if (!guests || guests < 1) return "At least one guest is required.";
    if (maxGuests && guests > maxGuests) return `This room allows a maximum of ${maxGuests} guests.`;
    return null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await onSubmit({
        checkIn,
        checkOut,
        numGuests: Number(guests),
        specialRequests: requests?.trim() || null,
      });
      if (isEdit) onClose();
      else setConfirmation(result ?? {});
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = isEdit ? "Modify stay" : `Book ${room.name}`;
  const subtitle = isEdit ? `${booking.location} • Ref ${booking.ref}` : room.subtitle;
  const referenceCode = confirmation?.reference_code ?? confirmation?.ref;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </header>

        {confirmation ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-600" />
            <h3 className="mt-3 text-xl font-bold">
              Reservation {confirmation.status === "pending" ? "requested" : "confirmed"}
            </h3>
            {referenceCode && (
              <p className="mt-1 text-gray-600">
                Reference <span className="font-mono font-bold">{referenceCode}</span>
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(checkIn)} to {formatDate(checkOut)} · {nights} {nights === 1 ? "night" : "nights"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onViewReservations}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                View my reservations
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-5">
              {isEdit ? (
                <div className="rounded-xl bg-slate-100 p-3 text-sm">
                  <p className="font-semibold">{booking.roomDetails}</p>
                  <p className="text-gray-600">{booking.roomNumber}</p>
                </div>
              ) : (
                <>
                  <div
                    className="relative h-36 overflow-hidden rounded-xl bg-gray-300 bg-cover bg-center"
                    style={room.image ? { backgroundImage: `url(${room.image})` } : undefined}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={room.status} />
                    </div>
                    <div className="absolute right-3 bottom-3 rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
                      <span className="font-bold">{formatPrice(room.pricePerNight)}</span>
                      <span className="ml-1 text-xs text-gray-500">/ night</span>
                    </div>
                  </div>

                  {room.description && <p className="text-sm text-gray-600">{room.description}</p>}

                  <ul className="flex flex-wrap gap-2">
                    {[guestLabel(room.guests), ...room.amenities].map((item) => (
                      <li key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>

                  {!bookable && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      This room is under maintenance and can't be booked right now.
                    </p>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Check-in
                  <input
                    type="date"
                    value={checkIn}
                    min={todayISO}
                    onChange={(e) => handleCheckIn(e.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Check-out
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn ? addDays(checkIn, 1) : todayISO}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Guests
                <input
                  type="number"
                  min={1}
                  max={maxGuests ?? undefined}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={inputClass}
                  required
                />
              </label>

              <label className="block text-sm font-semibold">
                Special requests <span className="font-normal text-gray-400">(optional)</span>
                <textarea
                  value={requests ?? ""}
                  onChange={(e) => setRequests(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              {total !== null && (
                <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm">
                  <span className="text-gray-600">
                    {nights} {nights === 1 ? "night" : "nights"} × {formatPrice(pricePerNight)}
                  </span>
                  <span className="text-base font-bold">{formatPrice(total)}</span>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

            <footer className="flex justify-end gap-3 border-t border-gray-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !bookable}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {busy ? "Saving…" : isEdit ? "Save changes" : "Confirm booking"}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
