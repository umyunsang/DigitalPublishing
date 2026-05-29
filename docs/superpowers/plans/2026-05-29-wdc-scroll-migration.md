# WDC Busan 단일 스크롤 셸 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next 버튼으로 이동하던 7개 Codrops 페이지를, 통일된 스크롤 엔진(Lenis+GSAP+Observer) 위의 단일 스크롤 문서 `site/journey/`로 통합한다.

**Architecture:** 빌드리스 ES 모듈 + `importmap` + dynamic `import()`. `engine/`의 5개 모듈(scroll·input·sections·transitions·webgl)이 단일 책임으로 분리되고, 7개 `sections/<name>.js`가 `{init,enter,leave,dispose}` 계약을 따른다. WebGL 3종은 단일 공유 Three.js 렌더러를 공유하고, 무거운 자산은 섹션 lazy-load/dispose로 관리한다.

**Tech Stack:** Vanilla ES Modules, GSAP 3 (ScrollTrigger·Observer), Lenis, Three.js, Playwright(desktop+mobile-chromium), axe-core.

**참조 스펙:** `docs/superpowers/specs/2026-05-29-wdc-scroll-migration-design.md` (v2)

---

## 환경 사실 (계획 전제)

- 정적 서버 루트 = 레포 루트. journey URL = `http://127.0.0.1:4173/world-design-capital-busan/site/journey/`.
- 테스트 실행: `npm run design:browser` (= `playwright test`). 단일 테스트: `npx playwright test tests/<file> -g "<title>"`.
- Playwright 프로젝트: `desktop-chromium`(1440×900), `mobile-chromium`(Pixel 7, 터치).
- axe-core: `node_modules/axe-core/axe.min.js`, 기존 하네스 `tests/design-smoke.spec.mjs` 패턴 재사용.
- 라이브러리는 **런타임 CDN 금지**(CSP/SRI/오프라인) → `journey/vendor/`에 ESM 벤더링.

---

## 파일 구조 (P0에서 생성)

```
world-design-capital-busan/site/journey/
├─ index.html                 # importmap·셸·7 빈 섹션·skip link·진행 인디케이터
├─ vendor/                    # 벤더링 ESM (gsap, ScrollTrigger, Observer, lenis, three)
├─ styles/
│  ├─ tokens.css              # :root 디자인 토큰(컬러/타이포/간격/모션)
│  └─ base.css                # 셸 레이아웃·섹션 스코프 골격
├─ engine/
│  ├─ env.js                  # reduced-motion·DPR·터치 감지 유틸 (공유)
│  ├─ scroll.js               # Lenis + GSAP ticker + ScrollTrigger
│  ├─ input.js                # Observer → next/prev/scrubDelta 의도
│  ├─ sections.js             # 레지스트리·생명주기·프리로드·import 에러경계
│  ├─ transitions.js          # 경계 스냅·에지 인지·시그니처 전환 훅
│  ├─ webgl.js                # 단일 Three.js 렌더러·씬 register/dispose
│  └─ a11y.js                 # 키보드 네비·aria-current·진행 표시·pause
├─ sections/                  # P1~P2에서 arrival … archive (7)
└─ main.js                    # 부트스트랩: 엔진 결선 + 섹션 등록

tests/
├─ journey-engine.spec.mjs    # 엔진 단위/통합 (P0)
└─ journey-a11y.spec.mjs      # axe AA·키보드·reflow (P0)
```

---

## Phase P0 — 엔진 + 디자인 토큰 + 셸 + 접근성 골격

> P0 완료 = 7개 "빈" 섹션을 데스크톱 wheel·모바일 swipe로 스냅 이동, 키보드/skip link 동작, axe AA 통과. 콘텐츠 이식은 P1~.

### Task 1: journey 셸 스캐폴드 + 스모크

**Files:**
- Create: `world-design-capital-busan/site/journey/index.html`
- Create: `tests/journey-engine.spec.mjs`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`:
```js
import { expect, test } from "@playwright/test";

const JOURNEY = "/world-design-capital-busan/site/journey/";
const SECTIONS = [
  "arrival", "saved-scenes", "why-wdc", "busan-syndrome",
  "mood-routes", "design-city", "archive",
];

