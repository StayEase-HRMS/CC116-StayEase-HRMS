import roomPhoto from '../assets/room_1.jpg';
export const rooms = [
  ['204', 'Deluxe Room', 3500, 'Occupied'], ['101', 'Standard Room', 2400, 'Needs Cleaning'],
  ['305', 'Executive Suite', 5800, 'Available'], ['108', 'Standard Room', 2400, 'Needs Cleaning'],
  ['402', 'Family Room', 4600, 'Vacant'], ['210', 'Deluxe Room', 3500, 'Available'],
].map(([number, category, price, status]) => ({
  id: number, name: 'Room ' + number, category, price, status,
  amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning'], photos: [roomPhoto],
  description: 'A comfortable ' + category.toLowerCase() + ' with a welcoming interior and space to relax.',
  floor: number[0] + 'F', sanitized: 'Not recorded', note: '',
}));
export const accounts = [
  { id: 'G001', name: 'Elena Rostova', email: 'elena.rostova@gmail.com', role: 'Guest', status: 'Active', created: '2023-11-04' },
  { id: 'S001', name: 'David Chen', email: 'david.chen@stayease.com', role: 'Staff', status: 'Active', created: '2023-09-18' },
  { id: 'G002', name: 'Mark Denina', email: 'mark.denina@example.com', role: 'Guest', status: 'Active', created: '2023-11-10' },
  { id: 'G003', name: 'Josh Dayapera', email: 'josh.dayapera@example.com', role: 'Guest', status: 'Suspended', created: '2023-11-10' },
];
export const reviews = [
  ['John Dela Cruz', 5, 'Great hotel! Very clean and comfortable. The staff are very accommodating. Will definitely come back!', 18],
  ['Sarah Martinez', 2, 'The room was okay, but the air conditioner was too noisy. I hope this can be fixed.', 17],
  ['Mike Tan', 5, 'Amazing stay! The location is perfect and the amenities are excellent.', 16],
  ['Liza Gomez', 1, 'The service was very slow and the room was not clean. Not what I expected.', 14],
  ['Carlos Reyes', 4, 'Great ambiance and smooth check-in process. The breakfast buffet had plenty of options.', 12],
  ['Maria Santos', 5, "Breathtaking ocean view and exceptionally comfortable beds. Best sleep I've had in years!", 10],
  ['Ana Cruz', 3, 'Comfortable room. Breakfast service could be quicker.', 9],
  ['Paolo Garcia', 4, 'Friendly reception and a lovely family suite.', 8],
].map(([name, rating, text, day], id) => ({ id, name, rating, text, day, kept: false }));
export const tickets = [
  { id: 1, name: 'Hugh Jorgan', room: '402', stay: 'Oct 12 – Oct 14', status: 'In Progress', messages: [{ text: 'Hi! Could we arrange a late check-out tomorrow around 1:00 PM? Also wondering if the rooftop pool is open today with this weather.', time: '2:19 PM' }, { text: 'Certainly, Mr. Jorgan! I have updated your check-out time to 1:00 PM with our compliments. The rooftop pool remains open until 10:00 PM today with fresh towel service on the terrace.', time: '2:20 PM', staff: true }] },
  { id: 2, name: 'Marcus Sterling', room: '701', stay: 'Oct 12 – Oct 16', status: 'Open', messages: [{ text: 'Please send up two additional flutes and an ice bucket to our room.', time: '2:14 PM' }] },
  { id: 3, name: 'Sarah Chen', room: '315', stay: 'Oct 11 – Oct 15', status: 'Open', messages: [{ text: 'Login prompt is not redirecting automatically on my laptop.', time: '2:06 PM' }] },
  { id: 4, name: 'David Miller', room: '208', stay: 'Oct 12 – Oct 14', status: 'Resolved', messages: [{ text: 'Need early morning transfer for a 6:30 AM departure.', time: '1:55 PM' }, { text: 'Your transfer is arranged for 4:30 AM. Please meet us at reception.', time: '2:00 PM', staff: true }] },
];
export const profile = {
  name: "Joshybels",
  employeeId: "SE-6821",
  title: "Senior Front Desk & Guest Relations Specialist",
  shift: "Morning (07:00 - 15:30)",
  email: "joshybels@stayease.com",
  phone: "+63 912-345-6789",
  avatar: null,
  fullName: "Joshybels A. Vance",
  preferredName: "Joshybels",
  department: "Front Desk Operations & Concierge",
  supervisor: "Helena Brandt (GM)",
  languages: "Tagalog (Native), English (Native)",
  joined: "March 14, 2022 (2+ Years)",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  rfid: "Master Staff RFID #4409",
  permittedFloors: "Floors 1 – 6, Service Level & Roof",
  pmsLevel: "Supervisor (Tier 2)",
  terminal: "Terminal Front-Desk-02",
  emergency: {
    name: "Sarah Vance",
    relation: "Spouse",
    phone: "+63 912-987-6543",
    address: "123 street, Caloocan City, Metro Manila, Philippines",
  },
};
export { initialReservations as reservations } from '../admin/reservation-data';
