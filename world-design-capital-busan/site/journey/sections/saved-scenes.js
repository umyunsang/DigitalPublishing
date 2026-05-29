import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../engine/env.js";

export function create() {
  let ctx = null;
  return {
    init(el) {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        const items = gsap.utils.toArray(el.querySelectorAll(".s-saved__grid li"));
        const title = el.querySelector(".s-saved__title");
        gsap.set(items, { yPercent: 60, opacity: 0, scale: .9 });
        gsap.timeline({
          scrollTrigger: {
            trigger: el.querySelector(".s-saved__stage"),
            start: "top top", end: "bottom bottom", scrub: 1.2,
          },
        })
        .to(items, { yPercent: 0, opacity: 1, scale: 1, ease: "power2.out",
          stagger: { each: 0.05, from: "center" } }, 0)
        .to(title, { scale: 1.15, opacity: .25, ease: "none" }, 0);
      }, el);
    },
    enter() {}, leave() {},
    dispose() { if (ctx) ctx.revert(); ctx = null; },
  };
}
export default create;
