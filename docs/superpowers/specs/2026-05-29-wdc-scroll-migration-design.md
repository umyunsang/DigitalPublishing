# WDC Busan — 단일 스크롤 셸 마이그레이션 설계 (C+D 하이브리드) · v2

- 작성일: 2026-05-29 (v2 보강: 디자인/모션 언어, 콘텐츠 서사, 성능 INP/CLS/폰트, WCAG 2.2 AA, 보안)
- 대상: `world-design-capital-busan/site/`
- 목표: Next 버튼 기반 7개 페이지 이동을, 통일된 스크롤 엔진 위의 단일 스크롤 경험으로 전환
- 범위 결정: **C+D 하이브리드 / 전체 7섹션 한 번에 / 루트 허브는 제외**
- 품질 목표: **Awwwards SOTD 문턱(6.5+) / Core Web Vitals "Good" / WCAG 2.2 AA**

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
6. **봉합 리스크** — 7개 데모는 색·타이포·모션 언어가 제각각. 통합 디자인 언어 없이는 "이어 붙인 자국"이 남는다(§4 대응).

---

## 2. 목표와 비목표

### 목표
- 7개 페이지(01~07)를 **단일 스크롤 문서**의 7개 섹션으로 통합.
- **통일 스크롤 엔진**(Lenis + GSAP ScrollTrigger)으로 재구성.
- 섹션 경계에서 **애니메이티브 전환**(Observer 스냅 + 시그니처 전환 §4.3).
- 174MB 자산을 **섹션 lazy-load + dispose**로 관리, 단일 공유 WebGL 렌더러.
- **측정 가능한 품질 목표**: Core Web Vitals "Good"(LCP≤2.5s, INP≤200ms, CLS≤0.1), **WCAG 2.2 AA**, Awwwards 4기준(Design/Usability/Creativity/Content) 균형.

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
   │   └─ Lenis 컨테이너 (7 <section>)
   ├─ engine/
   │   ├─ scroll.js         # Lenis + GSAP ticker + ScrollTrigger 등록
   │   ├─ sections.js       # 섹션 레지스트리·생명주기·프리로드
   │   ├─ webgl.js          # 단일 Three.js 렌더러·씬 등록/해제
   │   ├─ input.js          # wheel/touch/pointer → next/prev 의도 정규화
   │   └─ transitions.js    # 경계 전환·Observer 스냅
   ├─ sections/             # arrival … archive (7개, init/enter/leave/dispose)
   └─ styles/
       ├─ tokens.css        # :root 공통 디자인 토큰(§4)
       └─ <섹션별>.css       # .s-<name> 스코프 격리(§7)
```

### 입력/데이터 흐름

```
wheel(데스크톱) / touch-drag(모바일) / pointer
  → engine/input.js (Observer: next/prev/scrubDelta 의도 정규화, 임계값·디바운스)
  → free 모드:  Lenis(스무스) → ScrollTrigger(핀/스크럽/진행)
  → snap 모드:  transitions.js (경계 전환 타임라인 재생)
  → 활성 section.enter()/scrub  +  webgl.js가 활성 씬만 scissor/viewport로 draw
  (내부 스크롤 섹션: 콘텐츠 에지 도달 시 free→snap 전환)
