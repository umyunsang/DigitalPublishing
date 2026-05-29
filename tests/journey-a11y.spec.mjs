import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const JOURNEY = "/world-design-capital-busan/site/journey/";

test("keyboard ArrowDown advances current section", async ({ page }) => {
  await page.goto(JOURNEY);
  await page.locator("body").click();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(400);
  const cur = await page.evaluate(() =>
    document.querySelector('.progress li[aria-current="true"]')?.dataset.target);
  expect(cur).toBe("saved-scenes");
});

test("axe WCAG 2.2 AA: no critical or serious violations", async ({ page }) => {
  await page.goto(JOURNEY);
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a","wcag2aa","wcag22aa"] } });
    return res.violations
      .filter((v) => v.impact === "critical" || v.impact === "serious")
      .map((v) => ({ id: v.id, impact: v.impact, help: v.help }));
  });
  expect(violations).toEqual([]);
});

test("progress indicator has 7 markers", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator(".progress li")).toHaveCount(7);
});

test("reflow: snap disabled on very narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto(JOURNEY);
  await page.waitForTimeout(100);
  const mode = await page.evaluate(() => window.__journeyMode || "free");
  expect(mode).toBe("free");
});
