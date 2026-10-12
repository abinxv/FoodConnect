# FoodConnect Feature Specification
## Explainable Food Matching Engine and Live Social-Impact Dashboard

**Project:** FoodConnect  
**Document type:** Feature specification  
**Status:** Proposed  
**Scope:** Add two connected features to the existing FoodConnect MVP  
**Primary goals:** Improve surplus-food allocation and make verified social impact measurable

---

## 1. Overview

FoodConnect connects surplus-food suppliers (such as restaurants and caterers) with receiver organizations (such as community kitchens, shelters, and food banks).

This specification defines two features:

1. **Explainable Food Matching Engine** — filters out infeasible matches, scores eligible receivers for a specific donation, explains the ranking, and supports a hybrid rules-plus-ML design.
2. **Live Social-Impact Dashboard** — presents platform-wide impact, supplier rankings, contribution trends, and carefully labelled meal-equivalent and beneficiary metrics.

These features must use the same authoritative donation, reservation, handover, and outcome records. Dashboard totals must be based on recorded outcomes, not manually entered display values or uncompleted listings.

### 1.1 Existing project context

The current FoodConnect MVP uses React, Vite, CSS, Lucide icons, Node.js, and Express. Its README states that donation, reservation, organization, and dashboard data are currently seeded browser state; authentication data is stored in a local JSON-backed API store. MongoDB, ML matching, route optimization, external maps, live GPS, and production-grade operational persistence are not yet implemented.

The implementation must account for these existing limitations rather than assuming that those systems already exist.

### 1.2 Goals

- Recommend suitable receivers for each donation using consistent, explainable criteria.
- Respect safety, storage, dietary, capacity, deadline, and organization-eligibility constraints.
- Keep a deterministic rule-based fallback if the ML model is unavailable.
- Track completed donations and their actual quantities.
- Show transparent, auditable social-impact metrics and supplier leaderboards.
- Capture outcome data that can support future ML training and evaluation.

### 1.3 Non-goals for the initial version

- Autonomous decisions that override food-safety or eligibility rules.
- Claims that synthetic ML data represents real-world performance.
- Claims that kilograms donated directly prove the number of unique people or children helped.
- Real-time GPS tracking or a full fleet-management system.
- Carbon-emissions savings unless a documented methodology and data source are added.
- Public exposure of sensitive receiver, supplier, or beneficiary information.

---

## 2. Roles and permissions

### Supplier
- Create and manage their own donation listings, subject to existing authorization rules.
- View recommended eligible receivers and matching explanations for their donations.
- View their own verified impact profile and contribution history.
- Cannot edit completed donation quantities or impact totals directly.

### Receiver
- Maintain demand, capacity, receiving hours, dietary restrictions, and storage capabilities.
- View relevant donation listings and accept or decline reservations.
- Confirm actual received quantities or report discrepancies.
- View public aggregate impact information without access to another organization's private operational data.

### Admin
- Verify, reject, or suspend organizations.
- Review disputes and donation records.
- Configure policy settings such as maximum matching distance and urgency windows.
- View audit events and data-quality warnings.
- Correct records only through an auditable correction process.
- View and manage ML model version, status, and fallback configuration.

### Public or leaderboard viewer
- View approved aggregate platform metrics and supplier leaderboard information.
- Cannot view private addresses, contact details, dietary details, beneficiary identities, or internal risk signals.

All permissions must be enforced by the server, not only by hiding frontend controls.

---

# Part A — Explainable Food Matching Engine

## 3. Feature summary

For every available donation, FoodConnect identifies receivers that can safely and practically accept it, calculates a match score for each eligible receiver, ranks the candidates, and presents the reasons for the ranking.

**Important design principle:** do not assign each receiver one permanent priority. Calculate a score for each **donation–receiver pair**, because suitability depends on the specific food, quantity, deadline, storage conditions, and location.

The matching engine must never allow a high score to override a failed safety or eligibility rule.

## 4. Inputs

### 4.1 Donation fields

At minimum, the engine needs:

- Donation ID and supplier organization ID
- Food category and description
- Available quantity and unit
- Preparation or availability timestamp, where applicable
- Collection deadline
- Storage and handling requirements
- Allergen information
- Dietary attributes, where relevant
- Supplier pickup location or approved geographic coordinates
- Current remaining quantity
- Donation status

### 4.2 Receiver fields

At minimum, the engine needs:

