# WDC P1 — 비-WebGL 섹션 이식 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** P0 엔진 위에서 4개 비-WebGL 섹션(arrival, saved-scenes, why-wdc, design-city)을 `{init,enter,leave,dispose}` 계약으로 구현하고 `main.js`의 sections 레지스트리에 결선한다.

**Architecture:** 원본 01·02·03은 Vite minified 번들이라 리버스 엔지니어링하지 않고 **비주얼 의도를 P0 통일 엔진(GSAP/ScrollTrigger + 디자인 토큰) 위에서 재현**한다. 06은 raw 소스가 있어 SVG 블라인드 로직을 토큰화해 이식. 각 섹션은 `sections/<name>.js` + `styles/<name>.css`(`.s-<name>` 스코프). 자산은 원본 페이지 폴더에서 `journey/assets/<name>/`로 복사.

**Tech Stack:** Vanilla ESM, GSAP/ScrollTrigger(vendored), Playwright(desktop+mobile-chromium).

**참조:** 스펙 `docs/superpowers/specs/2026-05-29-wdc-scroll-migration-design.md` §4·§5·§9. 상위 계획 `docs/superpowers/plans/2026-05-29-wdc-scroll-migration.md`.

---

## 공통 사실 (전제)
- 브랜치 `feat/wdc-scroll-migration-spec`. cwd = repo root. No Co-Authored-By.
- journey URL = `/world-design-capital-busan/site/journey/`.
- P0 엔진 계약(확정):
  - `engine/sections.js`: `createRegistry()` → `{ register(name,factory), activate(name), deactivate(name), dispose(name), has(name) }`. factory는 `{init(el),enter(),leave(),dispose()}` (또는 async 로더)를 반환.
  - `engine/scroll.js`: `initScroll()` → `{ lenis, refresh(), destroy() }` (reduced-motion 시 lenis=null).
  - `engine/transitions.js`: `createSnap({order,scrollTo,onChange})` → `{ go, jump, current, index }`.
  - `engine/env.js`: `prefersReducedMotion()`, `isTouch()`, `cappedDPR()`, `isReflow()`.
  - gsap/ScrollTrigger는 importmap으로 `import { gsap } from "gsap"`, `import { ScrollTrigger } from "gsap/ScrollTrigger"`.
- 테스트: `npx playwright test <file> -g "<title>" --project=desktop-chromium`. 전체: `npm run design:browser`.
- ScrollTrigger 기반 섹션은 `main.js`의 단일 Lenis 스크롤러와 같은 스크롤 컨텍스트를 공유해야 한다. 섹션 모듈은 **자체 Lenis/ticker를 만들지 않는다**(P0 scroll.js가 이미 ticker+update 결선). 섹션은 ScrollTrigger 인스턴스만 만들고 `dispose()`에서 `.kill()` 한다.

## 파일 구조 (P1에서 생성/수정)
```
world-design-capital-busan/site/journey/
├─ sections/
│  ├─ arrival.js
│  ├─ saved-scenes.js
│  ├─ why-wdc.js
│  └─ design-city.js
├─ styles/
│  ├─ arrival.css  saved-scenes.css  why-wdc.css  design-city.css
├─ assets/
│  ├─ arrival/{home.webp,about.webp}
│  ├─ saved-scenes/{hero.webp,1..12.webp}
│  ├─ why-wdc/{keyword-01..NN.webp}  (대표 12장만 선별 복사)
│  └─ design-city/{1..12.webp}
├─ index.html   (각 섹션 내부 마크업 채움)
└─ main.js      (registry 생성·4개 register·IntersectionObserver activate 결선)
```

---

## Task 1: sections 레지스트리를 main.js에 결선 (활성화 토대)

**Files:** Modify `journey/main.js`, `journey/index.html`; Test append `tests/journey-engine.spec.mjs`.

- [ ] **Step 1 — 실패 테스트** (append to `tests/journey-engine.spec.mjs`):
```js
test("registry activates a section when scrolled into view", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "scroll/IO timing validated on desktop");
  await page.goto(JOURNEY);
  await expect(page.locator(".progress li")).toHaveCount(7);
  // arrival는 최초 활성
  await expect(page.locator("#arrival")).toHaveAttribute("data-active", "true");
  // saved-scenes로 점프하면 활성 전환
  await page.evaluate(() => window.__journeyJump && window.__journeyJump("saved-scenes"));
  await expect(page.locator("#saved-scenes")).toHaveAttribute("data-active", "true");
});
```

