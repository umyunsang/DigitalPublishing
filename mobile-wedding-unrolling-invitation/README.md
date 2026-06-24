# Mobile Wedding Unrolling Invitation

DigitalPublishing 저장소 안에 있는 모바일 청첩장 퍼블리싱 하위 프로젝트입니다.

Three.js/WebGL 기반의 이미지 unroll 효과를 모바일 청첩장 흐름에 맞게 변형했습니다. 이 폴더를 복사하거나 fork해서 이름, 날짜, 장소, 사진만 바꾸면 개인 청첩장 템플릿으로 사용할 수 있습니다.

도움이 됐다면 GitHub에서 Star(즐겨찾기)만 눌러주세요.

## Share Links

| Type | Link |
| --- | --- |
| Live demo | [https://ourseason.pages.dev/](https://ourseason.pages.dev/) |
| This folder on GitHub | [github.com/umyunsang/DigitalPublishing/tree/main/mobile-wedding-unrolling-invitation](https://github.com/umyunsang/DigitalPublishing/tree/main/mobile-wedding-unrolling-invitation) |
| Parent repository | [github.com/umyunsang/DigitalPublishing](https://github.com/umyunsang/DigitalPublishing) |
| Extra docs | [`../docs/mobile-wedding-template/`](../docs/mobile-wedding-template/) |

## What This Folder Contains

```text
mobile-wedding-unrolling-invitation/
├── index.html          # 청첩장 문구, 날짜, 장소, 지도 링크, 이미지 DOM hooks
├── css/base.css        # 전체 레이아웃, 색상, 타이포그래피, 모바일 스테이지
├── js/app.js           # preload, SmoothScroll, scroll-linked mesh progress
├── js/rolls.js         # Three.js renderer, camera, texture mesh setup
├── js/imagesLoaded.js  # vendored image loader helper
├── js/shader/          # WebGL unroll vertex/fragment shaders
├── img/                # 교체 가능한 청첩장 이미지 원본
├── dist/               # Parcel production build output
├── package.json        # 런타임/빌드 의존성
└── package-lock.json
```

This is not a React or Next.js app. It is a Parcel-served static WebGL page.

## Live Demo

Current public demo:

```text
https://ourseason.pages.dev/
```

The demo content currently uses sample wedding details for `형인 & 예영`. Replace the text and images before using it as a real invitation.

## Quick Start

```bash
git clone https://github.com/umyunsang/DigitalPublishing.git
cd DigitalPublishing/mobile-wedding-unrolling-invitation
npm install
npx parcel index.html
```

Parcel will print a local URL. Open that URL in a browser.

Do not use direct file opening as the main verification path. `index.html` imports `js/app.js`, and the runtime imports GLSL shader files through Parcel.

## Production Build

```bash
npx parcel build index.html --dist-dir dist --public-url ./
```

The static output is written to:

```text
dist/
```

## How to Customize

Most edits should happen in only three places:

| Goal | File or folder |
| --- | --- |
| Names, date, venue, invitation copy, map link | `index.html` |
| Couple photos and visual chapters | `img/` |
| Color, type scale, spacing, section placement | `css/base.css` |

Avoid editing `js/rolls.js`, `js/shader/`, or `js/imagesLoaded.js` unless you are intentionally changing the WebGL effect.

## Text Slots in `index.html`

| Area | Current selector or section | What to replace |
| --- | --- | --- |
| Browser title | `<title>` | couple names or invitation title |
| Meta description | `<meta name="description">` | short share/search description |
| Opening headline | `.header__title` | first emotional headline |
| Opening note | `.header__note` | short invitation lead |
| Cover date | `.intro__title` | date and time |
| Invitation message | `#invitation` / `.dos__text` | main invitation copy |
| Ceremony info | `#ceremony` / `.tres__text` | date, time, address |
| Closing guide | `#contact` | final note, venue details, map link |

## Image Slots

Keep the filenames if you want the simplest replacement path.

| File | Role | WebGL unroll? |
| --- | --- | --- |
| `img/intro1.jpg` | cover background image | no |
| `img/intro2.jpg` | cover foreground couple image | yes |
| `img/dos1.jpg` | bouquet/ring/detail image | no |
| `img/dos2.jpg` | invitation chapter image | yes |
| `img/tres1.jpg` | ceremony chapter couple image | yes |
| `img/tres2.jpg` | venue or ceremony support image | no |
| `img/1.jpg` | memory grid image 1 | yes |
| `img/2.jpg` | memory grid image 2 | yes |
| `img/3.jpg` | memory grid image 3 | yes |
| `img/4.jpg` | memory grid image 4 | yes |
| `img/last.jpg` | closing image | yes |

Images marked as WebGL unroll targets must keep `class="js-image"` in `index.html`.

## Required DOM Contracts

The scroll transaction depends on these hooks:

```html
<main>
  <div class="stage">
    <div data-scroll>
      <img class="js-image" src="img/intro2.jpg" alt="...">
    </div>
  </div>
</main>
<div id="container"></div>
```

Do not remove these contracts unless you also update `js/app.js` and `js/rolls.js`:

| Hook | Why it matters |
| --- | --- |
| `#container` | `Sketch` appends the Three.js canvas here |
| `main` | fixed viewport shell for simulated smooth scroll |
| `.stage` | fixed 900 x 1440 invitation stage scaled to the viewport |
| `[data-scroll]` | translated by `SmoothScroll` |
| `.js-image` | converted into WebGL unrolling meshes |
| `body.loading` / `body.loaded` | preload and visibility states |

## Motion Behavior

The core interaction is user-controlled scrolling:

- DOM images load first.
- `body.loading` becomes `body.loaded`.
- `.js-image` DOM sources become invisible.
- Three.js renders the visible canvas layer.
- Scroll position drives `[data-scroll]` transform and shader progress.

The current build keeps the WebGL scroll transaction active even when `prefers-reduced-motion: reduce` is enabled, because the invitation's primary experience is the scroll reveal itself. Only nonessential loader animation is reduced.

## Deploy

Recommended Cloudflare Pages settings:

| Setting | Value |
| --- | --- |
| Root directory | `mobile-wedding-unrolling-invitation` |
| Build command | `npx parcel build index.html --dist-dir dist --public-url ./` |
| Output directory | `dist` |

The same build output can also be used with Netlify, GitHub Pages, or any static host.

## QA Before Sharing

Check the deployed URL, not only localhost.

Minimum phone checks:

- iPhone Safari opens the page
- Android Chrome opens the page
- loader disappears
- first image is WebGL/canvas unrolled, not a flat fallback image
- normal finger scroll changes the visual transaction
- no horizontal overflow on phone width
- Korean text is readable
- map link opens the right venue

Detailed checklist:

```text
../docs/mobile-wedding-template/qa-checklist.md
```

## Credits and License Notes

This subproject adapts the interaction mechanics from Yuriy Artyukh's Codrops demo:

- [akella/UnrollingImages](https://github.com/akella/UnrollingImages)
- [Codrops article](https://tympanus.net/codrops/?p=46712)
- [Original demo](https://tympanus.net/Development/UnrollingImages/)

Core libraries:

- [three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [Font Face Observer](https://fontfaceobserver.com/)
- [imagesLoaded](https://imagesloaded.desandro.com/)
- [Parcel](https://parceljs.org/)

Keep the upstream credit when reusing the effect. Do not sell or redistribute the upstream demo as-is.

More notes:

```text
../docs/mobile-wedding-template/credits-license.md
```

## Star

If this folder helped you make a mobile invitation, Star(즐겨찾기)만 눌러주세요.

```text
https://github.com/umyunsang/DigitalPublishing
```