- Receiver organization ID and verification status
- Supported food categories
- Dietary restrictions or compatibility requirements
- Storage and handling capabilities
- Current unmet demand by food category
- Available capacity and remaining capacity
- Receiving hours and collection availability
- Approved location or coordinates
- Recent eligible pickup outcomes, if available
- Whether the organization is active and eligible to receive donations

### 4.3 Runtime inputs

- Current time
- Current available quantity
- Estimated road distance or travel time, when a routing provider is configured
- Current policy settings
- Model version and model availability

If reliable road distance is unavailable, the system must use an explicitly labelled fallback (for example, approximate straight-line distance) or omit distance-dependent matching. It must not present seeded distances as live routing estimates.

## 5. Matching pipeline

1. Load the donation and eligible receiver candidates.
2. Apply hard eligibility and safety rules.
3. Calculate normalized rule-based factor scores for each remaining candidate.
4. If the ML model is enabled and healthy, obtain a predicted probability of successful, on-time collection.
5. Calculate the final score and rank candidates.
6. Return the ranked list, factor scores, explanations, and model/fallback status.
7. Allow an authorized supplier or workflow to select a receiver, subject to reservation and capacity validation.
8. Revalidate quantity, eligibility, and deadline atomically when a reservation is committed.
9. Record the eventual outcome for monitoring and future model training.

## 6. Hard eligibility rules

A candidate must be excluded if any mandatory condition fails, including:

- Receiver organization is not verified, is suspended, or is otherwise ineligible.
- Required storage or handling capabilities are missing.
- Food is incompatible with a declared dietary or allergen restriction.
- Receiver has no relevant unmet demand, unless a documented policy allows general-purpose acceptance.
- Receiver capacity is exhausted.
- The receiver cannot collect within the allowed time window.
- Donation is cancelled, expired, unavailable, or has no remaining quantity.

The exact food-safety and eligibility policy must be documented and approved by project stakeholders. Do not encode unsupported food-safety claims as facts. If a required field is missing, apply a conservative policy: exclude the candidate or flag it for manual review rather than assuming compatibility.

## 7. Rule-based scoring algorithm

For every eligible donation–receiver pair, compute five normalized scores between 0 and 1.

### 7.1 Initial weights

| Factor | Symbol | Weight | Meaning |
|---|---:|---:|---|
| Unmet demand | D | 0.30 | How much relevant demand remains relative to the offered quantity |
| Urgency | U | 0.25 | How time-sensitive the receiver's need and donation collection are |
| Distance | R | 0.20 | How practical the journey is |
| Quantity fit | Q | 0.15 | How much of the offered quantity the receiver can accept |
| Reliability | H | 0.10 | Historical successful, on-time collection performance |
| **Total** | | **1.00** | |

These weights are initial configurable defaults, not proven optimal values. They must be evaluated against observed outcomes and can be changed by an authorized admin.

### 7.2 Unmet demand score (D)

Let:
- `unmet_demand_kg` be the receiver's remaining need for a compatible food category.
- `offered_quantity_kg` be the donation's current available quantity in kilograms.

For kilogram-based records:

`D = min(1, unmet_demand_kg / offered_quantity_kg)`

If units differ or cannot be safely converted, do not compare them directly; use a category-specific compatible unit or mark the factor unavailable.

Examples:
- Unmet demand 30 kg, donation 20 kg → `D = 1.0`
- Unmet demand 5 kg, donation 20 kg → `D = 0.25`

A receiver with zero unmet demand should normally be excluded by the eligibility filter.

### 7.3 Urgency score (U)

Urgency should reflect both the receiver's requested need-by time and the donation's collection deadline.

For a simple initial implementation, normalize each deadline into a value from 0 to 1 using configurable windows. For example:

- At or past the deadline: the match is infeasible and must be excluded.
- Deadline within the next hour: score close to 1.
- Deadline several hours away: lower urgency.
- Deadline outside the configured urgency window: score close to 0.

One possible function for remaining time `t` minutes and urgency window `T` minutes is:

`urgency_component = max(0, min(1, 1 - t / T))`

Compute receiver-need urgency and donation-collection urgency separately, then combine them using a documented policy, such as the maximum of the two. This makes the score increase as either deadline approaches. The values of `T` and the combination policy must be configurable and tested.

Never award a high urgency score to a candidate that cannot meet the deadline; feasibility is checked first.

### 7.4 Distance score (R)

When road distance `d_km` is available:

`R = max(0, 1 - d_km / max_distance_km)`

