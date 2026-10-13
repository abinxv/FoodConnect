// Shared runtime for plain HTML slides. Each slide file ends with:
//
//   <script type="module">
//     import { slide, layer, wire } from "../lib/deck.js";
//     slide(async ({ slide, zone }) => {
//       // runs after fonts and layout have settled: safe to measure boxes and draw wires
//       const w = layer(slide);
//       wire(w, zone.querySelector("#a"), zone.querySelector("#b"), { arrow: true });
//     });
//   </script>
//
// URL params: ?chrome=0 (hide template chrome preview), ?transparent=1, ?guides=1
const SVGNS = "http://www.w3.org/2000/svg";
const params = new URLSearchParams(location.search);

export async function loadDeck() {
  const r = await fetch(new URL("../deck.json", import.meta.url));
  return r.json();
}

const place = (el, r) => Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });

export async function settle() {
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
}

export async function slide(fn) {
  try {
    const deck = await loadDeck();
    document.documentElement.dataset.theme = deck.theme;
    document.body.classList.add("single");
    if (params.get("transparent") === "1") document.body.classList.add("transparent");
    const s = document.querySelector(".slide");
    if (!s) throw new Error("no .slide element");
    const id = s.id;
    Object.assign(s.style, { width: `${deck.canvas.width}px`, height: `${deck.canvas.height}px` });
    let zone = s.querySelector(":scope > .zone");
    if (!zone) {
      zone = document.createElement("div");
      zone.className = "zone";
      s.append(zone);
    }
    let band = s.querySelector(":scope > .band");
    if (!band) {
      band = document.createElement("div");
      band.className = "band";
      s.prepend(band);
    }
    place(zone, deck.zone);
    place(band, deck.band);
    const t = deck.template;
    if (t && t.map && id in t.map && params.get("chrome") !== "0") {
      const img = document.createElement("img");
      img.className = "chrome";
      img.alt = "";
      img.src = new URL(`../chrome/${id}.png`, import.meta.url).href;
      img.onerror = () => img.remove();
      s.prepend(img);
    }
    if (params.get("guides") === "1") s.classList.add("guides");
    await settle();
    if (fn) await fn({ id, slide: s, zone, band, deck, params });
    await settle();
    sync();
    // Export (Playwright) gets one frozen frame; a browser gets the loops. ?live=1 keeps motion, ?still=1 forces a still.
    if ((navigator.webdriver && params.get("live") !== "1") || params.get("still") === "1") freeze();
    window.__ready = true;
  } catch (e) {
    console.error(e);
    window.__error = String(e?.stack || e);
  }
}

// ---------- wires ----------
export function svg(tag, attrs = {}) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) e.setAttribute(k, String(v));
  return e;
}

export function layer(root, z = 5) {
  const s = svg("svg", { class: "wires", width: root.offsetWidth, height: root.offsetHeight, viewBox: `0 0 ${root.offsetWidth} ${root.offsetHeight}`, "data-lint": "off" });
  Object.assign(s.style, { position: "absolute", left: "0", top: "0", overflow: "visible", pointerEvents: "none", zIndex: String(z) });
  root.append(s);
  return s;
}

export function box(node, root) {
  const a = node.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  const k = root.offsetWidth ? b.width / root.offsetWidth : 1;
  return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k };
}

function anchor(b, side, off = 0) {
  if (side === "left") return { x: b.x, y: b.y + b.h / 2 + off };
  if (side === "right") return { x: b.x + b.w, y: b.y + b.h / 2 + off };
  if (side === "top") return { x: b.x + b.w / 2 + off, y: b.y };
  return { x: b.x + b.w / 2 + off, y: b.y + b.h };
}

function guess(A, B) {
  const dx = B.x + B.w / 2 - (A.x + A.w / 2);
  const dy = B.y + B.h / 2 - (A.y + A.h / 2);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ["right", "left"] : ["left", "right"];
  return dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
}

/** opts: from, to (left|right|top|bottom), shape (curve|elbow|straight), color, width, dash, dot, arrow */
export function wire(layerEl, a, b, o = {}) {
  const root = layerEl.parentElement;
  const A = box(a, root);
  const B = box(b, root);
  const [fs, ts] = guess(A, B);
  const from = o.from ?? fs;
  const to = o.to ?? ts;
  return wirePts(layerEl, anchor(A, from, o.fromOffset), anchor(B, to, o.toOffset), { ...o, from, to });
}

