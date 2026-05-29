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
// 활성 섹션에서 이만큼 떨어진 섹션은 dispose해 메모리/ScrollTrigger를 상한 (스펙 §8 lazy+dispose)
const DISPOSE_DISTANCE = 2;
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
  // 멀리 떨어진 섹션 정리(다시 가까워지면 재init)
  const activeIdx = ORDER.indexOf(name);
  for (const other of Object.keys(SECTION_MODULES)) {
    if (other === name) continue;
    if (Math.abs(ORDER.indexOf(other) - activeIdx) > DISPOSE_DISTANCE) {
      if (registry.has(other)) registry.dispose(other);
    }
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

// 뷰포트 중앙선(0높이 밴드)에 걸친 섹션을 활성화.
// rootMargin으로 루트를 중앙 한 줄로 좁혀, 섹션 높이(100~360vh)와 무관하게 동작한다.
// (고정 intersectionRatio 방식은 뷰포트보다 2배 이상 긴 섹션에서 영영 임계에 도달하지 못함)
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) activateSection(entry.target.id);
  }
}, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
for (const id of ORDER) {
  const el = document.getElementById(id);
  if (el) io.observe(el);
}

// 키보드/스냅 점프 시에도 활성화·진행표시 동기화
window.__journeyJump = (id) => { snap.jump(id); activateSection(id); };

activateSection("arrival");
document.body.classList.remove("loading");
