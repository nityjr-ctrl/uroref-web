import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const deepDives = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/deep-dives' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'deep-dives': deepDives,
};