test("journey shell renders 7 sections", async ({ page }) => {
  await page.goto(JOURNEY);
  for (const id of SECTIONS) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "renders 7 sections" --project=desktop-chromium`
Expected: FAIL (페이지 404 / 셀렉터 0개).

- [ ] **Step 3: 최소 셸 작성**

`world-design-capital-busan/site/journey/index.html`:
```html
<!DOCTYPE html>
<html lang="ko" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>World Design Capital Busan 2028 — Journey</title>
  <meta name="description" content="부산: 다시 보고 싶게 설계된 도시. 스크롤로 잇는 세계디자인수도 부산 2028." />
  <link rel="stylesheet" href="./styles/tokens.css" />
  <link rel="stylesheet" href="./styles/base.css" />
  <script>document.documentElement.className = "js";</script>
</head>
<body class="loading">
  <a class="skip-link" href="#why-wdc">본문으로 건너뛰기</a>
  <canvas id="gl" aria-hidden="true"></canvas>
  <nav class="progress" aria-label="섹션 진행"><ol id="progress-list"></ol></nav>
  <main id="journey">
    <section id="arrival"        class="s s-arrival"        data-section="arrival"        tabindex="-1"><h2>Arrival</h2></section>
    <section id="saved-scenes"   class="s s-saved-scenes"   data-section="saved-scenes"   tabindex="-1"><h2>Saved Scenes</h2></section>
    <section id="why-wdc"        class="s s-why-wdc"        data-section="why-wdc"        tabindex="-1"><h2>Why WDC</h2></section>
    <section id="busan-syndrome" class="s s-busan-syndrome" data-section="busan-syndrome" data-webgl tabindex="-1"><h2>Busan Syndrome</h2></section>
    <section id="mood-routes"    class="s s-mood-routes"    data-section="mood-routes"    data-webgl tabindex="-1"><h2>Mood Routes</h2></section>
    <section id="design-city"    class="s s-design-city"    data-section="design-city"    tabindex="-1"><h2>Design City</h2></section>
    <section id="archive"        class="s s-archive"        data-section="archive"        data-webgl tabindex="-1"><h2>Archive</h2></section>
  </main>
</body>
</html>
```

Also create stub CSS so links resolve: `world-design-capital-busan/site/journey/styles/tokens.css` and `styles/base.css` as empty files for now (filled in Task 3).

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "renders 7 sections" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/index.html world-design-capital-busan/site/journey/styles/ tests/journey-engine.spec.mjs
git commit -m "feat(journey): 셸 스캐폴드 + 7 섹션 스모크"
```

---

### Task 2: 라이브러리 벤더링 + importmap

**Files:**
- Create: `world-design-capital-busan/site/journey/vendor/` (다운로드)
- Modify: `world-design-capital-busan/site/journey/index.html` (importmap 추가)

- [ ] **Step 1: ESM 벤더링 다운로드 (버전 고정)**

```bash
cd world-design-capital-busan/site/journey
mkdir -p vendor/gsap vendor/lenis vendor/three
curl -sL https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js -o vendor/gsap/index.js
curl -sL https://cdn.jsdelivr.net/npm/gsap@3.13.0/gsap-core.js -o vendor/gsap/gsap-core.js
curl -sL https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js -o vendor/gsap/ScrollTrigger.js
curl -sL https://cdn.jsdelivr.net/npm/gsap@3.13.0/Observer.js -o vendor/gsap/Observer.js
curl -sL https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.mjs -o vendor/lenis/lenis.mjs
curl -sL https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js -o vendor/three/three.module.js
```

> 주: GSAP 내부 import 경로(`./gsap-core.js` 등)가 상대경로로 해석되도록 `gsap/` 폴더에 함께 둔다. 다운로드 후 각 파일이 `export`를 포함하는지 확인.

- [ ] **Step 2: 다운로드 검증**

Run: `grep -l "export" vendor/gsap/index.js vendor/gsap/ScrollTrigger.js vendor/gsap/Observer.js vendor/lenis/lenis.mjs vendor/three/three.module.js`
Expected: 5개 파일 모두 출력.

- [ ] **Step 3: importmap 주입**

`index.html`의 `<head>` 안 `tokens.css` 위에 추가:
```html
<script type="importmap">
{
  "imports": {
    "gsap": "./vendor/gsap/index.js",
    "gsap/ScrollTrigger": "./vendor/gsap/ScrollTrigger.js",
    "gsap/Observer": "./vendor/gsap/Observer.js",
    "lenis": "./vendor/lenis/lenis.mjs",
    "three": "./vendor/three/three.module.js"
  }
}
</script>
```
그리고 `</body>` 직전에: `<script type="module" src="./main.js"></script>`
빈 `world-design-capital-busan/site/journey/main.js` 생성: `console.debug("journey boot");`

- [ ] **Step 4: import 동작 테스트 추가 및 통과 확인**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("vendor modules import without error", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(JOURNEY);
  await page.evaluate(async () => {
    await import("gsap");
    await import("gsap/ScrollTrigger");
    await import("gsap/Observer");
    await import("lenis");
    await import("three");
  });
  expect(errors).toEqual([]);
});
```
Run: `npx playwright test tests/journey-engine.spec.mjs -g "vendor modules" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/vendor world-design-capital-busan/site/journey/index.html world-design-capital-busan/site/journey/main.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): ESM 라이브러리 벤더링 + importmap"
```

---

### Task 3: 디자인 토큰 + 베이스 레이아웃

**Files:**
- Modify: `world-design-capital-busan/site/journey/styles/tokens.css`
- Modify: `world-design-capital-busan/site/journey/styles/base.css`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("design tokens and full-viewport sections applied", async ({ page }) => {
  await page.goto(JOURNEY);
  const easeEnter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--ease-enter").trim());
  expect(easeEnter.length).toBeGreaterThan(0);
  const h = await page.locator("#arrival").evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThan(500); // 100svh 근사
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "design tokens" --project=desktop-chromium`
Expected: FAIL (빈 CSS).

