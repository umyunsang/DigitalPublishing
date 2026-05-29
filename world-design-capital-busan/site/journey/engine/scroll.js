import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion } from "./env.js";

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  if (prefersReducedMotion()) {
    // 네이티브 스크롤 사용. ScrollTrigger만 등록해 진행 추적은 유지.
    ScrollTrigger.refresh();
    return { lenis: null, refresh: () => ScrollTrigger.refresh(), destroy: () => {} };
  }
  const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  const onTick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    refresh: () => ScrollTrigger.refresh(),
    destroy: () => { gsap.ticker.remove(onTick); lenis.destroy(); },
  };
}
