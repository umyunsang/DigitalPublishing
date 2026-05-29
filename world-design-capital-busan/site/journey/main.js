import { initScroll } from "./engine/scroll.js";
import { createInput } from "./engine/input.js";
import { createSnap } from "./engine/transitions.js";
import { initA11y } from "./engine/a11y.js";
import { createRegistry } from "./engine/sections.js";
import { initWebGL } from "./engine/webgl.js";
import { isReflow, prefersReducedMotion } from "./engine/env.js";
import { gsap } from "gsap";

const webgl = initWebGL(document.getElementById("gl"));

const ORDER = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];
// Sections taller than 100vh — need edge-aware snap so internal scroll works
const TALL_SECTIONS = new Set(["saved-scenes","why-wdc","design-city"]);

// ---- scroll & scrollTo --------------------------------------------------
const scroll = initScroll();
let suppressScrollTo = false;
const scrollTo = (id) => {
  if (suppressScrollTo) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (scroll.lenis) scroll.lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

// ---- section registry ---------------------------------------------------
const registry = createRegistry();
const SECTION_MODULES = {
  "arrival":         () => import("./sections/arrival.js"),
  "saved-scenes":    () => import("./sections/saved-scenes.js"),
  "why-wdc":         () => import("./sections/why-wdc.js"),
  "busan-syndrome":  () => import("./sections/busan-syndrome.js"),
  "mood-routes":     () => import("./sections/mood-routes.js"),
  "design-city":     () => import("./sections/design-city.js"),
  "archive":         () => import("./sections/archive.js"),
};
for (const [name, loader] of Object.entries(SECTION_MODULES)) {
  registry.register(name, async () => {
    const mod = await loader();
    const fn = mod.default ?? mod.create;
    return fn(webgl);
  });
}

// ---- section activation -------------------------------------------------
let activeName = null;
const DISPOSE_DISTANCE = 2;

async function activateSection(name) {
  if (activeName === name) return;
  teardownEdgeScroll();
  if (activeName) {
    if (registry.has(activeName)) registry.deactivate(activeName);
    document.getElementById(activeName)?.setAttribute("data-active", "false");
  }
  activeName = name;
  document.getElementById(name)?.setAttribute("data-active", "true");
  if (registry.has(name)) {
    try { await registry.activate(name); }
    catch (e) { console.warn(`section ${name} failed; static fallback`, e); }
  }
  // Dispose sections that are far away (re-init on demand)
  const activeIdx = ORDER.indexOf(name);
  for (const other of Object.keys(SECTION_MODULES)) {
    if (other === name) continue;
    if (Math.abs(ORDER.indexOf(other) - activeIdx) > DISPOSE_DISTANCE) {
      if (registry.has(other)) registry.dispose(other);
    }
  }
  // Tall sections: switch to free mode so internal scroll works
  if (TALL_SECTIONS.has(name) && snapMode) setupEdgeScroll(name);
}

// ---- edge-aware snap (tall sections) ------------------------------------
let edgeScrollAbort = null;

function teardownEdgeScroll() {
  edgeScrollAbort?.abort();
  edgeScrollAbort = null;
  // Restore snap mode when leaving a tall section (snapMode checked at runtime)
  if (snapMode) input.setMode("snap");
}

function setupEdgeScroll(id) {
  input.setMode("free");  // allow native scroll within the tall section
  const el = document.getElementById(id);
  if (!el) return;
  const ac = new AbortController();
  edgeScrollAbort = ac;
  let prevY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    const d = y - prevY;
    prevY = y;
    if (Math.abs(d) < 2) return;
    const sTop = el.offsetTop;
    const sBottom = sTop + el.offsetHeight - window.innerHeight;
    if (d > 0 && y >= sBottom - 20) {
      // Reached bottom edge — snap to next
      teardownEdgeScroll();
      input.lock();
      snapWithCurtain("next");
    } else if (d < 0 && y <= sTop + 20) {
      // Reached top edge — snap to previous
      teardownEdgeScroll();
      input.lock();
      snapWithCurtain("prev");
    }
  }, { passive: true, signal: ac.signal });
}

// ---- curtain transition -------------------------------------------------
const curtain = document.querySelector(".s-curtain");

function snapWithCurtain(intent) {
  if (!snapMode || prefersReducedMotion() || !curtain) {
    snap.go(intent);
    return;
  }
  const nextIdx = Math.max(0, Math.min(ORDER.length - 1,
    snap.index() + (intent === "next" ? 1 : -1)));
  if (nextIdx === snap.index()) { input.unlock(); return; }
  const nextId = ORDER[nextIdx];
  const nextEl = document.getElementById(nextId);

  input.lock();
  gsap.timeline()
    .to(curtain, { clipPath: "inset(0% 0 0 0)", duration: 0.25, ease: "power2.in" })
    .call(() => {
      // Instant jump behind the curtain — Lenis stays in sync
      if (nextEl) {
        if (scroll.lenis) scroll.lenis.scrollTo(nextEl, { immediate: true });
        else window.scrollTo({ top: nextEl.offsetTop, behavior: "instant" });
      }
      suppressScrollTo = true;
      snap.jump(nextId);    // onChange fires; scrollTo suppressed
      suppressScrollTo = false;
    })
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: 0.35, ease: "power2.out", delay: 0.05 })
    .call(() => { input.unlock(); });
}

// ---- navigation ---------------------------------------------------------
let a11y;
const snap = createSnap({
  order: ORDER, scrollTo,
  onChange: (id) => { a11y?.setCurrent(id); activateSection(id); },
});
a11y = initA11y({ order: ORDER, onGo: (i) => snap.go(i), onJump: (id) => snap.jump(id) });

const snapMode = !isReflow() && !prefersReducedMotion();
window.__journeyMode = snapMode ? "snap" : "free";

const input = createInput({ onIntent: (i) => snapWithCurtain(i) });
input.setMode(window.__journeyMode);

// IntersectionObserver: 뷰포트 중앙선 기준 섹션 활성화
// rootMargin으로 관찰 대역을 중앙 1px로 좁혀 높이와 무관하게 동작
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) activateSection(entry.target.id);
  }
}, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
for (const id of ORDER) {
  const el = document.getElementById(id);
  if (el) io.observe(el);
}

// 테스트/키보드 직접 점프: instant 스크롤로 IO 중간 발화 방지
window.__journeyJump = (id) => {
  const el = document.getElementById(id);
  if (el && scroll.lenis) scroll.lenis.scrollTo(el, { immediate: true });
  else if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
  suppressScrollTo = true;
  snap.jump(id);
  suppressScrollTo = false;
};

activateSection("arrival");
document.body.classList.remove("loading");
