# FoodConnect

FoodConnect is a Hyderabad-focused surplus-food redistribution demo. It connects supplier organizations such as restaurants and caterers with receiver organizations such as community kitchens, shelters, and food banks.

The current build is a college-project MVP using seeded operational data and a small local API for authentication. It supports three roles: Supplier, Receiver, and Admin.

## SDG Alignment

- **SDG 2: Zero Hunger** - helps direct usable surplus food to community organizations.
- **SDG 12: Responsible Consumption and Production** - makes food redistribution more visible and coordinated.

## Features

### Authentication and onboarding

- Registration for supplier and receiver organizations.
- Login, logout, current-user API, and local password reset.
- Passwords are stored as bcrypt hashes in the local API store.
- New registrations receive a separate `pending` organization-verification state.
- Clear validation and login error messages.

### Supplier workspace

- Create, edit, and cancel unreserved donation listings.
- Capture food category, quantity, unit, preparation time, collection deadline, storage conditions, allergens, and handling notes.
- See current reservations and receiver pickup status.
- Confirm food handover.
- Edit supplier organization details.

### Receiver workspace

- Browse and search seeded food listings.
- Reserve a chosen quantity within available stock and configured per-unit capacity.
- Confirm received pickups or report a discrepancy.
- Manage receiver profile details: preferences, capacity, receiving hours, storage, dietary restrictions, and demand.

### Admin workspace

- Review seeded organizations and set their status to Verified, Rejected, or Suspended.
- Review demo reports/disputes.
- Configure local demo policy settings and manual fallback behavior.
- View in-app audit activity.

## Technology

- Frontend: React, Vite, CSS, Lucide icons
- Local API: Node.js, Express
- Authentication: bcryptjs password hashing and JWTs
- Data: seeded frontend records plus a local JSON-backed authentication store

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Installation

Install frontend dependencies from the project root:

```powershell
npm install
```

Install API dependencies:

```powershell
Set-Location server
npm install
Set-Location ..
```

## Run Locally

Use two PowerShell terminals, both opened in the FoodConnect project folder.

### Terminal 1: API

```powershell
npm run server
```

The API runs at `http://127.0.0.1:5000`.

### Terminal 2: frontend

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173` or `http://127.0.0.1:5173`.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Supplier | `supplier@foodconnect.demo` | `demo123` |
| Receiver | `receiver@foodconnect.demo` | `demo123` |
| Admin | `admin@foodconnect.demo` | `demo123` |

## Environment Variables

Copy `.env.example` to `.env` when configuring a custom local API environment.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. Default: `5000` |
| `SESSION_SECRET` | Secret used to sign local JWTs |
| `CLIENT_ORIGIN` | Frontend development URL |

## Available Commands

```powershell
npm run dev
npm run server
npm run build
```

`npm run build` creates a production frontend bundle in `dist/`.

## Current Limitations

- Donation, reservation, organization, and dashboard data are seeded browser state. Authentication data persists locally in `server/data/store.json`.
- The role switcher exists for classroom demonstration. It is not a substitute for server-side authorization over operational data.
- No MongoDB integration yet.
- ML matching, route optimization, external maps, live GPS, email, and SMS are not implemented.
- Distance is seeded demo information, not a routing-provider calculation.
- The local password-reset flow is intended only for development; production must use verified reset tokens and email delivery.
- The browser-side reservation flow is capacity-aware, but true atomic reservation enforcement must move to a database-backed API.

## Suggested Next Phase

1. Move donations, reservations, organization profiles, and audit events to MongoDB.
2. Protect all operational API endpoints with role and organization-ownership checks.
3. Implement database transactions or atomic update operations for reservations.
4. Add documented food-safety and eligibility policy rules.
5. Add rule-based matching and later an ML service with explainable ranking.
6. Integrate a routing provider only when live travel estimates are available.
