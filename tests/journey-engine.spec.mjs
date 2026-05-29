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
