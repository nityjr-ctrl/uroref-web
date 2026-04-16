import { defineCollection, z } from 'astro:content';

const deepDives = defineCollection({
  type: 'content',
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