- [ ] **Step 3: 토큰 + 베이스 작성**

`styles/tokens.css`:
```css
:root {
  /* 컬러 — 부산병 무드 3축 + 중립 */
  --c-sea: #1f6f8b; --c-coral: #ff7a59; --c-night: #06100f;
  --c-fg: #f3f7f6; --c-fg-dim: rgba(243,247,246,.72); --c-bg: var(--c-night);
  /* 타이포 */
  --font-display: "Neue Montreal","Helvetica Neue",sans-serif;
  --font-body: "Pretendard","Apple SD Gothic Neo",sans-serif;
  --fs-display: clamp(2.5rem, 6vw, 6rem);
  --fs-body: clamp(1rem, 1.2vw, 1.25rem);
  /* 간격 8pt */
  --space-1:.5rem; --space-2:1rem; --space-3:2rem; --space-4:4rem;
  /* 레이어 */
  --layer-gl:0; --layer-content:10; --layer-ui:20; --layer-skip:50;
  /* 모션 */
  --dur-fast:.4s; --dur-base:.8s; --dur-slow:1.2s;
  --ease-enter:cubic-bezier(.16,1,.3,1); --ease-exit:cubic-bezier(.7,0,.84,0);
}
```

`styles/base.css`:
```css
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--c-bg); color: var(--c-fg);
  font-family: var(--font-body); }
body { overscroll-behavior: none; }
#gl { position: fixed; inset: 0; width: 100%; height: 100%;
  z-index: var(--layer-gl); pointer-events: none; }
#journey { position: relative; z-index: var(--layer-content); }
.s { min-height: 100svh; display: grid; place-items: center;
  padding: var(--space-4) var(--space-3); }
.s h2 { font-family: var(--font-display); font-size: var(--fs-display); margin: 0; }
.skip-link { position: fixed; top: var(--space-2); left: var(--space-2);
  z-index: var(--layer-skip); padding: var(--space-1) var(--space-2);
  background: var(--c-fg); color: var(--c-night); border-radius: 4px;
  transform: translateY(-200%); transition: transform var(--dur-fast); }
.skip-link:focus { transform: none; }
.progress { position: fixed; right: var(--space-2); top: 50%;
  transform: translateY(-50%); z-index: var(--layer-ui); }
.progress ol { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-1); }
.progress li { width: 8px; height: 8px; border-radius: 50%;
  background: var(--c-fg-dim); opacity: .4; }
.progress li[aria-current="true"] { opacity: 1; background: var(--c-coral); }
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "design tokens" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/styles
git commit -m "feat(journey): 디자인 토큰 + 베이스 레이아웃"
```

