# Customization Guide

Use this guide to turn the template into your own mobile wedding invitation.

도움이 됐다면 GitHub Star(즐겨찾기)만 눌러주세요.

## 1. Edit the Invitation Text

Open:

```text
mobile-wedding-unrolling-invitation/index.html
```

Change these sections first:

| Section | What to edit |
| --- | --- |
| `<title>` | browser tab title |
| `<meta name="description">` | preview/search description |
| `.header__title` | opening headline |
| `.header__note` | short opening message |
| `.intro__title` | date and time shown on the cover image |
| `#invitation` | invitation message |
| `#ceremony` | venue name, date, address |
| `#contact` | final guide, venue details, map link |

## 2. Replace the Couple and Detail Images

Replace the files in:

```text
mobile-wedding-unrolling-invitation/img/
```

Keep the filenames if you want the fastest edit path:

| File | Recommended content |
| --- | --- |
| `intro1.jpg` | soft opening image or paper-like background |
| `intro2.jpg` | main couple portrait |
| `dos1.jpg` | bouquet, rings, hands, or invitation detail |
| `dos2.jpg` | walking/together image |
| `tres1.jpg` | close couple portrait |
| `tres2.jpg` | venue or ceremony scene |
| `1.jpg` | memory grid image 1 |
| `2.jpg` | memory grid image 2 |
| `3.jpg` | memory grid image 3 |
| `4.jpg` | memory grid image 4 |
| `last.jpg` | final closing image |

If you rename images, update every matching `src="img/..."` in `index.html`.

## 3. Keep the WebGL Hooks

Do not remove these unless you are also editing the JavaScript:

```text
#container
main
.stage
[data-scroll]
.js-image
body.loading
body.loaded
```

The most important hook is:

```html
<img src="img/intro2.jpg" class="js-image" alt="...">
```

Images with `.js-image` become the unrolling WebGL meshes. Images without `.js-image` stay normal static images.

## 4. Update Alt Text

Every image should keep meaningful Korean or English `alt` text.

Good:

```html
alt="형인과 예영이 함께 서 있는 청첩장 표지 이미지"
```

Avoid:

```html
alt="image"
```

## 5. Change the Map Link

In the closing section, update the map button:

```html
<a class="button button--primary" href="YOUR_MAP_URL" target="_blank" rel="noopener">지도 열기</a>
```

Use the final venue link from Naver Map, Kakao Map, Google Maps, or the service your guests will use.

## 6. Adjust Color and Typography

Open:

```text
mobile-wedding-unrolling-invitation/css/base.css
```

Start with the variables near the top of the file:

```css
--color-bg
--color-text
--color-muted
--color-link
--color-paper
--color-veil
```

Keep edits restrained. The template is designed as a quiet, photo-led invitation, so small changes usually work better than a full visual rewrite.

## 7. Image Export Tips

Recommended source image preparation:

- JPG is fine for photos and sketch-like images.
- Around 1600px on the long edge is usually enough for mobile invitations.
- Avoid uploading original 8MB to 20MB camera files directly.
- Use vertical or portrait-friendly crops for the unrolling sections.
- Check the final deployed URL on a real phone after replacing images.

## 8. What Not to Change First

Avoid changing these until your content and images are already working:

- `js/rolls.js`
- `js/shader/vertex.glsl`
- `js/shader/fragment.glsl`
- `js/imagesLoaded.js`

These files control the WebGL effect. Edit them only if you want to change the core interaction.
