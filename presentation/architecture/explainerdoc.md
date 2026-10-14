# FoodConnect architecture deck: slide explainer

This document explains what is on each slide of the technical architecture deck and why each
feature is designed the way it is. Use it to prepare the talk and to answer judges' questions.

The slides are in `presentation/architecture/slides/` (review images) and
`presentation/architecture/deck/slides/` (the animated HTML).

## How to read the deck

**Built or designed.** Every component carries a status:

- **Built** means it exists in the repository today. Built components are shown with a solid green
  chip, a solid border, or a solid green dot.
- **Designed** means it is part of the target architecture and is not in the code yet. Designed
  components are shown dashed.

Judges can check the repository, so the deck never presents a designed feature as working.

**Demo data.** Every operational number on the slides (the wedding buffet, the 26 kg handover, the
receiver counts) comes from the seeded demo records in `src/data.js` and `src/impactData.js`. These
numbers show how the system works. They are not measured real-world results, and the organisation
names in the demo are invented. Say this if anyone asks.

**Colour code.** The same colours mean the same thing on every slide:

| Colour | Meaning |
|---|---|
| Orange | Suppliers and surplus (kitchens, caterers, halls) |
| Green | Food moving to receivers; also "built" |
| Indigo | A step done by AI or a model |
| Amber | Time: the safety clock and deadlines |
| Red | Excluded or expired |
| Grey | External services and neutral parts |

### What is built today

| Component | Status | Where |
|---|---|---|
| Web app for suppliers, receivers and admins (React, Vite) | Built | `src/App.jsx` |
| Login and accounts (Node.js, Express, JWT, local JSON store) | Built | `server/index.js` |
| Organisation verification (Verified, Rejected, Suspended) | Built | README, admin role |
| 10 exclusion rules | Built | `src/matching.js`, `getExclusionReasons` |
| Rule-based score with 5 weighted factors | Built | `src/matching.js`, `matchingPolicy` in `src/data.js` |
| Listing, reservation, handover confirmation by both sides | Built | `src/App.jsx` |
| Impact dashboard (reconciled kg, meal estimate, data quality) | Built, on seeded data | `src/impactAnalytics.js` |
| Prevention engine (forecast, prep sheet) | Designed | – |
| WhatsApp intake, vision and speech models | Designed | – |
| Safety clock, cascade, tiered trust limits | Designed | – |
| MongoDB, waste report, city export | Designed | – |
| Scaling: multi-tenancy, sharding, shared cold-start model, vendor API | Designed | – |

**Before judges read the repo:** README "Future Improvements" item 5 still lists rule-based
matching as future work, but `src/matching.js` implements it. Update the README so the slide and
the repository agree.

---

## Slide 1: System overview

**Headline:** FoodConnect is three engines, prevention, redistribution and reporting, around one
record of every listing and its outcome.

**What is on it**

- **Channels** (left): the kitchen's costing software, WhatsApp, and the web app.
- **External services** (top): a weather API and vision and speech models.
- **The API** (centre, Node.js and Express) holds three engines:
  - Prevention: forecast and prep sheet.
  - Redistribution: AI intake, safety clock, 10 rules, rule score, handover, cascade.
  - Reporting: impact dashboard, waste report, city export.
- **The shared record** (dark strip): forecast, listing, reservation, handover, outcome. MongoDB is
  the target store; today the demo uses a JSON store and seeded data.
- **Report readers** (right): kitchens, CSR sponsors, city bodies.

**Why each part is there**

- **Three engines instead of one marketplace.** A plain listing marketplace has no answer to "how
  is this different from existing food rescue groups?" (revamp.md, Summary). Splitting the system
  this way makes the order of priorities visible:
  1. Prevent surplus.
  2. Move what remains.
  3. Prove both.

  Reducing waste at the source ranks above donating it (revamp.md 3.6).
- **One record per listing.** The forecast, the listing, the reservation, the handover and the
  outcome are linked in a single chain. This gives the system three things:
  - Every reported kilogram can be traced back to a handover (slide 4).
  - The forecast can learn from what actually happened (slide 2).
  - No listing disappears without an outcome (slide 5, cascade).
- **WhatsApp as a channel.** A tired manager at 11 pm will not fill a 10-field form, but will send
  a photo or a voice note (revamp.md 2.1). Nothing needs to be installed.