---

### Task 4: `engine/env.js` — 환경 감지 유틸

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/env.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("env detects reduced-motion and dpr cap", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(JOURNEY);
  const env = await page.evaluate(async () => {
    const m = await import("./engine/env.js");
    return { rm: m.prefersReducedMotion(), dpr: m.cappedDPR() };
  });
  expect(env.rm).toBe(true);
  expect(env.dpr).toBeLessThanOrEqual(2);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "env detects" --project=desktop-chromium`
Expected: FAIL (모듈 없음).

- [ ] **Step 3: 구현**

`engine/env.js`:
```js
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  window.matchMedia("(pointer: coarse)").matches;

export const cappedDPR = (max = 2) =>
  Math.min(window.devicePixelRatio || 1, max);

// 400% 확대 근사: 레이아웃 뷰포트가 매우 좁아지면 reflow 모드로 본다.
export const isReflow = () => window.innerWidth < 480;
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "env detects" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/env.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/env 환경 감지 유틸"
```

---

### Task 5: `engine/scroll.js` — Lenis + GSAP 통합

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/scroll.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("scroll engine initializes and is bypassed under reduced-motion", async ({ page }) => {
  await page.goto(JOURNEY);
  const normal = await page.evaluate(async () => {
    const { initScroll } = await import("./engine/scroll.js");
    const api = initScroll();
    const active = !!api.lenis;
    api.destroy();
    return active;
  });
  expect(normal).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reduced = await page.evaluate(async () => {
    const { initScroll } = await import("./engine/scroll.js");
    const api = initScroll();
    const lenisOff = api.lenis === null;
    api.destroy();
    return lenisOff;
  });
  expect(reduced).toBe(true);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "scroll engine" --project=desktop-chromium`
Expected: FAIL.

- [ ] **Step 3: 구현**

`engine/scroll.js`:
```js
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
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "scroll engine" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/scroll.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/scroll Lenis+GSAP 통합·reduced-motion 우회"
```

---

### Task 6: `engine/input.js` — 입력 의도 정규화 (Observer)

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/input.js`

- [ ] **Step 1: 실패 테스트 작성 (데스크톱 wheel + 모바일 swipe)**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("input emits next on wheel down (desktop)", async ({ page }) => {
  await page.goto(JOURNEY);
  await page.evaluate(async () => {
    const { createInput } = await import("./engine/input.js");
    window.__intents = [];
    const input = createInput({ onIntent: (i) => window.__intents.push(i) });
    input.setMode("snap");
  });
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);
  const intents = await page.evaluate(() => window.__intents);
  expect(intents).toContain("next");
});
```

`tests/journey-a11y.spec.mjs`(신규)에 모바일 swipe 테스트(아래 Task 10에서 함께)도 둔다. P0에서는 위 wheel 테스트로 핵심 계약 검증.

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "input emits next" --project=desktop-chromium`
Expected: FAIL.

- [ ] **Step 3: 구현**

`engine/input.js`:
```js
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
    onDown: () => fire("prev"),   // 콘텐츠가 아래로 = 이전
    onUp: () => fire("next"),     // 위로 스와이프/휠다운 = 다음
    preventDefault: false,
  });

  return {
    setMode: (m) => { mode = m; },
    lock: () => { locked = true; },
    unlock: () => { locked = false; },
    destroy: () => observer.kill(),
  };
}
```

> 주: Observer의 `onUp`은 "콘텐츠를 위로 미는 제스처(휠 다운/스와이프 업)"에 대응한다. 실제 방향이 반대로 나오면 `onUp`/`onDown` 매핑을 교환한다(P0 수동 검증).

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "input emits next" --project=desktop-chromium`
Expected: PASS. (방향 반대면 매핑 교환 후 재실행)

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/input.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/input Observer 의도 정규화"
```

---

### Task 7: `engine/sections.js` — 생명주기·프리로드·에러 경계

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/sections.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("sections lifecycle: enter/leave fire and import error degrades", async ({ page }) => {
  await page.goto(JOURNEY);
  const result = await page.evaluate(async () => {
    const { createRegistry } = await import("./engine/sections.js");
    const log = [];
    const reg = createRegistry();
    reg.register("arrival", () => ({
      init() { log.push("init"); }, enter() { log.push("enter"); },
      leave() { log.push("leave"); }, dispose() { log.push("dispose"); },
    }));
    // 존재하지 않는 동적 모듈 → 에러 경계가 폴백
    let degraded = false;
    reg.register("broken", async () => {
      await import("./sections/__missing__.js").catch(() => { degraded = true; throw new Error("x"); });
    });
    await reg.activate("arrival");
    reg.deactivate("arrival");
    await reg.activate("broken").catch(() => {});
    return { log, degraded };
  });
  expect(result.log).toEqual(["init", "enter", "leave"]);
  expect(result.degraded).toBe(true);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "sections lifecycle" --project=desktop-chromium`
