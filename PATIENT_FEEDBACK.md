# Patient feedback integration

Branch: feature/patient-feedback. No new dependencies or changes to patient navigation.

Patients see the feedback form on completed cards under My Appointments. A rating
from 1 to 5 is required; a comment up to 1000 characters is optional. Submission
requires an owned, completed appointment with a completed Consultation record.
Feedback is submitted once per appointment, enforced by a unique database index.
Existing appointment statuses are not modified by this module.

Authenticated patient endpoints:
- GET /api/feedback/:appointmentId returns the patient's saved feedback or null.
- POST /api/feedback/:appointmentId accepts { rating, comment? } and returns 201.
- Invalid input returns 400, missing/non-owned appointment 404, duplicate 409.
- Other roles return 403; unauthenticated requests return 401.

HIO Performance, Monthly Reports, PDF and text summary use aggregate ratings.
The period is the appointment date in Asia/Colombo, not the submission date.
Feedback stores the visit date on creation so later appointment edits do not move
the feedback into another report. Positive means a rating of 4 or 5. No responses
means total 0 and null rating/percentage. Patient names and free-text comments
are excluded from HIO responses and exports. Comments are visible to their owner.
There is no moderation interface or edit/delete feedback workflow in this change.

Restart the backend before testing. Ensure the PatientFeedback appointmentId
unique index exists in deployments that disable Mongoose automatic indexing.

Validation: node --test tests/patientFeedback.test.js tests/hioDateRange.test.js
from backend. Unit tests mock database operations; live database and physical
phone acceptance must be checked separately. Test a completed consultation's
feedback, duplicate submission, another account, and refresh HIO for the matching
appointment day/month. No production records are created by the unit tests.

Live HTTP acceptance passed on 2026-10-18 using
`node --use-system-ca scripts/check-feedback-flow.cjs` from backend. The script
creates temporary accounts, performs real password login as doctor/patient/HIO,
selects and completes a synthetic consultation, submits/reloads patient feedback,
rejects early/duplicate submissions, and verifies daily/monthly HIO aggregates
increase by one. It removes only its own temporary records in cleanup. This is
API verification, not a phone/browser UI acceptance check.
