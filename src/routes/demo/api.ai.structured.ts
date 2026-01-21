import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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

// Convert Zod schema to JSON Schema for Cloudflare JSON Mode
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
					notes: {
						type: "string",
						description: "Optional preparation notes",
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
		nutritionPerServing: {
			type: "object",
			description: "Nutritional information per serving",
			properties: {
				calories: {
					type: "number",
					description: "Calories per serving",
				},
				protein: {
					type: "string",
					description: 'Protein amount (e.g., "25g")',
				},
				carbs: {
					type: "string",
					description: 'Carbohydrates amount (e.g., "50g")',
				},
				fat: {
					type: "string",
					description: 'Fat amount (e.g., "15g")',
				},
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
					if (mode === "structured") {
						const prompt = `Generate a complete recipe for: ${recipeName}.

Include all ingredients with amounts, step-by-step instructions, prep/cook times, difficulty level, and nutritional info.`;

						const aiResponse = await env.AI.run(
							"@cf/meta/llama-3.1-8b-instruct",
							{
								messages: [
									{
										role: "system",
										content:
											"You are a helpful recipe generator that creates detailed, well-structured recipes.",
									},
									{ role: "user", content: prompt },
								],
								response_format: {
									type: "json_schema",
									json_schema: recipeJsonSchema,
								},
							},
						);

						// The AI response is already validated against the schema
						const recipeData = aiResponse.response || aiResponse;

						// Validate with Zod for additional type safety
						try {
							RecipeSchema.parse(recipeData);
						} catch (parseError: any) {
							console.error("Schema validation error:", parseError);
							return new Response(
								JSON.stringify({
									error: "Schema validation failed",
									details: parseError.message,
									rawResponse: recipeData,
								}),
								{
									status: 500,
									headers: { "Content-Type": "application/json" },
								},
							);
						}

						return new Response(
							JSON.stringify({
								mode: "structured",
								recipe: recipeData,
								provider: "cloudflare",
								model: "@cf/meta/llama-3.1-8b-instruct",
							}),
							{
								status: 200,
								headers: { "Content-Type": "application/json" },
							},
						);
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

						const aiResponse = await env.AI.run(
							"@cf/meta/llama-3.1-8b-instruct",
							{
								messages: [
									{
										role: "system",
										content:
											"You are a helpful recipe generator that creates well-formatted markdown recipes.",
									},
									{ role: "user", content: markdownPrompt },
								],
							},
						);

						const markdown = aiResponse.response || JSON.stringify(aiResponse);

						return new Response(
							JSON.stringify({
								mode: "oneshot",
								markdown,
								provider: "cloudflare",
								model: "@cf/meta/llama-3.1-8b-instruct",
							}),
							{
								status: 200,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
				} catch (error: any) {
					console.error("Recipe generation error:", error);
					return new Response(
						JSON.stringify({
							error:
								error.message || "An error occurred during recipe generation",
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