- **The costing software connector.** Kitchens adopt tools that save them money, not tools that
  add work. Reading production and waste data from software the kitchen already uses means no new
  workflow (user strategy notes: "no new hardware or workflow").
- **The web app stays.** It is what is built today, and it remains the fallback channel and the
  admin console.
- **Python and FastAPI for prevention.** The forecasting libraries (scikit-learn, LightGBM) are in
  Python. spec-short.md 5.1 already planned a Python FastAPI service; it is now used for demand
  forecasting instead of match prediction.
- **MongoDB as the target.** It is in the spec (spec-short.md 5.1). Today's demo keeps operational
  data in seeded frontend records and accounts in a JSON store (README), and the slide says so.

**Likely questions**

- *Why not one service?* The forecast runs as a nightly and on-booking batch job with Python
  dependencies. Matching and handovers are short, transactional API calls. Keeping them apart lets
  the forecast service fail or retrain without stopping redistribution.
- *What happens if WhatsApp is unavailable?* The web form is built and works as the fallback.

---

## Slide 2: Prevention engine

**Headline:** Each kitchen's own records forecast demand per dish, so it cooks less and the likely
leftover is matched before service ends.

**What is on it**

- **Inputs:** costing and inventory data (sales, production, waste), bookings and pledges (date,
  covers, menu), weather, and a festivals and exams calendar.
- **Forecast service:** four stages, Ingest, History, Forecast, Plan.
- **Demand curve:** a drawing, not data. The median is dashed, "Cook to here" sits at an upper
  quantile, and the shaded gap between them is the "likely leftover".
- **Model upgrade:** day one uses the weekday average × booked covers; a gradient-boosted quantile
  model replaces it once it wins.
- **Outputs:**
  - A prep sheet (a sample with bars and no numbers) that the manager accepts or overrides.
  - A pre-match of the likely leftover, using the built rule score.
  - A waste report showing kg not cooked and rupees saved.
- **Feedback loop:** what was served and what was left over update the history.

**Why each part is there**

- **Prevention as an engine.** Kitchens join for cost savings, not charity (user strategy notes).
  Over-production costs a kitchen money every day, so a tool that cuts it pays for itself.
  Redistribution then comes as a free side effect.
- **The kitchen's own records as training data.** This is the main technical defence. The earlier
  design trained a Random Forest on synthetic match labels, which only relearns the rule that made
  the labels (revamp.md 1.3). A demand forecast trains on the kitchen's real sales and waste
  history, which is real data from day one.
- **Baseline first, model later.** The weekday average × booked covers works with almost no
  history, is easy to explain, and gives the model something to beat. The learned model replaces
  it only when it beats the baseline on held-out weeks. This matches README Future Improvements
  item 6: evaluate ML only after suitable data exists, and keep a deterministic fallback.
- **Gradient-boosted trees with quantile loss.** They work well on small tabular datasets. They
  predict a chosen quantile directly (quantile loss in scikit-learn's GradientBoostingRegressor or
  LightGBM), so the result is a range and not just an average.
- **Cook to an upper quantile, not the median.** Running out of food costs a kitchen more than one
  leftover tray: unhappy customers, emergency cooking, lost trust. When the two costs are unequal,
  the best quantity sits above the median. This is the standard newsvendor result: the critical
  ratio is the cost of running short divided by the sum of both costs. Each kitchen's ratio sets
  its quantile; the slide shows no number because none has been measured.
- **Likely leftover goes to pre-match.** The gap between the cook line and the median is surplus
  the system expects before it exists. Matching it before service ends gives receivers a supply
  they can plan around, which is their reason to join (user strategy notes).
- **The manager accepts or overrides.** People trust a recommendation they can change. Overrides
  are recorded and become features, so the model learns when local knowledge beats it.
- **Guardrail: stock-outs must not rise.** Without this guardrail, "waste went down" could simply
  mean "customers went hungry". Tracking stock-outs alongside forecast error makes the savings
  claim credible.

**Likely questions**

- *What if a kitchen has no history?* The baseline needs only a few weeks of the same weekday plus
  booked covers. Campus mess halls also have fixed menu cycles and known headcounts.
- *Can the forecast be wrong on festival days?* Yes. That is why the calendar is an input, why the
  plan uses an upper quantile, and why the manager can override.