- [ ] **Step 2 — 실패 확인:** `npx playwright test tests/journey-engine.spec.mjs -g "registry activates" --project=desktop-chromium` → FAIL.

- [ ] **Step 3 — main.js 결선.** 기존 `main.js`에 sections 레지스트리 + IntersectionObserver 추가. 기존 import 줄 아래에 추가:
```js
import { createRegistry } from "./engine/sections.js";
```
ORDER 정의 다음에 추가:
```js
const registry = createRegistry();
// 섹션 모듈을 동적 로드해 등록 (실패 시 정적 폴백 — 섹션 마크업은 그대로 노출)
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
    registry.deactivate(activeName);
    document.getElementById(activeName)?.setAttribute("data-active", "false");
  }
  activeName = name;
  const el = document.getElementById(name);
  el?.setAttribute("data-active", "true");
  if (registry.has(name)) {
    try { await registry.activate(name); }
    catch (e) { console.warn(`section ${name} failed; static fallback`, e); }
  }
}

// 1섹션 앞 프리로드 + 진입 활성화
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

// 키보드/스냅이 점프할 때도 활성화·진행표시 동기화에 사용
window.__journeyJump = (id) => { snap.jump(id); activateSection(id); };
```
그리고 snap의 onChange도 activate를 부르도록, 기존 `onChange: (id) => a11y.setCurrent(id)` 를:
```js
onChange: (id) => { a11y.setCurrent(id); activateSection(id); },
```
초기 활성화: `document.body.classList.remove("loading");` 앞에 `activateSection("arrival");` 추가.

- [ ] **Step 4 — index.html:** 각 `<section>`에 `data-active="false"` 기본 속성 추가(arrival 포함; JS가 갱신). 7개 모두.

- [ ] **Step 5 — 통과 확인:** `-g "registry activates"` PASS. 그리고 `npm run design:browser`로 회귀(기존 vendor-import 무에러 테스트 포함) green.

- [ ] **Step 6 — 커밋:** `git add journey/main.js journey/index.html tests/journey-engine.spec.mjs && git commit -m "feat(journey): sections 레지스트리 결선 + IO 활성화"`

---

## Task 2: 자산 복사 (4개 섹션)

**Files:** Create `journey/assets/<name>/...` (copy from `pages/<orig>/`).

- [ ] **Step 1 — 복사 명령:**
```bash
cd world-design-capital-busan/site
mkdir -p journey/assets/arrival journey/assets/saved-scenes journey/assets/why-wdc journey/assets/design-city
cp pages/01-arrival/images/home.webp pages/01-arrival/images/about.webp journey/assets/arrival/
cp pages/02-saved-scenes/hero.webp journey/assets/saved-scenes/
cp pages/02-saved-scenes/{1,2,3,4,5,6,7,8,9,10,11,12}.webp journey/assets/saved-scenes/
cp pages/06-design-city/img/{1,2,3,4,5,6,7,8,9,10,11,12}.webp journey/assets/design-city/
# why-wdc: 대표 12장만 (01~12 키워드)
cp pages/03-why-wdc/keyword-0{1,2,3,4,5,6,7,8,9}-*.webp journey/assets/why-wdc/ 2>/dev/null
cp pages/03-why-wdc/keyword-1{0,1,2}-*.webp journey/assets/why-wdc/ 2>/dev/null
```
- [ ] **Step 2 — 검증:** `find journey/assets -type f | sort` 로 arrival 2, saved-scenes 13, design-city 12, why-wdc 12장 확인. why-wdc 파일명이 다르면 `ls pages/03-why-wdc/keyword-*.webp | head` 로 실제명 확인 후 12장 복사.
- [ ] **Step 3 — 커밋:** `git add journey/assets && git commit -m "assets(journey): P1 섹션 이미지 복사"`

---

## Task 3: sections/arrival.js — 도착 인트로

**의도(원본 01):** home.webp 풀스크린 → 텍스트 등장 → about.webp로 전환되는 도착 시퀀스. 서사 비트=도착(§5).

