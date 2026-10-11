# FoodConnect Remaining Tasks

## Current Demo Status

- [x] React dashboard with Supplier, Receiver, and Admin views.
- [x] Seeded Hyderabad organizations, donations, reservations, and impact summaries.
- [x] Supplier donation create, edit, and cancel interactions.
- [x] Receiver quantity-based reservations with browser-side capacity checks.
- [x] Pickup confirmation, handover confirmation, and discrepancy reporting interactions.
- [x] Organization profile forms and admin review/settings/audit screens.
- [x] Local Express authentication API with bcrypt password hashing.
- [x] Login, registration, logout, current-user endpoint, and local development password reset.

## Priority 1: Persist Core Data

- [ ] Set up MongoDB locally or in MongoDB Atlas.
- [ ] Define Mongoose schemas for users, organizations, donations, reservations, deliveries, and audit events.
- [ ] Add database indexes for organization ownership, status, deadlines, and geospatial coordinates.
- [ ] Move seeded organizations, donations, and reservations from browser state into database seed scripts.
- [ ] Replace the local JSON authentication store with MongoDB.
- [ ] Add a database migration or repeatable seed command for demo data.

## Priority 2: Secure API and Authorization

- [ ] Add role and organization-ownership middleware to every protected endpoint.
- [ ] Remove the browser-only role switcher or limit it to a clearly labelled demo-preview mode.
- [ ] Store the JWT in a secure, HTTP-only cookie or implement a carefully documented token strategy.
- [ ] Use a production-only `SESSION_SECRET` and validate required environment variables at startup.
- [ ] Add rate limiting to login, registration, and password-reset endpoints.
- [ ] Replace the development password reset with expiring, verified reset tokens and email delivery.
- [ ] Add server-side validation for all API request payloads.

## Priority 3: Donation and Reservation APIs

- [ ] Build supplier-only donation create, read, update, and cancel endpoints.
- [ ] Track original quantity, reserved quantity, remaining quantity, and listing lifecycle state separately.
- [ ] Enforce expiry, cancellation, and edit restrictions on the server.
- [ ] Create atomic reservation logic to prevent over-allocation under concurrent requests.
- [ ] Add reservation expiry and cancellation logic that releases eligible stock.
- [ ] Store actual collected and received quantities without changing the original allocation.
- [ ] Persist a status-history record for every donation and delivery transition.
- [ ] Connect current frontend forms and tables to these APIs.

## Priority 4: Organization Verification and Profiles

- [ ] Persist supplier and receiver profile fields in MongoDB.
- [ ] Keep organization verification state separate from user login state.
- [ ] Add an admin verification queue for pending registrations.
- [ ] Add suspension and reinstatement reasons with audit records.
- [ ] Ensure historical donations retain the supplier details from the time of creation.
- [ ] Add receiver requirements with active, fulfilled, inactive, and expired states.

## Priority 5: Eligibility, Search, and Safety

- [ ] Define food-safety and handling policy with the project supervisor.
- [ ] Add hard eligibility rules for verification status, deadlines, capacity, food category, dietary requirements, and handling capability.
- [ ] Add donation filters for distance, category, available quantity, deadline, pickup availability, and dietary compatibility.
- [ ] Store latitude/longitude on organizations and add a geospatial index.
- [ ] Document whether demo distance is straight-line distance or routing distance.
- [ ] Ensure cancelled, expired, suspended, or ineligible listings are never recommended.

## Priority 6: Matching and Allocation

- [ ] Implement deterministic rule-based ranking as the initial baseline.
- [ ] Show an explanation for every recommendation, such as distance, compatible category, deadline, and remaining capacity.
- [ ] Support partial allocation of one donation to multiple receivers.
- [ ] Record recommendation inputs and ranking output for auditability.
- [ ] Decide whether to add an ML service after the baseline has been evaluated.
- [ ] If ML is added, keep it advisory and never allow it to override hard eligibility rules.

## Priority 7: Pickup and Delivery Workflow

- [ ] Finalize the state-transition rules for `available`, `reserved`, `pickup_assigned`, `picked_up`, `delivered`, `cancelled`, `expired`, `failed_delivery`, `partially_delivered`, and `disputed`.
- [ ] Add authorized pickup/handover evidence fields and issue notes.
- [ ] Persist route/manual-assignment status and reasons for reassignment.
- [ ] Implement a manual receiver self-pickup fallback as the initial workflow.
- [ ] Add routing integration only when a suitable provider and API credentials are available.
- [ ] Do not display invented travel times, driver assignments, or GPS status.

## Priority 8: Notifications and Dashboard

- [ ] Persist in-app notifications for verification updates, reservation events, pickup deadlines, status changes, and failures.
- [ ] Add read/unread notification state.
- [ ] Calculate dashboard metrics from confirmed delivery records only.
- [ ] Group confirmed delivered quantity by compatible unit.
- [ ] Add requested-versus-received quantities and delivery completion rate.
- [ ] Document the serving-size assumption used for estimated meals.

## Priority 9: Quality and Delivery

- [ ] Add unit and integration tests for authentication, authorization, listing validation, and reservation atomicity.
- [ ] Add frontend tests for critical forms and role-specific views.
- [ ] Add API health/readiness checks and structured logging.
- [ ] Add a CI workflow to run build and test commands.
- [ ] Add deployment configuration and production environment documentation.
- [ ] Review accessibility: keyboard navigation, focus states, labels, contrast, and error messages.
