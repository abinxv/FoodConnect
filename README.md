# FoodConnect

**FoodConnect** is a Hyderabad-focused surplus-food redistribution demo that connects suppliers such as restaurants and caterers with receiver organizations such as community kitchens, shelters, and food banks.

This college-project MVP demonstrates the workflow of listing surplus food, reserving quantities, confirming handovers, verifying organizations, and tracking redistribution impact. It uses seeded operational data and a small local authentication API. **MongoDB is not required for the current demo.**

## Table of Contents

- [Project Goals](#project-goals)
- [SDG Alignment](#sdg-alignment)
- [User Roles](#user-roles)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture and Data](#architecture-and-data)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Run Locally](#run-locally)
- [Demo Accounts](#demo-accounts)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Impact Metric Definitions](#impact-metric-definitions)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)
- [Project Status](#project-status)

## Project Goals

FoodConnect aims to make local food redistribution more coordinated and visible. Suppliers can publish surplus food, receivers can reserve food that meets their needs, and both sides can confirm handovers. Admin tools support organization verification and demo dispute review.

## SDG Alignment

- **SDG 2 — Zero Hunger:** helps direct usable surplus food to community organizations supporting people experiencing food insecurity.
- **SDG 12 — Responsible Consumption and Production:** supports surplus-food redistribution and makes food-recovery activity more visible.

## User Roles

| Role | Responsibilities |
| --- | --- |
| **Supplier** | Manage organization details, publish surplus-food listings, review reservations, and confirm handovers. |
| **Receiver** | Browse listings, reserve quantities within configured limits, confirm received food, and report discrepancies. |
| **Admin** | Review organization verification, manage demo disputes, configure demo policies, and inspect audit activity. |

## Features

### 1. Authentication and onboarding

- Supplier and receiver organization registration.
- Login, logout, and current-user API support.
- Local password-reset flow for development and demonstration.
- Passwords hashed with `bcryptjs` before storage in the local API store.
- JWT-based authentication for the local API.
- New organizations receive a separate **Pending** verification status.
- Input validation and clear registration/login error messages.
- Demo accounts for Supplier, Receiver, and Admin.

> **Security note:** the local password-reset flow is not a production account-recovery system. A deployed version would need verified, expiring reset tokens and a trusted delivery channel.

### 2. Supplier workspace

- Create, edit, and cancel unreserved donation listings.
- Record food category, quantity, unit, preparation time, collection deadline, storage conditions, allergens, and handling notes.
- Review reservations and receiver pickup status.
- Confirm food handover.
- Update supplier organization details.

### 3. Receiver workspace

- Browse and search available seeded food listings.
- Reserve a selected quantity subject to available stock and configured per-unit capacity.
- Confirm received pickups.
- Report discrepancies when received food differs from the expected handover.
- Manage receiver profile information, including preferences, demand, receiving capacity, receiving hours, storage capability, and dietary restrictions.

### 4. Admin workspace

- Review seeded supplier and receiver organizations.
- Set organization status to **Verified**, **Rejected**, or **Suspended**.
- Review demo reports and disputes.
- Configure local demo policy settings and manual fallback behavior.
- View in-app audit activity.

### 5. Dashboard and social-impact reporting

The dashboard uses seeded demo records; figures are not live city-wide statistics. Depending on the available demo data and active view, reporting can include:

- Summary KPI cards for redistributed food and completed handovers.
- Estimated meal equivalents based on a configurable food-weight assumption.
- Supplier contribution rankings and contribution history.
- Weekly or monthly redistribution trends.
- Food-category breakdowns.
- Time-period filters, search, and metric-based leaderboard sorting where available.
- Receiver-reported beneficiary figures, kept separate from calculated meal equivalents when reports exist.

See [Impact Metric Definitions](#impact-metric-definitions) for how these figures should be interpreted.

### 6. Seeded demo workflows

- Operational records such as listings, reservations, organization profiles, and dashboard data are supplied as seeded frontend data.
- Authentication records persist separately in the local JSON-backed API store.
- The demo can be run locally without a database service.

## Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React | User interface and role-based workflows |
| Build tool | Vite | Development server and production frontend build |
| Styling | CSS | Responsive interface styling |
| Icons | Lucide icons | Interface icons |
| Local API | Node.js, Express | Authentication and local API endpoints |
| Password hashing | `bcryptjs` | Password hashing |
| Authentication | JWT | Local API authentication |
| Operational demo data | Seeded frontend records | Listings, reservations, organization records, and dashboard metrics |
| Authentication data | Local JSON store | Persistence for local authentication records |

## Architecture and Data

FoodConnect currently uses two data approaches:

1. **Seeded frontend data:** operational records such as donation listings, reservations, organization profiles, and dashboard information are supplied by the frontend.
2. **Local authentication API:** an Express server handles authentication-related functionality and stores local records in `server/data/store.json`.

This keeps the project straightforward to run for a classroom or hackathon demo, but operational changes are not backed by a shared, transactional database.

## Prerequisites

- **Node.js 20 or newer**
- **npm 10 or newer**

Check your versions:

```powershell
node --version
npm --version
```

## Installation

Run these commands from the FoodConnect project root.

### 1. Install frontend dependencies

```powershell
npm install
```

### 2. Install API dependencies

```powershell
Set-Location server
npm install
Set-Location ..
```

## Run Locally

Use two separate PowerShell terminals, both opened in the FoodConnect project root.

### Terminal 1: Start the API

```powershell
npm run server
```

The API is expected at `http://127.0.0.1:5000`.

### Terminal 2: Start the frontend

```powershell
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173` or `http://127.0.0.1:5173`.

Keep both terminals running while using the application.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Supplier | `supplier@foodconnect.demo` | `demo123` |
| Receiver | `receiver@foodconnect.demo` | `demo123` |
| Admin | `admin@foodconnect.demo` | `demo123` |

These public demo credentials are intended only for local demonstration. Do not reuse them for any deployed service.

## Environment Variables

Copy `.env.example` to `.env` when configuring a custom local API environment.

| Variable | Purpose | Default / note |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `SESSION_SECRET` | Secret used to sign local JWTs | Use a private value for local development |
| `CLIENT_ORIGIN` | Allowed frontend development origin | Normally `http://localhost:5173` |

Do not commit real secrets to version control. Keep placeholders in example environment files.

## Available Commands

Run from the project root:

```powershell
npm run dev
npm run server
npm run build
```

- `npm run dev` starts the Vite development server.
- `npm run server` starts the local Express API.
- `npm run build` creates the production frontend bundle in `dist/`.

## Impact Metric Definitions

Dashboard values depend on the seeded records included with the demo.

- **Redistributed food:** should be calculated from completed handovers and the quantity confirmed as received, rather than the original listing quantity.
- **Completed handovers:** counts completed handover records; it is not necessarily the same as the number of unique donation listings.
- **Estimated meal equivalents:** a rough estimate derived from redistributed food weight and a configurable kilograms-per-meal assumption. The dashboard specification uses **0.5 kg per meal equivalent** as its default assumption. This is an estimate, not a nutritional standard or a count of unique people.
- **Beneficiaries:** use receiver-reported figures only when those reports exist. Keep them separate from meal equivalents. If no report exists, show **Not reported** rather than inferring a beneficiary count from kilograms.
- **Completion rate:** use a consistent, documented denominator and exclude records that do not qualify under that definition.
- **Pending, cancelled, expired, or disputed records:** do not count these as completed redistribution. If provisional figures are shown, label them clearly.
- **Uncollected food:** an uncollected listing does not prove that the food was wasted.

## Current Limitations

- Donation listings, reservations, organization profiles, and dashboard data are seeded frontend/browser state rather than database-backed operational records.
- Authentication data persists in the local JSON-backed store at `server/data/store.json`.
- The role switcher is for classroom demonstration; it is not a substitute for server-side authorization over operational data.
- Operational actions are not backed by a database-enforced multi-user authorization and transaction model.
- Reservation capacity checks happen in the demo flow; atomic reservation enforcement is not guaranteed across concurrent users.
- ML-based matching is **not implemented**.
- Automated route optimization is **not implemented**.
- External maps, live travel-time calculations, and GPS tracking are **not implemented**.
- Email and SMS notifications are **not implemented**.
- Seeded distances are demo values, not routing-provider calculations.
- The local password-reset flow is for development only.
- This is a prototype, not a production food-safety, logistics, or emergency-response system.

## Future Improvements

These are possible future enhancements, not claims about current functionality:

1. Add server-side authorization and organization-ownership checks to operational endpoints.
2. Add persistent operational storage if multi-user, cross-session consistency becomes necessary.
3. Enforce reservations atomically to prevent over-reservation when multiple users act at the same time.
4. Document food-safety, handling, eligibility, and dispute-resolution policies.
5. Add explainable rule-based matching after hard eligibility checks. A future ranking system could consider unmet demand, urgency, distance, quantity fit, and historical reliability.
6. Evaluate a machine-learning model only after suitable historical outcome data exists, while retaining a deterministic rules fallback.
7. Integrate a routing provider when reliable addresses and live travel-time estimates are available.
8. Add verified email notifications and a secure password-reset process for a deployed version.
9. Add automated tests for reservation rules, dashboard aggregation, ranking calculations, and role permissions.

## Project Status

FoodConnect is a **local demonstration MVP**. It demonstrates supplier-to-receiver food listing, reservation, pickup confirmation, organization verification, and seeded impact reporting. Authentication is handled by a local API, while most operational data remains seeded frontend state.

The project does not currently claim live city-wide food availability, production-grade security, ML-powered matching, or automated logistics. Those capabilities require additional implementation and validation.
