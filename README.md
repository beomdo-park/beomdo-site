# 박범도 (Beomdo Park) — Researcher Portal & Engineering Blog

연구자 포트폴리오(한국어 기본 `/`, 영문 `/en/`)와 기술 블로그를 명확히 분리해 운영하는 개인 웹사이트입니다.  
**Astro v5 · React 19 · TypeScript · Tailwind CSS v4 · Cloudflare Workers (Static Assets + D1)** 기반으로 구축되었으며, `main` 브랜치 푸시 시 Cloudflare Workers Builds가 자동 빌드·배포합니다.

- **라이브 사이트**: https://beomdo-site.pbeomdo.workers.dev (`KO`) · https://beomdo-site.pbeomdo.workers.dev/en/ (`EN`)
- **글쓰기 가이드**: [`WRITING.md`](./WRITING.md) (Markdown & Quarto `.qmd` 실행형 글쓰기 도구 안내)
- **디자인 지침**: [`DESIGN.md`](./DESIGN.md) (`getdesign.md` 형식 모노크롬·CJK 타이포그래피 스펙)

---

## 자주 쓰는 명령어

| 목적 | 명령어 |
| --- | --- |
| 로컬 미리보기 | `pnpm dev` |
| 새 Markdown 글 생성 | `pnpm new:post <slug> --title "제목" --tags "QEC,JAX"` |
| 새 Quarto(`.qmd`) 실험 글 생성 | `pnpm new:post <slug> --title "제목" --tags "QEC" --qmd` |
| Quarto `.qmd` 실행 → 블로그 변환 | `pnpm qmd:publish drafts/<slug>/index.qmd` |
| 글 검증(이미지·타입) + 커밋 + 자동 배포 | `pnpm publish:post <slug>` (`--dry-run` 지원) |
| 타입 검사 / 프로덕션 빌드 | `pnpm check` / `pnpm build` |

---

## 어디를 수정하면 되나요? (Directory Map)

```text
beomdo-site/
├── DESIGN.md                  # 사이트 디자인 시스템 (색상·폰트·레이아웃 원칙)
├── WRITING.md                 # 블로그 글쓰기 & Quarto 발행 치트시트
├── scripts/
│   ├── new-post.mjs           # 새 글 + 이미지 폴더 자동 스캐폴딩 (MD / QMD)
│   ├── publish-qmd.py         # Quarto 실행 → 코드·출력·그래프·콜아웃 자동 변환
│   └── publish-post.mjs       # 이미지 누락 검사 + astro check + 커밋 + 푸시
├── src/
│   ├── content/blog/*.md      # 블로그 포스트 (KaTeX 수식, [!NOTE] 콜아웃, 코드 복사)
│   ├── data/
│   │   ├── profile.ts         # 소개 문구, 연구 분야 3축, 학력, 경력, 수상, 기술 스택
│   │   ├── publications.ts    # 논문 20편 + 등록특허 1건 (DBpia 링크 & BibTeX)
│   │   ├── projects.ts        # QEnvS, ROQET 등 프로젝트 설명 및 지표
│   │   └── site.ts            # 사이트 메타, 검색엔진 인증(Google/Naver), 외부 링크
│   ├── components/react/
│   │   ├── QEnvSExplorer.tsx  # QEnvS 개방 양자 배터리 · Dicke √N 인터랙티브 탐색기
│   │   ├── RoqetExplorer.tsx  # ROQET 사전 디코더 게이트 · KD+INT8 SoC 탐색기
│   │   └── VisitCounter.tsx   # Cloudflare D1 기반 새로고침·봇 중복 제외 방문자 수
│   └── pages/api/visits.ts    # Cloudflare Workers + D1 일일 고유 방문자 API (KST)
└── public/
    ├── blog-assets/<slug>/    # 포스트 이미지 (첫 이미지가 목록 우측 썸네일로 자동 사용)
    └── _redirects             # 기존 Quarto(/posts/*, /about.html) 301 영구 리다이렉트
```

---

## 자동 배포 & 추후 커스텀 도메인 연결

- **자동 배포**: Cloudflare Workers Builds가 `beomdo-park/beomdo-site` (`main`)에 연동되어 있어 `git push` 후 약 1분 안에 자동 배포됩니다. (`NODE_VERSION=22`, `.nvmrc` 포함)
- **커스텀 도메인 전환**:
  1. Cloudflare Workers → `beomdo-site` → **Settings → Domains & Routes**에서 도메인 연결
  2. `astro.config.mjs`의 `SITE_URL`을 새 도메인으로 변경 후 `git push`
  3. 기존 `beomdo-park.github.io`에는 루트 CNAME을 걸지 않아야 `https://beomdo-park.github.io/QEnvS/` 문서 사이트가 무중단 유지됩니다.
