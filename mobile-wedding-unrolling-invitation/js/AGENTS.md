# JS KNOWLEDGE BASE

## OVERVIEW

The `js/` folder is the runtime behavior layer: preload, smooth scrolling, IntersectionObserver state, GSAP uniform animation, Three.js scene creation, and vendored image loading.

## STRUCTURE

```text
js/
├── app.js           # side-effect entry module
├── rolls.js         # default Sketch class, Three.js mesh/renderer owner
├── imagesLoaded.js  # minified vendored helper
└── shader/          # GLSL imported by rolls.js
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Startup sequence | `app.js` | `Promise.all(preloadEverything)` removes loader and starts `SmoothScroll`. |
| Scroll behavior | `app.js` | `SmoothScroll` fixes `<main>` and translates `div[data-scroll]`. |
| Animated image state | `app.js` | `Item` measures DOM images, creates meshes, and drives GSAP progress. |
| Angle buttons | `app.js` | `.js-change` reads `data-angle` and rewrites scene mesh uniforms. |
| Three.js scene setup | `rolls.js` | `Sketch` creates renderer, camera, shader material, and mesh geometry. |
| Texture cover math | `rolls.js` | `createMesh()` computes `resolution.zw` for shader UV cover. |
| Image preload library | `imagesLoaded.js` | Vendored UMD helper; replace through dependency upgrade, not hand edits. |

## CONVENTIONS

- `app.js` exports nothing; it runs by being loaded from `index.html`.
- `rolls.js` exports one default class, imported as `Scene` in `app.js`.
- DOM contracts are implicit: `#container`, `main`, `div[data-scroll]`, `.js-image`, `.js-change`, and `data-angle`.
- Runtime state is mutable and instance-local; this is demo code, not a typed data model.
- GSAP writes `mesh.material.uniforms.progress.value`; Three.js render reads current uniforms.

## ANTI-PATTERNS

- Do not add non-mesh children to `scene.scene` unless angle-button iteration is guarded first.
- Do not add animated invitation images without `.js-image`; they will not become WebGL meshes.
- Do not change the markup nesting around `main > div[data-scroll]` without updating `SmoothScroll`.
- Do not move `#container`; `Sketch` appends the renderer there during construction.
- Do not remove `body.loading` / `body.loaded`; CSS and startup depend on those states.
- Do not rely on `this.src` in `Item`; it is currently passed but never assigned.

## RISK MAP

- `app.js`: font preload has no `.catch()`, so external font failure can freeze the loader.
- `app.js`: body height is copied from `scrollable.scrollHeight`; dynamic content needs explicit resize/update handling.
- `app.js`: `IntersectionObserver` is a hard dependency for mesh visibility and roll/unroll triggers.
- `rolls.js`: uses older Three.js APIs such as `PlaneBufferGeometry` and `renderer.outputEncoding`.
- `rolls.js`: camera depth and FOV math are tuned for the original image scale.

## VERIFICATION

Run through Parcel, then inspect in a real browser:

```bash
npx parcel index.html
```

Check loader removal, scroll animation, all `.js-change` buttons, mobile width, and console errors. Do not call this verified from static file opening.
