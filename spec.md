# FoodConnect — Full Software Requirements and Technical Specification

**Document type:** Software Requirements Specification (SRS) + Technical Design + Coding-LLM Implementation Brief  
**Project:** FoodConnect  
**Primary SDG:** SDG 2 — Zero Hunger  
**Secondary SDG:** SDG 12 — Responsible Consumption and Production  
**Implementation approach:** Flexible timeline, phased delivery  
**Matching approach:** Hybrid hard-rule eligibility + machine-learning ranking  
**Delivery approach:** Automated route optimization, with safe manual fallback  
**Primary account types:** Supplier/Donor and Receiver; Administrator is a privileged platform role

---

## 1. Project Overview

### 1.1 Summary

FoodConnect is a web platform that coordinates surplus-food donations from restaurants, hotels, offices, college hostels, caterers, supermarkets, and event organizers with verified receivers such as NGOs, shelters, orphanages, food banks, and community kitchens.

Suppliers post surplus food with quantity, food category, preparation time, storage conditions, collection deadline, location, and handling information. Receivers register demand, food preferences, storage capability, capacity, operating hours, and location. FoodConnect filters out infeasible matches, ranks eligible supplier–receiver pairs using a machine-learning model, supports allocation across multiple receivers, and plans feasible pickup/drop-off routes. Deliveries are tracked through confirmation and actual quantities received.

The platform must prioritize safe and timely redistribution. Machine learning assists ranking; it does not determine food safety, override eligibility rules, or guarantee successful delivery.

### 1.2 Problem Statement

Edible surplus food may be discarded because suppliers lack a reliable way to identify recipients and coordinate timely collection. Meanwhile, community organizations may not know where suitable surplus food is available. FoodConnect addresses the coordination gap by combining donation listings, receiver requirements, eligibility checks, ML-assisted matching, quantity allocation, route planning, delivery confirmation, and impact reporting.

### 1.3 Objectives

1. Reduce avoidable edible-food waste.
2. Improve access to surplus food for organizations serving people experiencing food insecurity.
3. Match available donations with current receiver demand.
4. Account for distance, deadlines, quantity, capacity, dietary compatibility, and handling constraints.
5. Coordinate pickup and delivery, including compatible multi-stop routes.
6. Record actual delivery outcomes and report transparent impact metrics.
7. Provide an ML component that can be evaluated against a simpler baseline.

### 1.4 Scope

**MVP must include:**
- Authentication, organization profiles, and verification workflow.
- Two primary account types: Supplier/Donor and Receiver.
- Admin capabilities for verification, disputes, and operational overrides.
- Donation creation, browsing, filtering, and lifecycle management.
- Receiver requirements and demand management.
- Hard eligibility filters and baseline matching.
- ML service that ranks eligible matches, with a rule-based fallback.
- Safe quantity reservations and partial allocation.
- Automated route optimization for feasible pickup/drop-off tasks, subject to available routing data.
- Delivery status tracking and confirmation.
- Basic impact dashboard.
- Security controls, tests, seed data, and setup documentation.

---

## 2. Roles and Permissions

### 2.1 Supplier / Donor

Examples: restaurants, hotels, offices, college hostels, caterers, supermarkets, event organizers.

Can:
- Register an organization and submit verification information.
- Manage permitted organization profile fields.
- Create, edit, and cancel unreserved donation listings.
- Enter food type, quantity, units, preparation time, storage conditions, allergens, location, deadline, and handling notes.
- View eligible and ranked receiver recommendations.
- Review allocation requests and current reservations.
- View pickup/drop-off route plans and assignment status.
- Confirm handover/pickup where applicable.
- View delivery history and supplier-level impact metrics.

Cannot:
- Edit another supplier's listings.
- Alter confirmed delivery records without an auditable correction workflow.
- Override hard eligibility or food-safety rules.

### 2.2 Receiver

Examples: verified NGOs, shelters, orphanages, food banks, and community kitchens.

Can:
- Register and submit verification information.
- Manage location, receiving hours, capacity, storage capability, food preferences, dietary restrictions, and demand.
- Browse and filter available eligible donations.
- Receive recommendations for suitable donations.
- Accept an offer or request a quantity within available supply and receiver capacity.
- View reservations and delivery status.
- Confirm received quantity and report discrepancies.
- View receiver-level delivery history and metrics.

Cannot:
- Change another organization's requirements or deliveries.
- Reserve more quantity than is available or that the receiver can handle.
- Confirm delivery on behalf of another organization without authorized evidence/permissions.

### 2.3 Administrator

Can:
- Review, approve, reject, or suspend organizations.
- Review reports, disputes, failed deliveries, and suspicious listings.
- Manage food categories, safety policy configuration, and platform settings.
- View aggregate platform metrics and audit records.
- Override or reassign a route/delivery with a reason and audit entry.
- Trigger a safe manual fallback when route optimization or ML is unavailable.

### 2.4 Authorization rules

- Every protected endpoint must verify authentication, role, and organization ownership on the server.
- A user-supplied role or organization ID must never be trusted without server-side checks.
- Only verified, active organizations may participate in live donation coordination.
- Administrative actions must be logged.
- Unverified organizations may access onboarding and verification status, but not unrestricted live coordination.
- Contact details and precise organization information must only be exposed when needed for an authorized workflow.

---

## 3. Functional Requirements

### FR-01: Authentication and onboarding

- Register, log in, log out, retrieve current-user profile, and reset password.
- Registration collects contact details, organization name/type, address, location, and requested account type.
- Passwords must be stored only as secure hashes.