- *Why should anyone believe the kg not cooked?* See slide 4: prevention is measured against the
  baseline forecast, not against the kitchen's own claim.

---

## Slide 3: Intake, safety and matching

**Headline:** Kitchens report on WhatsApp in their own language, and fixed rules plus a weighted
score pick the receiver.

**What is on it**

Five stage cards, each ending with the followed example event (the seeded wedding buffet, `don-6`):

| Stage | Status | Example line |
|---|---|---|
| 1 Report: photo or voice note on WhatsApp (web form fallback) | Designed (web form built) | Photo, voice note |
| 2 AI intake: vision for quantity and category; speech for Telugu, Hindi and Urdu; the manager confirms | Designed | 70 meals, cooked, dairy |
| 3 Safety clock: from prep time, category and heat; expires the listing at zero | Designed | Ready 8:45 pm |
| 4 10 exclusion rules | Built | 8 receivers, 1 qualifies |
| 5 Rule score: demand 0.30, urgency 0.25, distance 0.20, quantity fit 0.15, reliability 0.10 | Built | Takes 40, 30 move on |

A bottom strip shows the effort for each person: the manager sends one message, the receiver
confirms pickup, nothing needs installing.

**Why each part is there**

- **WhatsApp and voice notes.** These answer the user-acceptance criterion directly. The surplus
  appears late at night, and the person reporting it is busy and tired (revamp.md 1.2, 2.1).
- **Telugu, Hindi and Urdu.** The first market is Hyderabad, where kitchen staff often speak these
  languages rather than English.
- **AI only at intake, and the manager confirms.** AI does useful work here, turning a photo or a
  voice note into structured fields. It never decides whether food is safe, and nothing goes live
  without a human tap (revamp.md 3.5).
- **A deterministic safety clock.** It is calculated from preparation time, food category and
  ambient temperature. It is explainable, needs no training data, and addresses donor fear (revamp
  3.3). The slide shows no hour limits because no project document gives them; set them from food
  safety guidance before quoting any.
- **The 10 exclusion rules** (built, `getExclusionReasons`). A receiver is excluded if:
  1. It is not verified and active.
  2. The donation is no longer available.
  3. It does not support the food category.
  4. It lacks the required storage.
  5. The dietary needs are incompatible.
  6. It has an allergen restriction that conflicts.
  7. It has no unmet demand.
  8. It has no remaining capacity.
  9. It cannot collect before the deadline.
  10. It is outside the 12 km radius.

  Hard rules come first so the score never ranks someone who cannot or should not receive the food.
- **A rule-based score, not ML ranking.** In practice only two or three receivers qualify (in the
  example, 1 of 8), so a learned ranker has little to rank. A weighted score is transparent: every
  ranking can be explained factor by factor (revamp.md 1.3). When a receiver has fewer than 3
  completed handovers, a neutral reliability value is used, so new receivers are not punished
  (`src/matching.js`).
- **The followed example.** It is the same wedding buffet used in the pitch deck, so the two decks
  tell one story. 40 of the 70 meals go to the one qualifying receiver, and the other 30 move down
  the cascade (slide 5).

**Likely questions**

- *Why not ML matching?* There is too little real outcome data, and synthetic labels prove nothing.
  A learned model is evaluated only once real handover outcomes exist, with the rules kept as the
  fallback (README item 6).
- *What if the AI misreads the photo?* The manager sees the draft and confirms or corrects it with
  one tap. The vision model only suggests quantity and category.

---

## Slide 4: Impact measurement and accountability

**Headline:** Impact counts only food both sides confirm at handover, so every kilogram traces back
to one record.

**What is on it**

- **A seeded handover record** (cooked meals):
  - 28 kg reserved, 27 kg collected, 26 kg received, so 26 kg is counted (the smallest).
  - Both sides confirm (built); tray photos (designed).
  - Timestamps: 10:20 am, 5:40 pm and 6:15 pm.
- **What counts** (built): only completed handovers. Disputed, cancelled, expired and pending
  records are struck out. Meals are estimated at 0.5 kg each.
- **Three reports**, fed from completed records only:
  - Kitchen waste report (designed).
  - Sponsor impact report (built).
  - City SDG export (designed), tagged SDG 12.3 and SDG 2.1.
- **Two methods:**
  - Redistributed = the smallest of reserved, collected and received (built).
  - Prevented = baseline forecast minus what was cooked (designed).

