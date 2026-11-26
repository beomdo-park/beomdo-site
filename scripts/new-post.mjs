#!/usr/bin/env node
/**
 * Scaffold a new blog post (Markdown or Quarto .qmd) with KST date & asset folder.
 *
 * Usage:
 *   pnpm new:post my-post-slug --title "글 제목" [--series "ROQET"] [--tags "QEC,JAX"] [--qmd]
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`Usage:
  pnpm new:post <slug> [--title "제목"] [--desc "설명"] [--series "시리즈명"] [--tags "태그1,태그2"] [--qmd]

Examples:
  pnpm new:post qenvs-drag-pulse --title "QEnvS로 Transmon DRAG 펄스 최적화하기" --tags "QEnvS,JAX,QuantumControl"
  pnpm new:post qec-experiment --title "Stim 신드롬 실험" --qmd   # Quarto(.qmd) 실행형 초안 생성`);
  process.exit(0);
}

const slug = args[0]
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const getFlag = (name, fallback = '') => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--') ? args[idx + 1] : fallback;
};

const isQmd = args.includes('--qmd');
const title = getFlag('title', slug);
const desc = getFlag('desc', '포스트 한 줄 요약을 여기에 작성하세요.');
const series = getFlag('series', '');
const tagsRaw = getFlag('tags', 'Research');
const tags = tagsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// KST today YYYY-MM-DD
const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const root = process.cwd();

if (isQmd) {
  const draftDir = path.join(root, 'drafts', slug);
  const figsDir = path.join(draftDir, 'figs');
  const qmdPath = path.join(draftDir, 'index.qmd');
  if (fs.existsSync(qmdPath)) {
    console.error(`Error: ${qmdPath} already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(figsDir, { recursive: true });
  const qmdContent = `---
title: "${title}"
description: "${desc}"
date: "${kstDate}"
author: "Beomdo Park"
categories: [${tags.map((t) => `"${t}"`).join(', ')}]
tags: [${tags.map((t) => `"${t}"`).join(', ')}]${series ? `\nseries: "${series}"` : ''}
freeze: auto
jupyter: python3
---

> 도입부 요약을 여기에 작성하세요.

## 1. 배경

수식 예시: $H = \\frac{\\Delta}{2}\\sigma_z + \\frac{\\Omega}{2}\\sigma_x$

## 2. Python 실험 코드

\`\`\`{python}
import numpy as np
print("Hello from Quarto -> Astro!", np.pi)
\`\`\`

::: {.callout-note title="핵심 요약"}
여기에 주요 관찰 결과를 정리합니다.
:::
`;
  fs.writeFileSync(qmdPath, qmdContent, 'utf-8');
  console.log(`Created Quarto draft: ${path.relative(root, qmdPath)}`);
  console.log(`When ready to publish to Astro blog, run:`);
  console.log(`  pnpm qmd:publish ${path.relative(root, qmdPath)}`);
} else {
  const mdPath = path.join(root, 'src', 'content', 'blog', `${slug}.md`);
  const assetDir = path.join(root, 'public', 'blog-assets', slug);
  if (fs.existsSync(mdPath)) {
    console.error(`Error: ${mdPath} already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(assetDir, { recursive: true });
  const seriesLine = series ? `series: "${series}"\n` : '';
  const mdContent = `---
title: "${title}"
description: "${desc}"
pubDate: "${kstDate}"
author: "Beomdo Park"
categories: [${tags.map((t) => `"${t}"`).join(', ')}]
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
${seriesLine}lang: ko
draft: false
---

> 도입부 요약을 작성하세요.

## 1. 문제 정의

본문 내용을 작성합니다. 인라인 수식 $\\langle \\psi | H | \\psi \\rangle$ 과 블록 수식을 바로 쓸 수 있습니다.

$$
L_{\\text{total}} = \\alpha L_{\\text{task}} + \\beta L_{\\text{kd}}
$$

> [!NOTE] 핵심 요약
> GitHub/Obsidian 스타일 콜아웃(\`[!NOTE]\`, \`[!TIP]\`, \`[!WARNING]\`, \`[!IMPORTANT]\`)이 자동으로 디자인 시스템에 맞게 렌더링됩니다.

## 2. 구현 및 결과

이미지는 \`public/blog-assets/${slug}/\` 폴더에 넣고 아래처럼 삽입하면 블로그 목록 썸네일로도 자동 표시됩니다.

<!-- ![그림 설명](/blog-assets/${slug}/fig1.png) -->

\`\`\`python
import jax.numpy as jnp
print(jnp.pi)
\`\`\`
`;
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`Created Markdown post: ${path.relative(root, mdPath)}`);
  console.log(`Asset folder ready:    ${path.relative(root, assetDir)}/`);
  console.log(`Preview locally:       pnpm dev`);
  console.log(`Publish to live site:  git add . && git commit -m "post: ${slug}" && git push`);
}