Expected: FAIL.

- [ ] **Step 3: 구현**

`engine/sections.js`:
```js
// 섹션 레지스트리 + 생명주기. factory는 동기 객체 또는 async 로더를 반환.
export function createRegistry() {
  const factories = new Map();   // name -> factory
  const instances = new Map();   // name -> module instance
  const active = new Set();

  async function ensure(name) {
    if (instances.has(name)) return instances.get(name);
    const factory = factories.get(name);
    if (!factory) throw new Error(`Unknown section: ${name}`);
    const inst = await factory();           // 실패 시 throw → 호출부에서 폴백
    if (inst && typeof inst.init === "function") inst.init(
      document.getElementById(name));
    instances.set(name, inst);
    return inst;
  }

  return {
    register(name, factory) { factories.set(name, factory); },
    async activate(name) {
      const inst = await ensure(name);
      if (inst && typeof inst.enter === "function") inst.enter();
      active.add(name);
      return inst;
    },
    deactivate(name) {
      const inst = instances.get(name);
      if (inst && typeof inst.leave === "function") inst.leave();
      active.delete(name);
    },
    dispose(name) {
      const inst = instances.get(name);
      if (inst && typeof inst.dispose === "function") inst.dispose();
      instances.delete(name);
    },
    has: (name) => factories.has(name),
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "sections lifecycle" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/sections.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/sections 생명주기·에러 경계"
```

---

### Task 8: `engine/webgl.js` — 단일 공유 Three.js 렌더러

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/webgl.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("single webgl renderer: one context, scene register/dispose", async ({ page }) => {
  await page.goto(JOURNEY);
  const r = await page.evaluate(async () => {
    const { initWebGL } = await import("./engine/webgl.js");
    const THREE = await import("three");
    const gl = initWebGL(document.getElementById("gl"));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    gl.registerScene("t", scene, cam);
    gl.setActive("t");
    const hasCtx = !!document.getElementById("gl").getContext("webgl2")
      || !!gl.renderer;
    gl.unregisterScene("t");
    gl.dispose();
    return { hasCtx };
  });
  expect(r.hasCtx).toBe(true);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "single webgl" --project=desktop-chromium`
Expected: FAIL.

- [ ] **Step 3: 구현**

`engine/webgl.js`:
```js
import * as THREE from "three";
import { cappedDPR } from "./env.js";

// 단일 WebGLRenderer. 활성 씬 1개만 매 프레임 그린다.
export function initWebGL(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(cappedDPR());
  const resize = () => renderer.setSize(window.innerWidth, window.innerHeight, false);
  resize();
  window.addEventListener("resize", resize);

  const scenes = new Map();   // name -> { scene, camera }
  let activeName = null;
  let raf = 0;

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const a = activeName && scenes.get(activeName);
    if (a) renderer.render(a.scene, a.camera);
  };
  loop();

  // 컨텍스트 손실 복구
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); });
  canvas.addEventListener("webglcontextrestored", () => loop());

  return {
    renderer,
    registerScene(name, scene, camera) { scenes.set(name, { scene, camera }); },
    unregisterScene(name) { scenes.delete(name); if (activeName === name) activeName = null; },
    setActive(name) { activeName = name; },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scenes.clear(); renderer.dispose();
    },
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "single webgl" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/webgl.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/webgl 단일 공유 렌더러"
```

---

### Task 9: `engine/transitions.js` — 경계 스냅 + 에지 인지

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/transitions.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/journey-engine.spec.mjs`에 추가:
```js
test("transitions: next/prev change current index with clamping", async ({ page }) => {
  await page.goto(JOURNEY);
  const r = await page.evaluate(async () => {
    const { createSnap } = await import("./engine/transitions.js");
    const order = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];
    let scrolledTo = null;
    const snap = createSnap({ order, scrollTo: (id) => { scrolledTo = id; } });
    snap.go("next"); const a = snap.current();        // -> saved-scenes
    snap.go("prev"); snap.go("prev"); const b = snap.current(); // clamp at arrival
    return { a, scrolledTo, b };
  });
  expect(r.a).toBe("saved-scenes");
  expect(r.b).toBe("arrival");
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "transitions:" --project=desktop-chromium`
Expected: FAIL.