```

---

## 4. 디자인 / 모션 언어 (통합 아트디렉션) — *v2 신규*

7개 이질적 데모를 **하나의 작품**으로 묶는 통합 규칙. Awwwards Design(40%)·Creativity(20%) 대응.

### 4.1 디자인 토큰 (`styles/tokens.css`, `:root`)
- **컬러**: `부산병` 무드(바다 블루·노을 코랄·딥 나이트) 기반 3축 팔레트 + 중립 톤. 각 섹션은 이 팔레트의 변주만 허용(원본 데모 색 직접 사용 금지).
- **타이포**: 디스플레이 1종(영문 그로테스크) + 본문 1종(국문 가독체)으로 통일. 폰트 스케일은 `clamp()` 모듈러 스케일.
- **간격·레이아웃**: 8pt 그리드, `--space-*`, `--layer-*`(z-index 레이어 토큰).
- **모션 곡선**: `--ease-enter`(expo.out류)·`--ease-exit`·`--dur-*` 토큰으로 전 섹션 모션 일관.

### 4.2 모션 디자인 원칙
- 진입은 빠르게-감속(ease-out), 이탈은 가속(ease-in). 동시 모션 ≤2축.
- 스크롤 스크럽은 항상 같은 방향성(아래=전진=서사 진행).
- `prefers-reduced-motion`에서 모든 모션은 의미 보존형 페이드로 대체(§10).

### 4.3 시그니처 전환 컨셉 ("저장된 장면을 다시 연다")
- 7섹션을 잇는 **단일 메타포**: 각 경계 전환은 "이미지를 저장→다시 펼침"의 변주(허브 radial clipPath 감성 계승). clipPath/SVG mask/카메라 무브는 이 메타포의 표현 수단.
- 섹션 간 **연결 모티프**(예: 직전 섹션의 대표 이미지가 다음 섹션의 시드로 이어짐)로 봉합 자국 제거.

---

## 5. 콘텐츠 / 서사 아크 — *v2 신규*

Awwwards Content(10%) + SEO 대응. 원천 서사는 repo의 `부산병: 다시 보고 싶은 디자인 도시`.

### 5.1 섹션별 서사 역할
| 섹션 | 서사 비트 | 핵심 메시지(초안) |
|---|---|---|
| arrival | 도착 | 도시의 첫 장면으로 들어선다 |
| saved-scenes | 저장 | 반복해서 저장되는 부산의 이미지 |
| why-wdc | 근거 | 왜 세계디자인수도인가(키워드) |
| busan-syndrome | 잔상 | 여행 뒤에도 남는 도시의 잔상 |
| mood-routes | 감정 | 사람과 장소가 만드는 감정 루트 |
| design-city | 장면 | 바다·이동·골목·밤의 장면 전환 |
| archive | 기록 | 출처·레퍼런스·제작 기록 |

### 5.2 카피·언어 정책
- 현재 ko/en 혼용을 **표제=영문 / 본문=국문** 규칙으로 통일(현 `lang` 불일치도 `ko` 기준 정리).
- 섹션마다 1개 리드 카피 + 보조 캡션. 장문 콘텐츠는 why-wdc·archive로 한정.

### 5.3 단일 페이지 SEO/메타
- `journey/index.html`에 통합 `<title>`·description·**OG/Twitter 카드**(대표 비주얼) 정의.
- 섹션 앵커는 딥링크 가능(`#busan-syndrome` 등), 허브에서 진입 시 해당 섹션으로.
- 구조화 데이터(선택): `CreativeWork`/`WebSite`.

---

## 6. 모듈 설계 (단일 책임 · 독립 테스트)

각 모듈은 명확한 인터페이스로만 통신하며 내부 구현을 바꿔도 소비자에 영향 없도록 한다.

### 6.1 `engine/scroll.js`
- **역할**: Lenis 초기화, `lenis.raf`를 GSAP ticker에 연결, ScrollTrigger 연동, `prefers-reduced-motion` 시 Lenis 비활성(네이티브 스크롤).
- **인터페이스**: `initScroll(): { lenis, refresh(), destroy() }`

### 6.2 `engine/sections.js`
- **역할**: 섹션 생명주기 오케스트레이션. IntersectionObserver로 **1섹션 앞 프리로드**, 진입 시 `init()`→`enter()`, 이탈 시 `leave()`→(임계 초과 시)`dispose()`. **동적 `import()` 실패 시 에러 경계**(재시도+정적 폴백, §11).
- **계약**: 모든 섹션 모듈은 `{ init(el), enter(), leave(), dispose() }` 구현.
- **인터페이스**: `registerSection(name, factory)`, `mountAll()`.

### 6.3 `engine/webgl.js`
- **역할**: **단일 `WebGLRenderer`**, fixed 전체화면 캔버스. 활성 WebGL 섹션(04·05·07)만 scissor/viewport로 렌더. 씬 register/unregister. 컨텍스트 손실(`webglcontextlost/restored`) 복구. DPR 캡(모바일 ≤2).
- **인터페이스**: `registerScene(name, scene, camera, rect)`, `unregisterScene(name)`, `setActive(name)`.

### 6.4 `engine/input.js` (입력 추상화 — 데스크톱/모바일 통일)
- **역할**: GSAP Observer로 `wheel · touch · pointer`를 단일 의도(`next`/`prev`/`scrubDelta`)로 정규화. **모바일 터치 드래그(스와이프 업=next)** 가 같은 의도로 매핑. 멀티터치(핀치/줌)·우발 탭 무시, 한 제스처당 1회만 발화.
- **인터페이스**: `onIntent(handler)`, `lock()/unlock()`, `setMode('snap'|'free')`.

### 6.5 `engine/transitions.js`
- **역할**: §4.3 시그니처 전환 재생, 허브 radial 감성 계승. `input.js` 의도를 받아 풀스냅(D). 긴 내부 스크롤 섹션(why-wdc·archive)은 **에지 인지(edge-aware) 중첩 스크롤**.
- **인터페이스**: `enableSnap(sections, opts)`, `playBoundary(fromIdx, toIdx)`.

