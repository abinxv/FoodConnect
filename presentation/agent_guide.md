# Agent guide: FoodConnect

Read this whole file before touching anything. It records every decision made so far, so a new
chat can build the next slide without re-asking. deck.config.yaml holds the settings; this file
holds the decisions, the plan, the facts, and how the user likes to work. If the two disagree,
the newer dated decision in section 2 wins; fix the other file.

ROOT for the deck is `presentation/` (user instruction, 2026-10-13). The project docs are loose
files one level up, in the repo root.

## 0. Status

| Slide | Section | Status | Review PNG |
|---|---|---|---|
| board | Style board | approved 2026-10-13: direction A | slides/board.png |
| s1 | Problem | approved 2026-10-13 | slides/s1.png |
| s2 | Why rescue fails | approved 2026-10-13 | slides/s2.png |
| s3 | The idea | approved 2026-10-13 | slides/s3.png |
| s4 | How it works (pilot) | approved 2026-10-13 | slides/s4.png |
| s5 | WhatsApp and AI intake | awaiting review (2026-10-13, built as a set) | slides/s5.png |
| s6 | Safety and trust | awaiting review (2026-10-13, built as a set) | slides/s6.png |
| s7 | Allocation and cascade | awaiting review (2026-10-13, built as a set) | slides/s7.png |
| s8 | Who pays | awaiting review (2026-10-13, built as a set) | slides/s8.png |
| s9 | Close | awaiting review (2026-10-13, built as a set) | slides/s9.png |

Plan approval: revised plan (built around ../revamp.md) accepted 2026-10-13 when the user chose
palette A and answered the open question without asking for plan changes.

Next step: the user reviews s5 to s9 as a set (s1 to s4 are approved). Apply corrections, then
assemble the PDF backup only when asked (step 8: needs the deck venv with pillow / pymupdf,
`build_deck.py`, then render the PDF back to PNGs and look at every page).

## 1. What we are making

- Deck for an ideathon pitch, audience ideathon judges (inferred, mixed technical and non-technical).
  Outputs: animated HTML deck presented in a browser, plus a still PDF backup. No portal constraints known.
- The project: FoodConnect is a Hyderabad-focused web app where suppliers (restaurants, caterers)
  list surplus food and verified receivers (community kitchens, shelters, food banks) reserve it,
  and both confirm the handover. A rule-based engine ranks receivers for each donation and a
  dashboard reports redistributed food from confirmed handovers.
- The pitch (from ../revamp.md): surplus is predictable, so it is scheduled before it exists. A
  function-hall host pledges surplus at booking, a receiver that is awake at 11 pm is pre-matched,
  the manager reports on WhatsApp by photo or voice note and AI structures the listing, a
  safe-to-eat clock expires listings, and a cascade (waitlist, animal feed, biogas or compost)
  gives every listing a recorded outcome. Revenue: pledge package, waste analytics, CSR reports.
- Names: FoodConnect (one word, capital F and C).
- Method: simple (plain HTML + CSS). Canvas 1920x1080. No template.
- Motion: looping CSS animations on every slide (user instruction). Each animation must loop
  cleanly while the slide is on screen. Review PNGs and the PDF show one frozen frame, so every
  slide must also read correctly as a still (pick a representative frame for export).

## 2. Decisions (do not re-ask)

