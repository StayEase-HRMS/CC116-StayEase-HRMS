import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge, Stars, formatPrice, guestLabel } from "./RoomCard";

const AUTO_SCROLL_MS = 5000; // time each room stays on screen

// Full-width, dimmed room photos with the room's details on top.
// Native horizontal scrolling (swipe / trackpad / scroll-snap) plus arrows and dots.
export default function RoomHero({ rooms, onView }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = rooms.length;

  const goTo = useCallback(
    (i) => {
      const track = trackRef.current;
      if (!track || count === 0) return;
      const next = (i + count) % count; // wraps around
      track.scrollTo({
        left: next * track.clientWidth,
        // jump straight back to the first room instead of rewinding through every slide
        behavior: i >= count ? "auto" : "smooth",
      });
    },
    [count]
  );

  // Auto-scroll: a fresh timer starts whenever the room changes, so manual
  // navigation (arrows, dots, swiping) automatically restarts the countdown.
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setTimeout(() => goTo(index + 1), AUTO_SCROLL_MS);
    return () => clearTimeout(timer);
  }, [index, paused, count, goTo]);

  if (count === 0) return null;

  const handleScroll = (e) => {
    const track = e.currentTarget;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured rooms"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {rooms.map((room) => (
            <article
              key={room.id}
              className="relative h-96 w-full shrink-0 snap-center bg-gray-400 bg-cover bg-center"
              style={room.image ? { backgroundImage: `url(${room.image})` } : undefined}
            >
              {/* dim overlay */}
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end gap-3 px-8 py-8 text-white sm:px-16">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={room.status} />
                  <Stars
                    rating={room.rating}
                    reviews={room.reviews}
                    offClassName="text-white/40"
                    textClassName="text-gray-200"
                  />
                </div>

                <div>
                  <h3 className="text-4xl font-bold">{room.name}</h3>
                  <p className="text-lg text-gray-200">{room.subtitle}</p>
                </div>

                <p className="text-sm text-gray-100">{room.description}</p>

                <ul className="flex flex-wrap gap-2">
                  {[guestLabel(room.guests), ...room.amenities].map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-5">
                  <p className="text-2xl font-bold">
                    {formatPrice(room.pricePerNight)}{" "}
                    <span className="text-sm font-normal text-gray-300">/ night</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onView?.(room)}
                    className="cursor-pointer rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-400"
                  >
                    View room
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {rooms.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous room"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/35"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next room"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/35"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to ${room.name}`}
            aria-current={i === index}
            className={`size-2.5 cursor-pointer rounded-full ${
              i === index ? "bg-[#3b6fd8]" : "bg-[#dbe6fb] hover:bg-[#b9ccf3]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
