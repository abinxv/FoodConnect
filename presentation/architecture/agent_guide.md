# Agent guide: FoodConnect architecture deck

Read this whole file before touching anything. deck.config.yaml holds the settings; this file holds
the decisions, the plan, the facts and how the user likes to work. If the two disagree, the newer
dated decision in section 2 wins.

ROOT for this deck is `presentation/architecture/` (user, 2026-10-14). It is a sister deck of the
pitch deck in `presentation/` and reuses its approved look; read `../agent_guide.md` sections 3, 4
and 9 for the shared visual system, writing rules and data gotchas. The project docs are in the repo
root, two levels up (`../../`).

## 0. Status

| Slide | Section | Criterion | Status | Review PNG |
|---|---|---|---|---|
| s1 | System overview | 6 Presentation | awaiting review (2026-10-14, set) | slides/s1.png |
| s2 | Prevention engine (pilot) | 3, 6 | approved 2026-10-14 | slides/s2.png |
| s3 | Intake, safety and matching | 2 User acceptance | awaiting review (2026-10-14, set) | slides/s3.png |
| s4 | Impact measurement and accountability | 4 Impact | awaiting review (2026-10-14, set) | slides/s4.png |
| s5 | Risk management and long-term viability | 5 Risk | approved 2026-10-14 ("proceed") | slides/s5.png |
| s6 | Execution roadmap and resources | 3 Roadmap (plus 1 and 2 as phase gates) | approved 2026-10-14 ("proceed on all slides") | slides/s6.png |
| s7 | Scaling strategy | 5 viability, 3 deployment | awaiting review (2026-10-14) | slides/s7.png |

Plan: revised 2026-10-14 so that each slide answers one evaluation criterion (section 6). The user
asked for the risk slide next, so s5 was built out of order.

Next step: the user reviews s1, s3, s4 and s7. Then PDF assembly only when asked (step 8:
venv with pillow / pymupdf, build_deck.py, render the PDF back to PNGs and look at every page).
Checks on the whole set (2026-10-14): export --all reports no layout problems; lint ok on all six
(s2 120, s3 119, s4 119, s5 120, s6 118 words; s1 102); a live run in Chrome (`?live=1`) showed every
slide's animations running and no console errors.

## 1. What we are making

- A technical architecture deck for FoodConnect, for technical judges at the ideathon. Seven slides (s7 added 2026-10-14),
  animated HTML in the browser plus a PDF backup. Canvas 1920x1080, method simple.
- Source of the prevention engine design: the user's strategy notes of 2026-10-14 (in chat; summary
  in section 9): predict over-production in kitchens, caterers and canteens from sales, weather and
  event data, cut surplus before it exists, auto-list what remains. Sold to kitchens as cost saving.
- The user also has a separate restaurant costing and inventory system; it is the planned data
  source and first wedge for the prevention engine.

## 2. Decisions (do not re-ask)

| Date | Question | Answer |
|---|---|---|
| 2026-10-14 | Where the deck lives | New folder presentation/architecture/, same look as the pitch deck |
| 2026-10-14 | Built vs designed | Mark every component with a `chip-built` or `chip-design` tag (unlike the pitch deck) |
| 2026-10-14 | Forecasting approach | Baseline first (weekday average x booked covers), then a per-kitchen gradient-boosted quantile model once it beats the baseline on held-out weeks |
| 2026-10-14 | Audience and length | Technical judges, about 6 slides |
| 2026-10-14 | Look | Copied from the pitch deck: tokens.css (direction A), base.css, lib/art.js, lib/deck.js, Inter. No new style board |
| 2026-10-14 | Word budget | 80 to 120 per slide (technical audience, a little denser than the pitch) |
| 2026-10-14 | Pilot s2 approved ("go ahead"): locks | 120 words; lede 44 px over two lines; one status chip per component (built / designed) or status dots (solid green built, dashed grey designed) in lists; concept drawings (curves, bars) carry no numbers; sample cards tagged "sample" |
| 2026-10-14 | Plan structure | Map the slides to the six evaluation criteria (below) |
| 2026-10-14 | Scaling strategy | New slide s7 after the roadmap (deck now 7 slides), levels table covering technical and operational scaling; include the vendor API channel (new idea, accepted); matching section in explainerdoc.md |
| 2026-10-14 | Review cadence | "Proceed on all slides": s1, s3, s4 built as a set without stopping; self-check each and show the set |

