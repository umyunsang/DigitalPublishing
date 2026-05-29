import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../engine/env.js";

export function create() {
  let ctx = null;
  return {
    init(el) {
      const items = gsap.utils.toArray(el.querySelectorAll(".s-why__col li"));
      const thumb = el.querySelector(".s-why__thumb img");
      const setActive = (i) => {
        items.forEach((li, idx) => li.classList.toggle("is-active", idx === i));
        const src = items[i]?.dataset.img;
        if (src && thumb.getAttribute("src") !== src) thumb.setAttribute("src", src);
      };
      setActive(0);
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        items.forEach((li, i) => {
          ScrollTrigger.create({
            trigger: el.querySelector(".s-why__inner"),
            start: () => `top+=${(i / items.length) * 100}% center`,
            end: () => `top+=${((i + 1) / items.length) * 100}% center`,
            onToggle: (self) => { if (self.isActive) setActive(i); },
          });
        });
      }, el);
    },
    enter() {}, leave() {},
    dispose() { if (ctx) ctx.revert(); ctx = null; },
  };
}
export default create;
