# Admin and Staff functionality

## Admin workflows

- Dashboard: room counts, available/occupied inventory, distinct pending room
  assignments, today's recorded departures, category totals, current room-status
  pie/legend, and reservations scheduled across today's date. View all navigates
  to reservations. Empty inventory and a single-status pie are handled.
- Rooms: add/edit/view, image selection and removal, operational status/note,
  remove/undo, name uniqueness, price validation, search/category/status filters.
  Maximum nine cards per page. Reserved-history rooms cannot be deleted;
  checked-in guests must be checked out before clearing occupancy.
- Reservations: view/edit/cancel, confirm, check in and check out. Room options
  use current inventory; existing bookings retain their agreed nightly rate.
  Search, status/date/room filters, clickable column sorting, seven-row pagination.
- Reports: date range, Last 7 Days, This Month, collapsible chart, derived bookings,
  guests, pending counts, occupancy and availability. Invalid or >366-day ranges
  show errors. There was no report export action or report table in the supplied
  UI, so neither a new export control nor table was introduced.
- Users: add Staff, view/edit profiles, change the existing System Role selection,
  suspend/reactivate, reject duplicate email/employee IDs. Role selection updates
  the account's Guest/Staff category. Search, role/status filters, column sorting,
  seven-row pagination. These accounts do not create real authentication users.
- Reviews: keep/remove with confirmation; search, rating filter, date/rating/name
  sorting, reversible sort direction; maximum seven reviews per page. Existing
  fixed minimum row sizing is preserved for short filtered lists.

## Staff workflows

- Dashboard uses the same inventory/reservations as Admin.
- Rooms retain the supplied view-only Staff permission, filters and pagination.
- Reservation confirmation: Pending → Confirmed; pending reservations may also
  be declined. Duplicate confirmation and invalid jumps are rejected.
- Check-in: Confirmed → Checked-in, only during the scheduled stay, with settled
  payment and an Available room. The room atomically becomes Occupied.
- Checkout: Checked-in → Checked-out with settled payment. The room becomes
  Needs Cleaning; actual departure date is recorded and the existing receipt
  interface opens. Receipt uses the reservation's dates, guests, agreed rate,
  paid amount and calculated balance. Print invokes the browser print interface.
- Support: select a ticket, send a nonblank reply (up to 2000 characters), resolve
  or reopen. Resolved tickets cannot accept replies. Messages are chronologically
  ordered, retain history across selections/routes, and have no message pagination.
  The independently scrollable panel follows new messages near the bottom and
  outgoing replies; a reader scrolled back is not pulled away by other updates.
- Profiles: Admin and Staff edits use separate records; Staff cannot edit the
  existing restricted access fields. Both retain edits across route navigation.

## Shared state and business rules

`management-store.js` owns memory for rooms, reservations, users, reviews, support
tickets and role profiles. Related updates publish one consistent snapshot.
Room states represent operational readiness; a future confirmed reservation does
not immediately occupy its assigned room. Overlapping active reservations for
the same room are rejected; adjacent check-out/check-in dates are allowed.
Pending/Confirmed bookings can be cancelled; checked-in stays must be checked out.
Completed/cancelled/declined reservations cannot be edited or reopened.

Initial inconsistent fixtures were reconciled to the Admin reservation records:
204 is occupied, 101 needs cleaning, 305 is confirmed for its future stay, 210 is
pending and available. The separate Staff fixture from 2024 is no longer used.

## Reporting definitions and limits

Bookings/guests count non-cancelled, non-declined reservations by scheduled arrival
date (there is no creation timestamp in the existing fixture). Occupancy uses
checked-in/checked-out stays, actual arrival/departure when recorded, and scheduled
dates otherwise. Availability for today uses current room readiness. Other dates
estimate inventory less recorded occupancy and currently maintained rooms;
there is no historical housekeeping/inventory event log. Comparisons use the
preceding period of the same length and the current inventory denominator.

No new reservation-creation form was added: the existing Admin/Staff UI only
offers management of existing reservations. Customer booking remains a separate
existing flow. Password changes cannot be implemented truthfully without a
credential service: the form validates inputs and explicitly reports no change.
Nothing in this demo processes payments, refunds, real staff accounts, or messages
to an external customer.
