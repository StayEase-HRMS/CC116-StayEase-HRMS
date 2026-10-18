// Mock data for the customer reservations page.
// Swap these exports for real API calls once the backend is up.

// Returns an ISO date (YYYY-MM-DD) offset from today, so the demo data always
// contains a current stay and upcoming stays no matter when the app is run.
const fromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// status: "confirmed" | "completed" | "cancelled"
// Nights are derived from checkInDate / checkOutDate in the UI.
// To preview the "No reservations yet" state, change this to `export const reservations = [];`
export const reservations = [
  {
    ref: "BK-9990",
    status: "confirmed", // in-stay: today falls between check-in and check-out
    location: "Grand Sovereign Resort, Bali",
    roomDetails: "Executive Horizon King Suite • Oceanfront Wing",
    checkInDate: fromToday(-2),
    checkInTime: "2:00 PM",
    checkOutDate: fromToday(2),
    checkOutTime: "11:00 AM",
    roomNumber: "Room 408",
    guests: 3,
  },
  {
    ref: "BK-9872",
    status: "confirmed",
    location: "Skyline Suites, Singapore",
    roomDetails: "Executive Suite • City View",
    checkInDate: fromToday(4),
    checkInTime: "3:00 PM",
    checkOutDate: fromToday(9),
    checkOutTime: "12:00 PM",
    roomNumber: "Room 1204",
    guests: 2,
  },
  {
    ref: "BK-8921",
    status: "confirmed",
    location: "Azure Bay Hotel, Boracay",
    roomDetails: "Deluxe Twin Room • Garden View",
    checkInDate: fromToday(61),
    checkInTime: "2:00 PM",
    checkOutDate: fromToday(63),
    checkOutTime: "11:00 AM",
    roomNumber: "Room 117",
    guests: 2,
  },
  {
    ref: "BK-7710",
    status: "completed",
    location: "Skyline Suites, Singapore",
    roomDetails: "Executive Suite • City View",
    checkInDate: fromToday(-135),
    checkInTime: "3:00 PM",
    checkOutDate: fromToday(-132),
    checkOutTime: "12:00 PM",
    roomNumber: "Room 1204",
    guests: 2,
  },
  {
    ref: "BK-7203",
    status: "completed",
    location: "Highland Retreat, Tagaytay",
    roomDetails: "Family Room • Lake View",
    checkInDate: fromToday(-190),
    checkInTime: "2:00 PM",
    checkOutDate: fromToday(-188),
    checkOutTime: "11:00 AM",
    roomNumber: "Room 305",
    guests: 4,
  },
  {
    ref: "BK-6655",
    status: "completed",
    location: "Grand Sovereign Resort, Bali",
    roomDetails: "Standard Queen Room • Pool Side",
    checkInDate: fromToday(-240),
    checkInTime: "2:00 PM",
    checkOutDate: fromToday(-235),
    checkOutTime: "11:00 AM",
    roomNumber: "Room 108",
    guests: 2,
  },
  {
    ref: "BK-6102",
    status: "completed",
    location: "Azure Bay Hotel, Boracay",
    roomDetails: "Deluxe King Room • Ocean View",
    checkInDate: fromToday(-295),
    checkInTime: "2:00 PM",
    checkOutDate: fromToday(-291),
    checkOutTime: "11:00 AM",
    roomNumber: "Room 221",
    guests: 2,
  },
  {
    ref: "BK-8344",
    status: "cancelled",
    location: "Skyline Suites, Singapore",
    roomDetails: "Executive Suite • City View",
    checkInDate: fromToday(21),
    checkInTime: "3:00 PM",
    checkOutDate: fromToday(23),
    checkOutTime: "12:00 PM",
    roomNumber: "Room 1210",
    guests: 1,
  },
];

// Shown when the customer has no reservations yet.
export const recommendedRooms = [
  {
    id: "standard-queen",
    name: "Standard Queen Room",
    view: "Pool Side",
    description: "A bright, comfortable room with direct access to the pool deck.",
    pricePerNight: 89,
  },
  {
    id: "deluxe-king",
    name: "Deluxe King Room",
    view: "Ocean View",
    description: "Spacious king room with a private balcony facing the sea.",
    pricePerNight: 129,
  },
  {
    id: "family-room",
    name: "Family Room",
    view: "Garden View",
    description: "Two queen beds and extra living space for the whole family.",
    pricePerNight: 169,
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    view: "City View",
    description: "Separate lounge, work desk and panoramic skyline views.",
    pricePerNight: 219,
  },
];