### FR-02: Organization profiles

Supplier profile fields:
- Organization name and type.
- Address and coordinates.
- Contact person and contact details.
- Verification status.

Receiver profile fields additionally include:
- Accepted food categories.
- Typical demand and maximum receiving capacity.
- Estimated number of people served, if provided.

Historical donation records must not be rewritten when a profile changes.

### FR-03: Donation listing

A supplier can create a listing containing:
- Food category and description.
- Quantity and explicit unit.
- Preparation time. (what time the food was made)
- Collection deadline.
- Storage conditions.
- Known allergens and dietary information.
- Pickup location.
- Listing status.

Rules:
- Quantity must be greater than zero.
- Units must be explicit and consistent.
- A listing cannot be recommended after expiry, cancellation, or withdrawal.
- A listing may be edited only while permitted by its lifecycle state.
- Original quantity and remaining available quantity must be tracked separately.
- Partial allocation is supported when feasible.
- The system must not declare food safe merely because it has been listed.
- Missing or inconsistent safety information must trigger review or make the listing ineligible, according to configured policy.

### FR-04: Receiver requirements

Receivers can:
- Specify food categories, demand, units, capacity, dietary restrictions, storage capability, operating hours, and receiving windows.
- Create, update, close, and review requirements.
- Mark a requirement fulfilled or inactive.
- Set a review/expiry date so stale demand is not treated as current.

### FR-05: Discovery and search

Users can filter by:
- Distance.
- Food category.
- Available quantity.
- Collection deadline.
- Delivery/pickup availability.
- Dietary and handling compatibility.

Provide a list view even if a map is available. Geospatial search must use a proper geospatial index or a documented alternative.

### FR-06: Hybrid ML matching (SKIP)(do NOT work on this now)
(for future use not now) -> for 

Current requirement:
Create some static data and we'll assign by distance.

The system in the future will:
1. Retrieve current donations and receiver requirements.
2. Apply hard eligibility constraints first.
3. Generate features for each eligible supplier–receiver candidate.
4. Use an ML model to estimate match success probability.
5. Rank eligible candidates.
6. Explain the main recommendation factors.
7. Support multi-receiver quantity allocation.
8. Persist the model version and prediction metadata needed for evaluation.
9. Fall back to rule-based ranking if the ML service is unavailable.


### FR-07: Reservations and allocation

- Receivers can accept a proposed allocation or request a quantity.
- The server verifies current availability at reservation time.
- Reservation must be atomic to prevent over-allocation.
- A donation can be allocated across multiple receivers.
- A reservation has a configurable expiry time.
- Cancellation releases eligible reserved quantity.
- All quantity changes must be auditable.
- Confirmed deliveries must preserve the original allocation and actual received quantity.

### FR-08: Automated route optimization (SKIP)
(for future use not now)
The system should plan routes for compatible pickup and delivery tasks using available location and routing data.

Required behavior:
- Consider pickup and delivery locations, deadlines, vehicle/partner capacity when known, and handling constraints.
- Group compatible stops where this reduces unnecessary travel and still meets deadlines.
- Respect pickup-before-delivery precedence.
- Respect quantity/vehicle capacity and any configured food-handling constraints.
- Return ordered stops, estimated distances/durations if supported by the routing provider, and infeasible-task explanations.
- Do not invent travel-time estimates when a routing provider has not returned them.
- Recompute or request review when a stop is cancelled, a deadline changes, or a route becomes infeasible.
- Provide a manual assignment/route fallback.
- A generated route is a recommendation until a delivery partner/authorized user confirms it.
- Do not claim a vehicle or driver is assigned unless the assignment is confirmed.

For the MVP, use a deterministic heuristic (e.g. nearest feasible next stop with deadline and capacity checks) and a routing API for travel-time/distance estimates if available. Keep the route-planning interface modular so an optimization solver can be added later. Advanced vehicle-routing optimization is a later enhancement if time permits.

### FR-09: Delivery lifecycle

Suggested primary lifecycle:
`available → reserved → pickup_assigned → picked_up → delivered`

Exception/terminal states:
`cancelled`, `expired`, `failed_delivery`, `partially_delivered`, `disputed`.

Each delivery records:
- Donation and allocation IDs.
- Supplier and receiver.
- Assigned partner/vehicle details when applicable.
- Planned and actual pickup/delivery timestamps.
- Quantity collected and quantity received.
- Status history.
- Handover confirmation and issue notes.

### FR-10: Notifications (SKIP)

In-app notifications should cover:
- Matching donation available.
- Allocation accepted/rejected.
- Pickup assignment.
- Upcoming deadline.
- Status change.
- Cancellation or failure.
- Organization verification update.

Email/SMS can be added later. Notification failures must not corrupt the donation or delivery workflow.

### FR-11: Impact dashboard

Display:
- Total quantity confirmed as delivered, grouped by unit.
- Completed deliveries/donations.
- Active verified suppliers and receivers.
- Delivery completion rate.
- Average listing-to-pickup time.
- Requested versus received quantities.
- Estimated meals supported using a documented serving-size assumption.

Only confirmed delivery quantities contribute to delivered totals. Do not combine incompatible units. Clearly label estimated meals and do not claim that the estimate equals a verified count of people fed.

### FR-12: Admin and audit

- Verification queue.
- Account suspension and reinstatement.
- Donation and delivery issue review.
- Route reassignment with a reason.
- Aggregate analytics.
- Audit trail for important changes.
- Historical completed donation records must be retained according to the configured retention policy.