`max_distance_km` is a configurable threshold. A candidate beyond the threshold may be excluded, depending on policy.

Example with `max_distance_km = 20`:
- 4 km → `R = 0.80`
- 12 km → `R = 0.40`

Road distance or travel time is preferred over straight-line distance. If only approximate coordinates are available, label the distance as approximate. If location is missing, do not silently award a perfect score.

### 7.5 Quantity-fit score (Q)

This factor must be distinct from unmet demand. Define:

- `acceptable_quantity_kg = min(offered_quantity_kg, unmet_demand_kg, remaining_receiver_capacity_kg)`

Then:

`Q = acceptable_quantity_kg / offered_quantity_kg`

This measures the fraction of the donation that the receiver can accept. It avoids counting unmet demand twice in exactly the same way.

For a 20 kg donation where the receiver can accept 12 kg, `Q = 0.60`. The system may recommend a partial reservation if the business rules permit it.

### 7.6 Reliability score (H)

For a receiver with enough historical eligible pickups:

`H = successful_on_time_pickups / eligible_completed_or_due_pickups`

Define the denominator carefully and consistently. Do not count pending or not-yet-due pickups as failures. Use a minimum sample threshold; for new receivers, use a neutral configured default and show that reliability data is limited.

Reliability must not become a permanent barrier to new organizations. Monitor for unfair exclusion and allow admins to review suspicious or disputed records.

### 7.7 Rule score

`rule_score = 100 * (0.30*D + 0.25*U + 0.20*R + 0.15*Q + 0.10*H)`

The score is between 0 and 100 when all factor values are between 0 and 1.

If a factor is unavailable, the implementation must follow a documented policy: use a neutral value, renormalize the remaining weights, or fall back to manual review. Do not silently treat missing data as a perfect score.

## 8. Hybrid ML design

### 8.1 Recommended first ML model

Use **logistic regression** as the first supervised-learning baseline to predict the probability that an eligible donation–receiver match results in a successful, on-time collection.

Multiple linear regression is not the recommended first model because the primary target is a binary outcome (successful/on-time versus not). Linear regression can predict continuous values, such as collection duration, but it is not the natural baseline for a binary success probability.

Potential later comparisons:
- Random forest classifier for nonlinear feature interactions.
- A learning-to-rank model once enough correctly structured ranking data exists.

### 8.2 Label definition

Create one historical record per candidate donation–receiver match that was genuinely considered. Define the label consistently:

- `1`: the match was accepted and the donation was collected/received within the applicable deadline, according to verified records.
- `0`: the match failed according to a documented outcome policy, such as a confirmed missed pickup or unsuccessful allocation.

Do not automatically label every receiver who was not selected as a failed match. Such candidates may never have been offered the donation; this creates selection bias. Record candidate exposure and selection status separately.

### 8.3 Candidate features

Potential model features include:
- Normalized unmet demand
- Quantity-fit ratio
- Estimated road distance or travel time
- Time remaining until collection deadline
- Receiver receiving-hours compatibility
- Storage compatibility
- Relevant category compatibility
- Historical eligible on-time pickup rate
- Donation category and quantity
- Whether the match requires partial allocation

Hard safety and eligibility constraints must remain outside the model.

### 8.4 Hybrid final score

For eligible candidates, a configurable initial formula is:

`final_score = 0.70 * rule_score + 30 * predicted_success_probability`

Here:
- `rule_score` is from 0 to 100.
- `predicted_success_probability` is from 0 to 1.
- `final_score` is from 0 to 100.

This is a proposed starting point, not a validated optimum. Evaluate it against the rule-only baseline. Do not use the probability unless the model is available and has passed basic validation. If not, rank by `rule_score` and report `ranking_mode = "rules_fallback"`.

A probability must not be presented as a guarantee. Explain that it is a model estimate and show the model version or an appropriate UI disclosure.

### 8.5 Training and data limitations

- Begin with the rule-based algorithm even if there is no usable training data.
- Synthetic data may be used for development and a clearly labelled demonstration, not to claim real-world predictive performance.
- Store verified outcomes to build a future training set.
- Split training and test data in a way that avoids leakage, preferably using a time-based holdout when data volume permits.
- Evaluate class imbalance and calibration as well as basic accuracy.
- Compare against a simple baseline, such as rule-only ranking.
- Retrain only through a documented, repeatable process.
- Version model artifacts and retain a safe fallback.

### 8.6 Evaluation metrics

