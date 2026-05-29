import { initScroll } from "./engine/scroll.js";
import { createInput } from "./engine/input.js";
import { createSnap } from "./engine/transitions.js";
import { initA11y } from "./engine/a11y.js";
import { isReflow, prefersReducedMotion } from "./engine/env.js";

const ORDER = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];

const scroll = initScroll();
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroll.lenis) scroll.lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

let a11y;
const snap = createSnap({ order: ORDER, scrollTo, onChange: (id) => a11y.setCurrent(id) });
a11y = initA11y({ order: ORDER, onGo: (i) => snap.go(i), onJump: (id) => snap.jump(id) });

const snapMode = !isReflow() && !prefersReducedMotion();
window.__journeyMode = snapMode ? "snap" : "free";

const input = createInput({ onIntent: (i) => snap.go(i) });
input.setMode(window.__journeyMode);

document.body.classList.remove("loading");
