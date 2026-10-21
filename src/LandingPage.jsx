import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Award,
  CalendarDays,
  ChartColumn,
  ConciergeBell,
  Flower2,
  HeartPulse,
  KeyRound,
  MapPin,
  Menu,
  MonitorSmartphone,
  Sailboat,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SprayCan,
  Star,
  Users,
  Utensils,
  Waves,
  X,
  Zap,
  Sunrise,
  Droplets,
} from "lucide-react";
import logo from "./assets/logo.svg";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80",
  villa: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  suite: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
  pavilion: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
};

const NAV_LINKS = [
  { label: "Destinations", href: "#booking" },
  { label: "Rooms & Suites", href: "#residences" },
  { label: "Experience", href: "#experience" },
  { label: "Dining", href: "#amenities" },
  { label: "Offers", href: "#booking" },
];

const DESTINATIONS = [
  { name: "Grand Sovereign Resort, Bali", tagline: "Exclusive beach & clifftop villas" },
  { name: "Azure Coast Villa & Spa", tagline: "Private coves & Mediterranean terraces" },
  { name: "Highland Alpine Estate", tagline: "Ski-in chalets & thermal lounges" },
  { name: "Kyoto Heritage Lodge", tagline: "Ryokan suites & garden onsen" },
];

const GUEST_OPTIONS = [
  "1 Adult, 0 Children • 1 Suite",
  "2 Adults, 0 Children • 1 Suite",
  "2 Adults, 2 Children • 1 Suite",
  "4 Adults, 0 Children • 2 Suites",
];

const GUEST_FEATURES = [
  {
    icon: KeyRound,
    title: "Touchless NFC Room Keys",
    text: "Unlock private elevators, wellness pavilions, and beachfront suites right from your phone.",
  },
  {
    icon: ConciergeBell,
    title: "24/7 Butler & Dining Dispatch",
    text: "Real-time room dining tracker with sommelier pairings and custom dietary requests.",
  },
  {
    icon: Flower2,
    title: "On-Demand Wellness Bookings",
    text: "Instantly reserve seaside massage cabanas, thermal plunge pools, and private yoga sessions.",
  },
];

const STAFF_FEATURES = [
  {
    icon: SprayCan,
    title: "Housekeeping Live Tablet Sync",
    text: "Instant turnover tracking, minibar inventory auditing, and inspection approvals in real-time.",
  },
  {
    icon: ChartColumn,
    title: "Smart RevPAR & Dynamic Pricing",
    text: "AI-calibrated room rates based on regional demand, flight volume, and seasonal milestones.",
  },
  {
    icon: HeartPulse,
    title: "VIP Guest Preference Intelligence",
    text: "Comprehensive history of pillow choices, culinary preferences, and anniversary reminders.",
  },
];

const RESIDENCES = [
  {
    id: "villa",
    category: "oceanfront",
    image: IMAGES.villa,
    chip: "Oceanfront • 320 m²",
    badge: { text: "Private Butler", tone: "gold" },
    overlay: [
      { icon: Waves, text: "Private Infinity Pool" },
      { icon: Award, text: "Cellar Access" },
    ],
    title: "The Presidential Sovereign Villa",
    text: "Cliffside panoramic vantage featuring an outdoor marble rain shower, private teppanyaki deck, and 24-hour round-the-clock concierge.",
    tags: ["Wi-Fi 6E", "Sonos Spatial Sound", "Thermal Bath", "Helipad Access"],
    price: 1250,
  },
  {
    id: "suite",
    category: "lagoon",
    image: IMAGES.suite,
    chip: "Lagoon View • 115 m²",
    badge: { text: "Club Privileges", tone: "dark" },
    overlay: [
      { icon: Droplets, text: "Freestanding Stone Tub" },
      { icon: Sunrise, text: "Sunset Veranda" },
    ],
    title: "Executive Horizon King Suite",
    text: "Sweeping views over the outer lagoon with a deep Italian soaking tub, custom fragrance bar, and full access to our private Executive Club Lounge.",
    tags: ["King Featherbed", "Smart Climate", "Nespresso Reserve", "Complimentary Valet"],
    price: 680,
  },
  {
    id: "pavilion",
    category: "garden",
    image: IMAGES.pavilion,
    chip: "Tropical Courtyard • 95 m²",
    badge: { text: "Direct Beach Path", tone: "green" },
    overlay: [
      { icon: Flower2, text: "Botanical Courtyard" },
      { icon: Droplets, text: "Rain Garden" },
    ],
    title: "Garden Sanctuary Pavilion",
    text: "Immersed in native flora with an alfresco reading veranda, secluded stone reflection pool, and private pathway directly to white sand beaches.",
    tags: ["Botanical Scents", "Yoga Deck", "Daybed Terrace", "Organic Minibar"],
    price: 490,
  },
];