**Files:** Create `journey/sections/arrival.js`, `journey/styles/arrival.css`; Modify `journey/index.html`(arrival 섹션 마크업 + arrival.css link), append `tests/journey-engine.spec.mjs`.

- [ ] **Step 1 — index.html:** `#arrival` 섹션 내부를 채운다(기존 `<h2>` 교체):
```html
<section id="arrival" class="s s-arrival" data-section="arrival" data-active="false" tabindex="-1">
  <div class="s-arrival__media">
    <img class="s-arrival__img is-home" src="./assets/arrival/home.webp" alt="부산 도착 첫 장면" loading="eager" fetchpriority="high" />
    <img class="s-arrival__img is-about" src="./assets/arrival/about.webp" alt="부산의 두 번째 장면" loading="lazy" />
  </div>
  <div class="s-arrival__copy">
    <h2 class="s-arrival__title">Arrival</h2>
    <p class="s-arrival__lead">도시의 첫 장면으로 들어선다.</p>
  </div>
</section>
```
그리고 `<head>`의 base.css link 다음에 `<link rel="stylesheet" href="./styles/arrival.css" />` 추가.

- [ ] **Step 2 — 실패 테스트(append):**
```js
test("arrival section: media and title present", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator("#arrival .s-arrival__img.is-home")).toHaveCount(1);
  await expect(page.locator("#arrival .s-arrival__title")).toHaveText("Arrival");
});
```

- [ ] **Step 3 — 실패 확인:** `-g "arrival section"` → FAIL (마크업/모듈 전).

- [ ] **Step 4 — styles/arrival.css:**
```css
.s-arrival { position: relative; overflow: hidden; }
.s-arrival__media { position: absolute; inset: 0; z-index: 0; }
.s-arrival__img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; }
.s-arrival__img.is-about { opacity: 0; }
.s-arrival__copy { position: relative; z-index: 1; text-align: center;
  mix-blend-mode: difference; color: var(--c-fg); }
.s-arrival__title { font-family: var(--font-display); font-size: var(--fs-display); margin: 0; }
.s-arrival__lead { margin-top: var(--space-2); font-size: var(--fs-body); color: var(--c-fg-dim); }
@media (prefers-reduced-motion: reduce) {
  .s-arrival__img.is-about { opacity: .0; }
}
```

- [ ] **Step 5 — sections/arrival.js:**
```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../engine/env.js";

export function create() {
  let st = null;
  let ctx = null;
  return {
    init(el) {
      if (prefersReducedMotion()) return;       // 모션 강등: 정적 노출
      ctx = gsap.context(() => {
        const home = el.querySelector(".is-home");
        const about = el.querySelector(".is-about");
        const copy = el.querySelector(".s-arrival__copy");
        gsap.set(copy, { y: 30, opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el, start: "top top", end: "bottom top",
            scrub: 1, pin: false,
          },
        });
        tl.to(copy, { y: 0, opacity: 1, ease: "expo.out" }, 0)
          .to(home, { opacity: 0, ease: "none" }, 0.4)
          .to(about, { opacity: 1, ease: "none" }, 0.4);
        st = tl.scrollTrigger;
      }, el);
    },
    enter() {},
    leave() {},
    dispose() { if (ctx) ctx.revert(); st = null; ctx = null; },
  };
}
export default create;
```

- [ ] **Step 6 — 통과 확인:** `-g "arrival section"` PASS. 회귀 `npm run design:browser` green.

- [ ] **Step 7 — 커밋:** `git add journey/sections/arrival.js journey/styles/arrival.css journey/index.html tests/journey-engine.spec.mjs && git commit -m "feat(journey): arrival 섹션 이식"`

---

## Task 4: sections/saved-scenes.js — sticky 갤러리 스크럽

**의도(원본 02):** 히어로 풀스크린 → `block--main`(height 425vh)에서 `block__wrapper` sticky, 중앙 타이틀 위로 3열 갤러리가 스크럽되며 떠오름. 서사=저장(§5).

**Files:** Create `sections/saved-scenes.js`, `styles/saved-scenes.css`; Modify `index.html`; test append.

