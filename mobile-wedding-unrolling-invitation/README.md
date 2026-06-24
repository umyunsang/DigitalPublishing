# Mobile Wedding Unrolling Invitation

Reusable mobile wedding invitation template with a scroll-linked image unrolling effect.

도움이 됐다면 GitHub에서 Star(즐겨찾기)만 눌러주세요.

## Demo

- Live: [https://ourseason.pages.dev/](https://ourseason.pages.dev/)
- Repository: [https://github.com/umyunsang/DigitalPublishing](https://github.com/umyunsang/DigitalPublishing)

## Run Locally

Install dependencies:

```bash
npm install
```

Start a local dev server:

```bash
npx parcel index.html
```

Build for static hosting:

```bash
npx parcel build index.html --dist-dir dist --public-url ./
```

Do not open `index.html` directly as the main verification path. Parcel is needed for the JavaScript module and GLSL shader imports.

## Project Structure

```text
mobile-wedding-unrolling-invitation/
├── index.html          # invitation content, DOM hooks, page metadata
├── css/base.css        # layout, typography, colors, reduced-motion loader rule
├── js/app.js           # preload, smooth scroll, scroll-linked mesh progress
├── js/rolls.js         # Three.js renderer, mesh creation, texture mapping
├── js/imagesLoaded.js  # vendored image loader helper
├── js/shader/          # GLSL unroll shaders
├── img/                # replaceable invitation images
├── dist/               # generated production build
└── package.json        # dependencies
```

## Edit These First

| Goal | File |
| --- | --- |
| Change names, date, venue, and copy | `index.html` |
| Replace sample images | `img/` |
| Adjust palette, type, spacing, stage placement | `css/base.css` |
| Change unroll behavior or scroll math | `js/app.js`, `js/rolls.js`, `js/shader/` |

Most custom invitations should only need `index.html`, `img/`, and small CSS edits.

## Required DOM Hooks

The WebGL transaction depends on these hooks:

```text
<div id="container"></div>
<main>
  <div class="stage">
    <div data-scroll>
      ...
      <img class="js-image" ...>
    </div>
  </div>
</main>
```

Keep these contracts:

| Hook | Purpose |
| --- | --- |
| `#container` | Three.js appends the fixed canvas here |
| `main` | fixed viewport shell for simulated smooth scroll |
| `.stage` | fixed-format 900 x 1440 composition scaled to device width |
| `[data-scroll]` | translated by `SmoothScroll` |
| `.js-image` | source images converted into WebGL unroll meshes |
| `body.loading` / `body.loaded` | preload and visibility states |

## Image Slots

Replace files in `img/` while keeping the same filenames unless you also update `index.html`.

| File | Role |
| --- | --- |
| `intro1.jpg` | cover background |
| `intro2.jpg` | cover unroll image |
| `dos1.jpg` | invitation detail |
| `dos2.jpg` | invitation chapter unroll image |
| `tres1.jpg` | ceremony chapter unroll image |
| `tres2.jpg` | venue or ceremony supporting image |
| `1.jpg` to `4.jpg` | four-image memory grid |
| `last.jpg` | closing unroll image |

Recommended export:

- vertical or portrait-friendly composition
- compressed JPG around 1600px on the long edge for most phone invites
- meaningful `alt` text in `index.html`
- avoid huge raw camera files in `img/`

## Mobile Behavior

The page keeps one fixed editorial stage and scales it to the viewport. It does not reflow into separate mobile/tablet/desktop layouts.

The current build preserves the scroll-linked WebGL transaction even when `prefers-reduced-motion: reduce` is enabled, because the main purpose of this template is the user-controlled scroll reveal. Only nonessential loader animation is reduced.

## Deployment

For Cloudflare Pages:

```text
Root directory: mobile-wedding-unrolling-invitation
Build command: npx parcel build index.html --dist-dir dist --public-url ./
Output directory: dist
```

For GitHub Pages or Netlify, use the same production build command and publish the generated `dist/` folder.

## QA Before Sharing

Check the final URL on:

- iPhone Safari
- Android Chrome
- desktop browser for quick preview

Minimum checks:

- loader disappears
- the first image appears as a folded WebGL canvas, not a static DOM image
- scrolling changes the unroll/positioning
- no browser console errors
- no horizontal overflow
- map link opens correctly
- Korean text does not clip or wrap awkwardly

Detailed checklist:

```text
../docs/mobile-wedding-template/qa-checklist.md
```

## Credits and License

This template adapts the WebGL image-unroll mechanics from Yuriy Artyukh's Codrops demo:

- [akella/UnrollingImages](https://github.com/akella/UnrollingImages)
- [Codrops article](https://tympanus.net/codrops/?p=46712)
- [Original demo](https://tympanus.net/Development/UnrollingImages/)

Core libraries:

- [three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [imagesLoaded](https://imagesloaded.desandro.com/)

Keep the upstream credit when reusing the interaction. Do not sell or redistribute the upstream demo as-is.

## Star

If this template saved you time, Star(즐겨찾기)만 눌러주세요.

```text
https://github.com/umyunsang/DigitalPublishing
```
