# QA Checklist

Run this before sharing your invitation link.

도움이 됐다면 GitHub Star(즐겨찾기)만 눌러주세요.

## Phone QA

Test the deployed URL, not only the local development server.

| Device or browser | Required |
| --- | --- |
| iPhone Safari | yes |
| Android Chrome | yes |
| desktop Chrome or Safari | helpful preview |

## Visual Checks

Open the final URL and confirm:

- the loader disappears
- the first cover image is rendered as a folded/unrolling WebGL image
- the visible image is not a flat static fallback
- scrolling moves the invitation smoothly
- unrolling images appear in later sections
- Korean text is readable and not clipped
- no horizontal scrolling appears on phone width
- the closing section is reachable
- the map button opens the intended map URL

## Interaction Checks

Scroll slowly and quickly.

Expected:

- page responds to normal finger scroll
- image transaction follows scroll position
- no section gets stuck blank
- no white canvas covers the page
- no sudden jump back to the top
- no frozen loader

## Content Checks

Confirm final guest-facing details:

- couple names
- headline
- invitation message
- date
- time
- venue name
- venue address
- map link
- image alt text
- page title
- meta description

## Android Chrome Checks

Expected runtime state:

- WebGL canvas is visible
- DOM `.js-image` sources are hidden after load
- scroll changes the transformed `[data-scroll]` layer
- no browser console errors

If Android shows a static image:

1. Refresh the URL.
2. Open with a cache-busting query string, for example `?v=latest`.
3. Confirm the phone is not loading an old deployment.
4. Check whether WebGL is disabled in the browser.

## iPhone Safari Checks

Expected runtime state:

- WebGL canvas is visible
- scroll interaction still works when Reduce Motion is enabled
- no permanent static fallback replaces the interaction

If iPhone shows a static image:

1. Refresh Safari.
2. Reopen the link with a cache-busting query string.
3. Close and reopen the tab.
4. Check the deployed bundle hash changed after your latest build.

## Developer Smoke Test

Use this after changing code or images:

```bash
cd mobile-wedding-unrolling-invitation
npm install
npx parcel build index.html --dist-dir dist --public-url ./
```

Then serve the build locally:

```bash
cd dist
python3 -m http.server 5198 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5198/
```

Check at these viewport widths:

```text
360 x 780
390 x 844
412 x 915
768 x 1024
1280 x 900
```

## Pass Criteria

The invitation is ready to share when:

- both iPhone Safari and Android Chrome show the scroll transaction
- no final content is placeholder text
- all images load
- venue/map link is correct
- build exits successfully
- deployed URL, not just localhost, passes the checks