- [ ] **Step 1 — index.html** (`#saved-scenes` 내부 교체):
```html
<section id="saved-scenes" class="s s-saved-scenes" data-section="saved-scenes" data-active="false" tabindex="-1">
  <figure class="s-saved__hero">
    <img src="./assets/saved-scenes/hero.webp" alt="다시 보고 싶게 설계된 도시, 부산" />
    <figcaption>다시 저장되는 장면</figcaption>
  </figure>
  <div class="s-saved__stage">
    <div class="s-saved__sticky">
      <h2 class="s-saved__title">Saved Scenes of Busan</h2>
      <ul class="s-saved__grid">
        <!-- 12 items -->
        <li><img src="./assets/saved-scenes/1.webp" alt="저장된 부산 장면 1" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/2.webp" alt="저장된 부산 장면 2" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/3.webp" alt="저장된 부산 장면 3" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/4.webp" alt="저장된 부산 장면 4" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/5.webp" alt="저장된 부산 장면 5" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/6.webp" alt="저장된 부산 장면 6" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/7.webp" alt="저장된 부산 장면 7" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/8.webp" alt="저장된 부산 장면 8" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/9.webp" alt="저장된 부산 장면 9" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/10.webp" alt="저장된 부산 장면 10" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/11.webp" alt="저장된 부산 장면 11" loading="lazy" /></li>
        <li><img src="./assets/saved-scenes/12.webp" alt="저장된 부산 장면 12" loading="lazy" /></li>
      </ul>
    </div>
  </div>
</section>
```
`<head>`에 `<link rel="stylesheet" href="./styles/saved-scenes.css" />` 추가. **주의:** 이 섹션은 height>100vh(stage)라서 `.s` 기본 `min-height:100svh; place-items:center` 와 충돌. `.s-saved-scenes`에서 display/min-height를 재정의(아래 CSS).

- [ ] **Step 2 — 실패 테스트(append):**
```js
test("saved-scenes: hero and 12 gallery items", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator("#saved-scenes .s-saved__hero img")).toHaveCount(1);
  await expect(page.locator("#saved-scenes .s-saved__grid li")).toHaveCount(12);
});
```

- [ ] **Step 3 — 실패 확인:** `-g "saved-scenes:"` FAIL.

- [ ] **Step 4 — styles/saved-scenes.css:**
```css
.s-saved-scenes { display: block; min-height: auto; padding: 0; }
.s-saved__hero { position: relative; height: 100svh; margin: 0; }
.s-saved__hero img { width: 100%; height: 100%; object-fit: cover; }
.s-saved__hero figcaption { position: absolute; left: 50%; bottom: var(--space-4);
  transform: translateX(-50%); text-transform: uppercase; letter-spacing: .1em;
  font-size: var(--fs-body); text-shadow: 0 1px 12px rgba(0,0,0,.5); }
.s-saved__stage { position: relative; height: 360vh; }
.s-saved__sticky { position: sticky; top: 0; height: 100svh; overflow: hidden;
  display: grid; place-items: center; }
.s-saved__title { position: absolute; font-family: var(--font-display);
  font-size: var(--fs-display); text-align: center; z-index: 0; margin: 0; }
.s-saved__grid { position: relative; z-index: 1; display: grid;
  grid-template-columns: repeat(3, 1fr); gap: var(--space-3);
  width: min(64rem, 80vw); }
.s-saved__grid li { aspect-ratio: 1; }
.s-saved__grid img { width: 100%; height: 100%; object-fit: cover; }
@media (prefers-reduced-motion: reduce) {
  .s-saved__stage { height: auto; }
  .s-saved__sticky { position: static; height: auto; padding: var(--space-4) 0; }
}
```

- [ ] **Step 5 — sections/saved-scenes.js:**
```js
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
```

- [ ] **Step 6 — 통과 확인:** `-g "saved-scenes:"` PASS. 회귀 green.
- [ ] **Step 7 — 커밋:** `git add journey/sections/saved-scenes.js journey/styles/saved-scenes.css journey/index.html tests/journey-engine.spec.mjs && git commit -m "feat(journey): saved-scenes 섹션 이식"`

---

## Task 5: sections/why-wdc.js — 키워드 흐름 + 에지 인지