**Why each part is there**

- **Count the smallest of the three quantities** (`reconciledKg` in `src/impactAnalytics.js`).
  This is the most conservative figure: if 28 kg was reserved but 26 kg arrived, the report says
  26. It cannot overstate impact through a typo at one step.
- **Only completed handovers count.** A disputed, cancelled, expired or pending record does not
  count, and the dashboard reports how many of each were left out, so data quality is visible
  instead of hidden.
- **Both sides confirm.** One party alone cannot create impact. The supplier says it was collected,
  the receiver says it was received, and the smaller number wins.
- **Timestamps on every step.** They give an audit trail a sponsor or a city body can check, and
  show how long food took to move.
- **Meals are labelled as an estimate.** 0.5 kg per meal is an assumption (`impactConfig.kgPerMeal`),
  so the deck says "estimated". Beneficiary counts come only from receiver reports; with no report,
  the dashboard shows "Not reported" instead of inventing a number (Smart Dashboard spec).
- **Prevention is measured against the baseline forecast.** The counterfactual for "kg not cooked"
  is the system's own baseline, not the kitchen's word, and overrides are recorded. This makes the
  prevention figure checkable.
- **SDG 12.3 and SDG 2.1.** Target 12.3 is to halve food waste and reduce food losses. Target 2.1
  is access to safe, nutritious and sufficient food for all. The city export maps FoodConnect
  records to these indicators, which is what a municipality can use in its own reporting (source:
  sdgs.un.org/goals).

**Likely questions**

- *Can a kitchen inflate its numbers?* Redistribution needs the receiver's confirmation and counts
  the smaller figure. Prevention compares against a baseline the system computes from past records.
- *Are these real results?* No. The 26 kg record is seeded demo data. Real numbers come from the
  6 to 12 month proof phase (slide 6).

---

## Slide 5: Risk management and long-term viability

**Headline:** Each major risk has a control inside the system, and income does not depend on how
much food is wasted.

**What is on it**

- **A likelihood × impact matrix.** Six risks move from a dashed "before" position to a filled
  "after controls" position. The positions are the team's judgement, not data, and the caption
  says so.
- **Six risk rows,** each with its controls (built or designed).
- **A viability band:** no fleet and no hardware, three paying groups, and a drawn trend of surplus
  falling while income rises (a concept with no numbers).

**Why each control is there**

| Risk | Control | Why this control |
|---|---|---|
| 1 Unsafe food | Allergen and storage rules (built); safety clock expires the listing (designed) | Food safety is the highest-impact risk. Hard rules stop mismatches before ranking, and the clock removes the human judgement call at midnight. |
| 2 Kitchen runs short | Cook above the median; manager overrides (designed) | If prevention leaves customers hungry, kitchens will drop it. The upper quantile and the stock-out guardrail protect the kitchen first. |
| 3 Nobody collects | Pre-matched receiver (built score); waitlist, animal feed, biogas (designed) | Surplus appears when receivers are closed (revamp.md 1.2). Pre-matching books someone in advance, and the cascade gives every listing a recorded outcome instead of the bin (revamp.md 3.4). |
| 4 Fake or reselling receiver | Verified receivers only (built); limits rise with completed handovers (designed) | Verification is built into the first exclusion rule. Tiered limits mean a new organisation can only take small quantities until it has a track record (revamp.md 1.6). |
| 5 Low adoption | Runs inside the kitchen's costing software and WhatsApp (designed) | Nobody adopts this out of goodwill. Each user needs a selfish reason and almost no extra work (user strategy notes). This stays the largest risk after controls, and the matrix shows that honestly. |
| 6 Sales data leaks | Per-kitchen data; reports share totals only (designed) | Sales and waste figures are commercially sensitive. If kitchens fear competitors or the public will see them, they will not connect their software. |

**Why the business lasts**

- **Income comes from savings and reports, not from waste.** Kitchens pay for waste analytics,
  hosts pay a pledge package, and sponsors pay for verified CSR and ESG reports (revamp.md 1.5). As
  prevention works and surplus falls, the analytics become more valuable, not less. A model that
  earned money per kilogram donated would reward over-production (revamp.md 2.8).
- **Low running cost.** There is no delivery fleet (existing NGOs do the last mile) and no
  hardware (kitchens keep their own software). The main costs are hosting and WhatsApp messages.
