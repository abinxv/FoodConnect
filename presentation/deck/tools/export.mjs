#!/usr/bin/env node
// Render slides with Playwright. Lives in deck/tools/ (copied there by scaffold).
//
//   node tools/export.mjs s2                 review PNG -> ../slides/s2.png (2x), text + layout dump -> out/text/s2.json
//   node tools/export.mjs s2 s3 | --all      several / every slide in deck.json "slides"
//   node tools/export.mjs s2 --zone          also out/png/s2.zone.png: transparent export band at 3x (template assembly)
//   node tools/export.mjs s2 --crop 900,300,500,300 [--crop ...]   detail crops -> out/check/ (slide px, 3x)
//   node tools/export.mjs s2 --guides        out/check/s2-guides.png with the zone and band outlined
//   options: --scale 2  --no-chrome  --jobs 3  --timeout 90
//
// Starts the dev server (vite, or python http.server for the simple method) if it is not
// running, and stops it again afterwards. Fails loudly if the port belongs to another app.
// Browser: $DECK_CHROME (executable path) -> Playwright's chromium -> installed Google Chrome.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const deckDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(deckDir, "..");
const deck = JSON.parse(fs.readFileSync(path.join(deckDir, "deck.json"), "utf8"));
const W = deck.canvas.width;
const H = deck.canvas.height;

// ---- args ----
const argv = process.argv.slice(2);
const ids = [];
const crops = [];
const opt = { scale: 2, jobs: 3, timeout: 90, zone: false, guides: false, chrome: true, all: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--all") opt.all = true;
  else if (a === "--zone") opt.zone = true;
  else if (a === "--guides") opt.guides = true;
  else if (a === "--no-chrome") opt.chrome = false;
  else if (a === "--scale") opt.scale = Number(argv[++i]);
  else if (a === "--jobs") opt.jobs = Number(argv[++i]);
  else if (a === "--timeout") opt.timeout = Number(argv[++i]);
  else if (a === "--crop") {
    const r = argv[++i].split(",").map(Number);
    if (r.length !== 4 || r.some((n) => !Number.isFinite(n))) die("--crop needs x,y,w,h in slide px");
    crops.push(r);
  } else if (a.startsWith("--")) die(`unknown option ${a}`);
  else ids.push(a);
}
if (opt.all) ids.push(...deck.slides);
if (!ids.length) die("which slides? e.g. `node tools/export.mjs s2` or `--all`");

function die(m) {
  console.error(`export: ${m}`);
  process.exit(1);
}

// ---- dev server ----
const base = `http://127.0.0.1:${deck.port}`;
async function probe() {
  try {
    const r = await fetch(base + "/", { signal: AbortSignal.timeout(2000) });
    return r.ok ? await r.text() : "";
  } catch {
    return null;
  }
}
let server = null;
async function ensureServer() {
  const t = await probe();
  if (t !== null) {
    if (!t.includes(deck.id)) die(`port ${deck.port} is used by another app. Pick a free port: node <skill>/scripts/scaffold.mjs --root .. --update-json --port <n>`);
    return;
  }
  fs.mkdirSync(path.join(deckDir, "out"), { recursive: true });
  const log = fs.openSync(path.join(deckDir, "out", "server.log"), "w");
  if (deck.method === "vite") {
    const bin = path.join(deckDir, "node_modules", "vite", "bin", "vite.js");
    if (!fs.existsSync(bin)) die("vite not installed. Run `npm install` in deck/.");
    server = spawn(process.execPath, [bin, "--port", String(deck.port), "--strictPort", "--host", "127.0.0.1"], { cwd: deckDir, stdio: ["ignore", log, log] });
  } else {
    const py = process.platform === "win32" ? "python" : "python3";
    server = spawn(py, ["-m", "http.server", String(deck.port), "--bind", "127.0.0.1", "--directory", deckDir], { cwd: deckDir, stdio: ["ignore", log, log] });
  }
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const t2 = await probe();
    if (t2 !== null && t2.includes(deck.id)) return;
    if (server.exitCode !== null) break;
  }
  die(`dev server did not start on ${deck.port}; see deck/out/server.log`);
}
const stopServer = () => server && server.exitCode === null && server.kill();
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));