**의도(원본 03):** 두 텍스트 컬럼이 스크롤로 흐르고 키워드에 따라 썸네일이 바뀜. 내부 스크롤이 긴 섹션 → §9.2 에지 인지 대상(내부 끝 도달 후 추가 입력에서만 섹션 전환). 서사=근거(§5).

**Files:** Create `sections/why-wdc.js`, `styles/why-wdc.css`; Modify `index.html`; test append.

- [ ] **Step 1 — index.html** (`#why-wdc` 내부 교체). 키워드 12개 + 썸네일:
```html
<section id="why-wdc" class="s s-why-wdc" data-section="why-wdc" data-active="false" tabindex="-1">
  <div class="s-why__inner" data-edge-scroll>
    <h2 class="s-why__title">Why Busan Became a Design Capital</h2>
    <div class="s-why__wave">
      <ul class="s-why__col" aria-label="WDC 키워드">
        <li data-img="./assets/why-wdc/keyword-01-world-design-capital.webp">Capital</li>
        <li data-img="./assets/why-wdc/keyword-02-inclusive-city.webp">Open</li>
        <li data-img="./assets/why-wdc/keyword-03-citizen-led-design.webp">Civic</li>
        <li data-img="./assets/why-wdc/keyword-04-service-design.webp">Care</li>
        <li data-img="./assets/why-wdc/keyword-05-urban-recovery.webp">Renew</li>
        <li data-img="./assets/why-wdc/keyword-06-connectivity.webp">Link</li>
        <li data-img="./assets/why-wdc/keyword-07-design-culture.webp">Culture</li>
        <li data-img="./assets/why-wdc/keyword-08-resilient-coast.webp">Coast</li>
        <li data-img="./assets/why-wdc/keyword-09-global-design-hub.webp">Global</li>
        <li data-img="./assets/why-wdc/keyword-10-quality-of-life.webp">Life</li>
        <li data-img="./assets/why-wdc/keyword-11-pastel-sea.webp">Pastel</li>
        <li data-img="./assets/why-wdc/keyword-12-blue-line.webp">Line</li>
      </ul>
      <div class="s-why__thumb"><img src="./assets/why-wdc/keyword-01-world-design-capital.webp" alt="키워드 이미지" /></div>
    </div>
  </div>
</section>
```
> **주의:** Step 직전에 `ls world-design-capital-busan/site/journey/assets/why-wdc/` 로 실제 파일명을 확인하고 `data-img`/`src`를 실제명과 일치시킬 것. 위 파일명이 다르면 실제 12개 파일명으로 교체.
`<head>`에 `<link rel="stylesheet" href="./styles/why-wdc.css" />`.

- [ ] **Step 2 — 실패 테스트(append):**
```js
test("why-wdc: 12 keywords and a thumbnail", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator("#why-wdc .s-why__col li")).toHaveCount(12);
  await expect(page.locator("#why-wdc .s-why__thumb img")).toHaveCount(1);
});
```

- [ ] **Step 3 — 실패 확인:** FAIL.

- [ ] **Step 4 — styles/why-wdc.css:**
```css
.s-why-wdc { display: block; min-height: auto; padding: 0; }
.s-why__inner { min-height: 200vh; padding: var(--space-4) var(--space-3); }
.s-why__title { font-family: var(--font-display); font-size: var(--fs-display);
  text-align: center; margin: 0 0 var(--space-4); }
.s-why__wave { position: sticky; top: 0; height: 100svh; display: grid;
  grid-template-columns: 1fr minmax(12rem, 22rem); align-items: center; gap: var(--space-3); }
.s-why__col { display: flex; flex-direction: column; gap: var(--space-1);
  font-family: var(--font-display); font-size: clamp(2rem, 5vw, 4rem);
  line-height: .95; }
.s-why__col li { opacity: .35; transition: opacity var(--dur-fast); cursor: default; }
.s-why__col li.is-active { opacity: 1; color: var(--c-coral); }
.s-why__thumb { aspect-ratio: 3/4; overflow: hidden; }
.s-why__thumb img { width: 100%; height: 100%; object-fit: cover; }
@media (prefers-reduced-motion: reduce) {
  .s-why__inner { min-height: auto; }
  .s-why__wave { position: static; height: auto; }
  .s-why__col li { opacity: 1; }
}
```

