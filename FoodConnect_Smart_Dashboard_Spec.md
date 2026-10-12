# FoodConnect — Smart Social-Impact Dashboard Specification

## Objective

Build a complete, polished Smart Social-Impact Dashboard for the existing FoodConnect project in one implementation. The dashboard should demonstrate how surplus-food redistribution creates measurable social impact through platform-wide metrics, supplier leaderboards, contribution trends, food-category analytics, and clearly labelled meal-equivalent and beneficiary statistics.

This is a hackathon demo using static/seeded JSON data. **Do not add MongoDB, another database, or new infrastructure.** Reuse the existing React, Vite, CSS, Lucide, Node.js, and Express architecture where practical. Inspect the current repository before changing files and integrate the dashboard into the existing app rather than creating a disconnected standalone page.

## 1. Core requirements

### 1.1 Dashboard audiences and views

Implement the dashboard so it fits the existing role/navigation structure:

- **Public/overview view:** platform-wide aggregate metrics, approved supplier leaderboard, trends, and food-category analytics.
- **Supplier view:** the signed-in supplier's contribution totals, contribution history, leaderboard position, badges, and period-over-period comparisons.
- **Receiver view:** food received, accepted quantities, handover history, and optional receiver-reported service statistics.
- **Admin view:** platform-wide metrics, supplier/receiver activity, data-quality warnings, discrepancies, and donation/handover drill-downs where supported by existing data.

Respect existing role-based navigation and permissions. Do not break or replace current Supplier, Receiver, or Admin workflows. If the current app does not support a particular view, integrate it consistently with the existing architecture and explain the change.

### 1.2 Static data only

- Use version-controlled JSON seed data or the project's existing static/demo data conventions.
- Do not introduce MongoDB, SQL, or any other database.
- Do not add unnecessary dependencies or infrastructure.
- Separate immutable seed data from simulated mutable demo state where practical.
- Provide a reset-to-seed mechanism if the app supports simulated interactions.
- Calculate dashboard metrics dynamically from the data records; do not hard-code totals directly into UI components.
- Make it clear in the UI that seeded data is demonstration data. Never imply the demo metrics are verified real-world impact.
- Reuse existing dependencies for charts if possible; if none exist, select a lightweight option only if truly needed, or create accessible simple charts using existing tools/CSS/SVG.

## 2. Top-level KPI cards (key performance indicator)

Show responsive summary cards for:

1. **Verified/demo food redistributed (kg):** sum the reconciled actual received quantities for completed handovers only.
2. **Estimated meal equivalents:** calculated from redistributed kilograms using a configurable, documented kg-per-meal assumption. Show the assumption near the metric, e.g. "Estimate based on 0.5 kg per meal equivalent." Make it clear this is not a count of meals actually served.
3. **Completed handovers:** count completed supplier-to-receiver transfers.
4. **Active suppliers:** count suppliers with at least one completed handover in the selected period.
5. **Active receivers:** count receivers with at least one completed handover in the selected period.

Use consistent units and definitions across all dashboard views. Support loading, empty, and error states where relevant. If the data is local and instantly available, still handle empty datasets gracefully.

## 3. Supplier leaderboard

Build a polished leaderboard with:

- Rank
- Supplier name and verification indicator (if available)
- Total redistributed kilograms
- Completed handovers
- Estimated meal equivalents (optional)
- Completion rate (optional; only show when there is sufficient data)
- Change versus the previous equivalent period

Default ranking: **total completed/reconciled kilograms redistributed** during the selected period.

Include filters:
- Period: last 7 days, last 30 days, last 3 months, current year, all time
- Ranking metric: kilograms redistributed, completed handovers, completion rate
- Search supplier by name
- Optional category filter if supported by data

Provide separate, clearly labelled ranking modes rather than combining unlike metrics into an opaque score. For completion-rate ranking, require a minimum sample size. Ties should have deterministic handling.

### Supplier profile and badges

Allow opening a supplier profile or detail panel with:
- Supplier name and verification status
- Total completed kilograms
- Completed handovers/donations, with precise metric labels
- Meal-equivalent estimate and its assumption
- Weekly/monthly contribution trend
- Food-category breakdown
- Leaderboard position for the selected period
- Badges calculated from records, not manually assigned