---

## 4. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | Secure password hashing, authorization, validation, rate limiting, protected secrets |
| Reliability | No duplicate/over-allocated reservations; consistent state transitions |
| Performance | Target common API response time under 2 seconds for expected demo load, excluding external service latency |
| Usability | Responsive interface for desktop and mobile |
| Maintainability | Modular frontend, backend, ML service, and route planner |
| Scalability | Pagination, indexed query fields, bounded result sizes |
| Availability | Rule-based match fallback; manual route fallback |
| Privacy | Collect only necessary data and restrict access |
| Auditability | Record critical reservation, allocation, routing, and delivery events |
| Accessibility | Accessible labels, keyboard navigation, readable contrast, useful error messages |
| Observability | Structured logs, health endpoints, clear error handling; never log secrets |

Performance values are initial targets and must be measured rather than claimed without testing.

---

## 5. System Architecture and Technology

### 5.1 Recommended stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Web UI |
| Styling | Tailwind CSS or equivalent | Responsive UI |
| Main backend | Node.js + Express | REST API and business rules |
| Database | MongoDB + Mongoose | Persistent records |
| Authentication | Secure cookie-based session or well-configured token approach | Authentication |
| ML | Python + scikit-learn | Match-success prediction |
| ML API | FastAPI | Model inference |
| Maps | Leaflet + OpenStreetMap | Map display |
| Routing | A configurable routing provider such as OSRM or another suitable service | Route estimates |
| Charts | Recharts | Analytics |
| Validation | Zod or equivalent; Pydantic in Python | Request/data validation |
| Tests | Vitest, Supertest, pytest | Unit and integration testing |
| Version control | Git | Source control |

Use mutually compatible supported versions and commit dependency lockfiles. Document the selected geocoding/routing provider, limits, and terms. Do not depend on a public demo endpoint for production use.

### 5.2 Architecture

```text
React Frontend
  ├── Supplier Portal
  ├── Receiver Portal
  └── Admin Portal
          |
          v
Node.js + Express API
  ├── Authentication and Authorization
  ├── Organizations and Verification
  ├── Donations and Requirements
  ├── Reservations and Allocations
  ├── Matching Orchestrator
  ├── Route Planning Orchestrator
  ├── Deliveries and Notifications
  └── Analytics and Audit
       |          |             |
       v          v             v
   MongoDB     Python ML API   Routing Provider
               (FastAPI)       (distance/time)
```

### 5.3 Repository structure

```text
FoodConnect/
  client/
    src/
      components/
      pages/
      layouts/
      hooks/
      services/
      types/
    package.json
  server/
    src/
      config/
      middleware/
      models/
      routes/
      controllers/
      services/
      validators/
      utils/
      app.js
      server.js
    tests/
    package.json
  ml-service/
    app/
      main.py
      schemas.py
      features.py
      preprocessing.py
      predictor.py
      fallback.py
    training/
      generate_data.py
      train.py
      evaluate.py
    models/
    tests/
    requirements.txt
  route-planner/
    README.md
  docs/
    architecture.md
    api-specification.md
    ml-specification.md
  .env.example
  .gitignore
  README.md
```

The route planner may live in the Node.js backend initially. Do not create a separate microservice unless it meaningfully simplifies implementation.

---

## 6. Database Schemas

Use MongoDB collections with schema validation. Field names and enum values must be consistent across the frontend, backend, tests, and ML service.

### 6.1 Users