- [ ] **Step 5 — sections/why-wdc.js** (키워드 스크럽 + 썸네일 교체; 에지 인지는 §9.2의 free/snap 모드 전환을 위해 `data-edge-scroll`만 노출, 실제 모드 전환은 P3에서 input과 결선):
```js
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
```

- [ ] **Step 6 — 통과 확인:** `-g "why-wdc:"` PASS. 회귀 green.
- [ ] **Step 7 — 커밋:** `git add journey/sections/why-wdc.js journey/styles/why-wdc.css journey/index.html tests/journey-engine.spec.mjs && git commit -m "feat(journey): why-wdc 섹션 이식"`

---

## Task 6: sections/design-city.js — SVG 블라인드 장면 전환

**의도(원본 06, raw 소스 보유):** 3개 이미지 레이어를 SVG mask 블라인드로 순차 공개 + 텍스트 in/out + 진행바. raw `script.js` 로직을 토큰화해 이식. 서사=장면(§5).

**Files:** Create `sections/design-city.js`, `styles/design-city.css`; Modify `index.html`; test append. 이미지 3장(1·2·3.webp) 사용.

- [ ] **Step 1 — index.html** (`#design-city` 내부 교체). SVG 레이어 3 + 텍스트 3 + 진행바:
```html
<section id="design-city" class="s s-design-city" data-section="design-city" data-active="false" tabindex="-1">
  <div class="s-city__stage">
    <div class="s-city__layers">
      <svg class="s-city__layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><mask id="cityMask1" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="100" fill="black"/><g id="cityBlinds1"></g></mask></defs>
        <image href="./assets/design-city/1.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#cityMask1)"/>
      </svg>
      <svg class="s-city__layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><mask id="cityMask2" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="100" fill="black"/><g id="cityBlinds2"></g></mask></defs>
        <image href="./assets/design-city/2.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#cityMask2)"/>
      </svg>
      <svg class="s-city__layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><mask id="cityMask3" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="100" fill="black"/><g id="cityBlinds3"></g></mask></defs>
        <image href="./assets/design-city/3.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#cityMask3)"/>
      </svg>
      <div class="s-city__progress"><span></span><span></span><span></span></div>
      <div class="s-city__texts">
        <div class="s-city__txt"><h2>PASTEL<br>SEA</h2><p>광안리의 바다는 도시를 부드러운 색으로 기억하게 만든다.</p></div>
        <div class="s-city__txt"><h2>MOVING<br>SEA</h2><p>이동하는 풍경 속에서 부산은 계속 다시 보인다.</p></div>
        <div class="s-city__txt"><h2>NIGHT<br>SIGNAL</h2><p>밤의 신호들이 도시의 장면을 다시 켠다.</p></div>
      </div>
    </div>
  </div>
</section>
```
`<head>`에 `<link rel="stylesheet" href="./styles/design-city.css" />`.

- [ ] **Step 2 — 실패 테스트(append):**
```js
test("design-city: 3 svg layers and 3 texts", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator("#design-city .s-city__layer")).toHaveCount(3);
  await expect(page.locator("#design-city .s-city__txt")).toHaveCount(3);
});
```

- [ ] **Step 3 — 실패 확인:** FAIL.

- [ ] **Step 4 — styles/design-city.css:**
```css
.s-design-city { display: block; min-height: auto; padding: 0; }
.s-city__stage { height: 300vh; }
.s-city__layers { position: sticky; top: 0; height: 100svh; overflow: hidden; }
.s-city__layer { position: absolute; inset: 0; width: 100%; height: 100%; }
.s-city__progress { position: absolute; left: 50%; bottom: var(--space-3);
  transform: translateX(-50%); display: flex; gap: var(--space-1); z-index: 3; }
.s-city__progress span { width: 48px; height: 2px; background: rgba(255,255,255,.3); }
.s-city__progress span > i, .s-city__progress span::after { }
.s-city__texts { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; }
.s-city__txt { position: absolute; text-align: center; color: var(--c-fg);
  clip-path: inset(0 0 100% 0); }
.s-city__txt h2 { font-family: var(--font-display); font-size: var(--fs-display); margin: 0; }
.s-city__txt p { margin-top: var(--space-2); font-size: var(--fs-body); color: var(--c-fg-dim); }
@media (prefers-reduced-motion: reduce) {
  .s-city__stage { height: auto; }
  .s-city__layers { position: static; height: auto; }
  .s-city__layer { position: relative; height: 100svh; }
  .s-city__txt { position: relative; clip-path: none; }
}
```
> 진행바 채움은 JS에서 각 `span` 안에 `<i>` fill을 만들거나 `span` width 비율로 처리. 아래 JS는 `span` 자식 fill을 동적 생성.

