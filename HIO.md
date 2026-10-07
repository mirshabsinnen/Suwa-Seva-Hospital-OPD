# HIO module

The Health Information Officer module is a read-only operational analytics layer.
It reads existing Appointment and Queue records. It does not change Patient,
Staff, Doctor, authentication, or queue-management workflows.

## API

All routes require the existing JWT `protect` middleware and a database User role
of exactly `health_information_officer`. No token returns 401; another role returns
403. Successful responses use `{ success: true, data: ... }`.

| GET route | Result |
| --- | --- |
| `/api/hio/dashboard` | Today's summary, 7-day appointment trend, separate appointment/queue status comparison, active arrived priority distribution |
| `/api/hio/queue-stats` | Today's summary and paginated active queue roster |
| `/api/hio/performance` | Today's appointment statuses, completion percentage, queue completions, valid waiting-time metrics |
| `/api/hio/reports` | Months with appointments, latest first |
| `/api/hio/reports/:year/:month` | Derived monthly summary and zero-filled daily appointment trend |

Dashboard, queue, and performance accept an optional `date=YYYY-MM-DD` query.
Queue accepts `page` (default 1) and `limit` (default 25, maximum 100).
The UI requests 20 queue records per page. Invalid dates/months/pagination return
400. Report years are 2000–2100; months are 1–12.

## Counting definitions

- Calendar boundaries and aggregation grouping use Asia/Colombo (UTC+05:30).
  Ranges include their start and exclude the next midnight/month boundary.
- Appointments are counted by **scheduled appointmentDate**, not booking createdAt.
  Total appointments and trends include all statuses, including cancellations.
- Queue records join their associated appointments. Both the appointment date
  range and cancellation status are checked; cancelled appointments/queue entries
  are excluded from queue metrics. Orphaned queue records are excluded.
- Checked in = `arrivalStatus: Arrived`, including completed queue visits within
  the appointment period. Waiting = arrived AND queue status waiting.
- Active = queue status waiting/called/serving. The roster also lists unarrived
  reservations, explicitly labelled Not Arrived, without counting them as checked in.
- Active priority distributions count **arrived active** records. Emergency and
  Priority are separate categories. Monthly/performance case totals count all
  arrived records in that period, including completed ones.
- Estimated wait averages numeric non-negative stored estimates for arrived
  waiting patients. These estimates originate in the existing booking flow and
  are not real-time predictions. No eligible samples returns null, shown as —.
- Observed wait = `(calledTime - arrivalTime) / 60000`, only where both values are
  dates and call time is not earlier than arrival. No samples returns null.
- Appointment completion percentage = completed appointments / all appointments
  in the period, including cancellations. No appointments returns null, not 0%.
- Queue completions are distinct from appointment completions and from doctor
  consultations. Existing Staff logic can complete queue records when calling the
  next patient. No verified consultation duration is inferred from those records.

## Missing sources and scope

There is no Feedback, Consultation, or saved Report model in the current code.
The service's `unavailableSources()` is the integration point for future adapters.
Feedback responds with available false, total 0, null rating/positive percentage,
and no comments. Consultation responds with available false and null metrics.

Reports are live derived summaries, not saved/approved historical snapshots.
Monthly waiting/priority values reflect the records' current stored state; they
cannot reconstruct historical queue state changes. No extra report model or
database write operation was introduced. Report sharing uses React Native's
system share sheet with aggregate text only; no patient identifiers or PDF claims.

Facility filters, ward cameras, compliance targets, language switching, PDF/Excel
exports, and queue broadcasts from the Figma are not implemented without their
supporting data/features. The HIO screens retain the reference's teal/navy palette,
white cards, rounded panels, summary grids, charts and monthly report hierarchy.

The only dependency added is `react-native-svg` 15.15.4, Expo SDK 57's compatible
version. Custom SVG line/bar/donut charts require no additional chart library.
Counts come from API aggregates; no demo analytics are bundled into the UI.

## Running

Connect the authorized physical Android phone by USB. From the project root,
use two terminals:

```powershell
cd backend
node --use-system-ca src/server.js
```

```powershell
cd frontend
npm.cmd run start:usb
```

Open `exp://127.0.0.1:8081` in Expo Go. The existing USB script forwards Metro
8081 and API 5002, setting API_URL to `http://127.0.0.1:5002/api`. See STARTUP.md.
Restart the backend after adding the HIO routes. Reload Expo after installation
of SVG if Metro was already running.

## Verification

From backend:

```powershell
node --test tests/hioDateRange.test.js
node --use-system-ca scripts/check-hio.cjs
```

The integration script uses existing database users and short-lived in-memory
JWTs. It starts an isolated local server, checks the five HIO routes, role/token
denials, date validation, pagination validation, zero-data reports, monthly trend
totals and today's counts against independent queries. It prints neither JWTs
nor credentials and does not modify database records. An existing HIO account
is required. Synthetic fixtures in unit tests are not production analytics data.

From frontend:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npx.cmd expo install --check
npx.cmd expo-doctor
```

Mobile acceptance flow:

1. Sign in using an existing health_information_officer account.
2. Dashboard: check date, summary, seven-day trend, status bars and priority donut.
   Zero data must show empty states rather than invented chart values.
3. Queue: check arrived vs not-arrived labels, priorities and pagination. There
   must be no check-in, call, reorder or priority-edit controls.
4. Performance: compare appointment statuses; confirm feedback and consultation
   unavailable states. Pull to refresh.
5. Reports: select a month, compare total to daily trend, go back, and optionally
   share the aggregate summary. An empty month remains safe via the API.
6. Disconnect the backend briefly to verify retry/error states; restore it and
   pull to refresh. Expired/unauthorized sessions display an appropriate message.

Existing template TypeScript errors involving Expo Router/CSS remain outside
this module. No ESLint configuration/dependency was present during inspection;
no unrelated lint-tool installation or template cleanup is included.

Implementation validation: all five read-only API routes and authorization checks
passed against Atlas; Colombo date tests passed; Android release bundling and
HIO Babel compilation passed; Expo Doctor passed 21/21 checks. Queue was viewed
with live data on the connected phone and Performance passed a phone render check.
Reports phone checks were interrupted by the Android home screen; Reports/Details
are build-validated but still need the manual mobile acceptance steps above.
Temporary initial-route overrides used during testing were restored.