```json
{
  "_id": "user_id",
  "name": "Contact Person",
  "email": "contact@example.org",
  "passwordHash": "hashed_password",
  "role": "supplier",
  "organizationId": "organization_id",
  "accountStatus": "active",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

Rules:
- Email is unique and normalized.
- Store only password hashes.
- Roles are validated server-side.
- Account status and organization verification status are separate.

### 6.2 Organizations

```json
{
  "_id": "organization_id",
  "name": "Example Organization",
  "type": "restaurant",
  "address": "Example address",
  "location": {
    "type": "Point",
    "coordinates": [78.4867, 17.3850]
  },
  "contactPhone": "contact_number",
  "operatingHours": [],
  "verificationStatus": "pending",
  "foodPreferences": [],
  "receivingCapacityPortions": 100,
  "storageCapabilities": [],
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

The coordinates are illustrative only. GeoJSON coordinate order is `[longitude, latitude]`. Create a geospatial index for location queries.

### 6.3 Donations

```json
{
  "_id": "donation_id",
  "supplierOrganizationId": "organization_id",
  "foodCategory": "prepared_meals",
  "description": "Freshly prepared vegetarian meals",
  "quantity": {
    "value": 120,
    "unit": "portions"
  },
  "availableQuantity": {
    "value": 120,
    "unit": "portions"
  },
  "preparationTime": "ISO_DATE",
  "pickupDeadline": "ISO_DATE",
  "storageConditions": "refrigerated",
  "allergens": [],
  "dietaryTags": ["vegetarian"],
  "location": {
    "type": "Point",
    "coordinates": [78.4867, 17.3850]
  },
  "handlingNotes": "",
  "status": "available",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

Track original quantity separately from remaining quantity. Quantity units must be explicit. Portion count must not be treated as interchangeable with kilograms or liters.

### 6.4 Receiver Requirements

```json
{
  "_id": "requirement_id",
  "receiverOrganizationId": "organization_id",
  "foodCategories": ["prepared_meals", "produce"],
  "requiredQuantity": {
    "value": 80,
    "unit": "portions"
  },
  "maxCapacity": {
    "value": 100,
    "unit": "portions"
  },
  "dietaryRequirements": ["vegetarian"],
  "storageCapabilities": ["refrigerated"],
  "receivingWindow": {
    "start": "ISO_DATE",
    "end": "ISO_DATE"
  },
  "status": "active",
  "createdAt": "ISO_DATE",
  "expiresAt": "ISO_DATE"
}
```

### 6.5 Allocations / Reservations

A donation may be divided among multiple receivers, so each allocation must be stored separately.

```json
{
  "_id": "allocation_id",
  "donationId": "donation_id",
  "receiverOrganizationId": "organization_id",
  "quantity": {
    "value": 40,
    "unit": "portions"
  },
  "status": "reserved",
  "reservedAt": "ISO_DATE",
  "expiresAt": "ISO_DATE",
  "acceptedAt": null,
  "cancelledAt": null
}
```

Use atomic database operations or transactions so concurrent requests cannot reserve more than the remaining quantity. Reservation expiry and cancellation must release quantity exactly once.

### 6.6 Deliveries

```json
{
  "_id": "delivery_id",
  "allocationId": "allocation_id",
  "supplierOrganizationId": "organization_id",
  "receiverOrganizationId": "organization_id",
  "assignedPartner": null,
  "plannedPickupTime": "ISO_DATE",
  "plannedDeliveryTime": "ISO_DATE",
  "actualPickupTime": null,
  "actualDeliveryTime": null,
  "quantityCollected": null,
  "quantityReceived": null,
  "status": "pending_assignment",
  "routePlanId": null,
  "proofOfDelivery": null,
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

### 6.7 Route Plans

```json
{
  "_id": "route_plan_id",
  "status": "proposed",
  "assignedPartnerId": null,
  "vehicleCapacity": null,
  "stops": [
    {
      "sequence": 1,
      "type": "pickup",
      "donationId": "donation_id",
      "deliveryId": "delivery_id",
      "location": {
        "type": "Point",
        "coordinates": [78.4867, 17.3850]
      },
      "plannedArrival": "ISO_DATE",
      "status": "pending"
    }
  ],
  "estimatedDistanceKm": null,
  "estimatedDurationMinutes": null,
  "routingProvider": null,
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

Route estimates must only be populated from actual calculations returned by the configured routing engine. If unavailable, return `null` and explain that estimates could not be calculated.

### 6.8 Match Predictions

```json
{
  "_id": "match_prediction_id",
  "donationId": "donation_id",
  "receiverOrganizationId": "organization_id",
  "modelVersion": "1.0",
  "featuresSnapshot": {},
  "successProbability": 0.0,
  "rank": 1,
  "createdAt": "ISO_DATE"
}
```

Predictions must not be stored as delivery outcomes. Use a separate outcome/event record to capture whether a recommendation was accepted and what happened later.

### 6.9 Delivery Events and Audit Records

Store:
- Related donation/allocation/delivery/route ID.
- Previous and new state.
- Actor ID and role.
- Timestamp.
- Reason or notes where relevant.

Avoid recording passwords, tokens, or unnecessary sensitive information in audit logs.

### 6.10 Suggested indexes

- Unique normalized user email.
- `2dsphere` index on organization and donation locations.
- Donation status + pickup deadline.
- Donation supplier organization + creation date.
- Receiver requirement status + expiry date.
- Allocation donation ID + status.
- Delivery status + planned pickup time.
- Route plan status + creation time.

Index choices should be checked against actual queries.

---

## 7. Hybrid ML Matching Specification

### 7.1 Objective

Estimate the probability that an eligible receiver–donation match results in successful, timely delivery. Rank eligible candidates using the predicted probability and transparent operational criteria.

The system must not use ML to determine food safety or bypass hard constraints.

### 7.2 Eligibility filters

Before inference, exclude candidates that fail configured hard constraints:
- Organization is not verified or active.
- Donation is cancelled, withdrawn, expired, or unavailable.
- Food category or dietary constraints are incompatible.
- Receiver lacks required storage/handling capability.
- Receiver has insufficient capacity or no current demand, where these are mandatory.
- Receiver is not available within the relevant window.
- Pickup/delivery cannot reasonably occur before the permitted deadline.
- Required safety/handling information is missing or invalid according to configured policy.

Return an explanation code for each excluded candidate where appropriate, without leaking private information.

### 7.3 Features

Candidate-pair features may include:

| Feature | Type |
|---|---|
| Distance in km | Numeric |
| Estimated travel time | Numeric, nullable if unavailable |
| Donation quantity | Numeric |
| Receiver demand | Numeric |
| Quantity fit ratio | Numeric |
| Minutes until deadline | Numeric |
| Food category compatibility | Categorical/binary |
| Dietary compatibility | Binary |
| Storage compatibility | Binary |
| Receiver capacity sufficient | Binary |
| Receiver availability | Binary |
| Historical acceptance rate | Numeric, if sufficient history |
| Historical timely-delivery rate | Numeric, if sufficient history |
| Recent cancellation rate | Numeric, if sufficient history |

Historical features must use only data available before the prediction timestamp. Handle missing values explicitly. Do not encode unknown history as perfect performance.

### 7.4 Target label

Define a successful match for training as an eligible candidate that was accepted and whose allocated quantity was delivered and confirmed within the permitted deadline. Maintain separate operational reason codes where possible, such as recipient rejection, supplier cancellation, route failure, or deadline failure. Avoid treating a safety exclusion as an ordinary failed match.

### 7.5 Model

Primary candidate: `RandomForestClassifier` from scikit-learn.

Compare it with:
- A transparent rule-based ranking baseline.
- Logistic Regression or another simple tabular baseline.

Choose the ML model only if held-out evaluation provides useful evidence that it improves the relevant ranking/prediction task.

### 7.6 Data strategy

- Initially use clearly labelled synthetic data to exercise the end-to-end pipeline.
- Generate realistic relationships between features and labels; do not assign random labels unrelated to features.
- Fix random seeds for reproducibility.
- Split training and test data before evaluation.
- Avoid leakage from acceptance, pickup, delivery, or other future events into input features.
- If data volume permits, use a validation set or cross-validation.
- Record dataset version, preprocessing version, model version, and evaluation metrics.
- Retrain and reevaluate with real outcomes when sufficient authorized data exists.

Synthetic-data results prove only that the pipeline runs; they do not prove real-world effectiveness.

### 7.7 Evaluation

Report:
- Precision, recall, F1, and ROC-AUC where suitable.
- Calibration or Brier score if probabilities are displayed as probabilities.
- Top-k ranking quality where enough labelled candidate groups exist.
- Comparison with the rule-based baseline.
- Confusion matrix and limitations.
- Data provenance and whether the evaluation used synthetic or real data.

Do not claim that a model is “91% accurate” unless that value was actually measured on a properly held-out dataset and the metric is clearly identified.

### 7.8 Ranking and allocation

- ML outputs a score for eligible pairs.
- Ranking may combine model score with transparent operational criteria, but document the method.
- Show the main reasons for a recommendation (e.g. close distance, quantity fit, available receiving window).
- Use a deterministic greedy allocator initially: allocate no more than remaining supply, unmet demand, and feasible capacity.
- Do not over-allocate or recommend infeasible routes.
- Require receiver acceptance before treating an allocation as confirmed.
- Advanced global allocation optimization may be added later.

### 7.9 ML service endpoints

`GET /health` — health check.  
`GET /model-info` — model version, feature schema version, and training-data provenance.  
`POST /predict-matches` — score a donation against candidate receivers.

Example request:

```json
{
  "donation": {
    "id": "donation_123",
    "foodCategory": "prepared_meals",
    "quantity": 120,
    "unit": "portions",
    "minutesUntilDeadline": 75
  },
  "candidates": [
    {
      "receiverId": "receiver_A",
      "distanceKm": 2,
      "estimatedTravelMinutes": 15,
      "demand": 40,
      "capacity": 50,
      "compatible": true
    },
    {
      "receiverId": "receiver_B",
      "distanceKm": 4,
      "estimatedTravelMinutes": 25,
      "demand": 80,
      "capacity": 100,
      "compatible": true
    }
  ]
}
```

Example response structure (values are illustrative, not hardcoded predictions):

```json
{
  "modelVersion": "1.0",
  "matches": [
    {
      "receiverId": "receiver_A",
      "successProbability": 0.0,
      "rank": 1,
      "reasonCodes": ["NEARBY", "QUANTITY_FIT"]
    }
  ]
}
```

The real service must return actual model inference results. Validate request schema and feature versions. The backend must apply hard eligibility rules before calling the ML service and use the baseline matcher on timeout or service failure.

---

## 8. Automated Route Optimization Specification

### 8.1 Objective

Create feasible route plans that connect donation pickup locations and receiver drop-off locations while reducing avoidable travel and respecting time, capacity, and handling constraints.

### 8.2 Inputs

- Confirmed or eligible allocations requiring delivery.
- Pickup and drop-off coordinates.
- Pickup deadlines and receiver receiving windows.
- Estimated travel distance/duration from the configured routing provider, if available.
- Vehicle/partner capacity when known.
- Food quantity, units, and relevant handling constraints.
- Stop precedence: pickup must occur before the corresponding drop-off.
- Partner availability and route start location, if known.

### 8.3 MVP algorithm

Implement a deterministic heuristic:
1. Build candidate pickup/drop-off tasks for confirmed or explicitly routable allocations.
2. Fetch or calculate a travel-time/distance matrix where supported.
3. Start from the assigned partner/vehicle location, if known.
4. Select the next feasible stop using travel cost and deadline urgency.
5. Enforce pickup-before-drop-off, vehicle capacity, receiving windows, and relevant handling constraints.
6. Reject or flag tasks that cannot be feasibly inserted.
7. Return an ordered route and any infeasibility reasons.
8. Let an authorized user review and confirm the proposed route.
9. Recompute or request review when relevant tasks change.

The heuristic must not silently violate constraints merely to produce a route.

### 8.4 Route optimization interface

Implement a backend service interface such as:

```text
buildRoutePlan(tasks, vehicle, startLocation, routingProvider)
  -> {
       feasible,
       stops,
       estimatedDistanceKm,
       estimatedDurationMinutes,
       infeasibleTasks,
       provider,
       warnings
     }
```

The result must be validated before saving. Travel estimates must be nullable when the provider cannot calculate them. Document assumptions, such as service time at each stop, if used.

### 8.5 Later enhancement

If the heuristic is insufficient, evaluate a vehicle-routing solver such as Google OR-Tools with time windows and capacity constraints. This is an extension, not a prerequisite for the first working prototype.

### 8.6 Route API endpoints

- `POST /api/v1/routes/plan` — create a proposed route plan for authorized tasks.
- `GET /api/v1/routes/:id` — view an authorized route plan.
- `POST /api/v1/routes/:id/confirm` — confirm a proposed route/assignment.
- `POST /api/v1/routes/:id/recompute` — recompute after a permitted change.
- `POST /api/v1/routes/:id/cancel` — cancel with a reason.

These endpoints must enforce role and ownership permissions. If the external routing service fails, return a clear error/warning and allow manual route planning; do not fabricate distances or travel times.

---

## 9. REST API Specification

Use `/api/v1`. Protected endpoints require authentication and server-side authorization. Use consistent JSON response/error shapes and validate all inputs.

### 9.1 Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user and organization |
| POST | `/api/v1/auth/login` | Authenticate |
| POST | `/api/v1/auth/logout` | End session |
| GET | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/auth/forgot-password` | Start password reset |
| POST | `/api/v1/auth/reset-password` | Complete reset |

### 9.2 Organizations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/organizations/me` | Current organization profile |
| PATCH | `/api/v1/organizations/me` | Update permitted fields |
| GET | `/api/v1/organizations/nearby` | Search nearby organizations |
| GET | `/api/v1/organizations/:id` | View authorized profile |
| GET | `/api/v1/admin/organizations` | Admin review queue |
| PATCH | `/api/v1/admin/organizations/:id/verification` | Verify/reject/suspend |

### 9.3 Donations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/donations` | Create listing |
| GET | `/api/v1/donations` | Browse/filter listings |
| GET | `/api/v1/donations/:id` | Get details |
| PATCH | `/api/v1/donations/:id` | Edit permitted listing |
| POST | `/api/v1/donations/:id/cancel` | Cancel listing |
| GET | `/api/v1/donations/:id/matches` | Ranked eligible receivers |

### 9.4 Requirements

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/requirements` | Create receiver requirement |
| GET | `/api/v1/requirements/me` | List own requirements |
| PATCH | `/api/v1/requirements/:id` | Update requirement |
| POST | `/api/v1/requirements/:id/close` | Close requirement |

### 9.5 Reservations and allocations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/donations/:id/reservations` | Request/reserve quantity |
| GET | `/api/v1/reservations/me` | List own reservations |
| POST | `/api/v1/reservations/:id/accept` | Confirm offer |
| POST | `/api/v1/reservations/:id/cancel` | Cancel and release eligible quantity |

### 9.6 Deliveries

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/deliveries/me` | List authorized deliveries |
| POST | `/api/v1/deliveries/:id/assign` | Assign partner/manual handler |
| POST | `/api/v1/deliveries/:id/pickup` | Record pickup |
| POST | `/api/v1/deliveries/:id/confirm` | Confirm received quantity |
| POST | `/api/v1/deliveries/:id/report-issue` | Report discrepancy/failure |

### 9.7 Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/routes/plan` | Propose a route |
| GET | `/api/v1/routes/:id` | View route |
| POST | `/api/v1/routes/:id/confirm` | Confirm route |
| POST | `/api/v1/routes/:id/recompute` | Recompute route |
| POST | `/api/v1/routes/:id/cancel` | Cancel route |

### 9.8 Analytics, notifications, and health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/analytics/overview` | Authorized dashboard metrics |
| GET | `/api/v1/analytics/impact` | Aggregate impact metrics |
| GET | `/api/v1/notifications` | List notifications |
| POST | `/api/v1/notifications/:id/read` | Mark notification read |
| GET | `/api/v1/health` | Backend health |

### 9.9 API behavior

- Use appropriate HTTP status codes.
- Validate IDs, dates, quantities, units, enums, and state transitions.
- Paginate lists and cap result sizes.
- Use geospatial indexes for proximity search.
- Apply rate limits to authentication and sensitive operations.
- Restrict CORS to configured origins.
- Make reservation operations atomic and safe under concurrency.
- Do not expose internal stack traces.
- Add idempotency handling where repeated requests could duplicate a reservation, delivery event, or confirmation.
- Use provider signature verification for webhooks if integrations are added.

Suggested error response:

```json
{
  "error": {
    "code": "INSUFFICIENT_QUANTITY",
    "message": "The requested quantity is no longer available."
  }
}
```

---

## 10. Frontend Pages

### Shared
- Landing page.
- Registration/login/password reset.
- Organization onboarding and verification status.
- Profile/settings.
- Notifications.
- Help and food-safety information.

### Supplier portal
- Dashboard with active donations and impact.
- Create/edit donation form.
- Donation details and status history.
- Ranked receiver recommendations.
- Allocation/reservation review.
- Proposed route and delivery status.
- Completed donation history.

### Receiver portal
- Dashboard with current demand and incoming allocations.
- Requirement creation/editing.
- Available donation list and filters.
- Donation details.
- Accept/request quantity.
- Pickup/delivery schedule.
- Confirm received quantity.
- Report issue.
- Delivery history.

### Admin portal
- Organization verification queue.
- Account and listing review.
- Delivery and dispute management.
- Route review/reassignment.
- Audit history.
- Aggregate impact dashboard.

### UI requirements
- Responsive desktop/mobile layout.
- Clear lifecycle status labels and visible deadlines.
- Confirmation dialogs for cancellation.
- Accessible labels and keyboard navigation.
- Explainable recommendations.
- Map plus accessible list view if maps are implemented.
- No fake GPS tracking or simulated provider data presented as live.

---

## 11. Security and Privacy

- Hash passwords using a modern password hashing algorithm.
- Use secure, HTTP-only, appropriately configured cookies if cookie sessions are selected.
- Protect against broken access control, injection, XSS, and CSRF where applicable.
- Validate all input on the server.
- Store secrets in environment variables and exclude them from version control.
- Use HTTPS in deployment.
- Restrict access to contact information and precise locations.
- Apply rate limiting to authentication and sensitive APIs.
- Avoid logging credentials, tokens, or unnecessary personal data.
- Keep audit records for critical actions.
- Provide backup/recovery instructions if deployed beyond a local demo.
- Review applicable food-safety, privacy, and data-retention obligations before real-world use.

---

## 12. Testing and Acceptance Criteria

### 12.1 Acceptance tests

| ID | Test | Expected result |
|---|---|---|
| AC-01 | Register as supplier | Account created; verification pending |
| AC-02 | Unverified supplier tries live donation | Rejected or saved as draft |
| AC-03 | Verified supplier creates valid donation | Donation becomes available |
| AC-04 | Receiver browses listings | Only eligible available listings shown |
| AC-05 | Matching ranks eligible candidates | Ordered candidates and reasons returned |
| AC-06 | No eligible candidate | Empty list and clear explanation |
| AC-07 | Concurrent claims for final portions | No over-allocation |
| AC-08 | Reservation cancelled | Eligible quantity released exactly once |
| AC-09 | Pickup recorded | Status/timestamp updated |
| AC-10 | Partial delivery confirmed | Actual quantity and discrepancy recorded |
| AC-11 | Deadline passes | Listing cannot be newly reserved |
| AC-12 | Unauthorized organization access | Request denied |
| AC-13 | ML service unavailable | Baseline matcher used |
| AC-14 | Routing provider unavailable | No invented estimates; manual fallback offered |
| AC-15 | Route violates capacity/deadline | Plan rejected or infeasibility reported |
| AC-16 | Pickup/drop-off ordering | Pickup precedes associated delivery |
| AC-17 | Delivery confirmed | Impact totals update using confirmed quantity |
| AC-18 | Admin verifies organization | Status and audit record updated |
| AC-19 | Route is recomputed after cancellation | Cancelled task removed; remaining route revalidated |
| AC-20 | Duplicate confirmation request | Idempotent behavior; no duplicate impact count |

### 12.2 Automated tests

- Unit tests for validation, lifecycle transitions, allocation, and eligibility.
- Backend API integration tests.
- Authentication and authorization tests.
- Concurrent reservation and duplicate-request tests.
- ML preprocessing, inference, fallback, and schema tests.
- Route feasibility tests: time windows, capacity, pickup-before-drop-off, cancellation.
- End-to-end supplier-to-receiver delivery tests.
- Analytics tests proving only confirmed deliveries are counted.

---

## 13. Environment Setup and Local Development

The coding LLM must provide exact commands for the chosen package manager and ensure they match the generated files. Do not invent scripts that are absent from `package.json`.

### 13.1 Environment variables

Create `.env.example` with placeholders for:
- `MONGODB_URI`
- `PORT`
- `CLIENT_ORIGIN`
- `SESSION_SECRET` or equivalent authentication secret
- `ML_SERVICE_URL`
- Optional email provider credentials
- Optional routing/geocoding provider URL or API key, if required by the chosen service

Never commit real secrets. Validate required environment variables on startup and fail with a clear error if required configuration is missing.

### 13.2 Local services

Document how to:
1. Install supported Node.js and Python versions.
2. Install client and server dependencies.
3. Create a Python virtual environment and install `ml-service/requirements.txt`.
4. Start MongoDB locally or configure a hosted development database.
5. Generate synthetic ML data and train the model.
6. Start the ML API, backend API, and frontend.
7. Load clearly labelled seed organizations, donations, and receiver requirements.
8. Run tests and linting.
9. Configure the routing provider or use an explicitly labelled local/test routing stub.
10. Shut down services and reset demo data safely.

### 13.3 Seed data

Include fictional organizations, coordinates, food listings, receiver requirements, and delivery records. Clearly mark all records as demo data. Do not use real personal contact details. Seed data must include successful, rejected, cancelled, expired, and partial-delivery examples so edge cases can be demonstrated.

### 13.4 README requirements

The README must include:
- Project summary and SDG alignment.
- Architecture diagram or description.
- Prerequisites.
- Environment setup.
- Exact startup commands for each service.
- Database/seed setup.
- ML training and evaluation commands.
- Routing provider configuration and limitations.
- Test commands.
- Demo workflow.
- Known limitations and future work.

---

## 14. Development Roadmap

Use a flexible, dependency-driven schedule rather than promising a fixed completion date. Complete each phase's acceptance checks before moving on.

### Phase 1 — Requirements and foundation
- Confirm field names, units, roles, status enums, and lifecycle rules.
- Create UI wireframes and architecture.
- Set up repository and environment configuration.
- Implement authentication, organization profiles, and verification.

**Exit criteria:** Roles and organization ownership are enforced; core models and validation are tested.

### Phase 2 — Donation and demand workflows
- Implement donation creation/editing/cancellation.
- Implement receiver requirements and capacity.
- Add listing search and filters.
- Add seed data.

**Exit criteria:** Supplier and receiver can complete core listing and demand workflows.

### Phase 3 — Baseline matching and allocation
- Implement hard eligibility filters.
- Implement distance/time-aware rule-based ranking.
- Implement quantity allocation and atomic reservations.
- Add explanation codes and no-match behavior.

**Exit criteria:** No ineligible candidate is recommended; concurrent reservation tests pass.

### Phase 4 — ML pipeline
- Generate synthetic candidate-pair data with documented assumptions.
- Train and evaluate Random Forest and baseline models.
- Expose FastAPI prediction endpoints.
- Integrate model versioning, validation, timeout, and fallback.
- Display recommendation explanations.

**Exit criteria:** Inference works; metrics are reproducible; synthetic data is clearly labelled; fallback is tested.

### Phase 5 — Delivery and route optimization
- Implement delivery lifecycle and confirmation.
- Implement route-planning interface and configured travel-time provider.
- Implement deterministic feasible-stop heuristic.
- Add capacity, time-window, pickup-before-drop-off, and cancellation checks.
- Add manual assignment and route fallback.
- Add route confirmation and audit events.

**Exit criteria:** Feasible routes are proposed, infeasible plans are explained, and no fabricated route estimates appear.

### Phase 6 — Analytics, quality, and polish
- Implement impact metrics and dashboards.
- Complete notifications if time permits.
- Add end-to-end and authorization tests.
- Fix UI and accessibility issues.
- Finalize README and demo flow.

**Exit criteria:** Acceptance tests pass; setup is reproducible; impact metrics use confirmed data.

---

## 15. Demo Scenario

Use fictional data consistently across the demo.

A hotel lists 120 vegetarian meal portions with a permitted pickup deadline. The system finds several nearby verified receivers with different demand, capacity, receiving hours, and travel times.

1. Supplier creates the donation.
2. Backend validates the listing and finds eligible receivers.
3. ML ranks candidates and provides reasons.
4. Allocation logic proposes quantities without exceeding supply or receiver capacity.
5. Receiver accepts an allocation.
6. Route planner proposes a feasible pickup/drop-off route.
7. An authorized user confirms the route/assignment.
8. Pickup is recorded.
9. Receiver confirms actual quantity received.
10. Dashboard updates confirmed quantity and estimated meals supported.

Also demonstrate:
- No eligible receiver.
- Expired donation.
- Cancellation and quantity release.
- Partial delivery.
- ML service outage with baseline fallback.
- Routing provider outage with manual route fallback.
- An infeasible route due to deadline or capacity.

Do not describe simulated route assignments as real drivers or vehicles.

---

## 16. Success Criteria

The MVP is complete when:
- Supplier and receiver workflows work end to end.
- Organization verification and authorization are enforced.
- Donations and requirements can be created and searched.
- Hybrid matching produces ranked eligible candidates.
- ML evaluation is reproducible and clearly identifies synthetic data.
- Reservations cannot over-allocate supply.
- Route planning checks capacity, deadlines, and pickup/drop-off precedence.
- Delivery confirmation records actual quantities.
- Dashboard metrics use confirmed delivery records.
- ML and routing outages have tested fallbacks.
- Critical workflows have automated tests.
- The project can be run using documented setup commands.

---

## 17. Coding-LLM Implementation Instructions

The coding LLM must follow these instructions:

1. Read the complete specification before coding.
2. First produce a concise architecture summary, shared enums/field names, database models, API contracts, and a phased task checklist.
3. Implement incrementally; do not generate the whole codebase in one unverified response.
4. Keep frontend, backend, ML, and route-planner contracts consistent.
5. Build authentication, profiles, and validation before operational features.
6. Implement and test rule-based eligibility and matching before integrating ML.
7. Build reservation atomicity before multi-receiver allocation.
8. Use synthetic data only as labelled demo/training data; do not represent synthetic performance as real-world evidence.
9. Never hardcode model predictions, delivery outcomes, route distances, travel times, or impact metrics to make a demo look successful.
10. If a routing provider is unavailable, return unknown estimates and use manual fallback.
11. Treat generated routes as proposed until confirmed by an authorized user or integrated provider.
12. Enforce safety/eligibility constraints before ML inference and never let ML override them.
13. Write tests for every phase and fix failures before continuing.
14. Include input validation, authorization, error handling, audit events, and concurrency safeguards.
15. Provide seed data, `.env.example`, exact startup/test commands, and a complete README.
16. Do not claim a feature is implemented or tested unless it is.
17. At the end of each phase, report files changed, commands run, test results, known gaps, and the next phase.
18. If a requirement is ambiguous, choose the safest simple implementation, document the assumption, and avoid adding unrelated features.
19. Prefer maintainable, understandable code over unnecessary abstractions or premature microservices.
20. Keep all credentials and private data out of source control.

---

## 18. Future Enhancements (Not Required for MVP)

- Demand forecasting using historical recipient demand.
- Surplus prediction from supplier donation patterns.
- More advanced vehicle-routing optimization with time windows and capacity constraints.
- Live GPS tracking through an actual partner integration.
- Email/SMS/WhatsApp notifications where legally and technically appropriate.
- Retraining and monitoring with authorized real-world outcomes.
- Better model calibration, ranking metrics, and drift monitoring.
- Multi-language UI and regional-language support.
- Partnerships with local food-safety organizations and delivery providers.

---

## 19. Final Product Definition

FoodConnect is an AI-assisted food redistribution platform with two primary account types—Supplier/Donor and Receiver—and an administrative role. It combines verified donation listings, receiver demand, rule-based safety and feasibility checks, ML-assisted recipient ranking, quantity allocation, route planning, delivery confirmation, and transparent impact reporting.

Its core innovation is not simply a donation marketplace. It is a coordinated system that helps determine **which eligible receiver should get which quantity of surplus food, and how that food can be delivered within operational constraints**.

The MVP should favor safety, reliability, explainability, and a complete end-to-end workflow over a large number of superficial features.
