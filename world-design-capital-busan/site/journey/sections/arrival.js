import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../engine/env.js";

export function create() {
  let ctx = null;
  return {
    init(el) {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        const home = el.querySelector(".is-home");
        const about = el.querySelector(".is-about");
        const copy = el.querySelector(".s-arrival__copy");
        gsap.set(copy, { y: 30, opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 1 },
        });
        tl.to(copy, { y: 0, opacity: 1, ease: "expo.out" }, 0)
          .to(home, { opacity: 0, ease: "none" }, 0.4)
          .to(about, { opacity: 1, ease: "none" }, 0.4);
      }, el);
    },
    enter() {}, leave() {},
    dispose() { if (ctx) ctx.revert(); ctx = null; },
  };
}
export default create;
