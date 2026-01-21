import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

// Schema for structured recipe output
const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe'),
  description: z.string().describe('A brief description of the dish'),
  prepTime: z.string().describe('Preparation time (e.g., "15 minutes")'),
  cookTime: z.string().describe('Cooking time (e.g., "30 minutes")'),
  servings: z.number().describe('Number of servings'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  ingredients: z
    .array(
      z.object({
        item: z.string().describe('Ingredient name'),
        amount: z.string().describe('Amount needed (e.g., "2 cups")'),
        notes: z.string().optional().describe('Optional preparation notes'),
      }),
    )
    .describe('List of ingredients'),
  instructions: z
    .array(z.string())
    .describe('Step-by-step cooking instructions'),
  tips: z.array(z.string()).optional().describe('Optional cooking tips'),
  nutritionPerServing: z
    .object({
      calories: z.number().optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    })
    .optional()
    .describe('Nutritional information per serving'),
})

export type Recipe = z.infer<typeof RecipeSchema>

export const Route = createFileRoute('/demo/api/ai/structured')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json()
        const { recipeName, mode = 'structured' } = body

        if (!recipeName || recipeName.trim().length === 0) {
          return new Response(
            JSON.stringify({
              error: 'Recipe name is required',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const env = (context as any)?.cloudflare?.env
        if (!env?.AI) {
          return new Response(
            JSON.stringify({
              error: 'Cloudflare AI binding not available',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        try {
          if (mode === 'structured') {
            // Structured output mode - returns validated object
            const structuredPrompt = `Generate a complete recipe for: ${recipeName}.

IMPORTANT: You must respond with a valid JSON object matching this exact structure:
{
  "name": "recipe name",
  "description": "brief description",
  "prepTime": "time string (e.g., '15 minutes')",
  "cookTime": "time string (e.g., '30 minutes')",
  "servings": number,
  "difficulty": "easy" | "medium" | "hard",
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "amount with unit",
      "notes": "optional notes"
    }
  ],
  "instructions": ["step 1", "step 2", ...],
  "tips": ["tip 1", "tip 2", ...],
  "nutritionPerServing": {
    "calories": number (optional),
    "protein": "amount string" (optional),
    "carbs": "amount string" (optional),
    "fat": "amount string" (optional)
  }
}

Include all ingredients with amounts, step-by-step instructions, prep/cook times, difficulty level, and nutritional info. Respond ONLY with valid JSON, no markdown formatting.`

            const aiResponse = await env.AI.run(
              '@cf/meta/llama-4-scout-17b-16e-instruct',
              {
                messages: [
                  { role: 'system', content: 'You are a helpful recipe generator. Always respond with valid JSON.' },
                  { role: 'user', content: structuredPrompt },
                ],
              },
            )

            // Parse and validate the response
            let recipeData: Recipe
            try {
              // Extract JSON from response (in case AI adds extra text)
              const responseText = aiResponse.response || JSON.stringify(aiResponse)
              const jsonMatch = responseText.match(/\{[\s\S]*\}/)
              const jsonString = jsonMatch ? jsonMatch[0] : responseText

              const parsedData = JSON.parse(jsonString)
              recipeData = RecipeSchema.parse(parsedData)
            } catch (parseError: any) {
              console.error('Failed to parse AI response:', parseError)
              return new Response(
                JSON.stringify({
                  error: 'Failed to parse structured recipe data',
                  details: parseError.message,
                  rawResponse: aiResponse,
                }),
                {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            return new Response(
              JSON.stringify({
                mode: 'structured',
                recipe: recipeData,
                provider: 'cloudflare',
                model: '@cf/meta/llama-4-scout-17b-16e-instruct',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          } else {
            // One-shot markdown mode - returns text
            const markdownPrompt = `Generate a complete recipe for: ${recipeName}.

Format the recipe in beautiful markdown with:
- A title with the recipe name
- A brief description
- Prep time, cook time, and servings
- Ingredients list with amounts
- Numbered step-by-step instructions
- Optional tips section
- Nutritional info if applicable

Make it detailed and easy to follow.`

            const aiResponse = await env.AI.run(
              '@cf/meta/llama-4-scout-17b-16e-instruct',
              {
                messages: [
                  { role: 'system', content: 'You are a helpful recipe generator that creates well-formatted markdown recipes.' },
                  { role: 'user', content: markdownPrompt },
                ],
              },
            )

            const markdown = aiResponse.response || JSON.stringify(aiResponse)

            return new Response(
              JSON.stringify({
                mode: 'oneshot',
                markdown,
                provider: 'cloudflare',
                model: '@cf/meta/llama-4-scout-17b-16e-instruct',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
        } catch (error: any) {
          console.error('Recipe generation error:', error)
          return new Response(
            JSON.stringify({
              error: error.message || 'An error occurred during recipe generation',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
