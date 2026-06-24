# Digital Publishing

> 동아대-동서대 글로컬연합대학 Field 연합전공 | 디지털퍼블리싱 수업 및 퍼블리싱 프로젝트 저장소

## About

이 저장소는 **동서대학교 디지털미디어학부 디지털퍼블리싱 수업**에서 진행한 정적 HTML/CSS 실습과 퍼블리싱 프로젝트를 모아 둔 작업 공간입니다.

| 항목 | 내용 |
| --- | --- |
| 수강생 | 동아대학교 컴퓨터공학과 AI전공 |
| 개설학과 | 동서대학교 디지털미디어학부 |
| 연합전공 | 글로컬연합대학 Field 연합전공 |
| 수업명 | 디지털퍼블리싱 |

## Featured Publishing Projects

| Project | Description | Link |
| --- | --- | --- |
| Mobile Wedding Unrolling Invitation | Three.js/WebGL 기반 스크롤 인터랙션 모바일 청첩장 하위 프로젝트 | [`mobile-wedding-unrolling-invitation/`](mobile-wedding-unrolling-invitation/) |
| World Design Capital Busan 2028 Prototype | 부산 WDC 2028 콘셉트 퍼블리싱 프로토타입 | [wdc-busan.pages.dev](https://wdc-busan.pages.dev/) |

모바일 청첩장 템플릿을 사용하려면 아래 경로의 README를 먼저 보세요.

```text
mobile-wedding-unrolling-invitation/README.md
```

직접 공유 가능한 모바일 청첩장 데모 링크:

```text
https://ourseason.pages.dev/
```

도움이 됐다면 GitHub에서 Star(즐겨찾기)만 눌러주세요.

## Class Exercises

| File or folder | Description | Main practice |
| --- | --- | --- |
| `index.html` | 담소 한식 카페 메뉴판 | HTML 시맨틱 구조, CSS 텍스트 스타일링, 이미지 배치 |
| `figma.html` | Figma 디자인 기반 정적 페이지 | Figma export, absolute positioning, 뉴스 레이아웃 |
| `news.html` | 뉴스 기사 카드 레이아웃 | Flexbox, RGBA, shadow, radius |
| `radious.html` | border-radius 연습 | 다양한 border-radius 조합 |
| `float_layout.html` | Float 레이아웃 | float, clear |
| `layout_1200.html` | 1200px 고정폭 레이아웃 | fixed-width page layout |
| `div_layout.html` | div 레이아웃 구성 방식 | float, flex, inline-block |
| `govon.html` | GovOn 프로젝트 소개 페이지 | 카드 레이아웃, 외부 CSS, 웹폰트 |
| `9주차-*` | 9주차 UI 실습 묶음 | position, menu, toggle, popup, FAQ |

## Repository Structure

```text
DigitalPublishing/
├── README.md
├── index.html
├── figma.html
├── news.html
├── radious.html
├── float_layout.html
├── layout_1200.html
├── div_layout.html
├── govon.html
├── css/
├── images/
├── 9주차-*/
├── kosmos-light/
├── mobile-wedding-unrolling-invitation/
├── docs/
├── ai/
└── design-system/
```

## How to Run

Most class exercises are plain static HTML files and can be opened directly.

```bash
open index.html
```

The mobile wedding invitation is different because it uses Parcel, ES modules, and GLSL shader imports. Run it from its folder:

```bash
cd mobile-wedding-unrolling-invitation
npm install
npx parcel index.html
```

## AI Design Ops Documents

This repository also includes AI-assisted design workflow documents for static publishing work.

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Codex-compatible project instructions |
| `DESIGN.md` | Shared design system and visual rules |
| `docs/ai-design-lab/` | LLMOps-based static design methodology |
| `docs/templates/` | Design brief, layout spec, session log templates |
| `docs/rubrics/` | Static HTML/CSS design review rubrics |
| `ai/prompts/` | Reusable design prompts |
| `design-system/` | Token starter documents |

## License

This repository is primarily a course and portfolio workspace. Some subprojects use third-party demo mechanics or libraries and carry their own credit/license notes. For the mobile wedding invitation, see:

```text
docs/mobile-wedding-template/credits-license.md
```

---

<p align="center">
  <sub>동아대학교 x 동서대학교 글로컬연합대학 | 2026학년도 1학기</sub>
</p>
