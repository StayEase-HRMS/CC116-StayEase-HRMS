# Agent handoff

## Current status

Work is on `back-end-dev`; do not merge `front-end-dev`. Admin and Staff now share
in-memory room, reservation, user, review, support and profile records. Existing
CRUD/modals are retained; dashboard and report values follow those records.
Staff confirmation/check-in/out, room turnover and receipt preview use guarded
shared actions. Sorting and filters precede pagination (nine rooms, seven rows).

Read `PROJECT_CONTEXT.md`, `FUNCTIONALITY_OVERVIEW.md`, and `ARCHITECTURE.md` in
this directory before changing functionality. The root context document is old.

## Important files

- `src/state/management-model.js`: validation, transitions, reports, sorting.
- `src/state/management-store.js`: reactive memory and guarded action wrappers.
- `src/state/management-seed.js`, `src/admin/reservation-data.js`: initial records.
- `src/admin/Admin.jsx`, `src/admin/components/components.jsx`: dashboards.
- `src/admin/{RoomManagement,ReservationManagement,UserManagement,ReviewsManagement,Reports}.jsx`.
- `src/staff/{StaffReservations,CustomerSupport}.jsx`.
- `src/admin/{AccountManagement,AccountModal,EditProfileModal,ChangePasswordModal}.jsx`.
- `src/admin/ManagementUI.jsx`, `src/admin/components/{Pagination,SortHeader}.jsx`:
  reusable UI. Preserve their styles and existing CSS.
- `tests/management-model.test.mjs`, `tests/management-browser.mjs`: regressions.

## Commands and results

```powershell
npm install
npm run dev
npm test
npm run build
npm run lint
```

Domain suite: 14 tests pass. Production build passes with the existing large-bundle
warning. Lint passes for modified files. Full-project lint has 35 pre-existing
errors in unrelated App/LandingPage, legacy dashboard component, Customer/shared
components, API and login files; these were present before implementation.
Do not hide these with broad disables or change the database code to fix lint.

Optional browser suite (requires Playwright externally installed and Edge):

```powershell
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
# In another terminal; omit PLAYWRIGHT_MODULE if playwright resolves normally:
$env:PLAYWRIGHT_MODULE = 'absolute path to an installed playwright package'
node tests/management-browser.mjs
```

Browser workflows pass: reservation lifecycle/receipt, room CRUD/undo/pagination,
Staff permissions, users/roles/status, reviews, reports, support/history, separate
profiles, password-unavailable feedback, responsive route rendering, 7px padding.
Browser print output itself is not manually verified; the existing print action
and stylesheet remain.

## Known limits and recommended next work

- State resets on reload and does not sync between tabs or with the Customer API.
- Account Management password changes explicitly remain unavailable. Do not claim
  success without a real credential update. Existing login recovery is separate.
- There was no Admin/Staff create-reservation or report-export control; no new UI
  was invented. Discuss such UI additions separately if needed.
- Reports have no creation timestamps or inventory/housekeeping event history;
  definitions and historical estimates are documented in FUNCTIONALITY_OVERVIEW.
- No real payment/refund processing, user provisioning or customer-message delivery.
- Access props and routes are demo UI permissions, not a security boundary.
- Seeded stays use October 2026. Outside those dates, use Admin edit to schedule a
  pending/confirmed stay for today before testing check-in. Do not weaken checks.
- If database integration is later authorized, map these actions to real services
  and preserve failure feedback/transaction consistency. It is outside this task.
