import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

// Simple hash function for cache keys
async function hashPrompt(prompt: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(prompt.toLowerCase().trim());
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/generate-three")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const ai = env.AI;
				const cache = env.PROJECT_CACHE;
				const rateLimitKV = env.RATE_LIMIT;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				// Rate limiting - 3 requests per minute (expensive operation)
				const rateLimitResult = await checkRateLimit(
					request,
					"generate-three",
					RATE_LIMITS.THREE_JS,
					rateLimitKV
				);

				if (!rateLimitResult.success) {
					return rateLimitResponse(rateLimitResult);
				}

				try {
					const body = await request.json();
					const { prompt } = body as { prompt: string };

					if (!prompt || prompt.trim().length === 0) {
						return json({ error: "Prompt is required" }, { status: 400 });
					}

					// Check cache first
					const cacheKey = `three:${await hashPrompt(prompt)}`;
					if (cache) {
						const cached = await cache.get(cacheKey);
						if (cached) {
							console.log(`Cache hit for prompt: ${prompt.slice(0, 50)}...`);
							return json({ code: cached, cached: true });
						}
					}

					const systemPrompt = `You are a Three.js expert code generator. Generate COMPLETE, WORKING Three.js code based on user descriptions.

CRITICAL RULES:
1. Return ONLY executable JavaScript code - no explanations, no comments outside code, no markdown
2. Code MUST be complete and runnable as-is
3. ALWAYS include the full animation loop
4. ALWAYS set renderer size correctly
5. ALWAYS position camera appropriately for the scene
6. ALWAYS include at least one light source

REQUIRED CODE STRUCTURE:
\`\`\`javascript
import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.182.0/examples/jsm/controls/OrbitControls.js';

export async function createScene(canvas) {
  // 1. Initialize scene, camera, renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);

  // 2. Create geometry and materials based on user request
  // [YOUR CREATIVE CODE HERE]

  // 3. Add lighting (REQUIRED)
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // 4. Position camera
  camera.position.z = 5;

  // 5. Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 6. Animation loop (REQUIRED)
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // Add rotation/animation here if needed
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer };
}
\`\`\`

BEST PRACTICES:
- Use appropriate colors and materials (MeshStandardMaterial, MeshPhongMaterial)
- Add subtle animations (rotation, movement) when appropriate
- Scale objects appropriately to fit in view
- Use groups for complex objects
- Apply textures or colors creatively based on description

NOW GENERATE COMPLETE CODE FOR THE USER'S REQUEST.`;

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

					// Cache the generated code (7 days TTL)
					if (cache) {
						try {
							await cache.put(cacheKey, generatedCode, {
								expirationTtl: 60 * 60 * 24 * 7, // 7 days
							});
							console.log(`Cached code for prompt: ${prompt.slice(0, 50)}...`);
						} catch (error) {
							console.error("Cache error:", error);
							// Continue even if caching fails
						}
					}

					return json({ code: generatedCode, cached: false });
				} catch (error) {
					console.error("Generation Error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