| Date | Question | Answer |
|---|---|---|
| 2026-10-13 | Where deck files live | Everything in `presentation/` |
| 2026-10-13 | Template | None (ideathon) |
| 2026-10-13 | Motion | Animated deck with looping animations |
| 2026-10-13 | Fonts | Standard, commonly used, nothing fancy. Inter, fallback Arial / Helvetica |
| 2026-10-13 | Pictures | Claude gathers them: real app screenshots, free-licence web photos (credited), animated flowcharts, architecture diagrams |
| 2026-10-13 | Slide count | 9, including the title slide |
| 2026-10-13 | Theme | Light |
| 2026-10-13 | Delivery | Browser (animated HTML) plus PDF backup |
| 2026-10-13 | Web statistics | Allowed, each cited with a numbered source |
| 2026-10-13 | Run the project for screenshots | Allowed |
| 2026-10-13 | Method | simple (Claude's suggestion, in the config; not yet objected to) |
| 2026-10-13 | Claims policy | SUPERSEDED same day: present the FINAL product as built. No work-in-progress chips, no "next" or "not built" markers. The team says in person what is built so far |
| 2026-10-13 | Deck structure | Revamp the deck around ../revamp.md |
| 2026-10-13 | Title and team slides | None. All 9 slides are content slides; no team names on slides |
| 2026-10-13 | Pitch length | 10 minutes |
| 2026-10-13 | Palette | Direction A (warm paper, green, orange) |
| 2026-10-13 | Real quote from a hall or shelter | None available; do not plan one |
| 2026-10-13 | Pilot s4 approved: locks | Density about 90 words; lede at 50 px, balanced over two lines; cards coloured by actor with a title, a drawing and a who line; one travelling token plus small loops; detail panels tied to steps by badge number; numbers plain, no chips except the single "example event" tag |
| 2026-10-13 | Review cadence | "Go ahead on all slides": build s5 to s9 without stopping for review between them; self-check each and show the set |
| 2026-10-13 | Text against pictures (pilot feedback) | Replace descriptive text with SVG line illustrations of the scene. Applies to every slide: a step, actor or object gets a drawing plus a short title, not a sentence |
| 2026-10-13 | Trace one seeded donation through the deck | Yes: the seeded wedding buffet surplus (don-6) |
| 2026-10-13 | One colour code for the whole deck | Yes |
| 2026-10-13 | English | Indian (British spelling), plain register, international number grouping |

## 3. Writing rules

Defaults: the skill's writing-style.md. Settings: deck.config.yaml `writing`. Additions for this deck:

- Present every feature in ../revamp.md in the present tense, as the product. No chips or labels for "next", "planned" or "work in progress" (user, 2026-10-13).
- Ranking is "a rule-based score". Never claim ML-ranked matching or a Random Forest (revamp 1.3). AI is claimed only at intake: photo to quantity and category, voice note to listing. AI never decides whether food is safe.
- No route optimiser, no kilograms-donated leaderboard, little admin tooling (revamp section 4).
- The followed wedding buffet and its numbers come from the app's demo records. Introduce it once as an example event (small tag); never present demo figures as measured real-world impact, and never present demo organisation names as partners.
- Revamp section 5 lists unverified legal claims. Do not put the liability, 80G or public-lookup claims on a slide. The FSSAI 2019 surplus food regulations exist (verified, source 3) and may be named.
- Illustrative figures quoted in revamp.md ("fed 140 people", "18% on Tuesdays") are examples, not data. Use them only inside a sample card that is visibly an example, or leave them out.

Bad to better, specific to this project:

| Bad | Why | Better |
|---|---|---|
| "Surplus is predictable, so schedule it instead of chasing it" (revamp.md) | X instead of Y slogan | "A function hall knows its date, guest count and menu weeks ahead, so the host pledges the surplus at booking" |
| "ML-ranked matching" (spec-short.md) | cut by revamp 1.3 | "A rule-based score ranks the two or three receivers that qualify" |
| "this wedding fed 140 people" as a result | example figure, not data | show it only as the sample impact card |
| "nothing ends in the bin" | absolute claim, slogan | "every listing ends with a recorded outcome" |
| "AI-assisted food redistribution platform" (spec-short.md section 19) | vague; AI is at intake only | "AI turns a tray photo or a voice note into a listing the manager confirms" |
| "Its core innovation is not simply a donation marketplace" | X, not Y | "It works out which eligible receiver gets which quantity" |
| "Live Social-Impact Dashboard" (feature spec title) | data is seeded, not live | "Impact dashboard on seeded demo records" |
| "854 meals served" | estimate shown as a count | "854 meal equivalents (estimate, 0.5 kg per meal)" |
| "5 km away" | seeded value shown as routing | "5 km (seeded demo distance)" |
| "Reduces food waste in Hyderabad" | no measurement | "427 kg confirmed as received across 16 seeded handovers" |
| "Zero Hunger" as big text | slogan / heading as content | "Supports SDG 2 and SDG 12" as a small label with the tiles |
| "Smart matching" | buzzword | "Five weighted factors: demand 0.30, urgency 0.25, distance 0.20, quantity fit 0.15, reliability 0.10" |

Target register (approved lines; write like these):
- "One wedding buffet moves from pledge to recorded outcome in six steps."
- "Wedding buffet surplus, 70 meals, Pearl Event Caterers, Secunderabad"
- Step titles of one or two words: "Pledge", "Pre-match", "Safety clock"
- "On by default, host can opt out"

```lint-banned
# one phrase per line; "re:" for a regex
AI-powered
AI-assisted
smart matching
live dashboard
re: \bpeople fed\b
re: \bmeals served\b
```

## 4. Visual system (on the style board, awaiting a choice between A and B)

Tokens live in `deck/styles/tokens.css`. Direction A is the default; B is `[data-palette="b"]`
(rendered by `slides/boardb.html`, a generated copy of board.html). Reuse tokens; do not invent colours.

| Token | A | B | Meaning (one meaning per colour) |
|---|---|---|---|
| --paper | #fbf8f2 | #ffffff | slide background |
| --panel / --panel-2 | #f3eee3 / #e9e2d3 | #f2f5f8 / #e3e9ef | cards and lanes / bar tracks |
| --hair | #d9d0bd | #cdd6e0 | hairlines, borders |
| --ink / --ink-2 | #1d2a26 / #44524c | #14213d / #3b4a63 | text / secondary text |
| --ink-3 | #6b7a74 | #6a778c | captions, context, the old way |
| --wire | #15826b | #0f766e | food in motion and receivers; wires, flow tokens, section labels |
| --accent-2 | #d95836 | #e8590c | suppliers and surplus |
| --clock | #c98a12 | #b7791f | time: the safe-to-eat clock, deadlines |
| --ai | #5b5bd6 | #6d4bd8 | a step done by AI |
| --bad | #b3402e | #c0392b | expired, excluded |

- Fonts: Inter variable (local file deck/fonts/inter-latin-wght-normal.woff2), weights 400 / 600 / 700, tabular numerals.
- Type: lede 44 px, body 22 px, node 20 px, label 17 px, caption 15 px, big numbers 56 px. Lint floor 14 px.
- Vocabulary in base.css: label, lede, node (default green / supplier / ai / clock / muted / bad), wire with arrow head, flow token, marching dashed wire, score bar, clock ring, badge, tag chip (`chip-tag`, e.g. "example event"), readout, phone frame with chat bubbles, window frame with bar, photo frame with credit caption, source caption, hairline rule.
- Illustrations: `deck/lib/art.js` holds the shared line drawings (3 px round strokes in currentColor, so each takes its actor's colour). Scenes: pledge, prematch, report, listing, clock, handover. Parts: hall, home (receiver), tray (food), calendar, guests, menu, camera, photo, tickmark. Use `<div data-art="name">` + `mount()`. Add new drawings there, in the same style; reuse hall / home / tray so the same thing always looks the same. Small loops: voice waveform, lines writing themselves, spark, clock hand, marching arrow.
- Motion (all loop): `flow(slide, path, {n, dur, color, still})` in lib/deck.js puts tokens on a wire; `.march` on a wire path; `.bar > span` fills, holds, resets; `.clockring` counts down; `.pulse` rings a node.
- One clock: lib/deck.js `sync()` runs at the end of `slide()` and restarts every animation at the same instant, because CSS animations start at page load while tokens are created later. For a rail with cards that light as the token passes, call `railSync(cards, slide, dur)`: it sets each card's delay from its position on the rail. The card's keyframes must stay lit for one card width (as a share of the rail) and switch off within the gap before the next card (s4: 15% then 15.5%; s3: 23.5% then 24%; a longer fade spills past the end of the loop on the last card). Fixed 2026-10-13 after the user reported the rail and cards out of sync on s3 and s4.
- Stills: lib/deck.js `freeze()` runs under Playwright (or `?still=1`) and pauses every animation at `--still` (0 to 1 of one loop, default 0.6). Set `--still` so the frozen frame shows true values. `?live=1` keeps motion under automation.
- Deck-wide colour code, taught on s1: orange supplier and surplus, green food moving to a receiver, amber the clock, indigo an AI step, red expired or excluded.

## 5. Geometry

- Canvas 1920x1080. Zone and band: scaffold defaults (88 / 72 px margins) until the board says otherwise.
- No template chrome.

## 6. Slide plan (revamp, 10 minute pitch, about 65 s per slide, no title slide)

| # | Section | Lead idea (one sentence) | Main visual (looping) | Supporting visuals | Words | Numbers used |
|---|---|---|---|---|---|---|
| s1 | Problem | Food services throw away 28% of the world's 1.05 billion tonnes of wasted food, while 12% of India is undernourished. | Surplus lane and need lane joined by a wire that stops at a gap; teaches the colour code | Stat board of cited numbers; one photo | 80-110 | E1 to E6 |
| s2 | Why rescue fails | Surplus appears after 10:30 pm, when most receivers have closed and cooked food has only a few safe hours left. | One evening on a shared time axis: kitchens' surplus window, receivers' open hours, the shrinking safe window | Three human reasons as nodes: tired manager, donor fear, unplannable supply | 80-110 | R1, R2 |
| s3 | The idea | A function hall knows its date, guest count and menu weeks ahead, so the host pledges the surplus at booking. | Two timelines of the same wedding: midnight scramble (grey) against pledge, pre-match, scheduled pickup | Sample impact card for the host (annadanam); function hall photo | 80-110 | R3 (example only) |
| s4 | How it works (pilot) | One wedding buffet moves from pledge to recorded outcome in six steps, with a named person responsible for each. | Six-step chain with a food token travelling it: pledge, WhatsApp report, AI listing, safety clock, handover, outcome | The followed example: 70 meals, Pearl Event Caterers, Secunderabad; real app screenshots where a step has one | 80-110 | F4, F17 |
| s5 | WhatsApp and AI intake | On the night, the manager replies on WhatsApp with a tray photo or a voice note, and AI turns it into a listing to confirm with one tap. | Phone chat on the left, wires to the structured listing fields filling in on the right | Languages: Telugu, Hindi, Urdu; "staff share first" step | 80-110 | F4 |
| s6 | Safety and trust | A safe-to-eat clock, computed from preparation time, food category and ambient temperature, expires each listing automatically. | Three inputs wired into a running clock ring; listing expires when it empties | Handover record (timestamp, photos, checklist); registration checks (FSSAI licence, NGO registration); tiered limits | 80-110 | F5, S3 |
| s7 | Allocation and cascade | If a receiver does not confirm in time, the food moves down a waitlist, then to animal feed, then to biogas or compost. | Cascade flow with marching wires; the example: 40 of 70 meals to the first receiver, 30 move on | Rule score bars for the example (weights 0.30 / 0.25 / 0.20 / 0.15 / 0.10); receivers awake at 11 pm | 80-110 | F1, F4, F6, F7 |
| s8 | Who pays | Three groups pay: hosts for the pledge package, kitchens for waste analytics, and sponsors for audited impact reports. | Three revenue lanes from payer to what they get | Sample waste report; leaderboard ranked by reliability | 80-110 | R4 (example only) |
| s9 | Close | Hosts pledge surplus at booking, a receiver that is awake is waiting, a safety clock protects everyone, and every listing ends with a recorded outcome. | The whole loop as one circulating diagram | SDG 2 and SDG 12 tiles; first segment: Hyderabad function halls | 80-110 | none |

Gaps (TBD, need the user):
- R1 and R2 (10:30 pm to midnight surplus, receivers closed by 8 pm) are the team's own claims from revamp.md with no source. Shown as stated unless the user supplies a quote or source (revamp section 6 suggests five phone calls).
- Pricing for the three revenue lines: none in the docs, so s8 shows no prices.
- Photos still to gather (function hall or wedding buffet, night shelter or served meal), free licence, credited.
- The app has no screens for the pledge, WhatsApp intake, safety clock or cascade. Those are drawn as diagrams in the deck's own vocabulary; real screenshots are used only for steps the app has (listing, reservation, handover confirmation).

## 7. Slides as built

### s5 (awaiting review)
- File: `deck/slides/s5.html`. 104 words. Planned lede at 46 px.
- Left: phone chat whose bubbles appear in turn (prompt, tray photo, voice note waveform, "70 meals, cooked, ready 8:45 pm. Correct?", "Yes"). Middle: two indigo AI nodes, Vision (photo to quantity and category) and Speech (Telugu, Hindi or Urdu to text), wired with indigo tokens. Right: "Draft listing" card whose rows fill in (food, 70 meals, cooked meals, 8:45 pm, refrigeration, dairy; all from don-6) with a pulsing Confirm button. Bottom: three rule chips (staff share first; the manager confirms every listing; AI never decides food safety).
- Lint: 2 question warnings left on purpose; they are chat messages, not slide copy.

### s6 (awaiting review)
- File: `deck/slides/s6.html`. 61 words. Planned lede at 46 px.
- Left panel: three amber inputs (Prepared 8:45 pm, Category cooked meals, Temperature live outdoors) wired with tokens into a 250 px clock ring that counts down, then out to "Handed over inside the window" (green) or "Listing expires at zero" (red, marching). No hour count is shown because no document gives one.
- Right: three trust rows with drawings: handover record; checked registrations (FSSAI licence, NGO registration); tiered trust (limits rise with completed handovers). No legal or public-lookup claim.

### s7 (awaiting review)
- File: `deck/slides/s7.html`. 110 words. Planned lede at 46 px.
- Cascade of five cards that light in turn: Surplus listed 70 meals, First receiver 40 meals 4 km away, Waitlist 30 meals offered on, Animal feed, Biogas or compost. Green token on the first hop, grey marching wires after it, legend "Moves on when the confirmation deadline lapses". Example strip: "one receiver qualifies and can take 40 of the 70 meals" (F6b; the receiver's demo name and its 47.8 score are not shown).
- Lower left: rule-based score weight bar 0.30 / 0.25 / 0.20 / 0.15 / 0.10 (F1). Lower right: receivers awake at 11 pm (night shelters, hospital attendants, railway stations, labour colonies; revamp 3.2).

### s8 (awaiting review)
- File: `deck/slides/s8.html`. 105 words. Planned lede at 46 px.
- Three payer cards that light in turn: Hosts (pledge package, a per-event fee in the catering contract), Kitchens (waste analytics subscription, with the sample line "You over-produce biryani 18% on Tuesdays" tagged "sample report", R4), Sponsors (CSR and ESG reporting for hotel chains and corporate sponsors). No prices. Bottom notes: suppliers ranked by reliability; less surplus is the goal.
- The weekday bar chart in the Kitchens card is a drawing, not data.

### s9 (awaiting review)
- File: `deck/slides/s9.html`. 64 words. Planned lede at 46 px.
- Six stops on an ellipse with six tokens circulating (18 s): pledge at booking, WhatsApp report, AI listing, safety clock, handover, waste report; "FoodConnect" in the centre. Right: SDG 2 and SDG 12 as plain tiles (no UN logos) and "First segment: function halls in Hyderabad".

Checks on the whole set (2026-10-13): `node tools/export.mjs --all` reports no layout problems on s1 to s9; lint has no errors; a headless live run showed every slide's animations running with no console errors and the presenter stepping through 9 slides by key and by click.

Gotcha learnt: under Playwright `navigator.webdriver` is true, so slides freeze unless the URL has `?live=1`; a live test through present.html measures frozen slides. Test motion on `slides/sN.html?live=1`.

Gotcha learnt: `lib/art.js` is one object literal, so a repeated key silently replaces the earlier drawing (a second `report` broke s4 until it was renamed `audit`). Check for an existing name before adding one.

### s3 (approved 2026-10-13)
- File: `deck/slides/s3.html`. Review: `slides/s3.png`. 68 words (under budget; drawings carry it).
- What is on it: label, the planned lede, then two lanes over four moments (at booking, days before, event night, after dinner). Today: a dashed empty span "Nothing arranged" and a grey "Midnight scramble" cell (tray to red bin). With FoodConnect: four cards with drawings (host pledges, receiver matched, receiver waiting, planned pickup) that light in turn while a token crosses a rail in 8 s. Under them "Known at booking": date, guest count, menu chips. Right: "What the host receives", a sample card with the biryani photo, "Annadanam", and "This wedding fed 140 people in the couple's name." tagged "sample card" (R3, example only).
- Photo: img/web/hyderabadi-dum-biryani.jpg, "Hyderabadi Dum Ki Biryani" by Miansari66, CC0, https://commons.wikimedia.org/wiki/File:Hyderabadi_Dum_Ki_Biryani.JPG (credited in the caption).
- Photo search notes: Commons had no usable Hyderabad function hall or wedding buffet photo (one had a watermark and date stamp, one showed identifiable people at a club event). Rejected files were deleted.
- Open items: none.

### s2 (approved 2026-10-13)
- File: `deck/slides/s2.html`. Review: `slides/s2.png`. 62 words (under the 80 to 110 budget; drawings carry it).
- What is on it: label, the planned lede, then one evening from 6 pm to 1 am on a shared axis with three rows: Kitchens (outlined "Dinner service, weddings" until 10:30, solid orange "Surplus" 10:30 to midnight, pulsing), Receivers (green "Open" until 8 pm, dashed grey "Closed for the night" after), Safe to eat (amber bar fading out from 10:30, "A few hours"). A red-tinted zone marks 10:30 to midnight across all rows and a black cursor sweeps the evening in 12 s (still frame at about 11 pm). Below: three reason cards with drawings: a long form, donor fear (warning triangle), unplanned supply (calendar with a question mark).
- Numbers: R1, R2 (team assumptions). Caption says so: "Timings are the team's working assumption for Hyderabad function halls and receivers."
- Gotcha learnt: slide-local class names must not reuse base.css names (.band, .bar, .who are taken).
- Open items: none.

### s1 (approved 2026-10-13)
- File: `deck/slides/s1.html`. Review: `slides/s1.png`. 76 words (4 under the 80 to 110 budget; fine for an opening slide).
- What is on it: label, the planned lede, then a scene: an orange "Surplus" card (hall and two trays) whose wire carries three orange tokens that turn down into a red bin; a grey dashed wire from the green "Need" card (people, empty plate) stops short at a hollow dot, with "No link" in the gap. Below: an orange-topped panel with 1.05 billion tonnes [1] and a 60 / 28 / 12 split bar (food services highlighted, pulsing) and a green-topped panel with 12% undernourished [2] and rank 102 of 123 [2]. Footer: the three-colour key and the numbered sources.
- Numbers: E1, E2, E5, E6. E3 and E4 not used.
- Deviation from the plan: no photo. The drawn scene took the space; photos are held for s3.
- Open items: none.

### s4 (approved 2026-10-13, pilot, revision 2)
- File: `deck/slides/s4.html`. Review: `slides/s4.png`. 89 words (budget 80 to 110).
- What is on it: label, lede "One wedding buffet moves from pledge to recorded outcome in six steps." (the planned "named person" clause was dropped because steps 4 and 5 are AI and automatic), example-event strip (don-6), three phase headers (weeks ahead / event night, ready 8:45 pm / pickup 10:00 pm), six step cards coloured by actor, each with a title, a line illustration of the scene and a "who" line, a rail with a token that crosses in 9 s while each card lights in turn, then three detail panels tied by badge number: 1 booking form (date, guests, menu chips and the pledge toggle, drawn), 4 real app screenshot of the listing (img/app-wedding-listing-modal.png, cropped from the bottom edge), 6 handover record (two tray photos, 10:00 pm stamp, two sign-off ticks, outcome node, drawn).
- Revision 2 (2026-10-13): the user asked to replace text with SVG diagrams relevant to the scene; step descriptions and panel text became illustrations.
- Motion: token on rail (9 s), card highlight `step-on` (9 s, delay i x 1.5 s), pulses on the toggle and outcome node, small loops inside the illustrations. Still frame 0.6 = step 4 lit.
- Approved 2026-10-13 ("go ahead").
- Open items: none.

## 8. Facts ledger

Every number on a slide is here first. Status: measured / built / design / costed / simulated / assumed / external / TBD.

| Id | Number | What it is | Source | Status | Used on |
|---|---|---|---|---|---|
| F1 | 0.30 / 0.25 / 0.20 / 0.15 / 0.10 | weights: unmet demand, urgency, distance, quantity fit, reliability | src/data.js `matchingPolicy`; feature spec 7.1 | built | s5 |
| F2 | 12 km | max matching distance | src/data.js `matchingPolicy.maxDistanceKm` (spec example uses 20; code wins) | built | s5 |
| F3 | 240 min | urgency window | src/data.js `matchingPolicy` | built | s5 |
| F4 | 70 meals | the followed donation: don-6 Wedding buffet surplus, Pearl Event Caterers | src/data.js | simulated (demo record) | s4, s5, s7 |
| F5 | 8 in, 5 excluded, 3 ranked | receivers for that donation | computed by src/matching.js on seeded data, 2026-10-13 | simulated (seeded) | s5 |
| F6 | 81.1 / 74.6 / 70.9 | rule scores: City Food Bank, Asha Community Kitchen, Seva Meals Trust | same run | simulated (seeded) | s5 |
| F7 | 5 km / 4 km / 11 km | seeded demo distances for the three | same run | simulated (seeded) | s5 |
| F8 | 10 | hard exclusion rules checked | src/matching.js `getExclusionReasons` | built | s5 |
| F9 | 16 organisations: 8 suppliers, 8 receivers | seeded Hyderabad organisations | src/data.js | simulated (seeded) | s1, s4 |
| F10 | 10 | seeded donation listings | src/data.js | simulated (seeded) | s1, s4 |
| F11 | 427 kg | redistributed, all time, reconciled confirmed quantity | computed by src/impactAnalytics.js, period all, 2026-10-13 | simulated (seeded) | s6 |
| F12 | 854 | meal equivalents (estimate) | same run; 427 / 0.5 | simulated (seeded), estimate | s6 |
| F13 | 0.5 kg | assumed weight per meal equivalent | src/impactData.js `impactConfig.kgPerMeal` | assumed | s6 |
| F14 | 16 of 20 | completed handovers of all seeded handovers | same run | simulated (seeded) | s6 |
| F15 | 4 (1 disputed, 1 cancelled, 1 expired, 1 pending) | records not counted as impact | same run `dataQuality` | simulated (seeded) | s6 |
| F16 | 192 kg, 7 handovers, 384 meal equivalents | last 30 days (demo date 2026-10-12) | same run, period 30d | simulated (seeded) | s6 (optional) |
| F17 | 3 | roles: Supplier, Receiver, Admin | README.md | built | s3, s4, s7 |
| F18 | final = 0.70 x rule score + 30 x predicted success | proposed hybrid formula | feature spec 8.4 | design (not built) | s8 |
| F5b | 8:45 pm ready, 10:00 pm pickup, Secunderabad, vegetarian, allergen dairy, refrigeration | details of the followed donation don-6 "Wedding buffet surplus", Pearl Event Caterers | src/data.js | simulated (demo record) | s4, s5, s6 |
| F6b | 1 eligible of 8; City Food Bank (Abids), score 47.8, 4 km, can accept 40 of 70 | matching run on don-6 | computed by src/matching.js, 2026-10-13 | simulated (demo record) | s7 |
| R1 | 10:30 pm to midnight | when surplus appears | ../revamp.md 1.2, no source | assumed (team claim) | s2 |
| R2 | 8 pm | when typical receivers have closed | ../revamp.md 1.2, no source | assumed (team claim) | s2 |
| R3 | 140 people | sample text on the host's impact card | ../revamp.md 3.1 | example only | s3 |
| R4 | 18% on Tuesdays | sample line in the waste report | ../revamp.md 3.6 | example only | s8 |
| S3 | 2019 | FSSAI surplus food recovery and distribution regulations | source 3 | external | s6 |
| E1 | 1.05 billion tonnes | food waste generated worldwide in 2022 | source 1 | external | s2 |
| E2 | 28% | share from food services (households 60%, retail 12%) | source 1 | external | s2 |
| E3 | almost one-fifth | of food available to consumers is wasted | source 1 | external | s2 |
| E4 | 783 million | people affected by hunger | source 1 | external | s2 |
| E5 | 12.0% | prevalence of undernourishment, India | source 2 | external | s2 |
| E6 | 102nd of 123, score 25.8 (serious) | India in the 2025 Global Hunger Index | source 2 | external | s2 |

External sources (numbered as on the slides):
1. UNEP, Food Waste Index Report 2024, press release "World squanders over 1 billion meals a day", https://www.unep.org/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report
2. Global Hunger Index 2025, India country page, https://www.globalhungerindex.org/india.html
3. FSSAI, Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019, press release https://www.fssai.gov.in/upload/uploadfiles/files/Press_Release_Gazette_Notification_Surplus_Food_06_08_2019.pdf (existence confirmed via search results; the liability wording was not read, so no liability claim)

## 9. Data facts and gotchas

- ../revamp.md (added by the user 2026-10-13) is the authority for the pitch. It overrides the specs and the README on what the deck claims.
- Ledger rows F5 to F16 from the first plan (biryani matching run, dashboard kg totals) are no longer planned on any slide; kept for reference only.
- Wedding food waste figures found online (943 tonnes a year in Bengaluru, 2012 UAS study) come only from secondary reports; not used.
- All operational data (organisations, donations, reservations, handovers, dashboard figures, distances) is seeded demo data in src/data.js and src/impactData.js. Label it "seeded demo" every time.
- Organisation names (Nizam Kitchen, City Food Bank and so on) are invented for the demo; do not present them as partners.
- spec-short.md and spec-full.md describe the target design (MongoDB, FastAPI ML service, routing). README.md and tasks.md say what exists. README.md wins on status.
- READMEold.md is stale; do not use.
- Feature spec examples use max distance 20 km; the code uses 12 km. Code wins for anything shown as built.
- Slide CSS: base.css owns `.band`, `.zone`, `.bar`, `.label`, `.lede`, `.node`, `.chip`, `.badge`, `.shot`, `.photo`, `.token`, `.pulse`, `.march`, `.rule`, `.source`, `.readout`. Pick other names inside a slide.
- Demo date is fixed at 2026-10-12 in impactConfig, so "last 30 days" is relative to that.
- README quotes API port 5000; macOS AirPlay often holds it. Run the API with another PORT.
- Demo logins are public (README.md); fine to show in screenshots. No other sensitive data found.
- `ml logic question-mark.png` in the repo root is an early 4-factor sketch (D, U, Q, C); superseded by the 5-factor score. Do not use.

## 10. Workflow for this deck

```bash
cd presentation/deck
node tools/export.mjs s4            # review PNG (frozen frame) -> ../slides/s4.png + layout dump
python3 tools/lint_copy.py s4       # copy + layout check
node tools/export.mjs s4 --crop x,y,w,h
npm run serve -- 5290               # then http://127.0.0.1:5290/slides/s4.html to watch the loops
sed 's/<html lang="en">/<html lang="en" data-palette="b">/' slides/board.html > slides/boardb.html   # regenerate board B
```

- Recompute seeded numbers: import src/impactAnalytics.js, src/matching.js and the data files in a small node script (done once on 2026-10-13; `npm test` in the repo root passes).
- Running the project for screenshots (done 2026-10-13, dependencies installed): from the repo root `PORT=5055 node server/index.js` and `npx vite --port 5183 --strictPort --host 127.0.0.1`, then in deck/ `node tools/capture_app.mjs`. The app hardcodes its API at 127.0.0.1:5000, which macOS AirPlay holds, so capture_app.mjs forwards those requests to 5055 inside Playwright; no app source was changed. Logs in as the demo receiver. Stop both servers afterwards (only the ones you started).
- Presenting: in deck/ run `npm run serve -- 5290`, open http://127.0.0.1:5290/present.html. Right arrow, space or click = next, left = back, F = full screen. It shows only slides whose file exists. Needs the local server (file:// will not load deck.json).
- Assembly (only when asked): export all, build_deck.py for the PDF.

## 11. Files

| Path | What |
|---|---|
| ../README.md | current state of the MVP, limitations, metric definitions. Authoritative on status |
| ../tasks.md | what is done and what remains. Authoritative on roadmap |
| ../FoodConnect_Feature_Specification.md | matching engine design: rules, 5 factors, hybrid ML proposal |
| ../FoodConnect_Smart_Dashboard_Spec.md | dashboard design and metric definitions |
| ../spec-short.md, ../spec-full.md | target SRS; describes the full design, much of it not built |
| ../src/matching.js, ../src/impactAnalytics.js, ../src/data.js, ../src/impactData.js | the built rule score, dashboard maths and seeded data |
| deck.config.yaml | settings |
| deck/present.html | arrow-key presenter for the live pitch |
| deck/tools/capture_app.mjs | repeatable app screenshots into deck/img/ |
| deck/img/app-*.png | real app screens: receiver overview, available food, wedding buffet listing |

## 12. Ideas

Raised with the user (status: accepted / parked / rejected):
1. Follow one seeded donation through the deck. (accepted 2026-10-13; now the wedding buffet, don-6)
2. One colour code for the whole deck. (accepted 2026-10-13)
3. Put one real quote from a function hall or night shelter on s3 (revamp section 6). (rejected 2026-10-13: no quote available)

## 13. How the user likes to work

- Gives short numbered instructions up front and expects Claude to explore and gather material itself.
- Wants all deck files inside presentation/.
- No git commits unless asked.
- Prefers pictures to words: illustrations of the scene over descriptive text.
- Decides quickly and redirects firmly; apply the change across the whole plan instead of asking again.
