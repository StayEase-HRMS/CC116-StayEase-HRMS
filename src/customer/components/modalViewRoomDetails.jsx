import { useEffect } from "react";
import { Coffee, Lock, RotateCcw, Tv, Wifi, Wind, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Defaults (matches the mockup). Pass a `room` prop to override.     */
/* ------------------------------------------------------------------ */

const AMENITY_ICONS = {
  wifi: Wifi,
  tv: Tv,
  ac: Wind,
  coffee: Coffee,
  safe: Lock,
};

const DEFAULT_ROOM = {
  number: "204",
  type: "Deluxe Room",
  status: "Available", // Available | Reserved | Maintenance
  image:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  price: 3500,
  description:
    "Spacious and elegant Deluxe room offering panoramic courtyard views, plush king bed, and modern marble ensuite.",
  amenities: [
    { icon: "wifi", label: "High-speed Wi-Fi" },
    { icon: "tv", label: '55" Smart TV' },
    { icon: "ac", label: "Air Conditioning" },
    { icon: "coffee", label: "Nespresso Bar" },
    { icon: "safe", label: "Electronic Safe" },
  ],
  floor: "2nd Floor (East Wing)",
  lastSanitized: "Today, 11:20 AM",
};

const STATUS_STYLES = {
  Available: "bg-[#e3f5e8] text-[#1f7a3d]",
  Reserved: "bg-[#fdf1d0] text-[#a16207]",
  Maintenance: "bg-[#fde4e4] text-[#b42318]",
};

const peso = (n) => `₱${Number(n).toLocaleString("en-PH")}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ViewDetails({
  room = DEFAULT_ROOM,
  onClose = () => {},
  onUpdateStatus = () => {},
  onRemove = () => {},
  onEdit = () => {},
}) {
  const r = { ...DEFAULT_ROOM, ...room };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-overview-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#e8e4da] bg-white shadow-2xl shadow-slate-900/20"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#eeeae0] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="border-r border-[#e1ddd2] pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Room Overview
            </span>
            <h2 id="room-overview-title" className="text-lg font-bold text-slate-800">
              Room {r.number}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-5 pb-5 pt-5">
          {/* Image */}
          <div className="relative h-[175px] overflow-hidden rounded-xl bg-gradient-to-br from-[#5a4632] via-[#8a6c47] to-[#c9a46a]">
            <img
              src={r.image}
              alt={`Room ${r.number}, ${r.type}`}
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex gap-2">
              <span
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  STATUS_STYLES[r.status] ?? STATUS_STYLES.Available
                }`}
              >
                {r.status}
              </span>
              <span className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                {r.type}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
              <span className="text-lg font-bold text-slate-800">{peso(r.price)}</span>
              <span className="ml-1 text-xs text-slate-500">/ night</span>
            </div>
          </div>

          {/* Description */}
          <section className="mt-5">
            <h3 className="text-sm font-bold text-slate-900">Description</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{r.description}</p>
          </section>

          {/* Amenities */}
          <section className="mt-5">
            <h3 className="text-sm font-bold text-slate-900">Amenities Included</h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {r.amenities.map(({ icon, label }) => {
                const Icon = AMENITY_ICONS[icon] ?? Wifi;
                return (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-lg border border-[#e8e4da] bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#d9a441]" />
                    {label}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Meta */}
          <dl className="mt-5 grid gap-2 rounded-xl border border-[#e8e4da] bg-[#f8f9fb] px-4 py-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="inline font-bold text-slate-800">Floor: </dt>
              <dd className="inline font-medium text-slate-500">{r.floor}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-slate-800">Last Sanitized: </dt>
              <dd className="inline font-medium text-slate-500">{r.lastSanitized}</dd>
            </div>
          </dl>
        </div>

        {/* Footer actions */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae0] bg-[#f8f9fb] px-5 py-3.5">
          <button
            type="button"
            onClick={onUpdateStatus}
            className="flex items-center gap-2 rounded-lg border border-[#d5d9e2] bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#d9a441]" />
            Update Operational Status
          </button>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-[#f3c9cf] bg-white px-4 py-2 text-[13px] font-semibold text-[#d1264a] transition-colors hover:bg-[#fdeef0]"
            >
              Remove Room
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-[#d9a441] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#c8922c]"
            >
              Edit Room
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}