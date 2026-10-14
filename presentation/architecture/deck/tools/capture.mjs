#!/usr/bin/env node
// Screenshot the running project (the app itself, not the deck). Lives in deck/tools/.
//
//   node tools/capture.mjs --url http://127.0.0.1:3000/ --name app-home
//        [--width 1440 --height 900 --scale 2] [--mobile] [--dark] [--full]
//        [--wait "#map"] [--delay 800] [--hide ".dev-badge,.cookie-bar"] [--auth out/auth.json]
//   node tools/capture.mjs --batch capture.json
//
// capture.json:
//   { "defaults": { "width": 1440, "height": 900, "scale": 2, "hide": [".dev-badge"] },
//     "shots": [
//       { "name": "login-done", "url": "http://127.0.0.1:3000/login",
//         "actions": [ {"fill": ["#roll", "160125737001"]}, {"fill": ["#pw", "demo-pass"]},
//                      {"click": "button[type=submit]"}, {"wait": "#home"} ],
//         "saveAuth": "out/auth.json" },
//       { "name": "stop-page", "url": "http://127.0.0.1:3000/stop/12", "auth": "out/auth.json",
//         "mobile": true, "dark": true, "wait": ".eta", "delay": 500 } ] }
//   actions: {click: sel} {fill: [sel, text]} {press: key} {wait: ms | sel} {goto: url} {hover: sel} {scroll: [x, y]}
//
// Writes deck/<img_dir>/<name>.png (deck.json img_dir). The project must already be running;
// this script never starts, stops or kills the project's processes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const deck = JSON.parse(fs.readFileSync(path.join(deckDir, "deck.json"), "utf8"));
const argv = process.argv.slice(2);
const a = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const k = argv[i].slice(2);
  a[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
}
const die = (m) => {
  console.error(`capture: ${m}`);
  process.exit(1);
};

let shots;
if (a.batch) {
  const cfg = JSON.parse(fs.readFileSync(path.resolve(a.batch), "utf8"));
  shots = cfg.shots.map((s) => ({ ...(cfg.defaults || {}), ...s }));
} else {
  if (!a.url || !a.name) die("need --url and --name (or --batch file.json)");
  shots = [
    {
      name: a.name,
      url: a.url,
      width: a.width && Number(a.width),
      height: a.height && Number(a.height),
      scale: a.scale && Number(a.scale),
      mobile: !!a.mobile,
      dark: !!a.dark,
      fullPage: !!a.full,
      wait: a.wait,
      delay: a.delay && Number(a.delay),
      hide: a.hide ? String(a.hide).split(",") : [],
      auth: a.auth,
    },
  ];
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  die("playwright is not installed. Run `npm install` in deck/.");
}
async function launch() {
  const tries = [];
  if (process.env.DECK_CHROME) tries.push({ executablePath: process.env.DECK_CHROME });
  tries.push({}, { channel: "chrome" });
  let last;
  for (const t of tries) {
    try {
      return await chromium.launch({ ...t, args: ["--force-color-profile=srgb", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
    } catch (e) {
      last = e;
    }
  }
  die(`no browser: ${last?.message?.split("\n")[0]}`);
}

const browser = await launch();
const outDir = path.join(deckDir, deck.img_dir);
fs.mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const s of shots) {
  const mobile = !!s.mobile;
  const ctx = await browser.newContext({
    viewport: { width: s.width || (mobile ? 390 : 1440), height: s.height || (mobile ? 844 : 900) },
    deviceScaleFactor: s.scale || (mobile ? 3 : 2),
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: s.dark ? "dark" : "light",
    timezoneId: s.timezone,
    locale: s.locale,
    storageState: s.auth && fs.existsSync(path.resolve(deckDir, s.auth)) ? path.resolve(deckDir, s.auth) : undefined,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(s.url, { waitUntil: "load", timeout: 90000 }).catch((e) => {
      throw new Error(`cannot open ${s.url} (is the project running?): ${e.message.split("\n")[0]}`);
    });
    for (const act of s.actions || []) {
      if (act.click) await page.click(act.click);
      else if (act.fill) await page.fill(act.fill[0], act.fill[1]);
      else if (act.press) await page.keyboard.press(act.press);
      else if (act.hover) await page.hover(act.hover);
      else if (act.goto) await page.goto(act.goto, { waitUntil: "load" });
      else if (act.scroll) await page.mouse.wheel(act.scroll[0], act.scroll[1]);
      else if (typeof act.wait === "number") await page.waitForTimeout(act.wait);
      else if (act.wait) await page.waitForSelector(act.wait, { timeout: 60000 });
    }
    if (s.wait) await page.waitForSelector(s.wait, { timeout: 60000 });
    const hide = [].concat(s.hide || []);
    if (hide.length) await page.addStyleTag({ content: `${hide.join(",")} { visibility: hidden !important; }` });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(s.delay ?? 400);
    const f = path.join(outDir, `${s.name}.png`);
    await page.screenshot({ path: f, fullPage: !!s.fullPage, clip: s.clip });
    if (s.saveAuth) await ctx.storageState({ path: path.resolve(deckDir, s.saveAuth) });
    const vp = page.viewportSize();
    console.log(`${s.name}: ${path.relative(process.cwd(), f)} (${vp.width}x${vp.height} @${s.scale || (mobile ? 3 : 2)}x)`);
  } catch (e) {
    failed++;
    console.error(`${s.name}: FAILED ${e.message}`);
  }
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
