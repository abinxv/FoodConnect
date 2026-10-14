// Shared line illustrations. One drawing style for the whole deck: 3 px round strokes in
// currentColor (the colour of the actor), paper fills, small looping motion.
// Usage: el.innerHTML = art.phone(); or <div data-art="phone"></div> + mount().
const S = (vb, body) => `<svg class="art" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-lint="off" aria-hidden="true">${body}</svg>`;

// building blocks, drawn around their own origin
const hall = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 30 L34 8 L68 30"/><path d="M6 30 H62 M8 72 H60 M2 78 H66"/><path d="M14 36 V70 M28 36 V70 M40 36 V70 M54 36 V70"/></g>`;
const home = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 34 L32 8 L64 34"/><path d="M8 30 V76 H56 V30"/><path d="M26 76 V54 H38 V76"/></g>`;
const tick = (cx, cy, r = 13) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/><path d="M${cx - r * 0.42} ${cy + r * 0.02} l${r * 0.3} ${r * 0.32} l${r * 0.56} ${-r * 0.62}" stroke="var(--paper)" stroke-width="2.6"/>`;
const tray = (x, y, w = 62) => `<g transform="translate(${x} ${y})"><path d="M0 22 H${w} L${w - 7} 44 H7 Z"/><path d="M6 22 C6 2 ${w - 6} 2 ${w - 6} 22"/><path d="M${w / 2} 4 V0"/></g>`;
const arrow = (x1, x2, y) => `<path class="art-dash" d="M${x1} ${y} H${x2 - 4}" stroke-dasharray="5 7"/><path d="M${x2 - 10} ${y - 7} L${x2} ${y} L${x2 - 10} ${y + 7}"/>`;

export const art = {
  // 1 host pledges at the function hall: hall + signed form
  pledge: () => S("0 0 220 96", `${hall(18, 8)}<rect x="126" y="8" width="62" height="80" rx="7"/><path d="M138 28 H176 M138 44 H176 M138 60 H158"/>${tick(184, 78)}`),
  // 2 pickup agreed ahead: calendar date linked to the receiver
  prematch: () => S("0 0 220 96", `<rect x="20" y="16" width="66" height="66" rx="8"/><path d="M20 36 H86 M38 8 V22 M68 8 V22"/><rect class="art-day" x="56" y="52" width="16" height="16" rx="4" fill="currentColor" stroke="none"/><path d="M34 52 h6 M34 66 h6 M46 52 h0 M46 66 h0" stroke-width="5"/>${arrow(98, 130, 50)}${home(140, 8)}`),
  // 3 manager reports: phone, photo, voice note
  report: () => S("0 0 220 96", `<rect x="22" y="4" width="50" height="88" rx="9"/><path d="M40 82 H54"/><rect x="92" y="14" width="52" height="40" rx="7"/><circle cx="118" cy="35" r="9"/><path d="M104 14 l5 -7 h18 l5 7"/><g class="art-wave">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path style="--i:${i}" d="M${98 + i * 16} ${78} v0" />`).join("")}</g>`),
  // 4 AI drafts the listing: card whose lines write themselves, with a spark
  listing: () => S("0 0 220 96", `<rect x="24" y="10" width="136" height="78" rx="9"/><g class="art-type"><path style="--i:0" d="M40 32 H112"/><path style="--i:1" d="M40 50 H140"/><path style="--i:2" d="M40 68 H96"/></g><path class="art-spark" d="M188 14 q2 14 16 16 q-14 2 -16 16 q-2 -14 -16 -16 q14 -2 16 -16 Z" fill="currentColor"/>`),
  // 5 safe-to-eat clock: dial with a sweeping hand
  clock: () => S("0 0 220 96", `<circle cx="110" cy="50" r="38"/><path d="M110 4 V12 M96 4 H124"/><path d="M110 18 v5 M110 77 v5 M78 50 h5 M137 50 h5" stroke-width="2.4"/><path class="art-hand" d="M110 50 V24" stroke-width="4"/><circle cx="110" cy="50" r="4" fill="currentColor"/>`),
  // 6 handover: food tray goes to the receiver, confirmed
  handover: () => S("0 0 220 96", `${tray(16, 30)}${arrow(92, 128, 54)}${home(138, 8)}${tick(196, 78)}`),
  hall: () => S("0 0 68 80", hall(0, 0)),
  home: () => S("0 0 64 80", home(0, 2)),
  tray: () => S("0 0 62 46", tray(0, 1)),
  // booking form: date, guests and menu already known
  calendar: () => S("0 0 40 40", `<rect x="5" y="8" width="30" height="27" rx="5"/><path d="M5 17 H35 M13 4 V11 M27 4 V11"/>`),
  guests: () => S("0 0 40 40", `<circle cx="14" cy="13" r="6"/><path d="M3 35 c0 -14 22 -14 22 0"/><circle cx="29" cy="15" r="5"/><path d="M27 26 c6 -2 11 2 11 9"/>`),
  menu: () => S("0 0 40 40", `<path d="M4 30 H36 M7 30 C7 8 33 8 33 30 M20 11 V7"/>`),
  camera: () => S("0 0 40 40", `<rect x="4" y="11" width="32" height="23" rx="5"/><circle cx="20" cy="22" r="6"/><path d="M13 11 l3 -5 h8 l3 5"/>`),
  // photo of the trays, as kept in the handover record
  photo: () => S("0 0 120 84", `<rect x="3" y="3" width="114" height="78" rx="8" fill="var(--paper)"/>${tray(14, 26, 44)}${tray(62, 26, 44)}`),
  // the bin where unclaimed surplus ends
  bin: () => S("0 0 70 84", `<path d="M6 20 H64 M26 20 V10 H44 V20"/><path d="M12 20 L17 78 H53 L58 20"/><path d="M27 34 L29 66 M43 34 L41 66"/>`),
  // people waiting for a meal
  people: () => S("0 0 120 70", `<circle cx="24" cy="18" r="10"/><path d="M4 66 c0 -30 40 -30 40 0"/><circle cx="62" cy="14" r="11"/><path d="M40 66 c0 -34 44 -34 44 0"/><circle cx="98" cy="18" r="10"/><path d="M78 66 c0 -30 40 -30 40 0"/>`),
  // an empty plate
  plate: () => S("0 0 80 50", `<ellipse cx="40" cy="30" rx="36" ry="14"/><ellipse cx="40" cy="28" rx="20" ry="7"/>`),
  // a long form nobody fills in at midnight
  form: () => S("0 0 120 96", `<rect x="24" y="4" width="72" height="88" rx="8"/><path d="M36 20 H84 M36 32 H84 M36 44 H84 M36 56 H84 M36 68 H84 M36 80 H62" stroke-width="2.4"/>`),
  // a warning: the donor's fear of one bad outcome
  alert: () => S("0 0 120 96", `<path d="M60 8 L112 88 H8 Z"/><path d="M60 36 V60" stroke-width="5"/><circle cx="60" cy="74" r="3.5" fill="currentColor"/>`),
  // supply that may or may not arrive
  unknown: () => S("0 0 120 96", `<rect x="22" y="14" width="76" height="76" rx="9"/><path d="M22 36 H98 M42 6 V20 M78 6 V20"/><path d="M50 54 c0 -12 20 -12 20 0 c0 8 -10 8 -10 16" stroke-width="4"/><circle cx="60" cy="80" r="3" fill="currentColor"/>`),
  moon: () => S("0 0 40 40", `<path d="M30 25 A14 14 0 1 1 16 8 A11 11 0 0 0 30 25 Z"/>`),
  stopwatch: () => S("0 0 40 40", `<circle cx="20" cy="23" r="13"/><path d="M20 5 V10 M15 5 H25 M20 23 V15"/>`),
  // surplus with nowhere to go
  binned: () => S("0 0 220 96", `${tray(14, 30)}${arrow(92, 130, 54)}<g transform="translate(146 8)" style="color: var(--bad)"><path d="M6 20 H64 M26 20 V10 H44 V20"/><path d="M12 20 L17 78 H53 L58 20"/><path d="M27 34 L29 66 M43 34 L41 66"/></g>`),
  // the receiver is staffed and waiting
  waiting: () => S("0 0 220 96", `${home(34, 8)}<circle cx="150" cy="30" r="11"/><path d="M128 84 c0 -34 44 -34 44 0"/><path class="art-day" d="M186 20 v12 M186 44 v0" stroke-width="5"/>`),
  thermo: () => S("0 0 40 40", `<path d="M20 4 a5 5 0 0 1 5 5 v13 a8 8 0 1 1 -10 0 v-13 a5 5 0 0 1 5 -5 Z"/><path d="M20 14 v14" stroke-width="4"/>`),
  bowl: () => S("0 0 40 40", `<path d="M5 18 H35 C35 33 5 33 5 18 Z"/><path d="M14 11 v3 M20 7 v7 M26 11 v3"/>`),
  leaf: () => S("0 0 40 40", `<path d="M7 33 C7 14 19 6 34 6 C34 23 26 33 7 33 Z"/><path d="M7 33 L24 16"/>`),
  bed: () => S("0 0 40 40", `<path d="M4 32 V10 M4 25 H36 V32 M36 25 v-4 a4 4 0 0 0 -4 -4 H17 v8"/><circle cx="10.5" cy="19" r="3"/>`),
  hospital: () => S("0 0 40 40", `<rect x="6" y="6" width="28" height="28" rx="6"/><path d="M20 13 V27 M13 20 H27"/>`),
  train: () => S("0 0 40 40", `<rect x="9" y="4" width="22" height="25" rx="6"/><path d="M9 17 H31 M13 36 l4 -7 M27 36 l-4 -7"/><path d="M15 23 h0 M25 23 h0" stroke-width="4"/>`),
  helmet: () => S("0 0 40 40", `<path d="M6 27 C6 7 34 7 34 27 Z"/><path d="M3 27 H37 M20 12 V20"/>`),
  spark: () => S("0 0 40 40", `<path class="art-spark" d="M20 3 q2 15 17 17 q-15 2 -17 17 q-2 -15 -17 -17 q15 -2 17 -17 Z" fill="currentColor"/>`),
  // registration checked against an existing ID
  idcard: () => S("0 0 120 96", `<rect x="8" y="14" width="100" height="66" rx="9"/><circle cx="36" cy="40" r="10"/><path d="M22 66 c0 -13 28 -13 28 0"/><path d="M64 34 H96 M64 48 H96 M64 62 H82"/>${tick(104, 76, 14)}`),
  // limits that rise with completed handovers
  steps: () => S("0 0 120 96", `<path d="M8 90 H112"/><rect class="art-day" style="animation-delay:0s" x="16" y="62" width="24" height="28" rx="4"/><rect class="art-day" style="animation-delay:.4s" x="48" y="40" width="24" height="50" rx="4"/><rect class="art-day" style="animation-delay:.8s" x="80" y="14" width="24" height="76" rx="4" fill="currentColor"/>`),
  // an audited report
  audit: () => S("0 0 120 96", `<rect x="24" y="4" width="68" height="88" rx="8"/><path d="M36 22 H80 M36 36 H80 M36 50 H66"/>${tick(88, 76, 15)}`),
  // weekly over-production chart, one day standing out
  chart: () => S("0 0 220 96", `<path d="M10 90 H210"/>${[38, 70, 44, 36, 48, 56, 40].map((h, i) => `<rect x="${22 + i * 27}" y="${88 - h}" width="17" height="${h}" rx="4" ${i === 1 ? 'fill="currentColor" class="art-day"' : ""}/>`).join("")}`),
  // the next receiver in line
  queue: () => S("0 0 220 96", `${home(20, 8)}${arrow(98, 132, 50)}${home(142, 8)}`),
  feed: () => S("0 0 220 96", `${tray(18, 30)}${arrow(94, 130, 54)}<g transform="translate(140 14) scale(1.7)"><path d="M5 18 H35 C35 33 5 33 5 18 Z"/><path d="M14 11 v3 M20 7 v7 M26 11 v3"/></g>`),
  compost: () => S("0 0 220 96", `${tray(18, 30)}${arrow(94, 130, 54)}<g transform="translate(140 12) scale(1.7)"><path d="M7 33 C7 14 19 6 34 6 C34 23 26 33 7 33 Z"/><path d="M7 33 L24 16"/></g>`),
  surplus: () => S("0 0 220 96", `${hall(16, 8)}${tray(104, 14, 50)}${tray(150, 40, 50)}`),
  // the host's impact card
  card: () => S("0 0 120 96", `<rect x="14" y="8" width="92" height="80" rx="9"/><path d="M14 48 H106"/>${tray(38, 12, 44)}<path d="M28 62 H92 M28 76 H68"/>`),
  loop: () => S("0 0 40 40", `<path d="M33 20 a13 13 0 1 1 -4 -9.3"/><path d="M30 4 v8 h-8"/>`),
  tickmark: () => S("0 0 30 30", tick(15, 15, 13)),
  // a chat message (WhatsApp)
  chat: () => S("0 0 40 40", `<path d="M6 8 H34 a3 3 0 0 1 3 3 V26 a3 3 0 0 1 -3 3 H16 L8 36 V29 H6 a3 3 0 0 1 -3 -3 V11 a3 3 0 0 1 3 -3 Z"/><path d="M11 16 H29 M11 22 H23"/>`),
  // exclusion filter
  funnel: () => S("0 0 40 40", `<path d="M4 6 H36 L23 21 V34 L17 30 V21 Z"/>`),
  // excluded: filled disc with a cross
  cross: () => S("0 0 30 30", `<circle cx="15" cy="15" r="13" fill="currentColor" stroke="none"/><path d="M10 10 L20 20 M20 10 L10 20" stroke="var(--paper)" stroke-width="3"/>`),
  // city bodies: a small skyline
  city: () => S("0 0 80 80", `<path d="M4 76 H76"/><rect x="10" y="34" width="18" height="42" rx="2"/><rect x="32" y="12" width="18" height="64" rx="2"/><rect x="54" y="44" width="16" height="32" rx="2"/><path d="M37 24 h8 M37 36 h8 M37 48 h8 M15 46 h8 M15 58 h8 M58 56 h8"/>`),
  // padlock: kitchen data kept private
  lock: () => S("0 0 40 40", `<rect x="8" y="18" width="24" height="17" rx="4"/><path d="M13 18 v-5 a7 7 0 0 1 14 0 v5"/><path d="M20 25 v4"/>`),
};

/** Fill every [data-art="name"] element with its drawing. */
export function mount(root = document) {
  for (const el of root.querySelectorAll("[data-art]")) el.innerHTML = art[el.dataset.art]?.() ?? "";
}