Track at minimum:
- Successful and on-time collection rate
- Precision/recall or ROC-AUC for classification, where appropriate to the dataset
- Probability calibration when probability estimates are displayed
- Top-k success rate or ranking quality when comparing ranked candidates
- Match coverage and number of eligible candidates
- Outcome differences for new versus established receivers

Do not claim that the model is superior until evaluation supports that conclusion.

## 9. Explanations and UI requirements

For each recommended receiver, show:
- Final score out of 100.
- Rule score and, if applicable, ML estimate.
- Approximate or road distance and its source/quality.
- Relevant unmet demand and quantity that can be accepted.
- Collection feasibility or time remaining.
- Storage/category compatibility status.
- Reliability history sample size or an indication that history is limited.
- Two or three concise positive reasons and any important caveats.

Example explanation:

> Recommended because the receiver has 25 kg of unmet demand, can safely store the food, is approximately 4 km away, and can collect before the deadline. Reliability history is limited.

Do not reveal private receiver data to unauthorized suppliers. Show only information necessary for the donation decision.

## 10. Allocation and reservation behaviour

Ranking is not the same as allocating the entire donation.

- Support partial reservations if enabled by policy.
- Do not allocate more than the donation's remaining quantity.
- Do not allocate more than the receiver's remaining capacity or relevant unmet demand.
- Recheck eligibility and available quantity at commit time.
- Use atomic database operations or transactions to prevent double reservation.
- If a top-ranked receiver declines or times out, offer the next eligible candidate or recalculate the ranking.
- Record the reason for failed or cancelled matches.
- Ensure simultaneous reservation attempts cannot oversubscribe a donation.

## 11. Matching API proposal

Paths are illustrative and should be adapted to existing server conventions.

### `POST /api/matching/donations/:donationId/recommendations`

Purpose: return ranked eligible receivers for a donation.

Example response:

```json
{
  "donationId": "donation_123",
  "rankingMode": "hybrid",
  "modelVersion": "logistic-regression-v1",
  "candidates": [
    {
      "receiverId": "receiver_456",
      "ruleScore": 92.0,
      "predictedSuccessProbability": 0.91,
      "finalScore": 91.7,
      "factors": {
        "unmetDemand": 1.0,
        "urgency": 0.8,
        "distance": 0.8,
        "quantityFit": 1.0,
        "reliability": 0.9
      },
      "reasons": [
        "High unmet demand",
        "Can collect before the deadline",
        "Storage requirements are compatible"
      ],
      "distanceKm": 4.0,
      "distanceType": "road_estimate"
    }
  ]
}
```

All example values are illustrative. Validate the caller's role and ownership before returning results. Never trust client-submitted factor scores or final scores.

### Other suggested endpoints

- `POST /api/reservations` — create a reservation with server-side validation and atomic quantity enforcement.
- `POST /api/reservations/:id/confirm-pickup` — record pickup/handover evidence and actual quantity.
- `POST /api/reservations/:id/report-discrepancy` — record a discrepancy for review.
- `GET /api/matching/health` — admin/internal health status for the ML service and fallback mode, if needed.

---

# Part B — Live Social-Impact Dashboard

## 12. Feature summary

The dashboard communicates FoodConnect's measured contribution to surplus-food redistribution. It includes platform-wide KPIs, supplier leaderboard rankings, trends over time, and meal-equivalent or beneficiary statistics where the underlying evidence supports them.

**Core rule:** count completed and verified redistribution, not merely listed or reserved food.

## 13. Dashboard audiences

### Public or landing-page dashboard
- Platform-wide aggregate metrics.
- Supplier leaderboard for organizations that have opted into public recognition or are covered by a clear publication policy.
- Trends by period.
- No private contact, address, receiver demand, or beneficiary information.

### Supplier dashboard
- Supplier's own contribution totals and history.
- Current and previous period comparisons.
- Completed donation details visible to that supplier.
- Their leaderboard position and badges, if public ranking is enabled.

### Receiver dashboard
- Food received and accepted quantities.
- Donation history.
- Recorded service/beneficiary counts, if the receiver reports them.
- No unauthorized access to other receivers' private records.

### Admin dashboard
- Platform-wide and organization-level metrics.
- Data-quality flags and discrepancies.
- Donation states and audit history.
- Ability to correct erroneous records using an auditable process.

## 14. KPI definitions

All KPIs must have a written definition and use consistent units and date filters.

### 14.1 Food redistributed (kg)

Primary measure:

`redistributed_kg = sum(actual_received_quantity_kg for eligible completed donations)`