- [ ] **Step 5 — sections/design-city.js** (raw script.js의 블라인드/마스터 타임라인/진행바를 ScrollTrigger 단일 컨텍스트로 이식, 자체 Lenis/ticker 생성 금지):
```js
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
        // 진행바 fill 준비
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
```

- [ ] **Step 6 — 통과 확인:** `-g "design-city:"` PASS. 회귀 `npm run design:browser` green.
- [ ] **Step 7 — 커밋:** `git add journey/sections/design-city.js journey/styles/design-city.css journey/index.html tests/journey-engine.spec.mjs && git commit -m "feat(journey): design-city SVG 블라인드 섹션 이식"`

---

## Task 7: P1 통합 검증 + 접근성 회귀

**Files:** test append `tests/journey-a11y.spec.mjs`.

- [ ] **Step 1 — axe AA가 P1 마크업 추가 후에도 통과하는지 회귀 테스트 추가:**
```js
test("axe AA holds after sections populated (each section reachable)", async ({ page }) => {
  await page.goto(JOURNEY);
  await expect(page.locator(".progress li")).toHaveCount(7);
  for (const id of ["arrival","saved-scenes","why-wdc","design-city"]) {
    await page.evaluate((x) => window.__journeyJump(x), id);
    await expect(page.locator(`#${id}`)).toHaveAttribute("data-active", "true");
  }
  await page.addScriptTag({ path: axePath });
  const v = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a","wcag2aa","wcag22aa"] } });
    return res.violations.filter((x) => x.impact === "critical" || x.impact === "serious").map((x) => x.id);
  });
  expect(v).toEqual([]);
});
```

- [ ] **Step 2 — 실행:** `npx playwright test tests/journey-a11y.spec.mjs --retries=0` (desktop+mobile). axe 위반 시 마크업의 alt/대비/랜드마크 최소 수정 후 재실행. 그리고 전체 `npm run design:browser` green (실패 0, 스킵은 P0의 desktop-only 3건만 + 신규 desktop-only 스킵 허용).

- [ ] **Step 3 — 커밋:** `git add tests/journey-a11y.spec.mjs && git commit -m "test(journey): P1 섹션 채운 뒤 axe AA 회귀 게이트"`

---

## Self-Review (작성자 점검)
1. **스펙 커버리지:** §4 디자인 토큰 재사용(각 섹션 CSS가 `--c-*/--fs-*/--ease-*` 사용) ✓ / §5 서사 카피(각 섹션 한국어 리드) ✓ / §9.2 에지 인지(why-wdc `data-edge-scroll` 노출, 실제 모드전환은 P3) — **부분(의도)** / 단일 스크롤러 공유(섹션은 자체 Lenis 금지, ScrollTrigger만) ✓ / lazy + dispose(IO 활성화 + ctx.revert) ✓ / CSS 스코프(`.s-<name>`) ✓.
2. **플레이스홀더:** 모든 Task에 실제 코드/명령/기대결과 포함. why-wdc 이미지 파일명은 "실제명 확인 후 일치" 가드 명시(번들 자산 실명 의존이라 불가피).
3. **타입 일관성:** 섹션 factory는 `create()` 기본/명명 export, `{init,enter,leave,dispose}` 반환 — main.js loader가 `mod.default()||mod.create()` 처리. registry 계약과 일치.
4. **리스크:** ScrollTrigger pin/sticky가 Lenis와 함께 동작해야 함 → 섹션은 sticky(CSS) 기반이라 pin 미사용으로 충돌 최소화. design-city는 height 300vh stage + sticky로 원본 pin 효과 재현.

## 잔여(P3로 이월)
- why-wdc/saved/design-city의 긴 내부 스크롤에서 §9.2 free↔snap 모드 실제 전환을 input.js와 결선.
- §4.3 시그니처 경계 전환(섹션 간 clipPath/연결 모티프).