Evaluation criteria (from the user's screenshot, 2026-10-14):
1. Validation and evidence: credibility of research, data and stakeholder feedback.
2. User acceptance and participation: are people interested and willing to use it.
3. Execution roadmap and resource planning: timeline, resources, milestones, deployment plan.
4. Impact measurement and accountability: measurable outcomes and how the SDG impact is verified.
5. Risk management and long-term viability: risks, mitigations, sustainability over time.
6. Presentation and Q&A: clarity, confidence, depth, defending the idea under questions.

## 3. Writing rules

All of `../agent_guide.md` section 3 apply, with these changes for this deck:
- Status is shown, not hidden: "built" (in the repo today, per README.md) or "designed" (target
  architecture). The pitch deck's "present everything as built" rule does NOT apply here.
- AI and models may be claimed in two places: intake (vision, speech) and the demand forecast. The
  forecast trains on each kitchen's own real records, never on synthetic labels. Matching stays "a
  rule-based score"; never claim ML-ranked matching.
- No invented numbers. Sample cards (prep sheet) carry the "sample" tag and show bars, not figures.

## 4. Visual system

Same tokens and colour code as the pitch deck (`../agent_guide.md` section 4): orange supplier and
surplus, green food to a receiver, amber the clock, indigo an AI or model step, red expired, grey
external or neutral. Additions in `deck/styles/base.css` (architecture deck additions):
- `.chip-built` solid green, `.chip-design` dashed grey.
- Service boxes: a large panel with an indigo border for a model service, numbered stage nodes inside.

## 5. Geometry

Canvas 1920x1080, zone 88 / 72 px margins (scaffold defaults), no template chrome.

## 6. Slide plan (revised 2026-10-14 around the evaluation criteria; draft leads except s2, s5)

| # | Section | Criterion | Lead idea | Main visual | Status tags |
|---|---|---|---|---|---|
| s1 | System overview | 6 | FoodConnect is three engines, prevention, redistribution and reporting, around one record of every listing and its outcome. | Block diagram, three engines and the data layer, tokens circulating | mixed |
| s2 | Prevention engine | 3, 6 | Each kitchen's own records forecast demand per dish, so it cooks less and the likely leftover is matched before service ends. | Inputs, forecast service with demand curve, outputs, feedback loop | designed; pre-match score built |
| s3 | Intake, safety and matching | 2 | Kitchens report on WhatsApp in their own language and change nothing else, while ten exclusion rules and a five-factor score pick the receiver. | Channel adapters, vision / speech, exclusion filter, score bars, safety clock | rules and score built; WhatsApp, AI and clock designed |
| s4 | Impact measurement and accountability | 4 | Impact counts only food confirmed by both sides at handover, so every kilogram on a report traces to a record. | Outcome record at the centre feeding the kitchen waste report, the CSR report and SDG 12.3 / SDG 2 indicators | dashboard built on seeded data |
| s5 | Risk management and long-term viability | 5 | Each major risk has a control inside the system, and income does not depend on how much food is wasted. | Risk matrix, before and after controls; risk and control rows; viability band | per control |
| s6 | Execution roadmap and resources | 3 (1, 2) | Four phases, campus kitchens, proof, caterers and halls, then city bodies, each opened by a metric from the one before. | Timeline with a metric gate per phase; built vs target stack; team and cost per phase | mixed |

Criteria 1 and 2 are mainly the pitch deck's job; this deck covers them through s3 (no new
workflow) and the s6 phase gates (pilot numbers as validation). No stakeholder quotes exist yet
(pitch deck decision); do not invent any.

## 7. Slides as built

