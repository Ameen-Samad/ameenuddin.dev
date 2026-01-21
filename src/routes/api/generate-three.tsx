import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/generate-three")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const ai = context.cloudflare?.env.AI;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				try {
					const body = await request.json();
					const { prompt } = body as { prompt: string };

					if (!prompt || prompt.trim().length === 0) {
						return json({ error: "Prompt is required" }, { status: 400 });
					}

					const systemPrompt = `You are a Three.js expert. Generate complete, working Three.js code based on user descriptions.

IMPORTANT: Return ONLY the code, no explanations, no markdown formatting.

Format requirements:
1. Use ES6 modules
2. Export a function named createScene that accepts a canvas parameter
3. Set up scene, camera, renderer
4. Create geometries and materials based on description
5. Add lights for proper illumination
6. Include animation loop if appropriate
7. Use modern Three.js syntax (r170+) compatible)
8. Add orbit controls for user interaction
9. Return the scene object so it can be used

Example structure:
import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';

export async function createScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Add objects, lights, materials...

  return { scene, camera, renderer };
}`;

					// Use Workers AI binding (secure, server-side only)
					const response = await ai.run("@cf/qwen/qwen2.5-coder-32b-instruct", {
						messages: [
							{ role: "system", content: systemPrompt },
							{
								role: "user",
								content: `Create a Three.js scene with: ${prompt}`,
							},
						],
						max_tokens: 3000,
						temperature: 0.7,
					});

					// Extract generated code from AI response
					let generatedCode = "";

					if (typeof response === "string") {
						generatedCode = response;
					} else if (response && typeof response === "object") {
						// Handle different response formats from Workers AI
						generatedCode = (response as any).response || (response as any).result || "";
					}

					// Clean up markdown formatting
					generatedCode = generatedCode
						.replace(/```javascript/g, "")
						.replace(/```js/g, "")
						.replace(/```/g, "")
						.trim();

					// Ensure imports are present
					if (!generatedCode.startsWith("import")) {
						generatedCode = `import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';\n\n${generatedCode}`;
					}

					return json({ code: generatedCode });
				} catch (error) {
					console.error("Generation Error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