Rules:
- Use actual received quantity, not listed quantity.
- Do not count cancelled, expired, or merely reserved donations.
- Exclude unresolved disputed records from verified totals, or clearly mark them as provisional.
- Convert units only using documented, valid conversion factors.
- Prevent duplicate counting across partial reservations or multiple handovers.

If the supplier's collected amount differs from the receiver's confirmed received amount, use a documented reconciliation policy. For public verified impact, a conservative approach is to count the reconciled quantity, generally not exceeding the amount both parties confirm.

### 14.2 Completed donations

Count distinct donation-to-receiver handovers that satisfy the completion policy. Define how partial reservations and multiple receivers are counted. A single donation split across multiple receivers must not accidentally be counted as several original donations when the dashboard claims unique donation listings.

Recommended fields:
- `donation_count` for unique original listings completed at least once.
- `handover_count` for completed supplier-to-receiver transfers.

Use the metric name that corresponds to the actual calculation.

### 14.3 Meal equivalents

Optional estimate:

`estimated_meal_equivalents = redistributed_kg / kg_per_meal`

Requirements:
- The `kg_per_meal` conversion factor must be configurable and documented.
- Display the assumption in the UI (for example, "estimated using 0.5 kg per meal equivalent").
- Prefer food-category-specific conversion factors if a defensible methodology is available.
- Label the result as an estimate, not a count of meals served.
- Do not imply nutritional adequacy from weight alone.

### 14.4 People or children helped

Do not infer unique beneficiaries directly from kilograms or meal equivalents.

Use one of these separately labelled measures:
- `reported_people_served`: beneficiary counts reported by receivers for a defined period.
- `reported_children_served`: reported child beneficiary counts, only where the receiver can reliably provide them and the platform has a valid reason to collect them.
- `estimated_meal_equivalents`: a calculated food-weight proxy, never presented as a unique-person count.

Requirements:
- Define whether the count represents unique people, visits, or service instances.
- Do not sum overlapping reports across multiple receivers as unique people unless deduplication is actually possible and lawful.
- Avoid collecting children's personal data or publishing identifiable beneficiary information.
- Display source and reporting period, for example, "reported by receiver organizations for September."

### 14.5 Active suppliers and receivers

Define "active" explicitly, such as an organization with at least one completed handover in the selected period. Do not count merely registered organizations as active donors or recipients.

### 14.6 Success rate

One possible definition:

`success_rate = completed eligible handovers / all eligible handovers due in the selected period * 100`

Define how cancellations, supplier-caused failures, receiver-caused failures, and unresolved disputes are treated. Exclude pending handovers that are not yet due. Show the definition in documentation and use the same rule throughout the product.

### 14.7 Food expired or uncollected

Track food that reached its deadline without a successful handover, if reliably recorded. Distinguish:
- Expired or uncollected on the platform
- Confirmed discarded food, if actually reported
- Food successfully redistributed elsewhere outside FoodConnect, if known

Do not claim that every uncollected listing was wasted; the platform may not know what happened to it.

## 15. Supplier leaderboard

### 15.1 Default leaderboard

Columns:
- Rank
- Supplier organization name
- Verification indicator
- Redistributed kilograms
- Completed handovers or donations, with the metric named precisely
- Estimated meal equivalents (optional)
- Completion rate (optional, with minimum sample policy)
- Period-over-period change

Default ranking: total verified kilograms redistributed in the selected period.

### 15.2 Fairness and alternative rankings

Large suppliers naturally contribute more volume. Offer separate ranking categories rather than using a single composite score:
- **Most food redistributed** — total verified kilograms.
- **Most completed handovers** — completed transfer count.
- **Most consistent contributor** — active contribution across multiple periods, using a transparent definition.
- **Best completion rate** — only after a minimum number of eligible handovers.
- **New contributor milestone** — e.g. first verified 100 kg.

Avoid rewarding organizations for listing quantities that were not actually handed over. Avoid public rankings based on private receiver demand or unverified estimates.

### 15.3 Badges

Optional badges must have transparent, testable criteria. Examples:
- First verified 100 kg
- 10 completed handovers
- Consistent contributor for three consecutive months
- High completion rate, subject to a minimum sample size

Store or calculate badges from underlying verified records. Do not allow organizations to self-award badges.

## 16. Trend and analytics views

