---
version: 1.0
name: beomdo-park-research-portal
inspired_by:
  - getdesign.md / Vercel (monochrome precision, hairline geometry, Geist/mono discipline)
  - Shikun Liu Clarity & Minimal Academic Homepages (ruthless portfolio/blog separation)
  - CJK Web Typography (Pretendard Variable + word-break keep-all)
description: >
  Monochrome-first academic researcher portal and engineering blog for Beomdo Park
  (Quantum Control, QEC, Scientific ML). Built on stark ink-on-paper clarity (#171717 on #FFFFFF
  in light mode; #EDEDED on #0A0A0A in dark mode), hairline borders (#EBEBEB / #242424),
  surgical link blue (#0070F3 / #3291FF), and strict visual separation between the academic
  portfolio (Home / Publications / Projects / CV) and the technical blog.

colors:
  light:
    canvas: "#ffffff"
    canvas-soft: "#fafafa"
    canvas-subtle: "#f5f5f5"
    ink: "#171717"
    body: "#4d4d4d"
    muted: "#666666"
    hairline: "#ebebeb"
    hairline-strong: "#d4d4d4"
    link: "#0070f3"
    link-soft: "rgba(0, 112, 243, 0.08)"
    positive: "#0d7a5f"
    warning: "#b45309"
    negative: "#d92d20"
    accent-secondary: "#5b4fe9"
  dark:
    canvas: "#0a0a0a"
    canvas-soft: "#111111"
    canvas-subtle: "#171717"
    ink: "#ededed"
    body: "#a1a1a1"
    muted: "#737373"
    hairline: "#242424"
    hairline-strong: "#363636"
    link: "#3291ff"
    link-soft: "rgba(50, 145, 255, 0.14)"
    positive: "#34d399"
    warning: "#f5a623"
    negative: "#ff5c5c"
    accent-secondary: "#818cf8"

typography:
  sans: '"Pretendard Variable", "Pretendard", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  mono: '"JetBrains Mono", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
  cjk:
    wordBreak: keep-all
    overflowWrap: break-word
  scale:
    display-lg: { size: "36px", weight: 700, lineHeight: "1.18", tracking: "-0.03em" }
    heading-1: { size: "28px", weight: 700, lineHeight: "1.25", tracking: "-0.025em" }
    heading-2: { size: "18px", weight: 600, lineHeight: "1.35", tracking: "-0.015em" }
    body-md: { size: "15.5px", weight: 400, lineHeight: "1.78", tracking: "-0.005em" }
    body-sm: { size: "14px", weight: 400, lineHeight: "1.68", tracking: "0" }
    caption-mono: { size: "12px", weight: 400, lineHeight: "1.5", tracking: "0" }

spacing:
  grid: 8px
  container-max: 896px # max-w-4xl editorial spine
  prose-max: 70ch
  section-gap: 56px
  header-height: 60px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px
---

# DESIGN.md — Beomdo Park Researcher Portal & Engineering Blog

이 문서는 본 사이트의 **단일 디자인 기준(Single Source of Truth)**입니다. 새로운 페이지·컴포넌트·포스트 레이아웃을 추가할 때 반드시 아래 원칙을 따릅니다.

## 1. Visual Philosophy (시각 철학)
- **Monochrome-First Precision (Vercel-inspired)**: 기본 화면은 순백(`#FFFFFF`) 위의 진한 잉크(`#171717`)와 `1px` 헤어라인(`#EBEBEB`)만으로 위계를 만듭니다. 장식용 그라디언트, 블러 배경, 무거운 드롭 섀도를 쓰지 않습니다.
- **Surgical Accent**: 포인트 컬러(`#0070F3` / 다크 `#3291FF`)는 클릭 가능한 링크, DBpia/학술 태그, 인터랙티브 차트 데이터 시리즈에만 절제해 사용합니다.
- **Light Default + Obsidian Dark**: 학술 논문·CV·긴 한국어 기술 글을 읽기 편하도록 깨끗한 라이트 모드를 기본으로 두고, 우측 상단 토글로 `#0A0A0A` 다크 모드를 제공합니다.

## 2. Information Architecture (포트폴리오 vs 블로그 명확 분리)
상단 네비게이션은 **5개 비겹침 메뉴**로 고정합니다.
1. **소개 / Home (`/`, `/en/`)**: 연구자 정체성, 연구 분야 3축, 대표 논문 6편, 대표 프로젝트 2건 요약. 하단에 시각적으로 분리된 `canvas-soft` 인셋 박스로만 블로그 최근 글을 연결합니다.
2. **논문 / Publications (`/publications`, `/en/publications`)**: 논문 20편 + 등록특허 1건 아카이브. 국내 학회(IEIE/KICS) 전 편은 `[DBpia]` 링크를, 국제 논문은 원문/아티팩트 링크와 `[BibTeX]` 복사를 인라인 필로 제공합니다.
3. **프로젝트 / Projects (`/projects`, `/en/projects`)**: 직접 설계·구현한 시스템 케이스 스터디. `QEnvS`·`ROQET` 인터랙티브 탐색기는 별도 메뉴로 쪼개지 않고 각 프로젝트 상세 페이지 내부에 배치합니다.
4. **블로그 / Blog (`/blog`, `/en/blog`)**: 포트폴리오와 독립된 읽기 중심 기술 블로그(시리즈 필터, KaTeX 수식, 실행 출력·플롯, 목차).
5. **이력 / CV (`/cv`, `/en/cv`)**: 학력·경력·수상·자격·기술 스택 중심의 인쇄 친화적 이력서. 푸터에는 Cloudflare D1 기반 새로고침 중복 제외 일일 방문자 수(`Today · Total`)만 미니멀하게 표시합니다.

## 3. Bilingual Rule (`KO` 기본 + `EN` 미러)
- 한국어(`/`)가 기본이며, 영어(`/en/`)는 동일 구조의 미러 경로를 제공합니다.
- 헤더 우측 `KO | EN` 세그먼트 토글은 항상 현재 보고 있는 페이지의 대응 언어 경로로 이동합니다.
- **CJK 타이포그래피 필수 규칙**: 한국어 본문과 제목에는 반드시 `word-break: keep-all; overflow-wrap: break-word;`를 적용해 한글 단어가 어절 중간에서 끊기지 않게 합니다.

## 4. Component & Layout Rules
- **Hero Framing**: 홈 프로필 헤더는 `rounded-2xl` 1px 보더 패널 위에 방사형으로 사라지는 미세 도트 그리드(`.hero-ambient-grid`)와 우측 상단 미니멀 Bloch/Rabi 1px SVG 모티프만 절제해 사용합니다.
- **Hairline Lists & Studio Surfaces**: 논문(2컬럼 정렬: 좌측 학회·연도 / 우측 제목·저자·인라인 필), 경력, 수상, 블로그 목록은 `1px solid var(--border-hairline)` 수평 구분선으로 정리하며, 3열 연구 분야와 2열 대표 프로젝트에만 1px 미세 호버(`.surface-card`)를 적용합니다.
- **Navigation Pills**: 헤더 활성 메뉴와 `KO | EN` 토글은 `rounded-full` 소프트 필(`#F4F4F5` / 다크 `#1C1C20`) + 진한 잉크 텍스트로 표시합니다.
- **Inline Artifact Pills**: 논문·프로젝트의 외부 링크(`[DBpia ↗]`, `[IEEE T-QE ↗]`, `[BibTeX 복사]`)는 `font-mono 10–11px`, `rounded` 1px 보더 필로 통일합니다.
- **Blog Reading Micro-Interactions**: 글 본문 상단 `2px` 읽기 진행 바(`#reading-progress`), 모든 코드 블록 우측 상단 원클릭 복사 버튼(`Copy` → `Copied`), 데스크톱 우측 목차(`TOC`) 현재 섹션 자동 하이라이트를 제공합니다.
- **Interactive Telemetry**: QEnvS·ROQET 탐색기 내부 차트만 `lab-grid-bg` 도트 그리드와 수치 데이터 컬러(`link`, `positive`, `warning`, `negative`)를 허용합니다.

## 5. Do's & Don'ts
- **Do**: `tabular-nums`를 연도·지표·지연시간·수치 테이블에 항상 적용한다.
- **Do**: 본문 행 길이를 `68ch–72ch` 이내로 유지한다.
- **Don't**: 홈 히어로에 거대한 대시보드나 장식용 숫자를 과다 배치하지 않는다.
- **Don't**: 모든 제목 위에 의미 없는 영문 ALL-CAPS 아이브로우(eyebrow)나 가짜 `01 / 02 / 03` 번호를 붙이지 않는다.
- **Don't**: Tailwind 기본 `shadow-lg` 카드를 남발하지 않는다.