### s7 (awaiting review, 2026-10-14)
- File: `deck/slides/s7.html`. 114 words. Label chip "designed".
- Lede: "Fill one city densely, reach kitchens through their software, then copy the city playbook."
- Four level cards rising as a staircase (heights 330 / 380 / 430 / 480 px), lighting in turn (10 s,
  2.5 s apart): 1 Kitchen (single tenant, baseline forecast; team onboards by hand), 2 Cluster
  (multi-tenant, costing connectors; one contract, many kitchens), 3 City (API scaled out, nightly
  forecast queue, handover events; anchor NGOs vouch for receivers), 4 Cities (sharded by city,
  language packs, local clock settings; copy the city playbook). Tech / Lever row labels appear on
  card 1 only. Dark gate boxes above each card with marching arrows between them: Start campus
  kitchens; forecast beats baseline; chains pledge again; city is self-funding. Each card ends with
  a drawn density network (orange kitchens, green receivers; seeded pseudo-random, drawn after
  layout in `drawNets()`): one pair, a caterer hub, a city in a dashed ring, three linked cities.
- Bottom: three levers (shared model for cold start; vendor API; density first, matching radius
  12 km = F2) and "Never: own fleet, national launch, government first".

### s1 (awaiting review, 2026-10-14)
- File: `deck/slides/s1.html`. 102 words.
- Left: channels (costing software and WhatsApp with dashed orange borders = designed; web app solid
  green = built). Top: external services, weather API (grey) and vision and speech models (indigo),
  wired down into their engines. Centre: API panel (Node.js, Express, built) holding three engines
  that light in turn: Prevention (Python, FastAPI; forecast, prep sheet), Redistribution (AI intake,
  safety clock, 10 rules, rule score, handover, cascade), Reporting (impact dashboard, waste report,
  city export); chips solid = built, dashed = designed. Below: dark strip "One record per listing",
  forecast, listing, reservation, handover, outcome, with "MongoDB target; JSON store and seeded data
  today". Right: report readers (kitchens, CSR sponsors, city bodies). Footer: colour key and chip key.
- Convention set here: on node cards, a dashed border means designed (no chip needed).

### s3 (awaiting review, 2026-10-14)
- File: `deck/slides/s3.html`. 119 words.
- Lede: "Kitchens report on WhatsApp in their own language, and fixed rules plus a weighted score pick
  the receiver." Five stage cards lighting in turn as a token crosses (railSync, 17.3% / 18%):
  1 Report (designed; web form built), 2 AI intake (vision: quantity, category; speech: Telugu,
  Hindi, Urdu; manager confirms), 3 Safety clock (clock ring; prep time, category, heat; expires at
  zero), 4 10 rules (built; six example rule chips), 5 Rule score (built; weight bars F1; receiver
  booked). Each card ends with the followed example (don-6, tagged "example event"): photo and voice
  note; 70 meals, cooked, dairy; ready 8:45 pm; 8 receivers, 1 qualifies; takes 40, 30 move on.
  Bottom strip "Effort": manager one message, receiver confirms pickup, nothing to install.

### s4 (awaiting review, 2026-10-14)
- File: `deck/slides/s4.html`. 119 words.
- Left: seeded handover record ho-1 (cooked meals): reserved 28, collected 27, received 26 kg bars;
  "Counted: 26 kg, the smallest"; both sides confirm (built), tray photos (designed); timestamps
  10:20 am, 5:40 pm, 6:15 pm. Middle "What counts" (built): completed counts; disputed, cancelled,
  expired, pending struck out; meals estimated at 0.5 kg each. Right: three reports wired from
  "Completed" only: kitchen waste report (designed), sponsor impact report (built), city SDG export
  (designed; SDG 12.3 food waste, SDG 2.1 access to food). Bottom: two methods, Redistributed =
  smallest of reserved, collected, received (built); Prevented = baseline forecast minus cooked
  (designed). Source line cites the seeded record and sdgs.un.org/goals.