Provide:
- Weekly and monthly redistributed kilograms.
- Completed handovers over time.
- Number of active suppliers and receivers over time.
- Donation completion rate trend.
- Breakdown by food category.
- Supplier contribution trend.
- Optional meal-equivalent trend with its conversion assumption.
- Optional receiver-reported service counts with reporting period and source.

Filters:
- Last 7 days
- Last 30 days
- Last 3 months
- Current year
- All time
- Food category
- Supplier, for authorized views
- Area/locality, only if geographic data is available and privacy policy permits it

Use consistent timezone and period-boundary rules. Empty periods should return zero or no data consistently; do not fabricate trend values.

## 17. Dashboard UI layout

### Top summary cards
1. Verified food redistributed (kg)
2. Estimated meal equivalents, with assumption
3. Completed handovers
4. Active suppliers
5. Active receivers

### Main content
- Trend chart: redistributed kilograms per week/month.
- Supplier leaderboard with period selector.
- Category distribution chart.
- Completion-rate trend.
- Optional beneficiary-reporting section, clearly separated from estimated meals.

### Detail views
- Supplier profile with contribution history and badges.
- Donation-level drill-down for authorized users.
- Admin data-quality and discrepancy panel.

### UI and accessibility
- Responsive layout for desktop and mobile.
- Accessible chart labels and non-colour-only indicators.
- Loading, empty, and error states.
- Clear distinction between verified, reported, and estimated metrics.
- No hard-coded demo metrics in production views.

## 18. Dashboard API proposal

Paths are illustrative and should be adapted to existing server conventions.

### `GET /api/impact/summary`

Optional query parameters:
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `category=<category>`

Example response:

```json
{
  "period": {
    "from": "2026-09-01",
    "to": "2026-09-30"
  },
  "foodRedistributedKg": 2450,
  "estimatedMealEquivalents": 4900,
  "mealConversionKg": 0.5,
  "completedDonationListings": 64,
  "completedHandovers": 78,
  "activeSuppliers": 38,
  "activeReceivers": 21,
  "metricStatus": "illustrative"
}
```

This example is illustrative and must not be used as real project data. Production responses must calculate values from persisted records and label whether values are verified, reported, or estimated.

### `GET /api/impact/leaderboard`

Optional query parameters:
- `period=7d|30d|3m|year|all`
- `metric=redistributed_kg|handovers|completion_rate`
- `limit=<integer>`

Example response:

```json
{
  "period": "30d",
  "metric": "redistributed_kg",
  "entries": [
    {
      "rank": 1,
      "supplierId": "supplier_123",
      "displayName": "Supplier A",
      "verifiedKg": 420,
      "completedHandovers": 18,
      "estimatedMealEquivalents": 840
    }
  ]
}
```

### `GET /api/impact/trends`

Optional query parameters:
- `from`
- `to`
- `granularity=day|week|month`
- `category`

Return dated buckets with verified redistributed kilograms, completed handovers, and any other supported metric. Do not return invented data for missing periods.

### `GET /api/impact/suppliers/:supplierId`

Return public-safe aggregate information for the supplier's profile. Private detail endpoints must enforce ownership or admin permissions.

### `POST /api/impact/beneficiary-reports`

If beneficiary reporting is enabled, accept aggregate reports from authorized receiver organizations. Validate non-negative counts, reporting period, metric definition, and duplicate submissions. Keep these reports distinct from weight-derived meal estimates.

---

# Part C — Data Model and Integration

## 19. Suggested data entities

Adapt these to the project's actual database schema; do not create duplicate sources of truth.

### Donation
- `id`
- `supplierId`
- `foodCategory`
- `offeredQuantity`
- `unit`
- `remainingQuantity`
- `availableAt`
- `collectionDeadline`
- `storageRequirements`
- `allergens`
- `status`
- `createdAt`
- `updatedAt`

### Receiver profile
- `organizationId`
- `verificationStatus`
- `supportedCategories`
- `dietaryRestrictions`
- `storageCapabilities`
- `demandByCategory`
- `capacityByCategory`
- `receivingHours`
- `location`
- `updatedAt`

### Match recommendation
- `id`
- `donationId`
- `receiverId`
- `ruleScore`
- `predictedSuccessProbability` (nullable)
- `finalScore`
- `factorScores`
- `reasons`
- `rankingMode`
- `modelVersion` (nullable)
- `createdAt`
- `selectedAt` (nullable)

