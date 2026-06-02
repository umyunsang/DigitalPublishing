# WDC Busan Media Classification

Generated: 2026-05-21

This file records the current direct image wiring for the Codrops pages. No `sync-curated-media.mjs` build pipeline is used; images are written directly into each page asset folder.

## Source Pools

- Source folders: `references/media/review`, `references/media/reference-media`
- Raw usable files: 328
- Unique images after exact SHA-256 dedupe: 324
- Removed renamed exact duplicates: 4 files across 4 groups
- Tagged unique images: 154
- Red mood unique images: 52
- Orange/yellow person unique images: 112
- Untagged unique reference images: 170

## Removed Exact Duplicates

| Kept | Removed duplicate path |
| --- | --- |
| `references/media/review/social-wide-candidates-500-cleaner-20260521/images/021-ig-gamcheon-004830likes-cvh1ptkpxni.jpg` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/025-ig-gamcheon-004830likes-cvh1ptkpxni.jpg` |
| `references/media/review/social-wide-candidates-500-cleaner-20260521/images/069-ig-visitbusan-001576likes-cbpwp8ed73z.jpg` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/078-ig-visitbusan-001576likes-cbpwp8ed73z.jpg` |
| `references/media/review/social-wide-candidates-500-cleaner-20260521/images/110-ig-image-000951likes-cme0oyolyiu.jpg` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/128-ig-image-000951likes-cme0oyolyiu.jpg` |
| `references/media/review/social-wide-candidates-500-cleaner-20260521/images/149-ig-busancity-000600likes-b1resyongjz.jpg` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/174-ig-busancity-000600likes-b1resyongjz.jpg` |

## Page Wiring

| Page | Rule | Count | Notes |
| --- | --- | ---: | --- |
| `04-busan-syndrome` | red mood only | 5 | Replaces the fixed `flower-*.webp` bundle filenames. |
| `06-design-city` | red mood only | 12 | Replaces fixed `img/1.webp` through `img/12.webp` to match the four scene variations. |
| `05-mood-routes` | orange/yellow person photos only | 112 | Regenerated both 2D and WebGL galleries. |
| `03-why-wdc` | 49 unique image-backed short one-word keyword pairs | 49 | Restored to Codrops dual-wave geometry; visible labels are short one-word keywords and each image is unique. |
| `menu-shell` | deterministic random tagged images | 24 | Keeps fixed `media/1.webp` through `media/24.webp`. |
| `07-archive` | all unique usable images | 324 | Updates `artworks/manifest.json` and the embedded bundled media JSON. |

Full per-file source mapping: `site/_meta/media-selection-manifest.json`

## Dual-Wave Keywords

