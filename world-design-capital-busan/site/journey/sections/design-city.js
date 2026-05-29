import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../engine/env.js";

const svgNS = "http://www.w3.org/2000/svg";
const BLIND_COUNT = 30;

export function create() {
  let ctx = null;
  let onResize = null;
  return {
    init(el) {
      if (prefersReducedMotion()) return;
      const build = () => {
        if (ctx) ctx.revert();
        const w = window.innerWidth, h = window.innerHeight;
        const vbH = (h / w) * 100;
        const layers = gsap.utils.toArray(el.querySelectorAll(".s-city__layer"));
        const blindsSets = layers.map((svg) => {
          svg.setAttribute("viewBox", `0 0 100 ${vbH}`);
          const maskRect = svg.querySelector("mask rect");
          maskRect.setAttribute("width", 100); maskRect.setAttribute("height", vbH);
          const img = svg.querySelector("image");
          img.setAttribute("width", 100); img.setAttribute("height", vbH);
          const g = svg.querySelector('g[id^="cityBlinds"]');
          g.innerHTML = "";
          const hh = vbH / BLIND_COUNT; const blinds = []; let y = 0;
          for (let i = 0; i < BLIND_COUNT; i++) {
            const cy = vbH - (y + hh / 2);
            const top = document.createElementNS(svgNS, "rect");
            const bot = document.createElementNS(svgNS, "rect");
            [top, bot].forEach((r) => { r.setAttribute("x", 0); r.setAttribute("width", 100);
              r.setAttribute("height", 0); r.setAttribute("fill", "white");
              r.setAttribute("shape-rendering", "crispEdges"); r.setAttribute("y", cy); });
            g.appendChild(top); g.appendChild(bot);
            blinds.push({ top, bot, y: cy, h: hh / 2 }); y += hh;
          }
          return blinds;
        });
        const fills = gsap.utils.toArray(el.querySelectorAll(".s-city__progress span")).map((s) => {
          let f = s.querySelector("i");
          if (!f) { f = document.createElement("i"); f.style.cssText =
            "display:block;height:100%;width:0;background:var(--c-coral)"; s.appendChild(f); }
          return f;
        });
        const texts = gsap.utils.toArray(el.querySelectorAll(".s-city__txt"));

        ctx = gsap.context(() => {
          const master = gsap.timeline({
            scrollTrigger: { trigger: el.querySelector(".s-city__stage"),
              start: "top top", end: "bottom bottom", scrub: 2.5,
              anticipatePin: 1, invalidateOnRefresh: true },
          });
          blindsSets.forEach((blinds, i) => {
            master.add(gsap.timeline().to(blinds.flatMap((b) => [b.top, b.bot]), {
              attr: {
                y: (idx) => { const b = blinds[Math.floor(idx / 2)]; return idx % 2 === 0 ? b.y - b.h : b.y; },
                height: (idx) => blinds[Math.floor(idx / 2)].h + 0.01,
              },
              ease: "power3.out", stagger: { each: 0.02, from: "start" },
            }));
            if (texts[i]) {
              master.add(gsap.to(texts[i], { clipPath: "inset(0% 0% 0% 0%)", y: 0,
                duration: 1.5, ease: "expo.out" }), "-=0.3");
              master.add(gsap.to(texts[i], { clipPath: "inset(0% 0% 100% 0%)", y: -30,
                duration: 1.2, ease: "power2.inOut" }), "+=0.8");
            }
          });
          ScrollTrigger.create({ trigger: el.querySelector(".s-city__stage"),
            start: "top top", end: "bottom bottom", scrub: 0.3,
            onUpdate: (self) => {
              const p = self.progress, n = fills.length;
              fills.forEach((f, i) => { let v = (p - i / n) * n; v = Math.max(0, Math.min(1, v));
                f.style.width = `${v * 100}%`; });
            } });
        }, el);
      };
      build();
      onResize = () => { clearTimeout(onResize._t); onResize._t = setTimeout(build, 250); };
      window.addEventListener("resize", onResize);
    },
    enter() {}, leave() {},
    dispose() {
      if (onResize) window.removeEventListener("resize", onResize);
      if (ctx) ctx.revert(); ctx = null; onResize = null;
    },
  };
}
export default create;
