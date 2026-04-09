# Digital Publishing

> 동아대-동서대 글로컬연합대학 Field 연합전공 | 디지털퍼블리싱 수업 실습 저장소

<br>

## About

**동아대학교-동서대학교 글로컬연합대학**은 교육부 글로컬대학30 사업에 선정된 연합 모델로,  
두 대학 간 Field 연합전공을 통해 현장 실무 중심의 교육을 제공합니다.

본 저장소는 **동서대학교 디지털미디어학부**에서 개설한 **디지털퍼블리싱** 수업의 실습 결과물을 담고 있습니다.

|  |  |
|---|---|
| **수강생** | 동아대학교 컴퓨터공학과 AI전공 |
| **개설학과** | 동서대학교 디지털미디어학부 |
| **연합전공** | 글로컬연합대학 Field 연합전공 (문화콘텐츠 분야) |
| **수업명** | 디지털퍼블리싱 |

<br>

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white"/>
</p>

<br>

## Contents

| 파일 | 설명 | 주요 학습 내용 |
|------|------|--------------|
| `index.html` | 담소 한식 카페 메뉴판 | HTML 시맨틱 구조, CSS 텍스트 스타일링, 이미지 배치 |
| `figma.html` | Figma 디자인 → 코드 변환 | Figma export, absolute 포지셔닝, 뉴스 레이아웃 |
| `news.html` | 뉴스 기사 카드 레이아웃 | Flexbox, RGBA 색상, box-shadow, border-radius |
| `radious.html` | border-radius 연습 | 다양한 border-radius 값 조합, 도형 만들기 |
| `float_layout.html` | Float 레이아웃 | float, clear 속성 이해 |
| `layout_1200.html` | 1200px 고정폭 레이아웃 | 고정폭 페이지 설계, background-image 활용 |
| `div_layout.html` | div 레이아웃 구성방법 4가지 | float, flex+overflow, flex:1, inline-block |
| `govon.html` | GovOn 프로젝트 소개 페이지 | 3-카드 레이아웃, 외부 CSS 분리, 웹폰트 |

<br>

## Structure

```
DigitalPublishing/
├── index.html              # 메인: 한식 카페 메뉴판
├── figma.html              # Figma → 코드 변환
├── news.html               # 뉴스 카드 레이아웃
├── radious.html            # border-radius 연습
├── float_layout.html       # Float 레이아웃
├── layout_1200.html        # 1200px 고정폭 레이아웃
├── div_layout.html         # div 레이아웃 4가지 방식
├── govon.html              # GovOn 프로젝트 소개
├── css/
│   ├── style.css           # 메뉴판 스타일
│   ├── news.css            # 뉴스 카드 스타일
│   ├── radious.css         # border-radius 스타일
│   └── govon.css           # GovOn 페이지 스타일
└── images/
    ├── *.jpg               # 한식 메뉴 이미지
    ├── bts/                # BTS 레이아웃 이미지
    └── govon/              # GovOn 프로젝트 이미지
```

<br>

## How to Run

빌드 도구 없이 HTML 파일을 브라우저에서 직접 열어 확인할 수 있습니다.

```bash
# macOS
open index.html

# 또는 Live Server (VS Code) 사용
```

<br>

## License

이 저장소는 수업 실습 목적으로 제작되었습니다.

---

<p align="center">
  <sub>동아대학교 x 동서대학교 글로컬연합대학 | 2026학년도 1학기</sub>
</p>