### Reservation or handover
- `id`
- `donationId`
- `supplierId`
- `receiverId`
- `reservedQuantity`
- `collectedQuantity` (nullable)
- `receivedQuantity` (nullable)
- `status`
- `reservedAt`
- `collectedAt` (nullable)
- `receivedAt` (nullable)
- `outcomeReason` (nullable)
- `disputeStatus` (nullable)

### Beneficiary report (optional)
- `id`
- `receiverId`
- `periodStart`
- `periodEnd`
- `metricType` (e.g. people served, children served, service instances)
- `count`
- `reportingMethod`
- `verificationStatus`
- `submittedAt`
- `reviewedAt` (nullable)

### Audit event
- `id`
- `actorOrganizationId` or authorized user ID
- `entityType`
- `entityId`
- `action`
- `before` and `after` values, where appropriate and safe
- `reason`
- `timestamp`

## 20. Data integrity requirements

- Store operational data in a persistent database; MongoDB is compatible with the project's proposed direction.
- Use a canonical source of truth for quantities and outcomes.
- Use explicit units and validated conversions.
- Prevent duplicate completion events and duplicate impact aggregation.
- Record changes to received quantities and outcomes in an audit trail.
- Reconcile supplier and receiver confirmations where they disagree.
- Use server-side authorization for every protected endpoint.
- Use atomic reservation updates or transactions.
- Calculate dashboard metrics on the server or in a trusted aggregation layer, not from client-provided totals.
- Cache public aggregates if necessary, but invalidate or refresh them when verified outcomes change.
- Do not store unnecessary personal or beneficiary data.

---

# Part D — Security, Privacy, and Reliability

## 21. Security requirements

- Authenticate protected API calls.
- Enforce role-based access and organization ownership on the server.
- Validate all request bodies, path parameters, filters, and pagination values.
- Restrict public leaderboard fields to approved, non-sensitive attributes.
- Rate-limit public analytics endpoints where appropriate.
- Never expose secrets, internal model files, private addresses, or raw audit data in public APIs.
- Keep model inference server-side; clients must not submit authoritative final scores.
- Record administrative changes and corrections.
- Use environment variables for secrets and document safe local setup.

## 22. Privacy and responsible metrics

- Obtain appropriate permission before publicly ranking named suppliers.
- Do not expose receiver-specific demand or operational vulnerabilities.
- Collect aggregate beneficiary information only where necessary and appropriately authorized.
- Do not collect children's names, contact details, photos, or other identifiable details for this dashboard.
- Clearly distinguish verified quantities, receiver-reported beneficiary counts, and calculated estimates.
- Do not claim unique people helped unless unique people are reliably measured without inappropriate data collection.
- Document metric assumptions and limitations directly in the UI or an accessible methodology page.

## 23. Failure handling

### Matching engine
- If ML inference fails, use rule-only ranking.
- If distance is unavailable, label the fallback and apply documented scoring behaviour.
- If no candidates qualify, return an explicit no-eligible-receiver result with safe, non-sensitive reasons.
- If the donation changes after ranking, recalculate and revalidate before reservation.
- Log errors without leaking sensitive information.

### Dashboard
- Show loading, empty, and error states.
- Do not replace API errors with plausible-looking fabricated totals.
- If some metrics are unavailable, show the available metrics and explain what is missing.
- Keep previously cached aggregates labelled with their last-updated time if caching is implemented.
- Do not count unresolved or duplicate records as verified impact.

---

# Part E — Testing and Acceptance Criteria

## 24. Matching tests

1. A suspended or unverified receiver is excluded.
2. A receiver lacking required storage is excluded.
3. An allergen or dietary incompatibility is excluded according to policy.
4. A receiver with no remaining capacity is excluded.
5. An infeasible collection deadline excludes the candidate.
6. Higher unmet demand increases the demand score when other inputs are equal.
7. Shorter distance increases the distance score when other inputs are equal.
8. Quantity fit correctly measures the acceptible share of the donation.
9. New receivers are not assigned zero reliability solely because they lack history.
10. Missing factor data follows the documented fallback policy.
11. The final rule score is within 0–100.
12. ML probability is used only when the model is enabled and healthy.
13. ML failure triggers deterministic rule-only fallback.
14. Explanations agree with actual factor scores and eligibility checks.
15. A declined match can be replaced by another eligible candidate.
16. Concurrent reservation attempts cannot exceed available quantity.
17. A donation cannot be completed twice for the same handover.
18. Recommendations are revalidated after material donation or receiver changes.

## 25. Dashboard tests