const FILTERS = [
  { id: "all", label: "All Residences (24)" },
  { id: "oceanfront", label: "Oceanfront Villas" },
];

const AMENITIES = [
  {
    icon: Flower2,
    tone: "gold",
    title: "Holistic Wellness & Thermal Spa",
    text: "Himalayan salt grottos, hydrotherapy mineral circuits, and restorative ancient Ayurvedic therapies guided by resident masters.",
    link: "Explore Spa Menu",
  },
  {
    icon: Utensils,
    tone: "green",
    title: "Michelin-Starred Gastronomy",
    text: "Four artisanal concept bistros to an intimate 8-seat Omakase counter highlighting locally foraged ingredients.",
    link: "View Dining Concepts",
  },
  {
    icon: MonitorSmartphone,
    tone: "blue",
    title: "Smart Living Concierge",
    text: "Biometric entry, automated circadian lighting modes, motorized privacy drapery, and high-speed satellite connectivity.",
    link: "Digital Suite Features",
  },
  {
    icon: Sailboat,
    tone: "tan",
    title: "Bespoke Island Concierge",
    text: "Private 68ft catamaran excursions, sunset helicopter bay tours, and insider reservations to coveted cultural heritage sites.",
    link: "Charter Itineraries",
  },
];

const REVIEWS = [
  {
    initials: "EL",
    tone: "bg-[#d9a441]",
    when: "2 weeks ago",
    quote:
      "The mobile key and direct luggage delivery meant we were floating in our villa's infinity pool 12 minutes after touching down in Bali. Flawless hospitality.",
    name: "Elena Lindqvist",
    meta: "Stockholm • Stayed in Sovereign Villa",
  },
  {
    initials: "GM",
    tone: "bg-slate-600",
    when: "Last month",
    quote:
      "As General Manager of a 140-key estate, StayEase PMS eliminated 85% of radio chatter. Turnaround times dropped from 48 minutes to 22 minutes.",
    name: "Julian Vane",
    meta: "General Manager • Côte d'Azur Resort",
  },
  {
    initials: "TC",
    tone: "bg-emerald-700",
    when: "Yesterday",
    quote:
      "The sommelier in-app dispatch paired our terrace dinner with an exceptional vintage reservation within minutes. Unmatched precision and privacy.",
    name: "Tariq Al-Mansoor",
    meta: "Dubai • Stayed in Horizon King Suite",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Properties",
    items: [
      "Highland Alpine Estate",
      "Azure Coast Villa & Spa",
      "Metropolitan Grand Residence",
      "The Kyoto Heritage Lodge",
      "Boutique Penthouse Suites",
    ],
  },
  {
    title: "Guest Services",
    items: [
      "Private Concierge Care",
      "Michelin Dining Reservations",
      "Helipad & Chauffeur Transfers",
      "Wellness Sanctuary & Thermal Baths",
      "Bespoke Curated Itineraries",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const money = (n) => `$${n.toLocaleString("en-US")}`;

const toISO = (d) => d.toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
const nightsBetween = (a, b) =>
  Math.max(1, Math.round((new Date(b) - new Date(a)) / 86_400_000));

const BADGE_TONES = {
  gold: "bg-[#d9a441] text-[#3d2a05]",
  dark: "bg-slate-900/70 text-white backdrop-blur",
  green: "bg-emerald-200 text-emerald-900",
};

const AMENITY_TONES = {
  gold: "bg-[#fbeccb] text-[#a8761a]",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-[#e3ebfb] text-[#3b5bb5]",
  tan: "bg-[#f1e2c4] text-[#8a5a14]",
};

/** Image that quietly disappears if it fails to load, revealing the gradient behind it. */
function Photo({ src, alt, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a8761a]">
      {children}
    </p>
  );
}

function Stars({ className = "h-3.5 w-3.5" }) {
  return (
    <span className="flex gap-0.5 text-[#e8a92c]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} fill-current`} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece8df] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <a href="/" className="shrink-0" aria-label="StayEase home">
          <img src={logo} alt="StayEase Hospitality Suite" className="h-11 w-auto" />
        </a>

        <nav className="hidden flex-1 items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-slate-700 transition-colors hover:text-[#a8761a]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          <a href="/rooms" className="text-[13px] font-semibold text-slate-900 hover:text-[#a8761a]">
            Sign In
          </a>
          <a
            className="rounded-lg bg-[#d9a441] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#c8922c]">
            Book Now
          </a>
        </div>

        <button
          type="button"
          className="ml-auto rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#ece8df] bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-slate-700"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-4">
              <a href="/" className="text-sm font-semibold text-slate-900">
                Sign In
              </a>
              <a
                href="#booking"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#d9a441] px-4 py-2 text-sm font-semibold text-white"
              >
                Book Now
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function BookingBar() {
  const today = useMemo(() => toISO(new Date()), []);
  const [destIdx, setDestIdx] = useState(0);
  const [checkIn, setCheckIn] = useState(() => addDays(today, 7));
  const [checkOut, setCheckOut] = useState(() => addDays(today, 12));
  const [guests, setGuests] = useState(GUEST_OPTIONS[1]);

  const nights = nightsBetween(checkIn, checkOut);
  const dest = DESTINATIONS[destIdx];

  const onCheckIn = (value) => {
    setCheckIn(value);
    if (new Date(checkOut) <= new Date(value)) setCheckOut(addDays(value, 1));
  };

  const fieldBase =
    "min-w-0 rounded-xl border border-[#ece8df] bg-[#f8f6f1] px-4 py-3 transition-colors focus-within:border-[#d9a441] focus-within:bg-white";
  const labelBase =
    "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500";

  return (
    <div id="booking" className="relative z-10 mx-auto -mt-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 ">
      <div className="rounded-3xl border border-[#ece8df] bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_1.15fr_1.05fr_auto]">
          {/* Destination */}
          <label className={fieldBase}>
            <span className={labelBase}>
              <MapPin className="h-3 w-3 text-[#a8761a]" /> Sanctuary Destination
            </span>
            <span className="relative block">
              <select
                value={destIdx}
                onChange={(e) => setDestIdx(Number(e.target.value))}
                className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-slate-900 outline-none"
              >
                {DESTINATIONS.map((d, i) => (
                  <option key={d.name} value={i}>
                    {d.name}
                  </option>
                ))}
              </select>
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold text-[#a8761a]">
              {dest.tagline}
            </span>
          </label>

          {/* Dates */}
          <div className={fieldBase}>
            <span className={labelBase}>
              <CalendarDays className="h-3 w-3 text-[#a8761a]" /> 
              <p className="text-lg">Dates of Residency</p>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Check-in date"
                min={today}
                value={checkIn}
                onChange={(e) => onCheckIn(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-slate-900 outline-none"
              />
              <span className="text-slate-400">–</span>
              <input
                type="date"
                aria-label="Check-out date"
                min={addDays(checkIn, 1)}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Guests */}
          <label className={fieldBase}>
            <span className={labelBase}>
              <Users className="h-3 w-3 text-[#a8761a]" /> Residency Suite
            </span>
            <span className="relative block">
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-slate-900 outline-none"
              >
                {GUEST_OPTIONS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </span>
          </label>

          <button
            type="button"
            onClick={() =>
              document.getElementById("residences")?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#d9a441] px-6 py-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#c8922c] lg:px-8"
          >
            <Search className="h-4 w-4" />
            Check Availability &amp; Rates
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#1b2a4a] via-[#3a5a7a] to-[#7ab0c4]">
        <Photo src={IMAGES.hero} alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#faf8f4]/70 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-40 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Simplify Management.
            <span className="block text-[#f0b64a]">Elevate Every Stay.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/85">
            Where timeless architectural luxury meets digital precision. Experience tailored
            resort stays with instant digital key access, bespoke 24/7 concierge care, and
            unified resort intelligence for discerning guests and hospitality leaders.
          </p>
          <a
            href="#residences"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#d9a441] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#c8922c]"
          >
            Explore Suites &amp; Villas <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
      <BookingBar />
    </>
  );
}

function FeatureRow({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#f6f4ef] p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ece8df] bg-white text-[#8a5a14]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h4 className="text-[13px] font-bold text-slate-900">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function TwoWorlds() {
  return (
    <section id="experience" className="scroll-mt-20 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Crafted for Guests. Engineered for Hoteliers.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
          StayEase integrates touchless guest independence with an enterprise PMS suite that
          empowers staff to orchestrate flawless experiences.
        </p>
      </div>
    </section>
  );
}

function ResidenceCard({ room }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#ece8df] bg-white shadow-sm">
      <div className="relative h-56 bg-gradient-to-br from-[#2b4a6b] via-[#4c7a96] to-[#c9a46a]">
        <Photo src={room.image} alt={room.title} />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-slate-900/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {room.chip}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[11px] font-bold ${BADGE_TONES[room.badge.tone]}`}
        >
          {room.badge.text}
        </span>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] font-semibold text-white/95">
          {room.overlay.map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1">
              <Icon className="h-3 w-3" /> {text}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{room.title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{room.text}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-[#f1efe9] px-2 py-1 text-[10px] font-semibold text-slate-600"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between rounded-2xl bg-[#f8f6f1] p-4">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Residency starting at</p>
              <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">
                {money(room.price)}
                <span className="ml-1 text-xs font-medium text-slate-500">/ night</span>
              </p>
            </div>
            <a
              href="#booking"
              className="rounded-full bg-[#d9a441] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c8922c]"
            >
              Reserve Suite
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function Residences() {
  const [filter, setFilter] = useState("all");
  const rooms = RESIDENCES.filter((r) => filter === "all" || r.category === filter);

  return (
    <section id="residences" className="scroll-mt-20 bg-[#f4f1ea] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Unrivaled sanctuaries</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Curated Signature Residences
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">
              Every suite is intentionally designed with organic textures, panoramic vistas, and
              discrete technology.
            </p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter residences">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.id
                    ? "bg-[#d9a441] text-white"
                    : "bg-white text-slate-800 hover:bg-[#fbeccb]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <ResidenceCard key={r.id} room={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Amenities() {
  return (
    <section id="amenities" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <Eyebrow>The StayEase distinction</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Bespoke Resort Amenities
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-slate-600">
            Elevating hospitality beyond luxury accommodations into memorable sensory journeys.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map(({ icon: Icon, tone, title, text, link }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-[#ece8df] bg-white p-5 shadow-sm"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${AMENITY_TONES[tone]}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug tracking-tight text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{text}</p>
              <a
                href="#booking"
                className={`mt-auto flex items-center justify-between pt-5 text-[11px] font-bold ${
                  tone === "green" ? "text-emerald-700" : tone === "blue" ? "text-[#3b5bb5]" : "text-[#a8761a]"
                }`}
              >
                {link} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-20 bg-[#f4f1ea] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow>Unfiltered impressions</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Voices of Our Guests &amp; Operators
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-2xl border border-[#ece8df] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Stars className="h-3 w-3" />
                <span className="text-[11px] text-slate-500">{r.when}</span>
              </div>
              <blockquote className="mt-4 text-[13px] italic leading-relaxed text-slate-700">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                <span
                  className={`${r.tone} flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white`}
                >
                  {r.initials}
                </span>
                <span>
                  <span className="block text-xs font-bold text-slate-900">{r.name}</span>
                  <span className="block text-[11px] text-slate-500">{r.meta}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-[#ece8df] bg-white px-4 pb-8 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <img src={logo} alt="StayEase Hospitality Suite" className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-slate-600">
            Crafting timeless sanctuary and bespoke hospitality experiences across world-class
            retreats and urban boutique residences.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-700">
            <span className="flex items-center gap-1 rounded-full bg-[#f4f1ea] px-3 py-1.5">
              <Star className="h-3 w-3 fill-current text-[#a8761a]" /> Forbes Five-Star 2024
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#f4f1ea] px-3 py-1.5">
              <ShieldCheck className="h-3 w-3 text-[#a8761a]" /> Leading Hotels Quality Seal
            </span>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#residences" className="text-xs text-slate-600 hover:text-[#a8761a]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-[#ece8df] pt-6 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} StayEase Hospitality Group. All international rights reserved.</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {["Privacy Policy", "Terms of Residency", "Accessibility Standards", "Security & ESG"].map((l) => (
            <li key={l}>
              <a href="#top" className="hover:text-[#a8761a]">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div
      id="top"
      className="min-h-screen bg-[#faf8f4] text-slate-900 antialiased"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <Navbar />
      <main>
        <Hero />
        <TwoWorlds />
        <Residences />
        <Amenities />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}