- **Government comes later, as a scale lever.** City bodies join once there is data, as a pilot
  that costs them nothing (slide 6). The business does not depend on a procurement cycle.

**Not on the slide on purpose**

- Food-donor legal protection, 80G tax benefits, and public lookup of FSSAI or NGO registrations.
  These are unverified (revamp.md section 5). The FSSAI 2019 surplus food regulations exist and can
  be named, but do not claim what they protect against without reading them.

---

## Slide 6: Execution roadmap and resources

**Headline:** From campus kitchens to city bodies, each phase opens only when the one before it hits
its metric.

**What is on it**

Five columns, each showing who joins, why, what is built and the gate to the next phase:

| Column | Who | Why they join | Build | Gate to the next phase |
|---|---|---|---|---|
| Today (built) | Seeded web demo | – | React, Express, rule score | Pilot kitchen signs |
| 1 Wedge, months 0 to 6 | Campus mess halls | Cooks less, saves money | MongoDB, WhatsApp, costing connector, forecast baseline | Forecast beats baseline |
| 2 Proof, months 6 to 12 | Receiving NGOs | Free, steady supply | Waste and impact reports | Case study: kg, rupees, meals |
| 3 Clusters, after proof | Caterers, wedding halls | Pledge fee, ESG reports | Pledge, safety clock, cascade | Repeat pledges |
| 4 City bodies | GHMC, mid-day meals | SDG data, no cost | City export | Zero-cost pilot |

**Why this order**

- **Start small; do not start with government.** Government-first means long procurement cycles
  and a pitch with no data (user strategy notes).
- **Campus kitchens first.** Access is controlled, the dataset is captive (fixed menus, known
  headcounts) and there is no procurement barrier. The team's own restaurant costing system is an
  even stronger wedge, because a paying kitchen already records production and waste in it.
- **Build follows need.** Each phase builds only what its users need. The forecast baseline and the
  costing connector come first because prevention is the reason kitchens join. The pledge, safety
  clock and cascade come with caterers and halls, where large late-night surplus appears.
- **Proof before scale.** One credible case study (kg diverted, rupees saved, meals delivered) beats
  ten pitch decks. The proof phase exists to produce it. This also serves the "validation and
  evidence" criterion: the deck promises evidence from a pilot, not from assumptions.
- **Caterers before individual kitchens.** One caterer serves many events, so onboarding one
  caterer brings in more volume than onboarding one restaurant.
- **City bodies last.** GHMC, food safety authorities and mid-day meal or Anganwadi programmes get
  data they do not have and help with their SDG targets, at no cost. By then the project has
  results to show.
- **Gates name metrics, not targets.** No document sets target values, so the slide names the
  metric that opens each phase without inventing a threshold. Agree targets as a team if you want
  to state them.

**Open items for the team**

- Timing is given only for phases 1 and 2 (from the strategy notes). Phases 3 and 4 have no dates.
- Team size, cost per phase and gate targets are not in any document. Have answers ready, because
  "resource planning" is a judging criterion.

---

## Slide 7: Scaling strategy

**Headline:** Fill one city densely, reach kitchens through their software, then copy the city
playbook.

**What is on it**

Four levels drawn as a rising staircase. Each level has its tech changes (all designed), its main
lever, and a small drawing of kitchens (orange) and receivers (green) getting denser. A dark gate
box above each level names the result that opens it.

| Level | Opens when | Tech change | Lever |
|---|---|---|---|
| 1 Kitchen | Start: campus kitchens | Single tenant, baseline forecast | Team onboards by hand |
| 2 Cluster | Forecast beats baseline | Multi-tenant, costing connectors | One contract, many kitchens |
| 3 City | Chains pledge again | API scaled out, nightly forecast queue, handover events | Anchor NGOs vouch for receivers |
| 4 Cities | City is self-funding | Sharded by city, language packs, local clock settings | Copy the city playbook |

Below the staircase are three levers that apply at every level: a shared model for cold start, a
vendor API, and density first (the matching radius is 12 km). Last comes a "never" line: no fleet
of our own, no national launch, no government first.

Slide 6 shows the order in which people adopt. Slide 7 shows what breaks as volume grows and what
fixes each problem.

**Why each part is there**