export function wirePts(layerEl, p, q, o = {}) {
  const color = o.color ?? "var(--wire)";
  const horiz = (s) => s === "left" || s === "right" || s === undefined;
  let d;
  if (o.shape === "straight") d = `M${p.x},${p.y} L${q.x},${q.y}`;
  else if (o.shape === "elbow") {
    if (horiz(o.from)) {
      const mx = (p.x + q.x) / 2;
      d = `M${p.x},${p.y} H${mx} V${q.y} H${q.x}`;
    } else {
      const my = (p.y + q.y) / 2;
      d = `M${p.x},${p.y} V${my} H${q.x} V${q.y}`;
    }
  } else if (horiz(o.from)) {
    const dx = (q.x - p.x) / 2;
    d = `M${p.x},${p.y} C${p.x + dx},${p.y} ${q.x - dx},${q.y} ${q.x},${q.y}`;
  } else {
    const dy = (q.y - p.y) / 2;
    d = `M${p.x},${p.y} C${p.x},${p.y + dy} ${q.x},${q.y - dy} ${q.x},${q.y}`;
  }
  const path = svg("path", { d, fill: "none", stroke: color, "stroke-width": o.width ?? 1.6, "stroke-dasharray": o.dash ?? null, "stroke-linecap": "round" });
  layerEl.append(path);
  if (o.arrow) layerEl.append(arrowHead(p, q, color, o.to));
  else if (o.dot !== false) layerEl.append(svg("circle", { cx: q.x, cy: q.y, r: 3.2, fill: "var(--paper)", stroke: color, "stroke-width": 1.6 }));
  return path;
}

export function arrowHead(p, q, color, side) {
  const ang = side === "left" ? 0 : side === "right" ? Math.PI : side === "top" ? Math.PI / 2 : side === "bottom" ? -Math.PI / 2 : Math.atan2(q.y - p.y, q.x - p.x);
  const L = 9, W = 4.5;
  const bx = q.x - L * Math.cos(ang), by = q.y - L * Math.sin(ang);
  const nx = -Math.sin(ang) * W, ny = Math.cos(ang) * W;
  return svg("path", { d: `M${q.x},${q.y} L${bx + nx},${by + ny} L${bx - nx},${by - ny} Z`, fill: color });
}

// ---------- motion ----------
/** Pause every running animation at its still frame: --still (0..1, default 0.6) of one loop. */
export function freeze() {
  for (const a of document.getAnimations()) {
    const t = a.effect?.getComputedTiming?.();
    const target = a.effect?.target;
    if (!t || !target || !Number.isFinite(t.duration)) continue;
    const v = parseFloat(getComputedStyle(target).getPropertyValue("--still"));
    a.pause();
    a.currentTime = t.duration * (Number.isFinite(v) ? v : 0.6);
  }
}

/** Put every animation on one clock. CSS animations start at page load but tokens are created
 *  later (after fonts settle), so without this a token drifts from the cards it should light. */
export function sync() {
  const t0 = document.timeline.currentTime;
  for (const a of document.getAnimations()) a.startTime = t0;
}

/** Light each card exactly while a rail token is under it. The rail runs from the first card's
 *  left edge to the last card's right edge and the token crosses it in `dur` seconds. */
export function railSync(cards, root, dur) {
  const b = cards.map((c) => box(c, root));
  const x0 = b[0].x, len = b[b.length - 1].x + b[b.length - 1].w - x0;
  cards.forEach((c, i) => (c.style.animationDelay = `${(((b[i].x - x0) / len) * dur).toFixed(3)}s`));
}

/** Flow tokens that travel along a wire on a loop. opts: n (tokens), dur (s), color, size, still */
export function flow(root, pathEl, o = {}) {
  const d = pathEl.getAttribute("d");
  const n = o.n ?? 1;
  const dur = o.dur ?? 6;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = document.createElement("div");
    t.className = "token";
    t.dataset.lint = "off";
    t.style.offsetPath = `path("${d}")`;
    t.style.setProperty("--dur", `${dur}s`);
    t.style.setProperty("--delay", `${-(dur * i) / n - (o.phase ?? 0)}s`);
    if (o.still !== undefined) t.style.setProperty("--still", String(o.still));
    if (o.color) {
      t.style.background = o.color;
      t.style.boxShadow = `0 0 0 4px color-mix(in srgb, ${o.color} 22%, transparent)`;
    }
    if (o.size) Object.assign(t.style, { width: `${o.size}px`, height: `${o.size}px` });
    root.append(t);
    out.push(t);
  }
  return out;
}

// Inside the presenter (present.html) a focused slide forwards keys and clicks to it.
if (window.parent !== window) {
  addEventListener("keydown", (e) => window.parent.postMessage({ deckKey: e.key }, "*"));
  addEventListener("click", () => window.parent.postMessage({ deckKey: "ArrowRight" }, "*"));
}
