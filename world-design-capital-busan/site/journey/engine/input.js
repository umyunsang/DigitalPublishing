import { Observer } from "gsap/Observer";
import { gsap } from "gsap";
gsap.registerPlugin(Observer);

// wheel/touch/pointer를 next/prev 의도로 정규화. snap 모드에서만 네비 발화.
export function createInput({ onIntent, dragMinimum = 50, tolerance = 10 } = {}) {
  let mode = "free";          // "free" | "snap"
  let locked = false;

  const fire = (intent) => {
    if (mode !== "snap" || locked) return;
    locked = true;            // 한 제스처 = 1회
    onIntent(intent);
    gsap.delayedCall(0.9, () => { locked = false; });
  };

  const observer = Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    tolerance,
    dragMinimum,
    onDown: () => fire("next"),   // 휠다운/드래그다운 = 다음 (Observer semantics: onDown = user scrolls down)
    onUp: () => fire("prev"),     // 휠업/드래그업 = 이전
    preventDefault: false,
  });

  return {
    setMode: (m) => { mode = m; },
    lock: () => { locked = true; },
    unlock: () => { locked = false; },
    destroy: () => observer.kill(),
  };
}