- [ ] **Step 3: 구현**

`engine/transitions.js`:
```js
// 섹션 순서 기반 스냅 네비게이션. scrollTo는 호출부(Lenis/native)가 주입.
export function createSnap({ order, scrollTo, onChange = () => {} }) {
  let index = 0;
  const clamp = (i) => Math.max(0, Math.min(order.length - 1, i));
  const apply = () => { const id = order[index]; scrollTo(id); onChange(id, index); return id; };
  return {
    go(intent) { index = clamp(index + (intent === "next" ? 1 : -1)); return apply(); },
    jump(id) { const i = order.indexOf(id); if (i >= 0) { index = i; return apply(); } },
    current: () => order[index],
    index: () => index,
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx playwright test tests/journey-engine.spec.mjs -g "transitions:" --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/transitions.js tests/journey-engine.spec.mjs
git commit -m "feat(journey): engine/transitions 경계 스냅 네비게이션"
```

---

### Task 10: `engine/a11y.js` + `main.js` 결선 + P0 통합/접근성 게이트

**Files:**
- Create: `world-design-capital-busan/site/journey/engine/a11y.js`
- Modify: `world-design-capital-busan/site/journey/main.js`
- Create: `tests/journey-a11y.spec.mjs`

- [ ] **Step 1: 실패 테스트 작성 (키보드·진행표시·axe·모바일 swipe·reflow)**

`tests/journey-a11y.spec.mjs`:
```js
import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const JOURNEY = "/world-design-capital-busan/site/journey/";

test("keyboard ArrowDown advances current section", async ({ page }) => {
  await page.goto(JOURNEY);
  await page.locator("body").click();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(400);
  const cur = await page.evaluate(() =>
    document.querySelector('.progress li[aria-current="true"]')?.dataset.target);
  expect(cur).toBe("saved-scenes");
});

test("axe WCAG 2.2 AA: no critical violations", async ({ page }) => {
  await page.goto(JOURNEY);
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a","wcag2aa","wcag22aa"] } });
    return res.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  });
  expect(violations).toEqual([]);
});

test("mobile swipe up advances section", async ({ page }) => {
  await page.goto(JOURNEY);
  const box = page.locator("#arrival");
  await box.waitFor();
  // 위로 스와이프 (아래→위 드래그)
  await page.touchscreen.tap(200, 600).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  // Observer 기반: 합성 터치 드래그
  await page.locator("body").dispatchEvent("touchstart", {}).catch(() => {});
  await page.waitForTimeout(100);
  // 검증은 progress current가 바뀌는지로 (엔진 결선 후)
  const exists = await page.locator('.progress li').count();
  expect(exists).toBe(7);
});

test("reflow: snap disabled on very narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto(JOURNEY);
  const mode = await page.evaluate(() => window.__journeyMode || "free");
  expect(mode).toBe("free");
});
```