### s6 (approved 2026-10-14)
- File: `deck/slides/s6.html`. Review: `slides/s6.png`. 118 words.
- Lede: "From campus kitchens to city bodies, each phase opens only when the one before it hits its metric."
- Five columns on a rail (token crosses in 10 s, each column lights as it passes; railSync, keyframes
  18.8% / 19.4%): Today (built: React, Express, rule score; gate "Pilot kitchen signs"), 1 Wedge,
  months 0 to 6 (campus mess halls; cooks less, saves money; MongoDB, WhatsApp, costing connector,
  forecast baseline; gate "Forecast beats baseline"), 2 Proof, months 6 to 12 (receiving NGOs; free,
  steady supply; waste and impact reports; gate "Case study: kg, rupees, meals"), 3 Clusters, after
  proof (caterers, wedding halls; pledge fee, ESG reports; pledge, safety clock, cascade; gate
  "Repeat pledges"), 4 City bodies (GHMC, mid-day meals; SDG data, no cost; city export; "Zero-cost
  pilot"). Rows: Who (drawing), Why, Build (tech chips, solid = built, dashed = designed), Gate (dark
  box with an arrow into the next phase). Footer: legend and "No fleet, no new software".
- Gates name metrics, not targets: no target values exist (TBD, ask the user if they want numbers).
- New shared drawing: `city` (skyline) in lib/art.js. Later added: `cross`, `funnel`, `chat`; `.tech` chip moved to base.css.

### s5 (approved 2026-10-14)
- File: `deck/slides/s5.html`. Review: `slides/s5.png`. 120 words.
- Left: likelihood x impact matrix (high-high quadrant tinted red), six numbered risks moving from a
  dashed "before" position to a filled "after controls" position (8 s loop, still = after). Caption
  "team's assessment": positions are judgement, not data.
- Right: six rows, risk with drawing and control(s) with status dots: 1 unsafe food (allergen and
  storage rules built; safety clock designed), 2 kitchen runs short (cook above median, manager
  overrides; designed), 3 nobody collects (pre-matched receiver built; waitlist, feed, biogas
  designed), 4 fake receiver (verified receivers only built; limits rise with handovers designed),
  5 low adoption (runs in their software and WhatsApp; designed), 6 sales data leaks (per-kitchen
  data, totals-only reports; designed). Built status checked against src/matching.js
  `getExclusionReasons` and README (admin verification) on 2026-10-14.
- Bottom band: long-term viability, "No fleet, no hardware", three payers (kitchens: waste
  analytics; hosts: pledge package; sponsors: verified CSR, ESG reports) and a drawn trend of surplus
  falling while income rises (concept, no numbers).
- New shared drawing: `lock` (padlock) in lib/art.js.

### s2 (approved 2026-10-14)
- File: `deck/slides/s2.html`. Review: `slides/s2.png`. 120 words (budget 80 to 120).
- Left: four inputs (costing and inventory, bookings and pledges in orange; weather, calendar in
  grey) wired into stage 1. Middle: "Forecast service" panel (Python, FastAPI) with stages Ingest,
  History, Forecast (indigo), Plan lighting in turn; a drawn demand curve (not data) with the median
  dashed, "Cook to here" at an upper quantile, the gap shaded green as "Likely leftover", the tail
  grey; "running short costs more than a leftover tray" and "Guardrail: stock-outs must not rise";
  below, Day one (weekday average x booked covers) to Once it wins (gradient-boosted quantile model).
  Right: prep sheet (sample, usual vs planned bars, manager accepts or overrides), pre-match (built
  score), waste report (kg not cooked, rupees saved). Bottom: dashed loop "Served and leftover update
  history" back into the engine.
- Motion: tokens on input and output wires (4 s), stage highlight (8 s), leftover band breathing,
  plan bars shrink from usual to planned, marching feedback wire.

## 8. Facts ledger

No numbers on s2 or s5. s3, s4 and s6 use the rows below.

