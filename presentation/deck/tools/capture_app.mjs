#!/usr/bin/env node
// Screenshots of the FoodConnect app for the deck. The app calls its API on 127.0.0.1:5000,
// which macOS AirPlay holds, so requests are forwarded to the API started on PORT=5055.
//   node tools/capture_app.mjs      (app on http://127.0.0.1:5183, API on 5055; see agent_guide.md section 10)
import { chromium } from "playwright";
const APP = "http://127.0.0.1:5183/";
const browser = await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.route("http://127.0.0.1:5000/**", async (route) => {
  const req = route.request();
  const r = await fetch(req.url().replace(":5000", ":5055"), { method: req.method(), headers: { "Content-Type": "application/json" }, body: req.postData() ?? undefined });
  await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: await r.text() });
});
const shot = (name, opts = {}) => page.screenshot({ path: `img/${name}.png`, ...opts });
await page.goto(APP);
await page.click(".auth-submit");
await page.waitForSelector(".auth-page", { state: "detached" });
await page.waitForTimeout(600);
await shot("app-receiver-overview");
await page.getByText("Available food", { exact: true }).first().click();
await page.waitForTimeout(500);
await shot("app-available-food");
await page.getByPlaceholder("Search food or area").fill("Wedding");
await page.waitForTimeout(400);
await shot("app-wedding-row");
await page.getByText("Reserve", { exact: true }).first().click();
await page.waitForSelector(".modal");
await page.waitForTimeout(400);
await shot("app-wedding-listing");
await page.locator(".modal").screenshot({ path: "img/app-wedding-listing-modal.png" });
await browser.close();
console.log("ok");
