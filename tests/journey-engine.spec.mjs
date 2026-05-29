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

test("env detects reduced-motion and dpr cap", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(JOURNEY);
  const env = await page.evaluate(async () => {
    const m = await import("./engine/env.js");
    return { rm: m.prefersReducedMotion(), dpr: m.cappedDPR() };
  });
  expect(env.rm).toBe(true);
  expect(env.dpr).toBeLessThanOrEqual(2);
});

test("sections lifecycle: enter/leave fire and import error degrades", async ({ page }) => {
  await page.goto(JOURNEY);
  const result = await page.evaluate(async () => {
    const { createRegistry } = await import("./engine/sections.js");
    const log = [];
    const reg = createRegistry();
    reg.register("arrival", () => ({
      init() { log.push("init"); }, enter() { log.push("enter"); },
      leave() { log.push("leave"); }, dispose() { log.push("dispose"); },
    }));
    let degraded = false;
    reg.register("broken", async () => {
      await import("./sections/__missing__.js").catch(() => { degraded = true; throw new Error("x"); });
    });
    await reg.activate("arrival");
    reg.deactivate("arrival");
    await reg.activate("broken").catch(() => {});
    return { log, degraded };
  });
  expect(result.log).toEqual(["init", "enter", "leave"]);
  expect(result.degraded).toBe(true);
});

test("transitions: next/prev change current index with clamping", async ({ page }) => {
  await page.goto(JOURNEY);
  const r = await page.evaluate(async () => {
    const { createSnap } = await import("./engine/transitions.js");
    const order = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];
    let scrolledTo = null;
    const snap = createSnap({ order, scrollTo: (id) => { scrolledTo = id; } });
    snap.go("next"); const a = snap.current();
    snap.go("prev"); snap.go("prev"); const b = snap.current();
    return { a, scrolledTo, b };
  });
  expect(r.a).toBe("saved-scenes");
  expect(r.b).toBe("arrival");
});

test("input emits next on wheel down (desktop)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "wheel is a desktop-only input; touch swipe validated separately");
  await page.goto(JOURNEY);
  await page.evaluate(async () => {
    const { createInput } = await import("./engine/input.js");
    window.__intents = [];
    const input = createInput({ onIntent: (i) => window.__intents.push(i) });
    input.setMode("snap");
  });
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);
  const intents = await page.evaluate(() => window.__intents);
  expect(intents).toContain("next");
});

test("single webgl renderer: one context, scene register/dispose", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "headless mobile GPU is unreliable; mobile WebGL validated in P2");
  await page.goto(JOURNEY);
  const r = await page.evaluate(async () => {
    const { initWebGL } = await import("./engine/webgl.js");
    const THREE = await import("three");
    const gl = initWebGL(document.getElementById("gl"));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    gl.registerScene("t", scene, cam);
    gl.setActive("t");
    const hasCtx = !!gl.renderer;
    gl.unregisterScene("t");
    gl.dispose();
    return { hasCtx };
  });
  expect(r.hasCtx).toBe(true);
});

test("scroll engine initializes and is bypassed under reduced-motion", async ({ page }) => {
  await page.goto(JOURNEY);
  const normal = await page.evaluate(async () => {
    const { initScroll } = await import("./engine/scroll.js");
    const api = initScroll();
    const active = !!api.lenis;
    api.destroy();
    return active;
  });
  expect(normal).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reduced = await page.evaluate(async () => {
    const { initScroll } = await import("./engine/scroll.js");
    const api = initScroll();
    const lenisOff = api.lenis === null;
    api.destroy();
    return lenisOff;
  });
  expect(reduced).toBe(true);
});