| Id | Number | What it is | Source | Status | Used on |
|---|---|---|---|---|---|
| P1 | months 0 to 6 | wedge phase: campus mess halls, hostels, canteens, the user's costing system | user strategy notes, 2026-10-14 | plan | s6 |
| F1 | 0.30 / 0.25 / 0.20 / 0.15 / 0.10 | rule score weights | src/data.js matchingPolicy (pitch ledger F1) | built | s3 |
| F2 | 12 km | max matching distance | src/data.js matchingPolicy.maxDistanceKm | built | s7 |
| F8 | 10 | exclusion rules | src/matching.js getExclusionReasons | built | s1, s3 |
| F4 | 70 meals | the followed donation don-6, wedding buffet | src/data.js | simulated (demo record) | s3 |
| F5b | ready 8:45 pm, cooked meals, dairy | don-6 details | src/data.js | simulated (demo record) | s3 |
| F6b | 8 receivers, 1 qualifies, takes 40 of 70 | matching run on don-6 (pitch ledger) | src/matching.js | simulated (seeded) | s3 |
| H1 | 28 / 27 / 26 kg, counted 26 | seeded handover ho-1: reserved, collected, received; reconciledKg = min | src/impactData.js, src/impactAnalytics.js reconciledKg | simulated (seeded) | s4 |
| H2 | 10:20 am, 5:40 pm, 6:15 pm | ho-1 reservedAt, collectedAt, receivedAt (2026-10-10) | src/impactData.js | simulated (seeded) | s4 |
| F13 | 0.5 kg | assumed weight per meal equivalent | src/impactData.js impactConfig.kgPerMeal | assumed | s4 |
| S1 | SDG 12.3, SDG 2.1 | UN targets: halve food waste; access to safe, nutritious food | United Nations, https://sdgs.un.org/goals | external | s4 |
| P2 | months 6 to 12 | proof phase: publish kg diverted, rupees saved, meals delivered | user strategy notes, 2026-10-14 | plan | s6 | When a slide uses a number, add it here first; reuse the pitch deck's ledger
(`../agent_guide.md` section 8) for built values (F1 weights, F2 12 km, F3 240 min, F8 10 rules).

## 9. Data facts and gotchas

- The user's strategy notes (2026-10-14): wedge with campus mess halls, hostels and canteens, and the
  user's restaurant costing system (months 0 to 6); proof with published numbers (6 to 12 months);
  cluster expansion to caterers, wedding halls and hostel chains; institutional layer (GHMC, food
  safety authorities, mid-day meal and Anganwadi programmes) as a zero-cost pilot. Incentives:
  kitchens save money, corporates get verified ESG / CSR reports, NGOs get free predictable supply,
  government gets SDG data. Use for s6.
- The prevention engine, WhatsApp intake, safety clock and cascade are not built (README.md). The
  rule score, exclusion rules, listing, reservation, handover confirmation and the impact dashboard
  on seeded data are built.
- Shared gotchas from the pitch deck apply: base.css class names are taken (.band, .bar, .chip ...);
  art.js is one object literal, so check a name before adding a drawing; under Playwright slides
  freeze unless `?live=1`.

## 10. Workflow

```bash
cd presentation/architecture/deck
node tools/export.mjs s2            # review PNG -> ../slides/s2.png + layout dump
python3 tools/lint_copy.py s2
node tools/export.mjs s2 --crop x,y,w,h
npm run serve -- 5300               # http://127.0.0.1:5300/slides/s2.html or /present.html
```

## 11. Files

| Path | What |
|---|---|
| deck.config.yaml | settings |
| explainerdoc.md | per-slide explainer and feature justifications for the presenting team (2026-10-14); update it when a slide changes |
| deck/slides/sN.html | slides |
| deck/styles, deck/lib, deck/fonts | copied from the pitch deck (presentation/deck) |
| ../agent_guide.md | pitch deck guide: shared visual system and writing rules |
| ../../README.md | what is built (authoritative on status) |
| ../../spec-short.md | target architecture (section 5) |

## 12. Ideas

1. Reuse the pitch deck's followed wedding buffet (don-6) as the example through the redistribution half of the architecture. (not yet raised)

## 13. How the user likes to work

Same as the pitch deck: short instructions, Claude explores and gathers material, pictures over
words, quick decisions, no git commits unless asked.
