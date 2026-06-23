# SHADER KNOWLEDGE BASE

## OVERVIEW

This folder contains the WebGL unroll deformation imported by `../rolls.js`. The shaders are small but central: changing photo ratios or the unroll direction can require both GLSL and JavaScript uniform updates.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Roll geometry | `vertex.glsl` | Rotates, coils, and unrolls plane vertices based on `progress` and `angle`. |
| Texture sampling | `fragment.glsl` | Applies `resolution.zw` UV cover math and front shadow opacity. |
| Uniform definitions | `../rolls.js` | ShaderMaterial declares `time`, `progress`, `angle`, `texture1`, `texture2`, `resolution`, `uvRate1`. |
| Uniform animation | `../app.js` | GSAP animates `mesh.material.uniforms.progress.value`; angle buttons update `settings.angle`. |

## CONVENTIONS

- Shader files are imported directly from JavaScript; Parcel must process `.glsl`.
- `progress` is the main animation scalar, normally `0` to `1`.
- `angle` is radians. UI buttons provide degrees in HTML and convert in `app.js`.
- `resolution.zw` comes from image-cover math in `Sketch.createMesh()`.
- Fragment opacity is tied to `progress`; invisible source images are replaced visually by canvas meshes.

## ANTI-PATTERNS

- Do not change uniform names without updating `rolls.js` material setup and `app.js` animation writes.
- Do not tune aspect-ratio behavior only in CSS; shader UV cover and vertex deformation may still distort.
- Do not move shader files unless `../rolls.js` imports are updated and Parcel preview is rerun.
- Do not treat the `@todo account for aspect ratio!!!` in `vertex.glsl` as cosmetic; wedding-photo crops may expose it.

## NOTES

- `vertex.glsl` currently contains the only explicit source TODO in the template.
- The deformation math assumes the original demo scale and composition. Portrait-heavy invitation imagery should be tested at mobile widths before content work expands.
- Keep browser QA focused on real canvas pixels, not only DOM image placement, because `.loaded .js-image` hides source images.
