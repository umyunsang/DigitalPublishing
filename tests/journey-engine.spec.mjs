import { expect, test } from "@playwright/test";

const JOURNEY = "/world-design-capital-busan/site/journey/";
const SECTIONS = [
  "arrival", "saved-scenes", "why-wdc", "busan-syndrome",
  "mood-routes", "design-city", "archive",
];

test("journey shell renders 7 sections", async ({ page }) => {
  await page.goto(JOURNEY);
  for (const id of SECTIONS) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("design tokens and full-viewport sections applied", async ({ page }) => {
  await page.goto("/world-design-capital-busan/site/journey/");
  const easeEnter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--ease-enter").trim());
  expect(easeEnter.length).toBeGreaterThan(0);
  const h = await page.locator("#arrival").evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThan(500);
});

test("vendor modules import without error", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/world-design-capital-busan/site/journey/");
  await page.evaluate(async () => {
    await import("gsap");
    await import("gsap/ScrollTrigger");
    await import("gsap/Observer");
    await import("lenis");
    await import("three");
  });
  expect(errors).toEqual([]);
});