// ---- browser ----
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  die("playwright is not installed. Run `npm install` in deck/.");
}
async function launch() {
  const args = ["--force-color-profile=srgb", "--font-render-hinting=none", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"];
  const tries = [];
  if (process.env.DECK_CHROME) tries.push({ executablePath: process.env.DECK_CHROME });
  tries.push({});
  tries.push({ channel: "chrome" });
  let last;
  for (const t of tries) {
    try {
      return await chromium.launch({ ...t, args });
    } catch (e) {
      last = e;
    }
  }
  die(`could not start a browser. Run \`npx playwright install chromium\` in deck/, install Google Chrome, or set DECK_CHROME.\n${last?.message?.split("\n")[0]}`);
}

const urlFor = (id, q = {}) => {
  const p = new URLSearchParams(q);
  if (!opt.chrome) p.set("chrome", "0");
  if (deck.method === "vite") {
    p.set("slide", id);
    return `${base}/?${p}`;
  }
  const qs = p.toString();
  return `${base}/slides/${id}.html${qs ? "?" + qs : ""}`;
};

async function open(browser, id, scale, q = {}) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
  const resp = await page.goto(urlFor(id, q), { waitUntil: "load", timeout: opt.timeout * 1000 });
  if (deck.method === "simple" && resp && resp.status() === 404) {
    await page.close();
    throw new Error(`slides/${id}.html not found`);
  }
  try {
    await page.waitForFunction(() => window.__ready === true || !!window.__error, null, { timeout: opt.timeout * 1000 });
  } catch {
    await page.close();
    throw new Error(`timed out waiting for window.__ready. Script errors:\n  ${errors.join("\n  ") || "(none reported)"}`);
  }
  const err = await page.evaluate(() => window.__error);
  if (err) {
    await page.close();
    throw new Error(`slide threw: ${err}\n  ${errors.join("\n  ")}`);
  }
  return { page, errors };
}

// Runs inside the page: visible text grouped by block, word count, layout problems.
function collect({ floor }) {
  const slide = document.querySelector(".slide");
  const S = slide.getBoundingClientRect();
  const zone = slide.querySelector(":scope > .zone");
  const Z = zone ? zone.getBoundingClientRect() : S;
  const rel = (r) => ({ x: Math.round(r.left - S.left), y: Math.round(r.top - S.top), w: Math.round(r.width), h: Math.round(r.height) });
  const isSvg = (e) => e instanceof SVGElement;
  const blockOf = (e) => {
    if (isSvg(e)) return e.closest("text") || e;
    let b = e;
    while (b && b !== slide) {
      const d = getComputedStyle(b).display;
      if (d !== "inline" && d !== "contents") break;
      b = b.parentElement;
    }
    return b || e;
  };
  const blocks = new Map();
  const tw = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const s = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!s) continue;
    const e = n.parentElement;
    if (!e || e.closest("style,script,[data-lint='off']")) continue;
    if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const b = blockOf(e);
    if (!blocks.has(b)) blocks.set(b, { parts: [], rects: [], minSize: 999 });
    const rec = blocks.get(b);
    rec.parts.push(s);
    let size = parseFloat(getComputedStyle(e).fontSize);
    if (isSvg(e) && e.getScreenCTM && e.getScreenCTM()) size *= Math.abs(e.getScreenCTM().a); // rendered size of scaled SVG text
    rec.minSize = Math.min(rec.minSize, size);
    const range = document.createRange();
    range.selectNodeContents(n);
    let rs = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (!rs.length) rs = [e.getBoundingClientRect()];
    rec.rects.push(...rs);
  }
  const words = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%/+-]*/gu) || []).length;
  const out = [];
  const issues = { outside_zone: [], clipped: [], collisions: [], small_text: [], broken_images: [] };
  let total = 0;
  for (const [b, rec] of blocks) {
    const text = rec.parts.join(" ");
    const count = !b.closest("[data-count='off']");
    const r = b.getBoundingClientRect();
    const item = { text, size: Math.round(rec.minSize * 10) / 10, count, ...rel(r) };
    out.push(item);
    if (count) total += words(text);
    if (rec.minSize < floor) issues.small_text.push({ text: text.slice(0, 80), size: item.size });
    if (!b.closest("[data-bleed]")) {
      const bad = rec.rects.some((q) => q.left < Z.left - 2 || q.top < Z.top - 2 || q.right > Z.right + 2 || q.bottom > Z.bottom + 2);
      if (bad) issues.outside_zone.push({ text: text.slice(0, 80), ...rel(r) });
    }
    // clipped by an ancestor with overflow != visible, or spilling out of its own box
    let a = isSvg(b) ? null : b;
    let clipped = false;
    if (a && a.clientWidth > 0 && (a.scrollWidth > a.clientWidth + 2 || a.scrollHeight > a.clientHeight + 2)) {
      const ov = getComputedStyle(a);
      if (ov.overflow !== "visible" || ov.whiteSpace === "nowrap") clipped = true;
    }
    for (let p = b.parentElement; p && p !== slide && !clipped; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflow === "visible" && cs.overflowX === "visible" && cs.overflowY === "visible") continue;
      const P = p.getBoundingClientRect();
      if (rec.rects.some((q) => q.left < P.left - 2 || q.top < P.top - 2 || q.right > P.right + 2 || q.bottom > P.bottom + 2)) clipped = true;
    }
    if (clipped) issues.clipped.push({ text: text.slice(0, 80), ...rel(r) });
    rec.item = item;
    rec.el = b;
  }
  const list = [...blocks.values()];
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const A = list[i], B = list[j];
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const hit = A.rects.some((p) => B.rects.some((q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 3 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 3));
      if (hit) issues.collisions.push({ a: A.item.text.slice(0, 60), b: B.item.text.slice(0, 60) });
    }
  for (const img of slide.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (src && img.complete && img.naturalWidth === 0 && !img.classList.contains("chrome")) issues.broken_images.push(src);
  }
  const ul_items = [...slide.querySelectorAll("ul li")].filter((li) => !li.closest("[data-lint='off']")).length;
  return { words: total, blocks: out, ul_items, issues };
}

