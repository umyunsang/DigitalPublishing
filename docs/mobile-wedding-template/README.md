# Mobile Wedding Template Docs

이 문서는 `mobile-wedding-unrolling-invitation/` 템플릿을 다른 사람이 자신의 모바일 청첩장으로 바꿔 쓸 수 있게 정리한 가이드입니다.

도움이 됐다면 GitHub Star(즐겨찾기)만 눌러주세요.

## Start Here

| Document | Use it when |
| --- | --- |
| [`customization.md`](customization.md) | 이름, 날짜, 장소, 사진, 문구를 바꿀 때 |
| [`deployment.md`](deployment.md) | Cloudflare Pages, Netlify, GitHub Pages 등에 올릴 때 |
| [`qa-checklist.md`](qa-checklist.md) | 공유 전에 iPhone/Android에서 최종 확인할 때 |
| [`credits-license.md`](credits-license.md) | 원본 출처, 사용 가능 범위, 크레딧을 확인할 때 |

## Template Links

- Live demo: [https://ourseason.pages.dev/](https://ourseason.pages.dev/)
- GitHub repository: [https://github.com/umyunsang/DigitalPublishing](https://github.com/umyunsang/DigitalPublishing)
- Template folder: [`../../mobile-wedding-unrolling-invitation/`](../../mobile-wedding-unrolling-invitation/)

## One-Minute Summary

1. Copy or fork the repository.
2. Open `mobile-wedding-unrolling-invitation/index.html`.
3. Replace the couple names, invitation copy, date, venue, and map link.
4. Replace the files in `mobile-wedding-unrolling-invitation/img/`.
5. Run `npm install` and `npx parcel index.html`.
6. Build with `npx parcel build index.html --dist-dir dist --public-url ./`.
7. Deploy the `dist/` folder.
8. Test the final URL on iPhone Safari and Android Chrome.