### 6.6 `sections/<name>.js` (7개)
- 각 Codrops 데모를 §4 디자인 언어로 재작성. WebGL 섹션은 자체 렌더러 대신 `webgl.js`에 씬 등록. 내부 스크롤 섹션은 스크롤 끝 상태를 `transitions.js`에 보고.

---

## 7. CSS 충돌 해결
- 각 섹션 CSS를 래퍼 클래스(`.s-arrival` …) 하위로 **스코프 격리**.
- 공통 토큰(§4.1)은 `styles/tokens.css`의 `:root`로 통일. 레거시 전역 셀렉터(`.frame` 등)는 섹션 래퍼로 접두.

---

## 8. 성능 / 자산 계획 (174MB 대응) — *v2 강화*

### 8.1 자산
- 섹션별 **동적 `import()`** + 자산 lazy-load(IntersectionObserver, 1섹션 앞 프리로드).
- **07-archive(101MB) 자산 다이어트 최우선** — 사용 자산만 추리고 반응형 크기 분기(`srcset`/`sizes`).
- WebGL 3종을 **공유 렌더러 1개**로 통합(동시 활성 컨텍스트 1개), 이탈 시 `dispose()`로 GPU 메모리 상한. (선택) KTX2/Basis로 VRAM ≈10× 절감.

### 8.2 Core Web Vitals 예산 (*v2 신규*)
- **LCP ≤ 2.5s** — 첫 섹션 LCP 요소(arrival 히어로 이미지) 명시·`fetchpriority=high`·프리로드.
- **INP ≤ 200ms** — Observer/스크롤 핸들러는 passive·rAF 코얼레싱·메인스레드 작업 분할(긴 작업 <50ms). WebGL 업데이트는 ticker 단일 루프로.
- **CLS ≤ 0.1** — lazy-mount 섹션은 **높이 사전 예약**(min-height/aspect-ratio), 폰트 스왑 시 메트릭 오버라이드(`size-adjust`).
- 초기 로드 JS < 250KB gzip, 활성 WebGL 1개.

### 8.3 폰트 (*v2 신규*)
- Typekit/Google Fonts → 핵심 서브셋만, `<link rel=preload>` + `font-display: swap`, `@font-face size-adjust/ascent-override`로 스왑 시프트 억제.

---

## 9. 모바일 / 터치 입력 설계 (드래그 기반 네비게이션)

스냅(D) 활성 시 모바일은 네이티브 세로 스크롤이 막히므로 **터치 드래그가 주 입력**. 데스크톱 wheel과 모바일 swipe가 `input.js`에서 동일 의도로 수렴.

### 9.1 제스처 매핑
- **스와이프 업=다음, 다운=이전.** 최소 거리(`dragMinimum`~50px)+속도 동시 충족 시 발화(우발 탭 무시). 한 제스처=1회 전환(전환 중 Observer 비활성). 멀티터치/확대 중 네비 무시(사용자 줌 보존).

### 9.2 에지 인지 중첩 스크롤
- why-wdc·archive는 내부 네이티브 터치 스크롤 허용 → **콘텐츠 끝 도달 후 추가 드래그에서만** 섹션 전환. 진입 시 `setMode('free')`, 에지 도달 시 `setMode('snap')`.

### 9.3 뷰포트·터치 안정화
- `100svh/100dvh` + `visualViewport`(iOS 주소창, 고정 `100vh` 금지). `overscroll-behavior:none`(고무줄/당겨새로고침 차단). 캔버스·핀 `touch-action:none`, 스크롤 영역 `touch-action:pan-y`. 세로축 우세 제스처만 네비.

### 9.4 성능·연출 강등
- DPR≤2, 모바일 전환 단순화, 활성 WebGL 1개. 저전력/`prefers-reduced-motion` 시 풀스냅 해제 → 네이티브 스크롤+페이드.

---

## 10. 접근성 (WCAG 2.2 AA 목표) — *v2 신규/강화*

스크롤재킹은 NN/g가 경고하는 패턴이므로 **진보적 향상(progressive enhancement)** 원칙: 코어 콘텐츠는 스크롤재킹 없이도 도달 가능해야 한다.

