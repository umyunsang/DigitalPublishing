# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-23
**Commit:** 28000ef
**Branch:** master

## OVERVIEW

This folder is the upstream `akella/UnrollingImages` Codrops demo renamed as a mobile wedding invitation template baseline. It is a small Parcel-driven WebGL image-unroll page, not a framework app.

## STRUCTURE

```text
mobile-wedding-unrolling-invitation/
├── index.html          # content order, section markup, DOM hooks, script entry
├── css/base.css        # only stylesheet; fixed layout plus mobile breakpoint
├── js/app.js           # preload gate, smooth scroll, item animation state
├── js/rolls.js         # Three.js scene, camera, renderer, mesh factory
├── js/imagesLoaded.js  # vendored helper; treat as third-party code
├── js/shader/          # GLSL unroll effect imported by rolls.js
├── img/                # original demo image set; replace by filename contract
├── package.json        # dependencies only; no scripts
└── package-lock.json   # npm v6-era lockfile
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Replace demo story with invitation content | `index.html` | Keep `main > div[data-scroll]`, `#container`, `.js-image`, `.js-change` unless JS changes with it. |
| Mobile layout adaptation | `css/base.css` | Primary responsive branch is `@media (max-width: 750px)`. |
| Loader or startup behavior | `js/app.js` | Fonts and images must resolve before `loading` becomes `loaded`. |
| Scroll and unroll animation | `js/app.js` | `SmoothScroll` translates `div[data-scroll]`; `Item` owns visibility and GSAP progress. |
| WebGL scene and texture mapping | `js/rolls.js` | `Sketch.createMesh()` builds one shader mesh per `.js-image`. |
| Shader deformation | `js/shader/vertex.glsl` | Contains the aspect-ratio TODO that matters for new wedding photos. |
| Image replacement | `img/` plus `index.html` | Paths are relative, and every animated image must keep `.js-image`. |
| Source credit and license | `README.md` | Preserve Codrops/Yuriy Artyukh credit and reuse restrictions. |

## CODE MAP

LSP and codegraph were not authoritative for this nested repo during init: codegraph pointed at the parent worktree, and Deno LSP document-symbol calls timed out. Centrality below is source-read, not indexed.

| Symbol / Hook | Type | Location | Refs | Role |
|---------------|------|----------|------|------|
| `js/app.js` | module entry | `index.html` | 1 script tag | Starts the full runtime. |
| `.js-image` | DOM hook | `index.html`, `css/base.css`, `js/app.js` | 8 images | Marks images that become WebGL meshes. |
| `Scene("container")` | constructor call | `js/app.js` | 1 | Creates renderer/canvas before scroll setup. |
| `Item` | class | `js/app.js` | from `SmoothScroll.createItems()` | Measures image DOM bounds and animates mesh uniforms. |
| `SmoothScroll` | class | `js/app.js` | startup after preload | Fixes `main`, sets body height, translates `div[data-scroll]`. |
| `Sketch` | default class | `js/rolls.js` | imported as `Scene` | Owns Three.js scene, camera, renderer, material, and meshes. |
| `createMesh()` | method | `js/rolls.js` | `Item` constructor | Converts one DOM image into a textured shader mesh. |
| `render()` | method | `js/rolls.js` | `SmoothScroll.setPosition()` | Pushes angle uniforms and renders the scene. |
| `vertex.glsl` | shader | `js/shader/vertex.glsl` | imported by `rolls.js` | Performs the unroll deformation. |

## CONVENTIONS

- npm is the package manager; there is no explicit package-manager field.
- Run Parcel directly; `package.json` has no `scripts`.
- HTML content classes are BEM-ish (`intro__wrap`, `dos__background-image`, `meta__title`).
- JS behavior hooks use `js-` prefixes and data attributes: `.js-image`, `.js-change`, `data-scroll`, `data-angle`.
- Source images live in `img/` and are referenced from HTML with relative paths.
- Shader imports use local relative paths from `js/rolls.js`; Parcel must handle `.glsl`.
- `body.loading` and `body.loaded` are functional runtime states, not only styling.

## ANTI-PATTERNS

- Do not open `index.html` directly as the verification path; bare package imports and GLSL imports require Parcel.
- Do not introduce React, Next.js, bundlers, or backend code for this course template unless explicitly requested.
- Do not remove or rename `#container`, `main > div[data-scroll]`, `.js-image`, `.js-change`, or `data-angle` without updating `js/app.js`.
- Do not move shader files without updating `js/rolls.js` imports and checking Parcel resolution.
- Do not treat `js/imagesLoaded.js` as local authored code; it is vendored third-party code.
- Do not redistribute or sell the upstream demo as-is; preserve the license/credit constraints in `README.md`.

## UNIQUE STYLES

- The page uses a fixed `<main>` and simulated smooth scroll by translating `div[data-scroll]`.
- Images fade out after load; the visible animated version is the WebGL canvas.
- Layout uses overlap, negative margins, rotation, and section-specific image ratios.
- The mobile breakpoint is a hand-tuned composition, not a general responsive grid.
- External Typekit fonts are part of the source look and the preload gate.

## COUPLING CHECKS

- HTML section edits usually require matching CSS section-rule edits.
- Animated-image edits cross `index.html`, `.js-image`, `app.js`, `rolls.js`, and shader crop behavior.
- Portrait-heavy wedding photos must be checked in both DOM layout and canvas output.
- New controls need matching `.js-change` / `data-angle` behavior or new JS handlers.
- Changing image paths or filenames must preserve relative `img/` references or update all HTML uses.

## COMMANDS

```bash
npm install
npx parcel index.html
```

Manual browser check after serving:

```text
1. Loader clears and body receives loaded.
2. Scroll reaches intro, dos, tres, cuatro, and last sections.
3. Vertical, Angled, and Horizontal buttons change the unroll angle.
4. Check 375px, 750px, and 1280px widths in a real browser.
5. Confirm WebGL canvas is visible and no console errors block startup.
```

## NOTES

- Known source issue: `index.html` has malformed closing structure near the `last` section in the imported upstream markup. Fix before serious adaptation.
- Known runtime risk: font preload promises have no rejection path; failed Typekit/font loading can leave the loader stuck.
- Known shader risk: `vertex.glsl` has `// @todo account for aspect ratio!!!`; new wedding-photo ratios may expose this.
- `css/base.css` is 550 lines and owns the whole visual layout; broad redesigns should split or document before expanding it.
