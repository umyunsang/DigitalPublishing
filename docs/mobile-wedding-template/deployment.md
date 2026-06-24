# Deployment Guide

This template is a static site after build. You can deploy it to Cloudflare Pages, Netlify, GitHub Pages, Vercel static output, or any static host.

도움이 됐다면 GitHub Star(즐겨찾기)만 눌러주세요.

## Production Build

Run from the template folder:

```bash
cd mobile-wedding-unrolling-invitation
npm install
npx parcel build index.html --dist-dir dist --public-url ./
```

The deployable output is:

```text
mobile-wedding-unrolling-invitation/dist/
```

## Cloudflare Pages

Recommended settings:

| Setting | Value |
| --- | --- |
| Project root | `mobile-wedding-unrolling-invitation` |
| Build command | `npx parcel build index.html --dist-dir dist --public-url ./` |
| Build output directory | `dist` |
| Node version | current LTS or newer |

After deployment, open the production URL on a phone and run the QA checklist.

## Netlify

Recommended settings:

| Setting | Value |
| --- | --- |
| Base directory | `mobile-wedding-unrolling-invitation` |
| Build command | `npx parcel build index.html --dist-dir dist --public-url ./` |
| Publish directory | `mobile-wedding-unrolling-invitation/dist` |

If Netlify asks for the publish directory relative to the base directory, use:

```text
dist
```

## GitHub Pages

GitHub Pages can host the generated `dist/` output, but the cleanest workflow is to build locally or in Actions and publish only the build output.

Manual path:

1. Build with Parcel.
2. Copy or publish the contents of `mobile-wedding-unrolling-invitation/dist/`.
3. Make sure the final URL loads `index.html` and the hashed CSS/JS assets.

## Custom Domain

For an invitation, a short custom domain or subdomain is easier to share.

Examples:

```text
our-season.example.com
wedding.example.com
```

After connecting a custom domain:

- wait for DNS propagation
- test on mobile data and Wi-Fi
- share the HTTPS URL only

## Cache Notes

Parcel emits hashed asset names, so updated CSS/JS files get new URLs after each build.

If a phone still shows an old version:

1. Open the URL with a cache-busting query string, for example `?v=2026-06-24`.
2. Refresh the browser tab.
3. If needed, clear the browser cache for the site.

## Pre-Share Checklist

Before sending the invitation link:

- production URL opens without a local dev server
- first folded image appears after loading
- scroll interaction works on iPhone Safari
- scroll interaction works on Android Chrome
- map link opens the right venue
- names, date, time, and address are final
- no sample text remains
- no uncompressed original camera files are shipped
