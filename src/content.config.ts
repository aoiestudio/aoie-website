import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
  }),
})

export const collections = {
  projects,
}