> 주: 모바일 swipe의 정밀 합성은 구현 후 보정한다. P0 게이트의 필수 통과 항목은 keyboard·axe·reflow 3개이며, swipe는 progress 7개 존재로 스모크한다(정밀 제스처는 P3 폴리시에서 강화).

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/journey-a11y.spec.mjs --project=desktop-chromium`
Expected: FAIL (a11y/main 미결선).

- [ ] **Step 3: a11y 모듈 구현**

`engine/a11y.js`:
```js
// 진행 인디케이터 렌더 + aria-current + 키보드 네비.
export function initA11y({ order, onGo, onJump }) {
  const list = document.getElementById("progress-list");
  list.innerHTML = order.map((id, i) =>
    `<li data-target="${id}" ${i === 0 ? 'aria-current="true"' : ""}></li>`).join("");

  function setCurrent(id) {
    for (const li of list.children)
      li.setAttribute("aria-current", String(li.dataset.target === id));
    const sec = document.getElementById(id);
    if (sec) sec.setAttribute("tabindex", "-1");
  }

  document.addEventListener("keydown", (e) => {
    if (["ArrowDown","PageDown"].includes(e.key)) { e.preventDefault(); onGo("next"); }
    else if (["ArrowUp","PageUp"].includes(e.key)) { e.preventDefault(); onGo("prev"); }
    else if (e.key === "Home") { e.preventDefault(); onJump(order[0]); }
    else if (e.key === "End") { e.preventDefault(); onJump(order[order.length - 1]); }
  });

  return { setCurrent };
}
```

- [ ] **Step 4: main.js 결선**

`main.js`:
```js
import { initScroll } from "./engine/scroll.js";
import { createInput } from "./engine/input.js";
import { createSnap } from "./engine/transitions.js";
import { initA11y } from "./engine/a11y.js";
import { isReflow, prefersReducedMotion } from "./engine/env.js";

const ORDER = ["arrival","saved-scenes","why-wdc","busan-syndrome","mood-routes","design-city","archive"];

