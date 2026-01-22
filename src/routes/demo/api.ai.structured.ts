import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createWorkersAI } from "workers-ai-provider";
import { generateText } from "ai";
import { z } from "zod";

// Simple hash function for cache keys
async function hashKey(recipeName: string, mode: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${mode}:${recipeName.toLowerCase().trim()}`);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Simplified schema for more reliable output
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
			}),
		)
		.describe("List of ingredients"),
	instructions: z
		.array(z.string())
		.describe("Step-by-step cooking instructions"),
	tips: z.array(z.string()).optional().describe("Optional cooking tips"),
});

export type Recipe = z.infer<typeof RecipeSchema>;

// Manual JSON Schema definition (avoids bundling issues with zod-to-json-schema)
const recipeJsonSchema = {
	type: "object",
	properties: {
		name: {
			type: "string",
			description: "The name of the recipe",
		},
		description: {
			type: "string",
			description: "A brief description of the dish",
		},
		prepTime: {
			type: "string",
			description: 'Preparation time (e.g., "15 minutes")',
		},
		cookTime: {
			type: "string",
			description: 'Cooking time (e.g., "30 minutes")',
		},
		servings: {
			type: "number",
			description: "Number of servings",
		},
		difficulty: {
			type: "string",
			enum: ["easy", "medium", "hard"],
			description: "Difficulty level",
		},
		ingredients: {
			type: "array",
			description: "List of ingredients",
			items: {
				type: "object",
				properties: {
					item: {
						type: "string",
						description: "Ingredient name",
					},
					amount: {
						type: "string",
						description: 'Amount needed (e.g., "2 cups")',
					},
				},
				required: ["item", "amount"],
			},
		},
		instructions: {
			type: "array",
			description: "Step-by-step cooking instructions",
			items: {
				type: "string",
			},
		},
		tips: {
			type: "array",
			description: "Optional cooking tips",
			items: {
				type: "string",
			},
		},
	},
	required: [
		"name",
		"description",
		"prepTime",
		"cookTime",
		"servings",
		"difficulty",
		"ingredients",
		"instructions",
	],
};

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

					let responseData;

					if (mode === "structured") {
						const prompt = `Generate a complete recipe for: ${recipeName}.

Include all details: ingredients with amounts, step-by-step instructions, prep/cook times, difficulty level, and optional tips.`;

						// Use NATIVE Cloudflare AI structured output with json_schema
						const aiResponse = await env.AI.run(
							"@cf/meta/llama-4-scout-17b-16e-instruct",
							{
								messages: [
									{
										role: "system",
										content:
											"You are a helpful recipe generator that creates detailed, well-structured recipes.",
									},
									{
										role: "user",
										content: prompt,
									},
								],
								max_tokens: 2048,
								temperature: 0.7,
								// Native json_schema support - guarantees valid, complete JSON
								response_format: {
									type: "json_schema",
									json_schema: recipeJsonSchema,
								},
							},
						);

						console.log("AI Response type:", typeof aiResponse);

						// Parse the response
						let recipe;
						if (typeof aiResponse === "string") {
							recipe = JSON.parse(aiResponse);
						} else if (aiResponse && typeof aiResponse === "object") {
							if ("response" in aiResponse) {
								const responseText = (aiResponse as any).response;
								recipe =
									typeof responseText === "string"
										? JSON.parse(responseText)
										: responseText;
							} else if ("text" in aiResponse) {
								const textContent = (aiResponse as any).text;
								recipe =
									typeof textContent === "string"
										? JSON.parse(textContent)
										: textContent;
							} else {
								// Already an object
								recipe = aiResponse;
							}
						}

						console.log("Parsed recipe:", recipe);

						// Validate with Zod
						const validated = RecipeSchema.parse(recipe);

						responseData = {
							mode: "structured",
							recipe: validated,
							provider: "cloudflare",
							model: "@cf/meta/llama-4-scout-17b-16e-instruct",
							method: "native_json_schema",
						};
					} else {
						// Create Workers AI provider for markdown mode
						const workersai = createWorkersAI({ binding: env.AI });
						const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

						const markdownPrompt = `Generate a complete recipe for: ${recipeName}.

Format the recipe in beautiful markdown with:
- A title with the recipe name
- A brief description
- Prep time, cook time, and servings
- Ingredients list with amounts
- Numbered step-by-step instructions
- Optional tips section

Make it detailed and easy to follow.`;

						// Use AI SDK's generateText for markdown output
						const result = await generateText({
							model,
							system:
								"You are a helpful recipe generator that creates well-formatted markdown recipes.",
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
