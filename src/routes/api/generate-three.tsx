import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-three")({
	component: () => null,
});

export async function action({ request }: { request: Request }) {
	const body = await request.json();

	const { prompt } = body as { prompt: string };

	if (!prompt || prompt.trim().length === 0) {
		return new Response(JSON.stringify({ error: "Prompt is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
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

	try {
		const response = await fetch(
			"https://api.cloudflare.com/client/v4/accounts/REPLACE_WITH_ACCOUNT_ID/ai/run/@cf/qwen/qwen2.5-coder-32b-instruct",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "@cf/qwen/qwen2.5-coder-32b-instruct",
					messages: [
						{ role: "system", content: systemPrompt },
						{
							role: "user",
							content: `Create a Three.js scene with: ${prompt}`,
						},
					],
					max_tokens: 3000,
					temperature: 0.7,
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Cloudflare AI Error:", errorText);
			return new Response(
				JSON.stringify({
					error: "Failed to generate code",
					details: errorText,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const data = await response.json();
		let generatedCode = data.response?.result || data.response || "";

		generatedCode = generatedCode
			.replace(/```javascript/g, "")
			.replace(/```/g, "")
			.replace(/```js/g, "")
			.trim();

		if (!generatedCode.startsWith("import")) {
			generatedCode = `import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';\n\n${generatedCode}`;
		}

		return new Response(JSON.stringify({ code: generatedCode }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Generation Error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
