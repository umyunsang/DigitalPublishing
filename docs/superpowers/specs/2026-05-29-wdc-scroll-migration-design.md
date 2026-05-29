# WDC Busan — 단일 스크롤 셸 마이그레이션 설계 (C+D 하이브리드)

- 작성일: 2026-05-29
- 대상: `world-design-capital-busan/site/`
- 목표: Next 버튼 기반 7개 페이지 이동을, 통일된 스크롤 엔진 위의 단일 스크롤 경험으로 전환
- 범위 결정: **C+D 하이브리드 / 전체 7섹션 한 번에 / 루트 허브는 제외**

---

## 1. 배경과 문제 정의

배포 사이트(https://wdc-busan.pages.dev/)는 단일 작품이 아니라 **독립적으로 빌드된 7개 Codrops(tympanus.net) 데모를 이어 붙인 MPA**다. 루트(허브)는 GSAP radial 메뉴이고, 7개 페이지는 각자 `Prev/Next/Hub` 앵커 링크로 전이동(full reload)한다.

### 현재 구조 (조사 결과)

| 페이지 | 핵심 기술 | 스크롤/입력 | 용량 |
|---|---|---|---|
| `index.html` (허브) | GSAP 3.15 radial 메뉴(clipPath), imagesloaded | 클릭 | — |
| 01-arrival | Vite SPA + GSAP + ScrollTrigger + `data-transition` 라우터(taxi류) | wheel | 1.5M |
| 02-saved-scenes | Lenis + ScrollTrigger + GSAP 갤러리 | wheel | 6.6M |
| 03-why-wdc | GSAP ScrollSmoother(`#smooth-wrapper/#smooth-content`) + 듀얼 웨이브 | wheel | 19M |
| 04-busan-syndrome | Three.js + WebGLRenderer 3D 깊이 갤러리, PointerEvent | wheel/pointer | 2.3M |
| 05-mood-routes | Three.js + WebGLRenderer + ScrollTrigger + GSAP | wheel | 29M |
| 06-design-city | GSAP + ScrollTrigger + Lenis + SVG mask, 변형 4종 | wheel | 6.2M |
| 07-archive | Three.js + WebGLRenderer (React `#root`) | wheel | 101M |

### 핵심 제약 (설계를 좌우)

1. **각 페이지가 완전 분리된 미니앱** — Vite 해시 번들·자체 CSS. 한 DOM에 합치면 전역 CSS 클래스 충돌(`.frame/.media/.content/.gallery`)과 JS 전역 충돌 발생.
2. **Three.js 3벌 중복 번들(04·05·07)** — 동시 WebGL 컨텍스트 다수는 모바일에서 치명적.
3. **총 174MB**(07-archive 단독 101MB) — 연속 스크롤을 하려면 lazy-load 필수.
4. **압축할 glTF/glb 모델 0개** — 3D는 image-plane/절차적. Draco/Meshopt는 *신규 3D 모델 도입 시에만* 의미. KTX2는 기존 이미지 텍스처 VRAM 절감에 적용 여지.
5. **스크롤 엔진 불일치** — Lenis(02·06) / ScrollSmoother(03) / 순수 wheel(01·04·05). 통일 1순위.

---

## 2. 목표와 비목표

### 목표
- 7개 페이지(01~07)를 **단일 스크롤 문서**의 7개 섹션으로 통합.
- **통일 스크롤 엔진**(Lenis + GSAP ScrollTrigger)으로 재구성.
- 섹션 경계에서 **애니메이티브 전환**(Observer 스냅 + clipPath/mask/카메라).
- 174MB 자산을 **섹션 lazy-load + dispose**로 관리, 단일 공유 WebGL 렌더러.
- 접근성·크로스브라우저 폴백 보장.

### 비목표
- **루트 허브(radial 메뉴) 자체는 변경하지 않음** (메뉴 링크 `href`만 교체).
- WebGPU 전환(2025 기준 비인스턴스 메시에서 WebGL 대비 성능 열위 보고 → WebGL 유지).
- 신규 3D 모델 제작(현 자산 범위 유지). Draco 도입은 향후 과제.

---

## 3. 목표 아키텍처

루트 허브는 그대로 두고, 마이그레이션 결과물은 새 단일 문서 `site/journey/index.html`로 만든다. 허브의 7개 메뉴는 각 섹션 앵커로 연결한다.

```
site/
├─ index.html              # 루트 허브(radial 메뉴): 변경 없음
│     └─ 메뉴 7개 href → ./journey/#arrival, #saved-scenes, #why-wdc,
│        #busan-syndrome, #mood-routes, #design-city, #archive
│
└─ journey/
   ├─ index.html           # 단일 스크롤 셸
   │   ├─ <canvas id="gl"> # 공유 WebGL 레이어 (fixed, 전체 화면)
   │   └─ Lenis 컨테이너
   │       ├─ <section id="arrival"        data-section="arrival">
   │       ├─ <section id="saved-scenes"   data-section="saved-scenes">
   │       ├─ <section id="why-wdc"        data-section="why-wdc">
   │       ├─ <section id="busan-syndrome" data-section="busan-syndrome"> (WebGL)
   │       ├─ <section id="mood-routes"    data-section="mood-routes">   (WebGL)
   │       ├─ <section id="design-city"    data-section="design-city">
   │       └─ <section id="archive"        data-section="archive">       (WebGL)
   ├─ engine/
   │   ├─ scroll.js         # Lenis + GSAP ticker + ScrollTrigger 등록
   │   ├─ sections.js       # 섹션 레지스트리·생명주기·프리로드
   │   ├─ webgl.js          # 단일 Three.js 렌더러·씬 등록/해제
   │   ├─ input.js          # wheel/touch/pointer → next/prev 의도 정규화
   │   └─ transitions.js    # 경계 전환·Observer 스냅
   ├─ sections/
   │   ├─ arrival.js  saved-scenes.js  why-wdc.js  busan-syndrome.js
   │   └─ mood-routes.js  design-city.js  archive.js
   └─ styles/
       ├─ tokens.css        # :root 공통 디자인 토큰
       └─ <섹션별>.css       # .s-<name> 스코프 격리
```

### 입력/데이터 흐름

```
wheel(데스크톱) / touch-drag(모바일) / pointer
  → engine/input.js (Observer: next/prev/scrubDelta 의도로 정규화, 임계값·디바운스)
  → free 모드:  Lenis(스무스) → ScrollTrigger(핀/스크럽/진행)
  → snap 모드:  transitions.js (경계 전환 타임라인 재생)
  → 활성 section.enter()/scrub  +  webgl.js가 활성 씬만 scissor/viewport로 draw
  (내부 스크롤 섹션: 콘텐츠 에지 도달 시 free→snap 전환)
```

---

## 4. 모듈 설계 (단일 책임 · 독립 테스트)

각 모듈은 명확한 인터페이스로만 통신하며 내부 구현을 바꿔도 소비자에 영향 없도록 한다.

### 4.1 `engine/scroll.js`
- **역할**: Lenis 초기화, `lenis.raf`를 GSAP ticker에 연결, `ScrollTrigger.scrollerProxy`/`update` 연동, `prefers-reduced-motion` 시 Lenis 비활성(네이티브 스크롤).
- **인터페이스**: `initScroll(): { lenis, refresh(), destroy() }`
- **의존**: lenis, gsap, ScrollTrigger.

### 4.2 `engine/sections.js`
- **역할**: 섹션 모듈 등록·생명주기 오케스트레이션. IntersectionObserver로 **1섹션 앞 프리로드**, 뷰포트 진입 시 `init()`→`enter()`, 이탈 시 `leave()`→(임계 초과 시)`dispose()`.
- **계약**: 모든 섹션 모듈은 `{ init(el), enter(), leave(), dispose() }` 구현.
- **인터페이스**: `registerSection(name, factory)`, `mountAll()`.

### 4.3 `engine/webgl.js`
- **역할**: **단일 `WebGLRenderer`**, fixed 전체화면 캔버스. 활성 WebGL 섹션(04·05·07)만 scissor/viewport로 렌더. 씬 register/unregister. 컨텍스트 손실(`webglcontextlost/restored`) 복구. DPR 캡(모바일 ≤2).
- **인터페이스**: `registerScene(name, scene, camera, rect)`, `unregisterScene(name)`, `setActive(name)`.
- **의존**: three.

### 4.4 `engine/input.js` (입력 추상화 — 데스크톱/모바일 통일)
- **역할**: GSAP Observer로 `wheel · touch · pointer`를 **단일 의도 이벤트**(`next` / `prev` / `scrubDelta`)로 정규화. 데스크톱은 wheel, **모바일은 터치 드래그(스와이프 업=next, 다운=prev)** 가 같은 의도로 매핑됨. 멀티터치(핀치/줌)·우발 탭은 무시(속도·거리 임계값), 한 제스처당 1회만 발화(`Observer.disable()`→전환 종료 후 재활성으로 디바운스).
- **인터페이스**: `onIntent(handler)`, `lock()/unlock()`, `setMode('snap'|'free')`.
- **의존**: gsap, Observer, PointerEvent.

### 4.5 `engine/transitions.js`
- **역할**: 섹션 경계 "애니메이티브 전환"(clipPath/SVG mask/카메라 무브), 허브 radial 감성 계승. `engine/input.js`의 의도 이벤트를 받아 풀스냅(D) 재생. 긴 내부 스크롤 섹션(why-wdc·archive)은 **에지 인지(edge-aware) 중첩 스크롤**: 내부 콘텐츠를 끝(상단/하단)까지 본 뒤의 추가 드래그에서만 섹션 전환.
- **인터페이스**: `enableSnap(sections, opts)`, `playBoundary(fromIdx, toIdx)`.
- **의존**: gsap, Observer, `engine/input.js`.

### 4.6 `sections/<name>.js` (7개)
- 각 Codrops 데모의 비주얼을 통일 엔진 위로 재작성. WebGL 섹션은 자체 렌더러를 만들지 않고 `engine/webgl.js`에 씬을 등록. 내부 스크롤이 필요한 섹션은 자신의 스크롤 끝 상태를 `transitions.js`에 보고(에지 신호).

---

## 5. CSS 충돌 해결
- 각 섹션 CSS를 래퍼 클래스(`.s-arrival`, `.s-saved-scenes`, `.s-why-wdc` …) 하위로 **스코프 격리**.
- 공통 토큰(색·간격·전환 타이밍·z-index 레이어)은 `styles/tokens.css`의 `:root` custom properties로 통일.
- 레거시 전역 셀렉터(`.frame` 등)는 섹션 래퍼로 접두.

---

## 6. 성능 / 자산 계획 (174MB 대응)
- 섹션별 **동적 `import()`** + 자산 lazy-load(IntersectionObserver, 1섹션 앞 프리로드).
- **07-archive(101MB) 자산 다이어트 최우선** — 사용 자산만 추리고 반응형 크기 분기.
- WebGL 3종을 **공유 렌더러 1개**로 통합(동시 활성 컨텍스트 1개), 이탈 시 `dispose()`로 GPU 메모리 상한.
- (선택) 04·05 이미지 텍스처 KTX2/Basis 전환으로 VRAM ≈10× 절감 검토.
- 성능 예산: 초기 로드(허브 진입 후 첫 섹션) JS < 250KB gzip, LCP < 2.5s(중급 모바일), 활성 WebGL 1개.

---

## 7. 모바일 / 터치 입력 설계 (드래그 기반 네비게이션)

스냅(D) 활성 시 모바일은 네이티브 세로 스크롤이 막히므로 **터치 드래그가 주 입력**이다. 데스크톱 wheel과 모바일 swipe가 `engine/input.js`에서 동일한 의도(`next/prev`)로 수렴한다.

### 7.1 제스처 매핑
- **스와이프 업(위로 끌기)** → 다음 섹션, **스와이프 다운** → 이전 섹션. (네이티브 스크롤과 방향 일치)
- 의도 인식 임계값: 최소 이동 거리(`dragMinimum`, 예 ~50px)와 속도(velocity)를 동시 충족해야 발화 → 우발 탭·미세 흔들림 무시.
- 한 제스처 = 1회 전환: 전환 중 Observer 비활성 → 전환 완료 후 재활성(연속 점프 방지).
- **멀티터치(핀치/줌)·접근성 확대 중에는 네비게이션 무시** — 사용자 줌 보존.

### 7.2 내부 스크롤 섹션과의 충돌 해소 (에지 인지 중첩 스크롤)
- why-wdc·archive처럼 내용이 긴 섹션은 그 안에서 **네이티브 터치 스크롤 허용**.
- 내부 콘텐츠가 **끝(상단/하단)에 도달한 뒤의 추가 드래그**에서만 섹션 전환 발화 → "콘텐츠 읽기"와 "섹션 이동"이 충돌하지 않음.
- 해당 섹션은 진입 시 `setMode('free')`(네이티브 스크롤), 에지 도달 시 `setMode('snap')`로 전환.

### 7.3 모바일 뷰포트·터치 안정화
- iOS 주소창 리사이즈 대응: 높이 단위 `100svh/100dvh` + `visualViewport` 보정(고정 `100vh` 금지).
- `overscroll-behavior: none`(iOS 고무줄/당겨서 새로고침 차단), 캔버스·핀 영역 `touch-action: none`, 콘텐츠 스크롤 영역 `touch-action: pan-y`.
- 리스너는 의도 분기 전까지 passive, 네비게이션 확정 시에만 `preventDefault`.
- 가로/세로 잠금: 주축이 세로일 때만 섹션 네비, 가로 우세 제스처는 무시(가로 갤러리 보존).

### 7.4 모바일 성능·연출 강등
- DPR 캡(≤2), 모바일에서 무거운 전환은 단순화(복잡 카메라 무브 → 페이드/슬라이드), 활성 WebGL 1개 엄수.
- 저전력/저사양·`prefers-reduced-motion` 시 풀스냅 해제 → 네이티브 스크롤 + 페이드로 강등.

---

## 8. 엣지 / 폴백 (공통)
- `prefers-reduced-motion`: Lenis·풀스냅 비활성 → 네이티브 스크롤 + 단순 페이드.
- Firefox/Safari: View Transitions 미지원분은 스냅/페이드 폴백(전환은 GSAP 기반이라 핵심 동작은 크로스브라우저 동일).
- WebGL 컨텍스트 손실 복구, 저속 네트워크 스켈레톤/블러업 플레이스홀더.
- 키보드 네비게이션(↑/↓/PageUp/Down·Home/End, 섹션 점프), 포커스 관리.
- `why-wdc`·`archive`(긴 내부 스크롤)는 §7.2 에지 인지로 처리.

---

## 9. 테스트 (Playwright 기설정 활용)
- 섹션별 스크롤 진입/이탈 동작 및 시각 스냅샷.
- **모바일 터치 에뮬레이션**: swipe up/down 섹션 전환, 임계값 미달 드래그 무시, 멀티터치(핀치) 시 네비 무발화.
- **에지 인지 검증**: 내부 스크롤 섹션에서 끝 도달 전 드래그=콘텐츠 스크롤, 끝 도달 후 드래그=섹션 전환.
- iOS 주소창 리사이즈(svh/dvh) 및 `overscroll-behavior` 동작 확인.
- `dispose` 후 WebGL 컨텍스트/메모리 누수 검증(반복 진입·이탈).
- Lighthouse 성능 예산 검사, `prefers-reduced-motion` 경로 스모크.
- 크로스브라우저(Chromium/Firefox/WebKit) 폴백 스모크.
- 허브 메뉴 앵커 → 해당 섹션 진입 검증.

---

## 10. 단계적 빌드 (전체 7섹션 목표, 안전한 순서)
- **P0 — 엔진 골격**: `journey/index.html` 셸, `engine/*`(input 포함), CSS 스코프·토큰, 빈 7섹션 + 데스크톱 wheel·모바일 swipe 스냅 동작.
- **P1 — 비-WebGL 섹션**: 01-arrival, 02-saved-scenes, 03-why-wdc, 06-design-city 이식 + 에지 인지 중첩 스크롤.
- **P2 — WebGL 통합**: 04·05·07을 공유 렌더러로 통합, 씬 register/dispose.
- **P3 — 전환 연출**: 경계 transitions·Observer 스냅·radial 감성 폴리시.
- **P4 — 마감**: 07 자산 다이어트, 성능 예산 달성, 모바일·접근성·폴백·테스트 완비, 허브 메뉴 링크 교체.

---

## 11. 미해결/후속 (현 스펙 범위 밖)
- 신규 3D 모델 도입 시 Draco/Meshopt + KTX2 파이프라인(`gltf-transform optimize`).
- WebGPURenderer 재평가(생태계 성숙 후).
- OffscreenCanvas + Web Worker 렌더링(저사양 추가 최적화).

---

## 참고 (리서치 출처)
- View Transitions(MPA): https://developer.chrome.com/docs/web-platform/view-transitions/cross-document , https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- GSAP 무료화·Scroll·Observer: https://gsap.com/pricing/ , https://gsap.com/scroll/ , https://gsap.com/docs/v3/Plugins/Observer/
- Lenis: https://github.com/darkroomengineering/lenis
- CSS scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- Three.js 다중 씬/단일 렌더러: https://threejsfundamentals.org/threejs/lessons/threejs-multiple-scenes.html
- OffscreenCanvas: https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers
- 압축(Draco/Meshopt/KTX2): https://gltf-transform.dev/ , https://www.utsubo.com/blog/threejs-best-practices-100-tips
