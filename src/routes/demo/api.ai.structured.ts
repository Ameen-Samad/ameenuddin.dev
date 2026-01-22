import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createWorkersAI } from "workers-ai-provider";
import { generateObject, generateText } from "ai";
import { z } from "zod";

// Simple hash function for cache keys
async function hashKey(recipeName: string, mode: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${mode}:${recipeName.toLowerCase().trim()}`);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Schema for structured recipe output
const RecipeSchema = z.object({
	name: z.string().describe("The name of the recipe"),
	description: z.string().describe("A brief description of the dish"),
	prepTime: z.string().describe('Preparation time (e.g., "15 minutes")'),
	cookTime: z.string().describe('Cooking time (e.g., "30 minutes")'),
	servings: z.number().describe("Number of servings"),
	difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
	ingredients: z
		.array(
			z.object({
				item: z.string().describe("Ingredient name"),
				amount: z.string().describe('Amount needed (e.g., "2 cups")'),
				notes: z.string().optional().describe("Optional preparation notes"),
			}),
		)
		.describe("List of ingredients"),
	instructions: z
		.array(z.string())
		.describe("Step-by-step cooking instructions"),
	tips: z.array(z.string()).optional().describe("Optional cooking tips"),
	nutritionPerServing: z
		.object({
			calories: z.number().optional(),
			protein: z.string().optional(),
			carbs: z.string().optional(),
			fat: z.string().optional(),
		})
		.optional()
		.describe("Nutritional information per serving"),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const Route = createFileRoute("/demo/api/ai/structured")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();
				const { recipeName, mode = "structured" } = body;

				if (!recipeName || recipeName.trim().length === 0) {
					return new Response(
						JSON.stringify({
							error: "Recipe name is required",
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				if (!env?.AI) {
					return new Response(
						JSON.stringify({
							error: "Cloudflare AI binding not available",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					// Check cache first
					const cacheKey = `recipe:${await hashKey(recipeName, mode)}`;
					const cache = env.PROJECT_CACHE;

					if (cache) {
						const cached = await cache.get(cacheKey, "json");
						if (cached) {
							console.log(`Cache hit for recipe: ${recipeName} (${mode})`);
							return new Response(
								JSON.stringify({
									...cached,
									cached: true,
								}),
								{
									status: 200,
									headers: { "Content-Type": "application/json" },
								},
							);
						}
					}

					// Create Workers AI provider
					const workersai = createWorkersAI({ binding: env.AI });
					const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

					let responseData;

					if (mode === "structured") {
						const prompt = `Generate a complete recipe for: ${recipeName}.

Include all ingredients with amounts, step-by-step instructions, prep/cook times, difficulty level, and nutritional info.`;

						// Use AI SDK's generateObject for structured output
						const result = await generateObject({
							model,
							schema: RecipeSchema,
							system: "You are a helpful recipe generator that creates detailed, well-structured recipes.",
							prompt,
						});

						responseData = {
							mode: "structured",
							recipe: result.object,
							provider: "cloudflare",
							model: "@cf/meta/llama-4-scout-17b-16e-instruct",
						};
					} else {
						const markdownPrompt = `Generate a complete recipe for: ${recipeName}.

Format the recipe in beautiful markdown with:
- A title with the recipe name
- A brief description
- Prep time, cook time, and servings
- Ingredients list with amounts
- Numbered step-by-step instructions
- Optional tips section
- Nutritional info if applicable

Make it detailed and easy to follow.`;

						// Use AI SDK's generateText for markdown output
						const result = await generateText({
							model,
							system: "You are a helpful recipe generator that creates well-formatted markdown recipes.",
							prompt: markdownPrompt,
							maxTokens: 8192,
						});

						responseData = {
							mode: "oneshot",
							markdown: result.text,
							provider: "cloudflare",
							model: "@cf/meta/llama-4-scout-17b-16e-instruct",
						};
					}

					// Cache the response (7 days TTL)
					if (cache) {
						try {
							await cache.put(cacheKey, JSON.stringify(responseData), {
								expirationTtl: 60 * 60 * 24 * 7, // 7 days
							});
							console.log(`Cached recipe: ${recipeName} (${mode})`);
						} catch (error) {
							console.error("Cache error:", error);
						}
					}

					return new Response(JSON.stringify(responseData), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("Recipe generation error:", error);
					return new Response(
						JSON.stringify({
							error: "Failed to generate recipe",
							details: error instanceof Error ? error.message : String(error),
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
