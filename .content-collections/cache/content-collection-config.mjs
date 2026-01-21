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
var content_collections_default = defineConfig({
  collections: [education]
});
export {
  content_collections_default as default
};
