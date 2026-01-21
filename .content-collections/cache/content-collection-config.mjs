// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
var education = defineCollection({
  name: "education",
  directory: "content/education",
  include: "**/*.md",
  schema: z.object({
    school: z.string(),
    summary: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    tags: z.array(z.string()),
    content: z.string()
  })
});
var jobs = defineCollection({
  name: "jobs",
  directory: "content/jobs",
  include: "**/*.md",
  schema: z.object({
    jobTitle: z.string(),
    company: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()),
    content: z.string()
  })
});
var skills = defineCollection({
  name: "skills",
  directory: "content/skills",
  include: "**/*.md",
  schema: z.object({
    name: z.string(),
    startDate: z.string().optional(),
    tags: z.array(z.string()),
    summary: z.string(),
    content: z.string()
  })
});
var content_collections_default = defineConfig({
  collections: [education, jobs, skills]
});
export {
  content_collections_default as default
};