Possible transparent badges:
- First verified/demo 100 kg
- 10 completed handovers
- Consistent contributor across three consecutive months
- High completion rate, only when a minimum sample threshold is met

Use appropriate demo labels when badges are based on seeded data.

## 4. Trend and analytics section

Include charts or equivalent accessible visualizations for:

- Food redistributed by week or month
- Completed handovers over time
- Food-category distribution
- Active suppliers and receivers over time, if the data supports it
- Completion-rate trend, if eligible outcome data exists
- Optional receiver-reported people/service counts, shown separately from estimated meal equivalents

Filters should affect relevant charts and summary cards consistently. Support:
- Last 7 days
- Last 30 days
- Last 3 months
- Current year
- All time
- Food category
- Supplier filter in authorized views
- Locality/area only if available in the seeded dataset and safe to show

Use consistent timezone and date-boundary rules. Generate trend buckets from actual seed records. Do not invent values for missing periods; show zero or no-data states consistently.

## 5. Metric definitions and responsible reporting

### 5.1 Redistributed kilograms

Calculate from completed handover records and their actual received quantities, not listing quantities or reserved amounts.

- Exclude cancelled, expired, pending, and merely reserved records.
- Exclude unresolved disputed records from the verified/demo total, or display them separately as provisional.
- For supplier/receiver quantity disagreements, use a documented reconciliation rule. A conservative demo rule is to count no more than the amount both sides confirm.
- Prevent duplicate counting when a donation has multiple partial handovers.

### 5.2 Completed handovers and donation listings

Keep these metrics distinct:
- **Completed handovers:** completed supplier-to-receiver transfers.
- **Completed donation listings:** unique original listings that have at least one completed handover.

Do not count a single donation split across multiple receivers as multiple original donation listings.

### 5.3 Meal equivalents

Use:

`estimatedMealEquivalents = redistributedKg / kgPerMeal`

- Make `kgPerMeal` a configurable constant in one central configuration file.
- Default demonstration assumption: `0.5 kg per meal equivalent`, unless the project already has a different documented assumption.
- Display the assumption in the UI.
- Label the result "estimated meal equivalents", not "meals served".
- Do not imply nutritional adequacy from food weight alone.

### 5.4 People and children helped

Do not infer unique people or children helped from kilograms or meal equivalents.

If seeded receiver reports are included:
- Keep them in a separate `beneficiaryReports` dataset.
- Label them "receiver-reported" and show their reporting period.
- State whether the count represents unique people, visits, or service instances.
- Do not add overlapping receiver counts together and claim they are unique individuals.
- Do not collect or expose children's names, contact information, photos, or other identifiable data.

If no credible report data is available, show "Not reported" rather than inventing a beneficiary count.

### 5.5 Success/completion rate

Define completion rate from eligible handovers due in the selected period:

`completionRate = completedEligibleHandovers / eligibleHandoversDue * 100`

Document how cancellations, unresolved disputes, and not-yet-due pending records are treated. Exclude pending handovers that are not yet due. Do not show or rank by completion rate if the dataset lacks a meaningful denominator.

### 5.6 Expired/uncollected food

If supported by the dataset, show a separate count/quantity of expired or uncollected listings. Do not label all uncollected listings as confirmed food waste; the app may not know what happened to them outside FoodConnect.

## 6. Data model for seeded JSON

Adapt to the existing repository's data model where possible. Do not duplicate existing structures unnecessarily.

### Handover record

Each completed or attempted transfer should contain enough information to calculate impact accurately:

- `id`
- `donationId`
- `supplierId`
- `receiverId`
- `foodCategory`
- `reservedQuantityKg`
- `collectedQuantityKg` (optional)
- `receivedQuantityKg` (optional)
- `status` (e.g. `completed`, `pending`, `cancelled`, `expired`, `disputed`)
- `eligibleForImpact` or an equivalent documented rule
- `reservedAt`
- `collectedAt` (optional)
- `receivedAt` (optional)
- `outcomeReason` (optional)

### Supplier record

- `id`
- `displayName`
- `verificationStatus`
- Optional safe public profile fields
- No private contact details in public leaderboard responses or views

### Receiver record

- `id`
- `displayName`
- `verificationStatus`
- Optional reported aggregate statistics
- Do not include beneficiary personal information

