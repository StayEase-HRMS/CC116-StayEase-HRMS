import { ChevronRight, Star } from "lucide-react";

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const STATUS_STYLES = {
  available: { label: "Available", className: "bg-[#e3f5e8] text-[#1f7a3d]" },
  reserved: { label: "Reserved", className: "bg-[#fdf1d0] text-[#a16207]" },
  maintenance: { label: "Maintenance", className: "bg-[#fde4e4] text-[#b42318]" },
};

export function StatusBadge({ status }) {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Stars({ rating, reviews, offClassName = "text-gray-300", textClassName = "text-gray-500" }) {
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={0}
          fill="currentColor"
          className={i < filled ? "text-[#f5a623]" : offClassName}
        />
      ))}
      <span className={`ml-1.5 text-xs ${textClassName}`}>({reviews}) Reviews</span>
    </div>
  );
}

export const guestLabel = (guests) => `${guests} ${guests === 1 ? "Person" : "Persons"}`;

export default function RoomCard({ room }) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex gap-3">
        {room.image ? (
          <img src={room.image} alt={room.name} className="h-20 w-20 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-md bg-gray-300" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{room.name}</h3>
            <StatusBadge status={room.status} />
          </div>
          <p className="text-sm text-gray-600">{room.subtitle}</p>
          <p className="mt-1 font-bold">
            {formatPrice(room.pricePerNight)}{" "}
            <span className="text-xs font-normal text-gray-400">/ night</span>
          </p>
          <Stars rating={room.rating} reviews={room.reviews} />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
        <p className="truncate">{[guestLabel(room.guests), ...room.amenities].join(" · ")}</p>
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-0.5 text-[#d4880a] hover:underline"
        >
          View <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