1. A completed verified handover contributes the reconciled received quantity to the relevant totals.
2. A merely listed or reserved donation does not count as redistributed food.
3. Cancelled and expired donations do not count as successful handovers.
4. Duplicate completion events do not inflate totals.
5. Partial handovers count only the actual verified quantities.
6. Supplier leaderboard order matches the selected metric and date range.
7. Weekly/monthly trends use consistent time boundaries.
8. Meal equivalents use the documented conversion factor and are labelled estimated.
9. Beneficiary reports remain distinct from meal-equivalent estimates.
10. Unresolved discrepancies are excluded from verified totals or clearly marked provisional.
11. Public responses do not expose private addresses, contacts, demand, or beneficiary identities.
12. Empty periods and API failures display honest empty/error states.
13. Supplier profile metrics agree with platform aggregates under the same filters.
14. Corrections update totals without duplicate counting and leave an audit record.

## 26. Definition of done

The features are ready for the hackathon demo when:

- Matching produces a ranked list of eligible receivers with understandable explanations.
- The score is reproducible for fixed inputs and policy settings.
- The rule-only fallback works when ML is disabled or unavailable.
- Any displayed ML estimate is clearly identified as a model estimate.
- A supplier can complete a donation flow without violating capacity or authorization rules.
- Completed handovers persist and can be audited.
- The dashboard and leaderboard are calculated from persisted records.
- Every headline metric has a written definition and source.
- Meal equivalents are labelled estimates with a visible conversion assumption.
- Beneficiary metrics are reported separately and do not claim unsupported unique-person counts.
- Public and organization-specific permissions are tested.
- The demo dataset and any synthetic ML data are clearly labelled.
- The demo can be reset to a known state.

---

# Part F — Phased Implementation Plan

## Phase 1: Data foundation

- Move donations, receiver profiles, reservations, handovers, and audit events to persistent storage.
- Add actual collected and received quantities.
- Enforce server-side authorization and atomic reservation rules.
- Define donation states and metric definitions.
- Seed a deterministic demonstration dataset.

**Exit condition:** operational records persist, quantities are consistent, and completed handovers can be trusted.

## Phase 2: Rule-based matching

- Implement hard eligibility filters.
- Implement configurable factor weights and normalized scores.
- Add ranking explanations.
- Add unit and integration tests.
- Build the UI for recommended receivers and alternative matches.

**Exit condition:** matching works without ML and produces reproducible, explainable rankings.

## Phase 3: Impact dashboard

- Implement server-side summary aggregation.
- Add supplier leaderboard and period filters.
- Add weekly/monthly trends and category breakdowns.
- Add meal-equivalent calculations with a visible assumption.
- Add privacy-safe supplier profiles and data-quality indicators.

**Exit condition:** dashboard totals reconcile with completed handover records and are not hard-coded.

## Phase 4: ML-assisted ranking

- Collect and validate candidate-match outcome data.
- Establish a rule-only baseline.
- Train logistic regression using a documented pipeline.
- Evaluate with a suitable held-out dataset.
- Add model versioning, inference validation, and fallback.
- Display ML output only when the model has passed basic evaluation.
- Clearly label synthetic-data demonstrations.

**Exit condition:** ML inference is reproducible, evaluated against the baseline, and never overrides hard eligibility rules.

## Phase 5: Demo polish and evaluation

- Add badges and comparison views.
- Add realistic success and failure scenarios.
- Verify metrics against a known dataset.
- Test concurrent reservations, API failures, and authorization boundaries.
- Prepare a short demonstration explaining the matching factors, model limitations, and measured impact.

**Exit condition:** the team can demonstrate the full donation lifecycle and explain how every recommendation and impact number is derived.

---

## 27. Final architectural recommendation

Keep the implementation simple enough to finish and test:

- **React frontend:** matching recommendations, explanations, impact cards, charts, filters, and leaderboard.
- **Node.js/Express API:** authentication, authorization, donation lifecycle, reservations, impact aggregation, and matching orchestration.
- **MongoDB:** persistent organizations, donations, reservations, handovers, audit events, and match outcomes.
- **Python ML service:** logistic-regression inference and model metadata, introduced after the rule-based version works.
- **Routing provider:** optional source of road distance/travel-time data; do not claim live route estimates without it.

The matching algorithm should start with deterministic rules, then add an evaluated ML probability. The dashboard should start with verified kilograms and completed handovers, then add clearly labelled estimates and receiver-reported beneficiary metrics.

This gives FoodConnect a credible path from a working MVP to an explainable food-allocation system with measurable social impact.