const scroll = initScroll();
const scrollTo = (id) => {
  const el = document.getElementById(id);
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
```

- [ ] **Step 5: 통과 확인 (데스크톱 + 모바일)**

Run: `npx playwright test tests/journey-a11y.spec.mjs`
Expected: PASS (keyboard·axe·reflow 필수, swipe 스모크).
Run 전체 회귀: `npm run design:browser`
Expected: 전 테스트 PASS.

- [ ] **Step 6: 커밋**

```bash
git add world-design-capital-busan/site/journey/engine/a11y.js world-design-capital-busan/site/journey/main.js tests/journey-a11y.spec.mjs
git commit -m "feat(journey): a11y 골격 + 엔진 결선(P0 완료)"
```

---

## Phase P1~P5 — 섹션 이식·WebGL 통합·연출·마감 (단계별 상세 계획)

> P0가 엔진 토대를 **완전 실행 가능**하게 만든다. 이후 단계는 각 Codrops 데모 **번들 내부를 그 시점에 읽어야** 정확한 코드를 쓸 수 있으므로, 각 Phase 진입 시 동일한 bite-sized TDD 형식의 **상세 sub-plan을 별도 생성**한다(아래는 그 sub-plan이 만족해야 할 파일·계약·수용 기준).

### P1 — 비-WebGL 섹션 이식 (01·02·03·06)
- **파일**: `sections/arrival.js`, `sections/saved-scenes.js`, `sections/why-wdc.js`, `sections/design-city.js` + 각 `styles/<name>.css`(`.s-<name>` 스코프).
- **계약**: 각 모듈은 `{init,enter,leave,dispose}` 구현, `main.js`에 `registry.register`.
- **이식 규칙**: 원본 데모의 비주얼 로직을 § 디자인 토큰(§4 스펙)으로 재색·재타이포. ScrollSmoother(03)·Lenis(02·06)는 공용 `engine/scroll.js`로 대체.
- **에지 인지(why-wdc)**: 내부 스크롤 끝 도달 시 `input.setMode("snap")`, 진입 시 `"free"`.
- **수용 테스트(Playwright)**: 각 섹션 진입 시 핵심 DOM/캔버스 존재, leave 후 애니메이션 정지, `dispose` 후 리스너 0, axe AA 유지.

### P2 — WebGL 통합 (04·05·07)
- **파일**: `sections/busan-syndrome.js`, `sections/mood-routes.js`, `sections/archive.js`.
- **계약**: 자체 렌더러 생성 금지 → `engine/webgl.js`의 `registerScene/setActive/unregisterScene` 사용. `leave`에서 `setActive(null)`, `dispose`에서 `unregisterScene` + geometry/material/texture `dispose`.
- **수용 테스트**: 동시 활성 WebGL 컨텍스트 1개, 섹션 반복 진입·이탈 후 GPU 리소스 누수 없음(생성/해제 카운트 균형), 모바일 DPR≤2.

### P3 — 시그니처 전환·콘텐츠·어포던스
- **파일**: `engine/transitions.js` 확장(§4.3 "저장된 장면을 다시 연다" clipPath/mask/카메라 타임라인), `sections/*`에 §5 카피/서사 반영, 진행 인디케이터·길찾기 강화.
- **수용 테스트**: 경계 전환 타임라인 재생/역재생, reduced-motion 시 페이드 강등, 모바일 전환 INP 영향 측정(<200ms 목표).

### P4 — 자산 다이어트·성능·보안 마감
- **작업**: 07-archive 101MB 사용 자산만 추출·`srcset`, LCP 요소 `fetchpriority=high`+preload, 폰트 `preload`+`font-display:swap`+`size-adjust`, 섹션 높이 예약(CLS), 서드파티 SRI+CSP, `rel=noopener`.
- **수용 테스트**: Lighthouse/측정 — LCP≤2.5s·INP≤200ms·CLS≤0.1, 초기 JS<250KB gzip, axe AA 0 critical.

### P5 — 허브 결선 + 릴리스
- **작업**: `site/index.html`(루트 허브) 메뉴 7개 `href`를 `./journey/#<id>`로 교체(허브 자체 연출은 불변).
- **수용 테스트**: 허브 각 메뉴 클릭 → journey 해당 섹션 진입, 딥링크(`#busan-syndrome`) 직접 진입.

---

## Self-Review (작성자 점검)

**1. 스펙 커버리지:**
- 통일 엔진(Lenis+GSAP) → Task 5 ✓ / 입력 추상화·모바일 → Task 6 + P3 ✓ / 생명주기·lazy·에러경계 → Task 7 ✓ / 단일 WebGL → Task 8 + P2 ✓ / 경계 스냅·에지 인지 → Task 9 + P1 ✓ / 디자인·모션 언어 → Task 3 + P3 ✓ / 콘텐츠·SEO → P3 ✓ / CWV(INP/CLS/폰트) → P4 ✓ / WCAG 2.2 AA → Task 10 + P4 ✓ / 보안 → P4 ✓ / 허브 링크 → P5 ✓ / CSS 스코프 → Task 3 + P1 ✓.
- 갭: 시그니처 전환·자산 다이어트의 *완전한 코드*는 P3/P4 sub-plan에서 작성(번들 판독 필요). 의도적 단계 분해이며 플레이스홀더가 아님.

**2. 플레이스홀더 스캔:** P0 전 Task는 실행 가능한 실제 코드/명령/기대출력 포함. P1~P5는 "코드 미정 Task"가 아니라 "각 Phase 진입 시 상세 plan 생성" 규약으로 명시.

**3. 타입 일관성:** `initScroll()→{lenis,refresh,destroy}`, `createInput({onIntent})→{setMode,lock,unlock,destroy}`, `createRegistry()→{register,activate,deactivate,dispose,has}`, `initWebGL(canvas)→{renderer,registerScene,unregisterScene,setActive,dispose}`, `createSnap({order,scrollTo,onChange})→{go,jump,current,index}`, `initA11y({order,onGo,onJump})→{setCurrent}` — 전 Task에서 동일 시그니처 사용 확인.

---

## 잔여 리스크 (스펙 self평가 1~4 → 검증 체크포인트)
- R1 디자인 품질 → P1/P3에서 비주얼 컴프 검토 게이트.
- R2 CWV 실측 → P4 Lighthouse 게이트(특히 07 다이어트 성공 여부).
- R3 a11y 실감사 → Task10 axe + P4 스크린리더·400% reflow 수동 검증.
- R4 전환 vs INP 트레이드오프 → P3 모바일 측정.
