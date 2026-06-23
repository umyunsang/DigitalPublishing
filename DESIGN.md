# Digital Publishing Design System

## 1. Atmosphere & Identity

This course workspace should feel like a quiet design lab: practical, readable, and image-led, with enough editorial detail to support experimental static layouts. The signature for the wedding unrolling prototype is a soft ceremonial scroll, where tall monochrome images unfold through WebGL while the page keeps the restraint of a printed invitation.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/page | `--surface-page` | `#FBF4EA` | `#171512` | Main page background |
| Surface/paper | `--surface-paper` | `#FFF9F1` | `#211E1A` | Invitation text panels |
| Surface/veil | `--surface-veil` | `#F1E4D5` | `#2D2923` | Soft image and section backing |
| Text/primary | `--text-primary` | `#2F251F` | `#F8F7F3` | Main text |
| Text/muted | `--text-muted` | `#7E6B5B` | `#B9B0A3` | Secondary copy |
| Text/inverse | `--text-inverse` | `#FFFFFF` | `#171512` | Overlay text |
| Accent/primary | `--accent-primary` | `#6F5137` | `#8EBB9C` | Main interactive accent |
| Accent/gold | `--accent-gold` | `#A9682A` | `#D6AE64` | Ceremonial highlight |
| Accent/rose | `--accent-rose` | `#B06A5B` | `#D59B90` | Warm detail accent |
| Border/subtle | `--border-subtle` | `#E2D3C0` | `#3A352E` | Hairlines and dividers |
| Border/strong | `--border-strong` | `#A88A68` | `#726A5E` | Active controls |

### Rules

- Page backgrounds use `--surface-page` and `--surface-veil`; text panels use `--surface-paper`.
- Wedding highlights use `--accent-gold` sparingly for dates, separators, and active unroll controls.
- Interactive focus and primary links use `--accent-primary`.
- New colors must be added here before they appear in CSS.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `108px` | 600 | 0.92 | 0 | Main invitation names |
| H1 | `60px` | 600 | 1.05 | 0 | Main emotional headline |
| H2 | `48px` | 600 | 1.15 | 0 | Feature headings |
| Date/lg | `34px` | 500 | 1.18 | 0 | Hero date and time |
| H3 | `24px` | 600 | 1.3 | 0 | Card or caption title |
| Body/lg | `18px` | 400 | 1.8 | 0 | Invitation copy |
| Body | `16px` | 400 | 1.7 | 0 | Default text |
| Body/sm | `14px` | 400 | 1.6 | 0 | Metadata |
| Caption | `12px` | 500 | 1.4 | 0 | Labels and controls |

### Font Stack

- Primary: `serif`
- UI: `serif`
- Mono: `serif`

### Rules

- Use the generic `serif` family across invitation names, narrative copy, controls, metadata, and links so Korean text resolves through the operating system's serif font mapping.
- Body text never drops below `14px`.
- Do not scale type by viewport width inside the invitation; the `900px x 1440px` stage scales as a whole.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a base of `4px`.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Hairline offsets |
| `--space-2` | `8px` | Tight inline groups |
| `--space-3` | `12px` | Small control padding |
| `--space-4` | `16px` | Standard content padding |
| `--space-5` | `20px` | Mobile section gutters |
| `--space-6` | `24px` | Text block rhythm |
| `--space-8` | `32px` | Image-to-caption spacing |
| `--space-10` | `40px` | Section interior rhythm |
| `--space-12` | `48px` | Major text breaks |
| `--space-16` | `64px` | Mobile chapter spacing |
| `--space-20` | `80px` | Desktop chapter spacing |
| `--space-24` | `96px` | Maximum editorial break |

### Grid

- Virtual viewport: `900px x 1440px`
- Stage scaling: the `900px x 1440px` composition scales as a single centered canvas across mobile, tablet, and desktop screens.
- Max content width: `820px` inside the virtual viewport.
- Column system: preserve the same asymmetric invitation composition at every screen size.
- Breakpoints: none for the wedding unrolling invitation; do not reflow the composition by device width.

### Rules

- Use full-bleed sections only when the WebGL image needs room to unroll.
- Keep the virtual viewport composition intact instead of switching to a separate mobile layout.
- Preserve fixed-format image containers with explicit aspect ratios.

## 5. Components

### Invitation Header

- **Structure**: top-aligned title with a short host line that names the couple and frames the invitation.
- **Variants**: overlay on desktop, inline on mobile.
- **Spacing**: `--space-4`, `--space-6`, `--space-8`.
- **States**: links include hover and focus-visible states.
- **Accessibility**: meaningful link text and visible focus.
- **Motion**: no independent animation; follows page scroll.

### Unrolling Image Chapter

- **Structure**: semantic section, DOM image fallback, WebGL overlay target through `.js-image`.
- **Variants**: hero overlap, asymmetric chapter, four-photo memory grid, final single-photo reveal.
- **Spacing**: `--space-10` through `--space-24`.
- **States**: WebGL unroll on viewport entry with one fixed angled variation.
- **Accessibility**: all DOM images need meaningful `alt` text because they are the fallback.
- **Motion**: transform-based WebGL unroll; reduced motion disables smooth scroll and restores visible DOM images.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | `120ms` | `ease-out` | Link and button feedback |
| Standard | `240ms` | `ease-in-out` | Button state transitions |
| Emphasis | `1700ms` | `power2.out` | WebGL image unroll |
| Scroll-driven | tied to scroll | linear interpolation | Smooth scroll and image positioning |

### Rules

- Animate `transform`, `opacity`, and shader uniforms only.
- Avoid layout animation.
- Respect `prefers-reduced-motion` by removing smooth-scroll transforms and showing fallback images.
- Interactive controls must have hover, active, and focus-visible states.

## 7. Depth & Surface

### Strategy

Use a mixed editorial strategy: tonal surface shifts for page sections, hairline borders for controls, and no decorative card shadows in the prototype.

| Level | Value | Usage |
|-------|-------|-------|
| Hairline | `1px solid var(--border-subtle)` | Button and divider edges |
| Strong line | `1px solid var(--border-strong)` | Active controls |
| Tonal surface | `var(--surface-veil)` | Soft backing behind image chapters |
