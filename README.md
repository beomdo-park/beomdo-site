# Beomdo Park — Researcher Portal & Engineering Blog

Personal researcher portal, interactive quantum-control/QEC lab, publication archive, technical blog, and Cloudflare D1 guestbook built with **Astro v5 + React 19 + TypeScript + Tailwind CSS v4 + Cloudflare Workers (Static Assets + D1)**.

## Commands

```bash
pnpm dev        # Local Astro dev server
pnpm build      # Build static pages + Worker bundle + Pagefind search index
pnpm preview    # Preview locally on Cloudflare workerd runtime
pnpm deploy     # Build + deploy to Cloudflare Workers
```

## Custom Domain Cutover (1-step upgrade)

1. Attach your custom domain under Cloudflare Workers → `beomdo-site` → **Settings → Domains & Routes**.
2. Set `SITE_URL=https://yourdomain.com` before running `pnpm deploy` (or update the default in `astro.config.mjs`).
3. Keep `beomdo-park.github.io` free of a root CNAME so `https://beomdo-park.github.io/QEnvS/` continues serving QEnvS docs uninterrupted; optionally add meta-refresh / canonical redirects on the old GitHub Pages root/posts pointing to your new domain.
