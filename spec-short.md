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
- Safe quantity reservations and partial allocation.
- Delivery status tracking and confirmation.
- Basic impact dashboard.


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


### FR-07: Reservations and allocation

- Receivers can accept a proposed allocation or request a quantity.
- The server verifies current availability at reservation time.
- Reservation must be atomic to prevent over-allocation.
- A donation can be allocated across multiple receivers.
- A reservation has a configurable expiry time.
- Cancellation releases eligible reserved quantity.
- All quantity changes must be auditable.
- Confirmed deliveries must preserve the original allocation and actual received quantity.

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

## 19. Final Product Definition

FoodConnect is an AI-assisted food redistribution platform with two primary account types—Supplier/Donor and Receiver—and an administrative role. It combines verified donation listings, receiver demand, rule-based safety and feasibility checks, ML-assisted recipient ranking, quantity allocation, route planning, delivery confirmation, and transparent impact reporting.

Its core innovation is not simply a donation marketplace. It is a coordinated system that helps determine **which eligible receiver should get which quantity of surplus food, and how that food can be delivered within operational constraints**.

The MVP should favor safety, reliability, explainability, and a complete end-to-end workflow over a large number of superficial features.
