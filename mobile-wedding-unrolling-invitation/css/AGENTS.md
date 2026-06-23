# CSS KNOWLEDGE BASE

## OVERVIEW

`base.css` is the complete visual system for the imported demo: reset, loader, typography, overlapping sections, buttons, canvas layering, and all responsive behavior.

## WHERE TO LOOK

| Task | Selector / Area | Notes |
|------|-----------------|-------|
| Loader appearance | `.js .loading::before`, `.js .loading::after` | Paired with `body.loading` and `body.loaded` in `js/app.js`. |
| Canvas layering | `canvas` | Fixed overlay, `z-index: 100`, pointer-events disabled. |
| Animated source images | `.js-image`, `.loaded .js-image` | DOM images become invisible after the WebGL mesh takes over. |
| Header links | `.header`, `.info`, `.info__link` | Replace for invitation metadata or remove with markup changes. |
| Scene sections | `.intro`, `.dos`, `.tres`, `.cuatro`, `.last` | Each section has bespoke layout logic. |
| Angle controls | `.buttons`, `.button` | Styled controls tied to `.js-change` hooks in HTML. |
| Wide layout | `@media (min-width: 1480px)` | Centers sections at max width. |
| Mobile layout | `@media (max-width: 750px)` | Hand-tuned source adaptation path. |

## CONVENTIONS

- Plain CSS only; no preprocessor, utility framework, or token build pipeline exists here.
- CSS variables define base colors on `body`, not in a separate design-system file.
- Section classes are content-specific and BEM-ish; behavior classes stay in JS as `js-*`.
- Many layouts rely on absolute positioning, floats, negative margins, rotated metadata, and fixed viewport spacing.
- Breakpoint behavior is composition-specific, not a reusable grid.

## ANTI-PATTERNS

- Do not add broad invitation styling at the bottom without checking existing section-specific rules first.
- Do not remove `.loaded .js-image { opacity: 0; }` unless the WebGL replacement strategy changes.
- Do not animate layout properties for future polish; keep motion on transform, opacity, or shader uniforms.
- Do not use the `750px` mobile branch as proof of full mobile readiness; verify in a browser at phone widths.
- Do not expand `base.css` further for a large redesign without considering a split, because it is already 550 lines.

## MOBILE INVITATION NOTES

- The current mobile breakpoint hides some source imagery and flattens the intro/dos/tres composition.
- Wedding-photo replacement will change aspect ratios; inspect both DOM layout and canvas output.
- Button text is English demo text; replacing controls with invitation actions requires matching `js/app.js` behavior.
- If the future page becomes primarily vertical invitation content, preserve the scroll illusion deliberately or remove it with coordinated JS changes.

## VERIFICATION

After any CSS change, serve with Parcel and inspect at:

```text
375px phone width
750px breakpoint edge
1280px desktop width
```

Check text overlap, image crop, canvas alignment, loader visibility, and keyboard focus on buttons/links.