| Left Keyword | Right Keyword | Image | Source | WD14 top tags |
| --- | --- | --- | --- | --- |
| Capital | Title | `keyword-01-world-design-capital.webp` | `assets/logos/official/wdc-busan-2028-primary-rgb.png` | official_logo, wdc_busan_2028, typography, black_background, world_design_capital, busan |
| Open | Access | `keyword-02-inclusive-city.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/410-pin-광안리-감성-사진-002330followers-1041738957555721749.jpg` | outdoors, sign, tree, road, multiple_boys, road_sign |
| Civic | People | `keyword-03-citizen-led-design.webp` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/283-ig-cheongsapo-000108likes-cm06ta1l-1q.jpg` | motor_vehicle, 1girl, ground_vehicle, car, outdoors, road |
| Care | Route | `keyword-04-service-design.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/007-ig-청사포-014485likes-cbhnyeil6vq.jpg` | ground_vehicle, motor_vehicle, outdoors, real_world_location, car, road |
| Renew | Renewal | `keyword-05-urban-recovery.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/395-pin-감천문화마을-사진-003133followers-358880664052260628.jpg` | scenery, no_humans, building, real_world_location, outdoors, tree |
| Link | Network | `keyword-06-connectivity.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/140-ig-해운대블루라인파크-000639likes-ck2ttqklpvq.jpg` | no_humans, scenery, outdoors, ocean, tree, sky |
| Culture | Create | `keyword-07-design-culture.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/338-pin-busan-city-night-photography-021311followers-708120741437400647.jpg` | scenery, no_humans, sky, cityscape, outdoors, cloud |
| Coastal | Tide | `keyword-08-resilient-coast.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/234-ig-다대포-000132likes-dyurbwptbuk.jpg` | outdoors, solo, 1boy, beach, ocean, male_focus |
| Global | Water | `keyword-09-global-design-hub.webp` | `references/media/reference-media/images/img-0091-fa18a620c2-001-bridge-skyline-033543likes-0255comments-DNp2y0ORz5Q.jpg` | ground_vehicle, outdoors, scenery, cloud, sky, motor_vehicle |
| Life | Comfort | `keyword-10-quality-of-life.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/467-pin-busan-cafe-ocean-view-001079followers-55169164191045290.jpg` | no_humans, scenery, chair, outdoors, water, table |
| Pastel | Horizon | `keyword-11-pastel-sea.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/086-ig-다대포-001298likes-cjm7ufprpzz.jpg` | sky, scenery, cloud, outdoors, sunset, reflection |
| Line | Transit | `keyword-12-blue-line.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/001-ig-스카이캡슐-113690likes-cvcmntppvph.jpg` | 1girl, solo, sitting, long_hair, skirt, socks |
| Capsule | Slow | `keyword-13-sky-capsule.webp` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/161-ig-스카이캡슐-000646likes-dyqtvepj0si.jpg` | 1girl, skirt, solo, long_hair, ocean, photo_background |
| Rail | Rail | `keyword-14-cheongsapo-rhythm.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/195-ig-청사포-000352likes-cl-nk4-pera.jpg` | no_humans, scenery, outdoors, sky, tree, cloud |
| Glow | Bridge | `keyword-15-gwangalli-glow.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/085-ig-광안대교-001299likes-c2y4yfrvqgj.jpg` | scenery, night, no_humans, city_lights, reflection, city |
| Sunset | Light | `keyword-16-dadaepo-afterglow.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/157-ig-다대포-000563likes-clyjj3ap1ki.jpg` | sunset, ocean, multiple_girls, sun, silhouette, outdoors |
| Temple | Temple | `keyword-17-yonggungsa-cliff.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/147-ig-해동용궁사-000604likes-cdf8p6pjyqq.jpg` | 1girl, solo, ocean, outdoors, shoes, black_hair |
| Cliff | Village | `keyword-18-huinnyeoul-edge.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/105-ig-흰여울문화마을-000972likes-cejvplabg70.jpg` | 1girl, hat, outdoors, dress, solo, black_hair |
| Color | Palette | `keyword-19-gamcheon-palette.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/406-pin-감천문화마을-사진-002518followers-590745676133918561.jpg` | scenery, no_humans, tree, building, outdoors, bridge |
| Harbor | Port | `keyword-20-harbor-light.webp` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/175-ig-광안대교-000597likes-dbp1q5gi0fc.jpg` | scenery, no_humans, outdoors, city, cityscape, sky |
| Film | Cinema | `keyword-21-film-city.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/498-pin-busan-city-night-photography-000796followers-744360644664379377.jpg` | ground_vehicle, night, motor_vehicle, scenery, car, city |
| Cafe | Window | `keyword-22-ocean-cafe.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/417-pin-busan-cafe-ocean-view-002154followers-727753621021521857.jpg` | no_humans, scenery, chair, table, window, sky |
| Walk | Scale | `keyword-23-walking-city.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/500-pin-busan-city-night-photography-000796followers-744360644660677694.jpg` | motor_vehicle, car, road, ground_vehicle, lamppost, outdoors |
| Market | Taste | `keyword-24-local-market.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/397-pin-busan-korea-photography-002943followers-1266706140990472.jpg` | outdoors, scenery, tree, road, building, street |
| Food | Night | `keyword-25-night-food.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/349-pin-busan-port-night-view-014567followers-380976449745646786.jpg` | no_humans, scenery, night, cityscape, city_lights, outdoors |
| Kpop | Share | `keyword-26-k-culture-route.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/015-ig-gamcheon-006413likes-cytcxuwphx3.jpg` | scenery, cityscape, night, no_humans, city, outdoors |
| Saved | Archive | `keyword-27-saved-scene.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/304-ig-다대포노을-000055likes-cnptyglpntg.jpg` | no_humans, scenery, sky, outdoors, sunset, cloud |
| Revisit | Feeling | `keyword-28-revisit-loop.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/468-pin-haeundae-beach-busan-aesthetic-001021followers-604186106293720407.jpg` | night, beach, outdoors, scenery, sky, no_humans |
| After | Glow | `keyword-29-afterglow.webp` | `references/media/reference-media/images/img-0007-236e29d91f-mood-07-dadaepo-sunset-silhouette.jpg` | 1girl, solo, sunset, sun, ocean, outdoors |
| Return | Return | `keyword-30-return-desire.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/098-ig-광안리해수욕장-001130likes-dbjemhitxio.jpg` | 1girl, solo, black_hair, jacket, outdoors, dress |
| Memory | Mood | `keyword-31-memory-map.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/499-pin-청사포-감성-사진-000796followers-744360644663608293.jpg` | scenery, outdoors, no_humans, motor_vehicle, ground_vehicle, power_lines |
| Feed | Photo | `keyword-32-travel-feed.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/031-ig-해운대해수욕장-003424likes-c7a7r8ltohx.jpg` | scenery, real_world_location, outdoors, no_humans, building, photo_background |
| Look | Angle | `keyword-33-second-look.webp` | `references/media/review/social-wide-candidates-500-filtered-20260521/images/462-pin-감천문화마을-사진-001210followers-433401164113242141.jpg` | scenery, building, outdoors, house, stairs, balcony |
| Comfort | Stay | `keyword-34-comfort-city.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/205-ig-광안리-000261likes-dylb99tk1pn.jpg` | 1girl, solo, black_hair, long_hair, hat, outdoors |
| Blue | Breeze | `keyword-35-lingering-blue.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/027-ig-부산바다-003741likes-cfgzzvdpa5z.jpg` | 1girl, jewelry, earrings, outdoors, sky, closed_eyes |
| Replay | Echo | `keyword-36-scene-replay.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/462-pin-gwangan-bridge-night-busan-001097followers-289285976044195939.jpg` | no_humans, scenery, city, cityscape, sky, outdoors |
| Design | Dream | `keyword-37-design-busan.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/283-ig-부산야경-000071likes-dyead5-k1nb.jpg` | scenery, cityscape, city, 6+boys, outdoors, multiple_boys |
| Port | Change | `keyword-38-north-port-future.webp` | `references/media/reference-media/images/img-0128-28e96bb7ec-056-city-tourism-architecture-001254likes-0043comments-DV0lWT2CYxa.jpg` | no_humans, scenery, outdoors, building, day, sky |
| F1963 | Texture | `keyword-39-f1963-texture.webp` | `references/media/reference-media/images/img-0048-f56f2a8918-015-000914likes-0027comments-ko-mood-DQbc7nlkfA7.jpg` | scenery, no_humans, architecture, building, east_asian_architecture, outdoors |
| Village | Local | `keyword-40-bongsan-village.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/489-pin-감천문화마을-사진-000875followers-503277327085755562.jpg` | no_humans, scenery, outdoors, tree, sky, building |
| Public | Civic | `keyword-41-public-design.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/050-ig-흰여울문화마을-002105likes-cq-bgbthk6q.jpg` | scenery, no_humans, building, tree, outdoors, east_asian_architecture |
| Solid | Unity | `keyword-42-solidarity.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/194-ig-감천문화마을-000355likes-cjndxkpjeud.jpg` | 1boy, white_pants, jacket, solo, male_focus, black_hair |
| Coast | Future | `keyword-43-sustainable-coast.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/174-ig-해동용궁사-000515likes-chjjg9evpcd.jpg` | 1girl, dress, white_dress, ocean, solo, outdoors |
| Daily | Daily | `keyword-44-everyday-design.webp` | `references/media/reference-media/images/img-extra-20260521-extra-043-busan-007118likes-0063comments-ko-CllEKTYPhxs.jpg` | motor_vehicle, ground_vehicle, scenery, outdoors, car, road |
| Sea | Open | `keyword-45-open-sea.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/449-pin-해운대-스카이캡슐-사진-001308followers-841610249142454841.jpg` | no_humans, scenery, ocean, waves, outdoors, water |
| Route | Share | `keyword-46-photo-worthy-route.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/385-pin-gwangalli-beach-busan-photo-004634followers-7881368090544418.jpg` | outdoors, scenery, real_world_location, building, sky, day |
| Unseen | Reason | `keyword-47-unfinished-trip.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/233-ig-다대포노을-000135likes-dyhmb1okwvq.jpg` | 1girl, 1boy, black_hair, sitting, long_hair, outdoors |
| Syndrome | Desire | `keyword-48-busan-syndrome.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/052-ig-부산야경-002059likes-dljka2ct8fc.jpg` | outdoors, beach, scenery, sand, ocean, traditional_media |
| Echo | Return | `keyword-49-busan-echoes.webp` | `references/media/review/social-wide-candidates-500-cleaner-20260521/images/343-pin-gwangan-bridge-night-busan-018739followers-359795457747979517.jpg` | night, sky, scenery, night_sky, outdoors, no_humans |

## Horizontal People Feed

Uses all 112 unique orange/yellow-tagged person photos. See `media-selection-manifest.json` for the full list.

## Infinite Canvas

Uses all 324 unique remaining images from the reviewed/reference folders, including red mood, orange/yellow people, and untagged retained references.

## Quality Pass - 2026-05-21

- `06-design-city`: replaced the image set with higher-resolution red-tagged sources and mapped image numbers to the visible `Pastel Sea`, `Moving Sea`, `Sacred Coast`, and `Night Signal` scene variations from the content concept.
- `02-saved-scenes`: replaced `hero.webp` with the user-selected Gwangalli night bridge image.
- `04-busan-syndrome`: replaced all five `flower-*.webp` files with red-tagged saved-scene sources that were not in the previous scroll set, match the current scene labels, and do not overlap with the SVG mask source set.
- `03-why-wdc`: restored the Codrops dual-wave CSS geometry, converted visible labels to one-word keywords, and set the first image to the official WDC Busan 2028 logo.


Full updated source mapping remains in `site/_meta/media-selection-manifest.json`.
