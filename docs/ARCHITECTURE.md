# Admin/Staff architecture

## Routes and composition

`App` uses BrowserRouter. `/admin` and `/staff` render the same `AdminPage` shell
with an explicit role. Existing routes select the dashboard, rooms, reservations,
account, and role-specific modules:

| Route prefix | Pages |
| --- | --- |
| `/admin` | dashboard, rooms, reservations, reports, users, reviews, account |
| `/staff` | dashboard, rooms, reservations, support, account |

`AdminPage` composes the existing header, appropriate sidebar and 7px content
container. Dashboard widgets use the same data as management screens. Staff room
management remains read-only. Role props preserve the existing UI permissions;
they do not enforce authentication or database authorization.

## State and actions

`management-seed.js` consolidates existing room, user, review, ticket and profile
fixtures; reservation seeds remain in `admin/reservation-data.js`. The store
initializes a consistent set of room statuses and reservation rates/statuses.
Separate Admin and Staff profile copies prevent edits leaking between roles.

`management-store.js` uses React's `useSyncExternalStore` to publish immutable
snapshots. `useManagement()` reads a snapshot; `useManagementCollection(key)`
reuses the existing set-state style for independent collections. Use the guarded
`managementActions` for rooms, reservations and support messages; these validate
against the latest snapshot and return an error string or an empty string on
success. `useReservationRooms()` derives room options from current inventory.

The store deliberately lives for the browser module lifetime. It survives route
unmounts but resets on page reload, browser restart, and development module reload.
There is no localStorage, IndexedDB, server, or new persistence mechanism.

## Pure domain model

`management-model.js` contains room validation/CRUD, booking validation and allowed
status transitions, atomic room/booking updates, report aggregation, sorting and
chronological support replies. Invalid mutations throw before a new state is
published. Actual arrival/departure dates use Asia/Manila. A reservation's nightly
rate is retained across inventory price changes; reassignment uses the new room's
rate and requires matching payment. Room IDs remain stable across name edits.

Admin statuses are canonical (`Checked-in`, `Checked-out`). Staff adapts those to
its existing labels (`Checked In`, `Checked Out`) and feeds canonical transitions
back to the same actions. There is no duplicate Staff business-rule implementation.

## Reusable UI and preservation

- `admin/components/Pagination.jsx`: shared left/right chevrons.
- `admin/components/SortHeader.jsx` + `state/useTableSort.js`: accessible sortable
  existing table headings and non-mutating ordering.
- `admin/ManagementUI.jsx`: existing dialogs, search field, badges and wrappers.
- `admin/components/components.jsx`: reactive dashboard reservations and status pie.
- Existing RoomForm, BookingDialog, AccountModal and profile modals are reused.
- Existing CSS is unchanged, including room badges/alignment, responsive rules,
  seven-review sizing and independent support scrolling.

Existing Supabase and Customer code is independent and untouched. Do not route
Admin/Staff mock mutations through those services as part of this implementation.

## Validation

`npm test` runs Node's built-in test runner without subprocess isolation. Tests
cover lifecycle/duplicates, payment/date/capacity/overlap checks, room protection,
rate snapshots, reports, sorting and chronological support replies.

`tests/management-browser.mjs` is an optional Playwright regression suite. It uses
an externally installed Playwright package, so the project gains no dependency.
It fixes the browser date to the seeded reservation dates, retains one SPA session
through route changes, and checks Admin/Staff workflows and runtime exceptions.
