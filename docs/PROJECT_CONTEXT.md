# StayEase project context

StayEase is a hotel reservation and management school project with Customer,
Admin, and Staff portals. Current implementation work on `back-end-dev` makes
Admin and Staff operational using shared application memory. It adds no database
integration, dependencies, schemas, migrations, or persistent storage.

## Stack and structure

- React 19, React Router 7, Vite 8, Tailwind 4, Lucide, ESLint 10.
- `src/App.jsx`: existing route definitions.
- `src/admin/Admin.jsx`: Admin/Staff shell and shared dashboard.
- `src/admin/`: rooms, reservations, users, reviews, reports, account modals.
- `src/admin/components/`: dashboard widgets, pagination, sortable table heading.
- `src/staff/`: reservation operations, receipt preview, support conversations.
- `src/state/management-seed.js`: existing mock records consolidated in one place.
- `src/state/management-store.js`: shared reactive state and action wrappers.
- `src/state/management-model.js`: pure validation, transitions and calculations.
- `tests/`: domain tests and optional browser workflow suite.
- `src/customer/`, `src/api/`, `src/login/`: existing Customer and Supabase code;
  these integrations are outside this implementation's scope.

## Assessment and current status

| Module | Before this implementation | Current behavior |
| --- | --- | --- |
| Dashboards | UI-only statistics and unrelated fixed table/chart records | Derived from shared rooms and reservations; View all opens the role's reservations |
| Room management | Working forms and filters; screen-local records | Shared CRUD/status changes, validation, protected occupied/history records, delete undo |
| Admin reservations | Working local edit/view/cancel; partial operational checks | Shared edits, cancellation, confirmation and guarded check-in/out; dynamic room options |
| Staff reservations | Local transitions on a separate, inconsistent fixture | Same Admin records; guarded confirmation/check-in/out, room turnover and receipt |
| Reports | Filters worked, but metrics came from synthetic day patterns | Chart/statistics derive from shared reservations and inventory |
| Users | Working forms/status changes, lost on navigation | Shared records, role editing, column sorting, existing filters and pagination |
| Reviews | Working local moderation and seven-row pagination | Shared moderation, search/rating filters and date/rating/name sorting |
| Staff support | Working screen-local conversations | Shared chronological history across routes; existing continuous message panel retained |
| Account profiles | Working local forms | Separate Admin/Staff profile records survive route changes |
| Account password | UI-only success without a password change | Explicit unavailable feedback; no false success |

The shell, CSS, 7px content padding, sidebar/navbar, room-card layout, account
position, chevron pagination, nine-room and seven-table/review page limits remain.
Sorting reuses existing table headings; review sorting adds compact filter controls.

The older root `PROJECT_CONTEXT.md` describes an earlier prototype. Use this
document and the other files in `docs/` for the current Admin/Staff implementation.

## Limits

State resets on reload and is independent between tabs. Existing Customer API
state is not connected to the Admin/Staff mock store. Routes are not a security
boundary. Real authentication, payments, refunds, password changes, customer
message delivery, and cross-device synchronization require separate work.
