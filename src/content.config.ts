import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './content/projects',
    generateId: ({ entry }) => entry.split('/')[0]!,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    year: z.number().optional(),
    order: z.number(),
    images: z.array(z.string()),
    hero: z.array(z.string()).optional(),
  }),
})

export const collections = {
  projects,
}