- **목표 등급: WCAG 2.2 레벨 AA.**
- **2.3.3 / prefers-reduced-motion** — 인터랙션 모션 비활성 경로 의무.
- **2.2.2 Pause/Stop/Hide** — autoplay 비디오·루프 모션에 정지 컨트롤 제공.
- **1.4.10 Reflow (400% 확대)** — 확대 시 스크롤재킹 자동 해제 → 단일 컬럼 네이티브 스크롤로 강등(2D 스크롤 금지).
- **2.5.1 포인터 제스처** — 드래그 외 **단일 포인터 대안**(이전/다음 버튼·키보드) 항상 제공.
- **키보드** — ↑/↓/PageUp·Down/Home/End/Tab 완전 동작, 가시 포커스, 논리적 포커스 순서(섹션 lazy-mount 시 포커스 유실 방지).
- **스크린리더** — 섹션 랜드마크·`aria-current`로 현재 위치, 동적 마운트는 적절한 live region, **skip link**("본문/특정 섹션으로 건너뛰기").
- **어포던스** — 스크롤 진행 인디케이터 + "내가 몇/7" 길찾기 표시(Usability 보강).

---

## 11. 엣지 / 폴백 / 보안 — *v2 강화*

- Firefox/Safari: View Transitions 미지원분은 스냅/페이드 폴백(전환은 GSAP 기반이라 핵심 동작 동일).
- WebGL 컨텍스트 손실 복구, 저속 네트워크 스켈레톤/블러업.
- **동적 `import()`·자산 실패 에러 경계** — 재시도 1회 후 정적 폴백(이미지/텍스트)로 우아한 강등.
- **보안** — 서드파티 CDN(폰트·디코더) `integrity`(SRI) + `crossorigin`, 기본 **CSP** 헤더(script/style/img/connect 출처 화이트리스트), 외부 링크 `rel="noopener"`.

---

## 12. 테스트 (Playwright 기설정 활용)
- 섹션별 스크롤 진입/이탈 동작 및 시각 스냅샷.
- **모바일 터치 에뮬레이션**: swipe up/down 전환, 임계값 미달 무시, 핀치 시 네비 무발화.
- **에지 인지**: 내부 끝 도달 전=콘텐츠 스크롤, 후=섹션 전환.
- **접근성**: axe-core 자동검사(WCAG 2.2 AA), 키보드 전 경로, prefers-reduced-motion, 400% 확대 reflow, 스크린리더 스모크.
- **CWV**: Lighthouse/측정 — LCP·INP·CLS 예산 게이트.
- `dispose` 후 WebGL 누수 검증, 동적 import 실패 폴백, 크로스브라우저, 허브 앵커→섹션.

---

## 13. 단계적 빌드 (전체 7섹션 목표, 안전한 순서)
- **P0 — 엔진+디자인 토큰**: `journey/index.html` 셸, `engine/*`, `tokens.css`(§4), CSS 스코프, 데스크톱 wheel·모바일 swipe 스냅, 접근성 골격(키보드·skip link).
- **P1 — 비-WebGL 섹션**: 01·02·03·06 이식(§4 디자인 언어 적용) + 에지 인지.
- **P2 — WebGL 통합**: 04·05·07 공유 렌더러, 씬 register/dispose.
- **P3 — 전환·콘텐츠**: §4.3 시그니처 전환·§5 서사/카피·길찾기 어포던스.
- **P4 — 마감**: 07 자산 다이어트, CWV 예산 달성, WCAG 2.2 AA 검증, 보안(SRI/CSP), 허브 링크 교체.

---

## 14. 미해결/후속 (현 스펙 범위 밖)
- 신규 3D 모델 도입 시 Draco/Meshopt + KTX2 파이프라인(`gltf-transform optimize`).
- WebGPURenderer 재평가, OffscreenCanvas + Web Worker 렌더링(저사양 추가 최적화).

---

## 참고 (리서치 출처)
- View Transitions(MPA): https://developer.chrome.com/docs/web-platform/view-transitions/cross-document · https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- GSAP 무료화·Scroll·Observer: https://gsap.com/pricing/ · https://gsap.com/scroll/ · https://gsap.com/docs/v3/Plugins/Observer/
- Lenis: https://github.com/darkroomengineering/lenis
- CSS scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- Three.js 다중 씬/단일 렌더러: https://threejsfundamentals.org/threejs/lessons/threejs-multiple-scenes.html · OffscreenCanvas: https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers
- 압축(Draco/Meshopt/KTX2): https://gltf-transform.dev/ · https://www.utsubo.com/blog/threejs-best-practices-100-tips
- 평가기준: Awwwards Evaluation https://www.awwwards.com/about-evaluation/ · CWV https://web.dev/articles/defining-core-web-vitals-thresholds · 스크롤재킹 a11y https://www.nngroup.com/articles/scrolljacking-101/ · WCAG F16 https://www.w3.org/TR/WCAG20-TECHS/F16.html · ISO 25010 https://quality.arc42.org/standards/iso-25010
