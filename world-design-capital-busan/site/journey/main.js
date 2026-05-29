import { initScroll } from "./engine/scroll.js";
import { createInput } from "./engine/input.js";
import { createSnap } from "./engine/transitions.js";
import { initA11y } from "./engine/a11y.js";
import { createRegistry } from "./engine/sections.js";
import { isReflow, prefersReducedMotion } from "./engine/env.js";

const ORDER = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];

const scroll = initScroll();
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroll.lenis) scroll.lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

// ------------------------------------------------------------
// 섹션 레지스트리: 동적 로드 + 진입 시 활성화 (실패 시 정적 폴백)
// ------------------------------------------------------------
const registry = createRegistry();
const SECTION_MODULES = {
  "arrival": () => import("./sections/arrival.js"),
  "saved-scenes": () => import("./sections/saved-scenes.js"),
  "why-wdc": () => import("./sections/why-wdc.js"),
  "design-city": () => import("./sections/design-city.js"),
};
for (const [name, loader] of Object.entries(SECTION_MODULES)) {
  registry.register(name, async () => {
    const mod = await loader();
    return mod.default ? mod.default() : mod.create();
  });
}

let activeName = null;
async function activateSection(name) {
  if (activeName === name) return;
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
}

let a11y;
const snap = createSnap({
  order: ORDER, scrollTo,
  onChange: (id) => { a11y.setCurrent(id); activateSection(id); },
});
a11y = initA11y({ order: ORDER, onGo: (i) => snap.go(i), onJump: (id) => snap.jump(id) });

const snapMode = !isReflow() && !prefersReducedMotion();
window.__journeyMode = snapMode ? "snap" : "free";

const input = createInput({ onIntent: (i) => snap.go(i) });
input.setMode(window.__journeyMode);

// 1섹션 앞 프리로드 + 진입(50%) 활성화
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      activateSection(entry.target.id);
    }
  }
}, { threshold: [0.5] });
for (const id of ORDER) {
  const el = document.getElementById(id);
  if (el) io.observe(el);
}

// 키보드/스냅 점프 시에도 활성화·진행표시 동기화
window.__journeyJump = (id) => { snap.jump(id); activateSection(id); };

activateSection("arrival");
document.body.classList.remove("loading");
