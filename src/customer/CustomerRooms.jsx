import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import RoomCard from "../components/RoomCard";
import RoomHero from "../components/RoomHero";
import { rooms } from "./mock-data-rooms";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "maintenance", label: "Maintenance" },
];

const RATING_OPTIONS = [
  { value: 0, label: "All Rating" },
  { value: 3, label: "3+ Stars" },
  { value: 4, label: "4+ Stars" },
  { value: 5, label: "5 Stars" },
];

const DEFAULT_FILTERS = { query: "", status: "all", minRating: 0 };

/* ---------- components ---------- */

function RoomFilters({ filters, onChange, onReset }) {
  const selectClass =
    "h-9 min-w-28 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#3b6fd8]";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-gray-400 focus-within:border-[#3b6fd8]">
        <Search size={16} />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="Search room number or room name..."
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        Status:
        <select
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        Rating:
        <select
          value={filters.minRating}
          onChange={(e) => onChange("minRating", Number(e.target.value))}
          className={selectClass}
        >
          {RATING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        aria-label="Reset filters"
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const baseClass =
    "flex size-6 cursor-pointer items-center justify-center rounded bg-[#dbe6fb] text-xs text-[#3b6fd8] disabled:cursor-default disabled:opacity-50";

  return (
    <nav aria-label="Room pages" className="mt-5 flex justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={baseClass}
      >
        <ChevronLeft size={14} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${baseClass} ${n === page ? "bg-[#2563eb]! text-white!" : ""}`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={baseClass}
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}

/* ---------- page ---------- */

export default function CustomerRooms() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Any filter change sends the list back to page 1.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const query = filters.query.trim().toLowerCase();
  const filteredRooms = rooms.filter((room) => {
    const matchesQuery =
      !query || room.name.toLowerCase().includes(query) || room.subtitle.toLowerCase().includes(query);
    const matchesStatus = filters.status === "all" || room.status === filters.status;
    const matchesRating = Math.round(room.rating) >= filters.minRating;
    return matchesQuery && matchesStatus && matchesRating;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRooms = filteredRooms.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const featuredRooms = rooms.filter((room) => room.featured);

  return (
    <section className="bg-linear-to-b from-[#e8eefb] to-[#f6f8fd] p-4">
      <div className="mx-auto max-w-6xl">
        <RoomHero rooms={featuredRooms} />

        <RoomFilters filters={filters} onChange={updateFilter} onReset={resetFilters} />

        {pageRooms.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No rooms match your filters.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pageRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </section>
  );
}
