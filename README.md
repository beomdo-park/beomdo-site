# Beomdo Park — Researcher Portal & Engineering Blog

Personal researcher homepage, publication archive (with DBpia & BibTeX), interactive QEnvS/ROQET demos, bilingual (`KO` default + `EN` mirror) site, technical blog, and D1-backed reload-deduplicated visitor counter built with **Astro v5 + React 19 + TypeScript + Tailwind CSS v4 + Cloudflare Workers (Static Assets + D1)**.

- **Live**: https://beomdo-site.pbeomdo.workers.dev (`KO`) · https://beomdo-site.pbeomdo.workers.dev/en/ (`EN`)
- **Design System**: See [`DESIGN.md`](./DESIGN.md)

## Structure

- `/` & `/en/` — Academic researcher homepage (profile, research focus, selected publications & projects)
- `/publications` & `/en/publications` — 20 papers + 1 granted patent with DBpia links, filters, and BibTeX copy
- `/projects` & `/en/projects` — QEnvS, ROQET, Kaggle VQCC, Industrial Power AD (with embedded interactive explorers)
- `/blog` & `/en/blog` — 15 migrated technical notes (KaTeX math, code outputs, series navigation, right-hand thumbnails)
- `/cv` & `/en/cv` — Education, experience, awards, certifications, and tech stack
- `/api/visits` — Cloudflare Workers + D1 KST daily unique visitor counter (reload & bot deduplicated)

## Commands

```bash
pnpm dev        # Local Astro dev server
pnpm check      # Astro + TypeScript diagnostics
pnpm build      # Build static pages + Worker bundle + Pagefind (ko/en) search index
pnpm preview    # Preview locally on Cloudflare workerd runtime
pnpm deploy     # Build + deploy to Cloudflare Workers
```

## Custom Domain Cutover

1. Attach your custom domain under Cloudflare Workers → `beomdo-site` → **Settings → Domains & Routes**.
2. Set `SITE_URL=https://yourdomain.com` before running `pnpm deploy` (or update the default in `astro.config.mjs`).
3. Keep `beomdo-park.github.io` free of a root CNAME so `https://beomdo-park.github.io/QEnvS/` continues serving QEnvS docs uninterrupted.
