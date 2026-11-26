import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './src/plugins/remark-callouts.mjs';

const SITE_URL = process.env.SITE_URL || 'https://beomdo-site.pbeomdo.workers.dev';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkMath, remarkCallouts],
      rehypePlugins: [[rehypeKatex, { strict: false }]],
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkCallouts],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Required for React 19 on Cloudflare Workers edge runtime
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : undefined,
    },
  },
});
