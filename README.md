# Mobile Wedding Unrolling Invitation Template

Scroll-driven mobile wedding invitation template built with Three.js, WebGL, and a soft image-unrolling interaction.

도움이 됐다면 GitHub에서 Star(즐겨찾기)만 눌러주세요. 그걸로 충분합니다.

## Links

| Type | Link |
| --- | --- |
| Live demo | [ourseason.pages.dev](https://ourseason.pages.dev/) |
| GitHub repository | [github.com/umyunsang/DigitalPublishing](https://github.com/umyunsang/DigitalPublishing) |
| Template folder | [`mobile-wedding-unrolling-invitation/`](mobile-wedding-unrolling-invitation/) |
| Customization guide | [`docs/mobile-wedding-template/customization.md`](docs/mobile-wedding-template/customization.md) |
| Deployment guide | [`docs/mobile-wedding-template/deployment.md`](docs/mobile-wedding-template/deployment.md) |
| QA checklist | [`docs/mobile-wedding-template/qa-checklist.md`](docs/mobile-wedding-template/qa-checklist.md) |

## What This Is

This repository contains a reusable mobile wedding invitation template:

- scroll-linked WebGL image unroll transition
- Korean invitation copy layout
- mobile-first fixed stage composition
- replaceable couple photos and wedding details
- static hosting friendly build output
- no React, no backend, no account system

The invitation lives in:

```text
mobile-wedding-unrolling-invitation/
```

The current public demo is deployed at:

```text
https://ourseason.pages.dev/
```

## Quick Start

```bash
git clone https://github.com/umyunsang/DigitalPublishing.git
cd DigitalPublishing/mobile-wedding-unrolling-invitation
npm install
npx parcel index.html
```

Then open the local Parcel URL in a browser.

For a production build:

```bash
npx parcel build index.html --dist-dir dist --public-url ./
```

The generated files are written to:

```text
mobile-wedding-unrolling-invitation/dist/
```

## Customize Your Invitation

Most people only need to edit these files:

| File or folder | What to change |
| --- | --- |
| `mobile-wedding-unrolling-invitation/index.html` | Names, invitation copy, date, venue, map link, alt text |
| `mobile-wedding-unrolling-invitation/img/` | Replace sample images with your own wedding photos or sketches |
| `mobile-wedding-unrolling-invitation/css/base.css` | Colors, type scale, spacing, section placement |

Keep these hooks unless you also update the JavaScript:

```text
#container
main > .stage > [data-scroll]
.js-image
body.loading
body.loaded
```

The `.js-image` class marks images that become WebGL unrolling meshes. If you remove it, that image will render as a normal DOM image and will not use the scroll transaction.

For step-by-step editing, read:

```text
docs/mobile-wedding-template/customization.md
```

## Recommended Image Slots

| Slot | File | Suggested image |
| --- | --- | --- |
| Cover background | `img/intro1.jpg` | Quiet wide or vertical opening image |
| Cover unroll | `img/intro2.jpg` | Main couple portrait |
| Detail foreground | `img/dos1.jpg` | Bouquet, rings, venue detail |
| Invitation chapter | `img/dos2.jpg` | Walking or together image |
| Ceremony chapter | `img/tres1.jpg` | Couple close portrait |
| Venue image | `img/tres2.jpg` | Venue or ceremony mood image |
| Memory grid | `img/1.jpg` to `img/4.jpg` | Four supporting memories |
| Closing image | `img/last.jpg` | Final portrait or closing scene |

Use compressed JPG or WebP-like source exports when possible. Very large images can make mobile WebGL startup slow.

## Deploy

Cloudflare Pages settings:

| Setting | Value |
| --- | --- |
| Root directory | `mobile-wedding-unrolling-invitation` |
| Build command | `npx parcel build index.html --dist-dir dist --public-url ./` |
| Output directory | `dist` |

More deployment details:

```text
docs/mobile-wedding-template/deployment.md
```

## Browser Support

The template is intended for current mobile browsers with WebGL:

- iPhone Safari
- Android Chrome
- desktop Chrome/Safari/Edge for previewing

The live build has been checked on iPhone/WebKit profiles and Android Chrome profiles. Before sharing your own customized invitation, run the QA checklist:

```text
docs/mobile-wedding-template/qa-checklist.md
```

## Credit

This template adapts the interaction mechanics from:

- [akella/UnrollingImages](https://github.com/akella/UnrollingImages)
- [Codrops Unrolling Images article](https://tympanus.net/codrops/?p=46712)
- [Original demo](https://tympanus.net/Development/UnrollingImages/)

Please keep the original credit when you reuse the interaction.

License and reuse notes:

```text
docs/mobile-wedding-template/credits-license.md
```

## Star

If this helped you make an invitation, please just press Star(즐겨찾기) on the GitHub repository.

No sponsorship, no sign-up, no mailing list. Star is enough.

```text
https://github.com/umyunsang/DigitalPublishing
```

## Course Archive

This repository also contains older Digital Publishing class exercises and AI design-lab documents. The reusable wedding invitation template is the `mobile-wedding-unrolling-invitation/` folder.