async function doSlide(browser, id) {
  const lines = [];
  // review render
  const { page, errors } = await open(browser, id, opt.scale);
  const png = path.join(root, "slides", `${id}.png`);
  fs.mkdirSync(path.dirname(png), { recursive: true });
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
  const dump = await page.evaluate(collect, { floor: deck.type_floor_px ?? 13 });
  await page.close();
  dump.id = id;
  dump.console_errors = errors;
  const title = (deck.title_slides || []).includes(id) || id === "board";
  dump.budget = title ? null : deck.words_per_slide;
  fs.mkdirSync(path.join(deckDir, "out", "text"), { recursive: true });
  fs.writeFileSync(path.join(deckDir, "out", "text", `${id}.json`), JSON.stringify(dump, null, 2));

  const i = dump.issues;
  const b = dump.budget;
  const over = b && dump.words > b[1] ? `  OVER BUDGET (${b[0]}-${b[1]})` : b ? ` (budget ${b[0]}-${b[1]})` : " (no word budget)";
  lines.push(`${id}: ${path.relative(process.cwd(), png)}  words ${dump.words}${over}`);
  const counts = Object.entries(i).filter(([, v]) => v.length).map(([k, v]) => `${k} ${v.length}`);
  if (dump.ul_items) counts.push(`bullets ${dump.ul_items}`);
  if (errors.length) counts.push(`console errors ${errors.length}`);
  lines.push(counts.length ? `  check: ${counts.join(", ")}  (details: python3 tools/lint_copy.py ${id})` : "  layout: no problems found");

  if (opt.zone) {
    const z = await open(browser, id, 3, { transparent: "1", chrome: "0" });
    const f = path.join(deckDir, "out", "png", `${id}.zone.png`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const band = deck.band;
    await z.page.screenshot({ path: f, omitBackground: true, clip: { x: band.x, y: band.y, width: band.w, height: band.h } });
    await z.page.close();
    lines.push(`  zone: ${path.relative(process.cwd(), f)}`);
  }
  if (opt.guides) {
    const g = await open(browser, id, 1, { guides: "1" });
    const f = path.join(deckDir, "out", "check", `${id}-guides.png`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    await g.page.screenshot({ path: f, clip: { x: 0, y: 0, width: W, height: H } });
    await g.page.close();
    lines.push(`  guides: ${path.relative(process.cwd(), f)}`);
  }
  return lines.join("\n");
}

async function doCrops(browser, id) {
  const { page } = await open(browser, id, 3);
  const out = [];
  for (const [x, y, w, h] of crops) {
    const f = path.join(deckDir, "out", "check", `${id}-crop-${x}-${y}-${w}x${h}.png`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    await page.screenshot({ path: f, clip: { x, y, width: w, height: h } });
    out.push(`${id}: ${path.relative(process.cwd(), f)}`);
  }
  await page.close();
  return out.join("\n");
}

await ensureServer();
const browser = await launch();
let failed = 0;
const queue = [...new Set(ids)];
async function worker() {
  while (queue.length) {
    const id = queue.shift();
    const t0 = Date.now();
    try {
      const msg = crops.length ? await doCrops(browser, id) : await doSlide(browser, id);
      console.log(`${msg}  [${((Date.now() - t0) / 1000).toFixed(1)} s]`);
    } catch (e) {
      failed++;
      console.error(`${id}: FAILED ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: Math.max(1, opt.jobs) }, worker));
await browser.close();
stopServer();
process.exit(failed ? 1 : 0);
