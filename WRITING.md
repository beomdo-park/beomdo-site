# 글쓰기 & 발행 가이드 (Writing Workflow)

이 블로그는 **일반 Markdown 글**과 **Python 코드 실행이 필요한 Quarto(`.qmd`) 실험 노트** 두 가지 방식을 모두 지원합니다.

---

## 방식 1: 일반 Markdown 글 (가장 빠름)

### 1) 새 글 스캐폴딩
```bash
pnpm new:post my-topic --title "글 제목" --tags "QEC,JAX" --series "ROQET"
```
- `src/content/blog/my-topic.md` (오늘 KST 날짜·frontmatter 포함)와 `public/blog-assets/my-topic/` 폴더가 자동 생성됩니다.

### 2) 지원 문법
- **LaTeX 수식**: `$E = mc^2$`, `$$ ... $$` (KaTeX 빌드타임 렌더링)
- **콜아웃 박스** (GitHub / Obsidian 표준 문법 그대로 지원):
  ```markdown
  > [!NOTE] 제목
  > 참고할 내용을 적습니다. (`NOTE`, `TIP`, `WARNING`, `IMPORTANT`, `CAUTION` 지원)
  ```
- **이미지 & 자동 썸네일**: `public/blog-assets/<slug>/fig1.png`에 넣고 `![설명](/blog-assets/<slug>/fig1.png)`로 삽입하면 블로그 목록 우측 썸네일로도 자동 표시됩니다.
- **코드 블록**: Shiki 다크/라이트 자동 테마 + 우측 상단 원클릭 `Copy` 버튼 자동 생성.

### 3) 발행 (자동 배포!)
```bash
git add . && git commit -m "post: my-topic" && git push
```
→ `main` 푸시 후 약 1분 안에 Cloudflare Workers가 자동 빌드·배포합니다.

---

## 방식 2: Python 실행 & 그래프 생성이 필요한 글 (Quarto 연동)

Astro 자체는 Python을 실행하지 않지만, 로컬에 설치된 **Quarto**로 실행·렌더링한 뒤 Astro 블로그로 원클릭 변환하는 파이프라인이 내장되어 있습니다.

```bash
# 1) Quarto 초안 생성 (drafts/ 폴더는 .gitignore 처리됨)
pnpm new:post stim-exp --title "Stim 신드롬 실험" --tags "QEC,Stim" --qmd

# 2) drafts/stim-exp/index.qmd 에 ```{python} 셀과 matplotlib 그래프 작성

# 3) Quarto 실행 → 코드·stdout 출력·플롯 이미지·수식·콜아웃 자동 변환
pnpm qmd:publish drafts/stim-exp/index.qmd

# 4) 푸시하면 자동 배포 완료!
git add src/content/blog/stim-exp.md public/blog-assets/stim-exp
git commit -m "post: stim-exp"
git push
```
