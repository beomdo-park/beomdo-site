#!/usr/bin/env node
/**
 * Validate and publish a blog post (check images, run astro check, commit, and push to trigger Cloudflare auto-deploy).
 *
 * Usage:
 *   pnpm publish:post <slug> [--message "custom commit msg"] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`Usage:
  pnpm publish:post <slug> [--message "post: custom message"] [--dry-run]

What it does:
  1. Verifies src/content/blog/<slug>.md exists (and warns if draft: true)
  2. Verifies every /blog-assets/... image referenced in the post exists in public/
  3. Runs \`pnpm check\` (Astro + Zod frontmatter + TypeScript validation)
  4. Stages the post + its public/blog-assets/<slug>/ folder, commits, and pushes to origin/main
     (Cloudflare Workers Builds then auto-deploys in ~1 minute)`);
  process.exit(0);
}

const slug = args[0]
  .replace(/^src\/content\/blog\//, '')
  .replace(/\.mdx?$/, '');
const dryRun = args.includes('--dry-run');
const msgIdx = args.indexOf('--message');
const customMsg = msgIdx !== -1 && args[msgIdx + 1] ? args[msgIdx + 1] : `post: ${slug}`;

const root = process.cwd();
const mdPath = path.join(root, 'src', 'content', 'blog', `${slug}.md`);
const assetDir = path.join(root, 'public', 'blog-assets', slug);

if (!fs.existsSync(mdPath)) {
  console.error(`Error: Post not found at ${path.relative(root, mdPath)}`);
  process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf-8');
if (/^draft:\s*true\s*$/m.test(content)) {
  console.warn('Warning: This post currently has `draft: true` in frontmatter — it will be hidden on the live site.');
}

// Check all referenced /blog-assets/... files exist
const imgMatches = [...content.matchAll(/(\/blog-assets\/[^)\s"']+)/g)].map((m) => m[1]);
const missing = [];
for (const urlPath of new Set(imgMatches)) {
  const localFile = path.join(root, 'public', urlPath.replace(/^\//, ''));
  if (!fs.existsSync(localFile)) {
    missing.push(urlPath);
  }
}
if (missing.length > 0) {
  console.error('Error: Missing referenced image asset(s):');
  for (const m of missing) console.error(`  - public${m}`);
  process.exit(1);
}
console.log(`✓ Post verified (${imgMatches.length} image references OK)`);

console.log('Running `pnpm check`...');
execFileSync('pnpm', ['check'], { stdio: 'inherit', cwd: root });

const filesToStage = [path.relative(root, mdPath)];
if (fs.existsSync(assetDir)) {
  filesToStage.push(path.relative(root, assetDir));
}

if (dryRun) {
  console.log(`[dry-run] Would stage: ${filesToStage.join(', ')}`);
  console.log(`[dry-run] Would commit: "${customMsg}" and push to origin/main`);
  process.exit(0);
}

execFileSync('git', ['add', ...filesToStage], { stdio: 'inherit', cwd: root });
const status = execFileSync('git', ['status', '--porcelain', ...filesToStage], { cwd: root }).toString().trim();
if (!status) {
  console.log('No uncommitted changes for this post.');
  process.exit(0);
}

execFileSync('git', ['commit', '-m', customMsg], { stdio: 'inherit', cwd: root });
execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit', cwd: root });
console.log('✓ Pushed to origin/main — Cloudflare Workers Builds will auto-deploy in ~1 minute.');