- **Density first.** The built matching only considers receivers within 12 km
  (`matchingPolicy.maxDistanceKm` in `src/data.js`). Kitchens scattered across many cities would
  rarely find a qualifying receiver. A dense city means more matches and shorter pickups, and gives
  receivers a steady supply they can plan around.
- **Level 1, team onboards by hand.** At the start, manual onboarding is affordable and teaches the
  team what the connector and the playbook must automate later.
- **Level 2, one contract for many kitchens.** One caterer serves many events and one hostel chain
  runs many kitchens (user strategy notes), so the cost of onboarding is shared across all of them.
  Multi-tenancy (city → organisation → kitchen) lets one chain see all its kitchens while keeping
  each kitchen's data separate (slide 5, risk 6).
- **Costing connectors.** Each kitchen keeps working in software it already uses. Each connector is
  built once per software product, not once per kitchen.
- **Level 3, the API scales out.** The Node.js API holds no session state, so more instances can be
  added behind a load balancer as a city grows.
  - Forecasts run as a nightly batch queue, not as live requests. Thousands of kitchens then cost
    one overnight job, not constant compute.
  - Handover events feed reporting asynchronously, so a busy night of handovers does not slow the
    dashboards.
- **Anchor NGOs vouch for smaller receivers.** Verification is the admin bottleneck that grows with
  every new receiver. Letting an established NGO vouch for the groups it already works with, plus
  tiered limits, avoids hiring reviewers city by city (revamp.md 1.6).
- **Level 4, sharded by city.** Most queries stay inside one city (matching, reports), so splitting
  the database by city keeps each city's load and data separate. It also suits a city body that
  wants its own data export.
- **Language packs and local clock settings.** A new city needs speech intake in its own languages
  (for example Tamil or Kannada). It also needs safety-clock temperature inputs that match its
  climate. Both are settings, not new code.
- **The city playbook.** Every new city starts with the same four pieces: one anchor NGO, one
  caterer cluster, one municipal contact, and the language and climate settings. Copying a fixed
  playbook is cheaper and more predictable than inventing a launch each time.
- **Shared model for cold start.** A new kitchen has no history. One model trained across similar
  kitchens, with kitchen type, covers and menu as inputs, gives it a usable forecast on day one. The
  per-kitchen model takes over only once it beats the shared one, the same rule as slide 2's
  "baseline first".
- **Vendor API (a new idea, approved 2026-10-14).** Costing and POS software vendors embed the
  forecast through an API, and any kitchen on that software can switch prevention on without a sales
  visit. This answers "how do you reach thousands of kitchens without a sales team?". It also builds
  on the team's own costing system, which is the first such integration.
- **The gates.** Each level opens only on a result from the level before:
  - The forecast beats the baseline: prevention works.
  - Chains pledge again: customers come back.
  - The city is self-funding, meaning subscriptions and reports cover its running cost: growth will
    not burn money.

  As on slide 6, the gates name metrics without targets.
- **The "never" line.**
  - An own fleet adds the largest fixed cost; existing NGOs already do the last mile.
  - A national launch spreads density too thin.
  - Government first means long procurement cycles with no data to show (user strategy notes).

**Likely questions**

- *What breaks first as you grow?* Verification and onboarding, not servers. That is why the main
  levers are partners (chains, anchor NGOs, vendors) rather than infrastructure.
- *How do the costs grow?* Mostly with WhatsApp messages, vision and speech calls, and nightly
  forecast compute per kitchen. Kitchen subscriptions also grow per kitchen. No cost figures exist
  yet, so do not quote any.
- *Why would a software vendor integrate?* Waste savings are a feature its customers will pay for,
  and FoodConnect handles the forecast and the redistribution behind it. The commercial terms (fee
  or revenue share) are not decided.
- *When do you open a second city?* When the first is self-funding. No date is set.

---

## Sources

- Project documents: `README.md` (status of what is built), `revamp.md` (pitch repositioning and
  cuts), `spec-short.md` (target architecture), `FoodConnect_Smart_Dashboard_Spec.md` (impact
  metric rules).
- Code: `src/matching.js`, `src/impactAnalytics.js`, `src/data.js`, `src/impactData.js`.
- User strategy notes on adoption sequence and incentives, 2026-10-14 (recorded in
  `agent_guide.md` section 9).
- United Nations Sustainable Development Goals, targets 12.3 and 2.1: https://sdgs.un.org/goals
