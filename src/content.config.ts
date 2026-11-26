import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Beomdo Park'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    heroImage: z.string().optional(),
    lang: z.enum(['ko', 'en']).default('ko'),
    legacySlug: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
