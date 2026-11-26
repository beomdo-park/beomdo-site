# 글쓰기 & 콘텐츠 관리 가이드 (Writing Workflow)

이 저장소는 **일반 Markdown 글**과 **Python 코드 실행·그래프 생성이 필요한 Quarto(`.qmd`) 실험 노트** 두 가지를 모두 원클릭으로 발행할 수 있게 구성되어 있습니다.

---

## 1. 일반 Markdown 글쓰기 (가장 빠름)

```bash
# 1) 새 글 + 이미지 폴더 자동 생성 (KST 오늘 날짜 자동 입력)
pnpm new:post qenvs-drag-pulse --title "QEnvS로 Transmon DRAG 펄스 최적화하기" --tags "QEnvS,JAX"

# 2) src/content/blog/qenvs-drag-pulse.md 작성 (이미지는 public/blog-assets/qenvs-drag-pulse/ 에 저장)
#    로컬 미리보기: pnpm dev

# 3) 이미지 누락 검사 + astro check + 커밋 + 푸시 → Cloudflare 자동 배포!
pnpm publish:post qenvs-drag-pulse
```

### 지원하는 Markdown 확장 문법
- **LaTeX 수식**: 인라인 `$H = \frac{\Omega}{2}\sigma_x$`, 블록 `$$ ... $$` (KaTeX 빌드타임 렌더링)
- **콜아웃 박스** (GitHub · Obsidian 표준 문법 그대로 지원):
  ```markdown
  > [!NOTE] 핵심 요약
  > `NOTE`, `TIP`, `WARNING`, `IMPORTANT`, `CAUTION` 모두 지원합니다.
  ```
- **자동 썸네일**: frontmatter에 `heroImage`를 지정하거나, 본문에 `/blog-assets/<slug>/...` 이미지를 넣으면 첫 번째 이미지가 블로그 목록 우측 썸네일로 자동 표시됩니다(`object-contain`).
- **시리즈 묶기**: frontmatter에 `series: "ROQET"`, `seriesOrder: 9`를 넣으면 시리즈 필터와 본문 상단 시리즈 목차가 자동 생성됩니다.
- **코드 블록**: Shiki 다크/라이트 자동 테마 + 우측 상단 원클릭 `Copy` 버튼 자동 생성.

---

## 2. Python 실행 & 그래프 생성이 필요한 실험 글 (Quarto 연동)

예전처럼 ` ```{python} ` 셀을 실행해서 출력과 `matplotlib` 그래프를 자동으로 넣고 싶을 때 사용합니다.

```bash
# 1) Quarto 초안 생성 (drafts/ 폴더는 .gitignore 처리되어 저장소를 어지럽히지 않음)
pnpm new:post stim-exp --title "Stim 신드롬 실험" --tags "QEC,Stim" --qmd

# 2) drafts/stim-exp/index.qmd 에 Python 셀, 수식, ::: {.callout-note} 작성

# 3) 로컬 Quarto로 실행·렌더링 → src/content/blog/stim-exp.md + public/blog-assets/stim-exp/ 로 자동 변환
pnpm qmd:publish drafts/stim-exp/index.qmd

# 4) 검증 + 커밋 + 푸시 → Cloudflare 자동 배포!
pnpm publish:post stim-exp
```

> 이미 렌더링된 HTML을 재사용하려면 `pnpm qmd:publish drafts/stim-exp/index.qmd --no-render` 옵션을 사용할 수 있습니다.

---

## 3. 논문 · 프로젝트 · 이력 업데이트

| 바꾸고 싶은 항목 | 수정 파일 |
| --- | --- |
| 논문·특허 추가 (DBpia 링크, BibTeX) | `src/data/publications.ts` |
| 프로젝트 추가/지표 수정 | `src/data/projects.ts` |
| 소개 문구, 학력, 경력, 수상, 스택 | `src/data/profile.ts` |
| 디자인 색상·타이포그래피 원칙 확인 | `DESIGN.md` |

수정 후 `pnpm check`로 확인하고 `git push origin main` 하면 약 1분 안에 라이브 사이트에 자동 반영됩니다.