### Beneficiary report (optional)

- `id`
- `receiverId`
- `periodStart`
- `periodEnd`
- `metricType` (`people_served`, `children_served`, `service_instances`)
- `count`
- `reportingMethod`
- `verificationStatus`

Use consistent IDs and dates across JSON files. Include enough seeded records across multiple weeks/months and multiple suppliers/receivers to make filters, charts, ranking changes, badges, and comparisons meaningfully demonstrable. Label all seed records as simulated demo data where appropriate.

## 7. Interactivity

Implement the following where consistent with the existing application:

- Period selector updates KPI cards, leaderboard, and charts.
- Ranking metric selector reorders the leaderboard.
- Search filters suppliers by name.
- Category filter updates relevant metrics and charts.
- Clicking a supplier opens a profile/detail view.
- Chart tooltips or accessible textual summaries reveal values.
- Period-over-period change compares the selected period with the immediately preceding period of equal duration.
- Reset demo data restores the initial seeded state if mutable interactions are supported.
- All controls must work; do not add decorative controls with no effect.

## 8. Design and UX

Create a clean, modern, hackathon-quality interface consistent with FoodConnect's current visual identity.

- Preserve existing app styling and navigation where practical.
- Responsive desktop and mobile layouts.
- Clear visual hierarchy, readable typography, consistent spacing, and restrained use of colour.
- KPI cards with clear labels, values, and optional trends.
- Leaderboard should be visually engaging without making large suppliers the only visible success story; provide alternative ranking modes.
- Charts must have labels and not rely on colour alone.
- Use Lucide icons already installed in the project.
- Provide useful empty, loading, and error states.
- Make verified/demo, receiver-reported, and estimated metrics visually distinct.
- Add a short methodology/info section explaining metric definitions and meal-equivalent assumptions.
- Do not use fake live indicators or claim live external data when all data is seeded.
- Avoid excessive animation or decorative UI that makes the dashboard slower or harder to read.

## 9. Technical and integration requirements

- Inspect the current repository and reuse existing routes, layouts, components, styles, and dependencies.
- Do not rewrite authentication or unrelated workflows.
- Keep calculations in reusable service/helper functions, not scattered throughout JSX.
- Keep seed data separate from UI components.
- Use deterministic calculations so the same input data and filters produce the same results.
- Validate IDs, quantities, statuses, and dates; handle missing or malformed records safely.
- Avoid duplicate counting and invalid unit conversions.
- Do not expose private data in public views.
- If a backend API is appropriate for the current architecture, reuse it; otherwise use the existing local data conventions. Do not add a database.
- Add automated tests for aggregation, period filters, ranking, duplicate prevention, meal conversion, and beneficiary metric separation.
- Run the existing production build and relevant tests; fix failures caused by the implementation.
- Do not claim tests passed unless they were actually run.

## 10. Acceptance criteria

The dashboard is complete when:

1. All KPI cards are calculated dynamically from the seeded handover records.
2. Only completed and eligible/reconciled quantities count as redistributed food.
3. Period filters update all relevant metrics and visualizations consistently.
4. Leaderboard ranking works for each supported metric and has deterministic tie handling.
5. Supplier profiles show the correct filtered history, totals, trends, and record-derived badges.
6. Charts reflect the underlying data and handle empty periods without fabricating values.
7. Meal equivalents show the conversion assumption and are labelled estimates.
8. Beneficiary reports remain separate from estimated meal equivalents and are labelled by source and period.
9. No private supplier/receiver contact data or beneficiary identities are exposed.
10. All interactive controls work and are keyboard-accessible where practical.
11. The dashboard integrates into the existing FoodConnect application without breaking current role workflows.
12. The application builds successfully and the new calculations have automated tests.
13. The interface clearly identifies the dashboard as using seeded/simulated data.
14. A documented demo reset restores the initial state if mutable demo data is supported.

## 11. Build instruction

Implement the entire Smart Social-Impact Dashboard described in this document in one coherent build. First inspect the repository and existing README, then make the necessary integrated changes without asking the user to manually perform each implementation phase. Preserve existing features, use static/seeded data only, and do not add MongoDB or other databases. When finished, provide a concise summary of files changed, features implemented, how to run the app, tests/build results, and any limitations.
