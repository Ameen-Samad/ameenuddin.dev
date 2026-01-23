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

				try {
					const body = await request.json();
					const { prompt } = body as { prompt: string };

					if (!prompt || prompt.trim().length === 0) {
						return json({ error: "Prompt is required" }, { status: 400 });
					}

					// Check cache FIRST - before rate limiting
					const cacheKey = `three:${await hashPrompt(prompt)}`;
					if (cache) {
						const cached = await cache.get(cacheKey);
						if (cached) {
							console.log(`Cache hit for prompt: ${prompt.slice(0, 50)}...`);
							return json({ code: cached, cached: true });
						}
					}

					// Only apply rate limiting on cache miss (expensive AI operation)
					const rateLimitResult = await checkRateLimit(
						request,
						"generate-three",
						RATE_LIMITS.THREE_JS,
						rateLimitKV
					);

					if (!rateLimitResult.success) {
						return rateLimitResponse(rateLimitResult);
					}

					// Step 1: Classify the request using Scout model (Meta Llama 4 Scout - fast reasoning)
					const classificationResponse = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
						messages: [
							{
								role: "system",
								content: `You are a classification expert. Classify 3D scene requests into exactly one of these types:
- "simple_object": Single object or simple group (e.g., "red cube", "blue sphere", "rotating golden cube")
- "complete_scene": Full scene with environment/atmosphere (e.g., "space scene", "underwater world", "forest landscape")

Respond with ONLY the type name: either "simple_object" or "complete_scene". No explanation.`,
							},
							{
								role: "user",
								content: `Classify: "${prompt}"`,
							},
						],
						max_tokens: 50,
						temperature: 0.1,
					});

					// Parse Scout's classification
					let classification = {
						type: "simple_object" as "simple_object" | "complete_scene",
						needsCustomLighting: false,
						reasoning: "scout classification",
					};

					try {
						const responseText =
							typeof classificationResponse === "string"
								? classificationResponse
								: (classificationResponse as any).response || "";

						const cleanText = responseText.toLowerCase().trim();

						if (cleanText.includes("complete_scene") || cleanText.includes("complete scene")) {
							classification = {
								type: "complete_scene",
								needsCustomLighting: true,
								reasoning: "scout model detected scene/environment",
							};
						} else if (cleanText.includes("simple_object") || cleanText.includes("simple object")) {
							classification = {
								type: "simple_object",
								needsCustomLighting: false,
								reasoning: "scout model detected simple object",
							};
						} else {
							// Fallback: keyword detection
							const sceneKeywords = ["scene", "environment", "world", "landscape", "space", "underwater"];
							const isScene = sceneKeywords.some((kw) => prompt.toLowerCase().includes(kw));
							classification = {
								type: isScene ? "complete_scene" : "simple_object",
								needsCustomLighting: isScene,
								reasoning: "fallback keyword detection",
							};
						}
					} catch (e) {
						console.error("Classification error:", e);
						// Default to simple_object on error
					}

					console.log(`Classification for "${prompt}":`, classification);

					// Step 2: Generate code based on classification
					let systemPrompt: string;
					let generateFullScene = false;

					if (classification.type === "complete_scene" && classification.needsCustomLighting) {
						generateFullScene = true;
						systemPrompt = `You are a Three.js scene expert. Generate COMPLETE scene code with custom lighting and environment.

CRITICAL RULES:
1. Return ONLY geometry/material/mesh creation code - NO imports, NO scene/camera/renderer setup, NO animation loop
2. You have access to THREE (already imported) and scene, camera, renderer (already set up)
3. Create full environment with appropriate lighting for the scene atmosphere
4. Add scene.background color appropriate to the scene (e.g., dark for space, blue for sky)
5. Create multiple lights to set the mood (ambient, directional, point, spot)
6. Add all geometries and lights to the scene
7. Use MeshStandardMaterial or MeshPhongMaterial for realistic lighting

WHAT TO GENERATE:
\`\`\`javascript
// Set background for scene atmosphere
scene.background = new THREE.Color(0x000020); // Dark blue for space

// Custom lighting for atmosphere
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(10, 10, 5);
scene.add(mainLight);

// Create scene objects
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x0088ff });
const planet = new THREE.Mesh(geometry, material);
scene.add(planet);

// Optional: Add animation
animate.userCode = function() {
  planet.rotation.y += 0.01;
};
\`\`\`

IMPORTANT:
- NO import statements
- NO scene/camera/renderer/controls creation (already exists)
- Set scene.background appropriate to the scene
- Create custom lighting for atmosphere
- ONLY geometry, material, mesh, light creation and scene.add() calls
- For animations, define animate.userCode function

NOW GENERATE COMPLETE SCENE CODE FOR THE USER'S REQUEST.`;
					} else {
						// Simple object - use template
						systemPrompt = `You are a Three.js geometry expert. Generate ONLY the geometry/material creation code based on user descriptions.

CRITICAL RULES:
1. Return ONLY the geometry/material/mesh creation code - NO imports, NO scene setup, NO camera, NO renderer, NO animation loop, NO lighting
2. You have access to THREE (already imported) and scene, camera, renderer, controls (already set up)
3. The scene already has bright background and perfect lighting - DO NOT add lights
4. Create geometries, materials, and meshes, then add them to the scene
5. Add animations by modifying object properties in the animate() function
6. Use MeshStandardMaterial or MeshPhongMaterial for realistic lighting
7. Keep objects scaled between 0.5 and 3 units to fit in view

WHAT TO GENERATE:
\`\`\`javascript
// Create geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.2 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Optional: Add animation
animate.userCode = function() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
};
\`\`\`

IMPORTANT:
- NO import statements
- NO scene/camera/renderer/controls creation
- NO lights (already set up with bright background)
- ONLY geometry, material, mesh creation and scene.add() calls
- For animations, define animate.userCode function
- Use descriptive variable names

NOW GENERATE GEOMETRY CODE FOR THE USER'S REQUEST.`;
					}

					// Use Workers AI binding (secure, server-side only)
					const response = await ai.run("@cf/qwen/qwen2.5-coder-32b-instruct", {
						messages: [
							{ role: "system", content: systemPrompt },
							{
								role: "user",
								content: `Create: ${prompt}`,
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
					let geometryCode = generatedCode
						.replace(/```javascript/g, "")
						.replace(/```js/g, "")
						.replace(/```/g, "")
						.trim();

					// Remove any imports if AI added them
					geometryCode = geometryCode
						.replace(/import.*from.*;?\n?/g, "")
						.trim();

					// Step 3: Wrap in appropriate template based on classification
					if (generateFullScene) {
						// Complete scene - minimal template (AI controls background and lighting)
						generatedCode = `import * as THREE from 'https://esm.sh/three@0.182.0';
import { OrbitControls } from 'https://esm.sh/three@0.182.0/examples/jsm/controls/OrbitControls.js';

export async function createScene(canvas) {
  // Initialize scene (AI will set background)
  const scene = new THREE.Scene();

  // Setup camera
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // Setup renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Handle canvas resizing
  function updateSize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  updateSize();
  window.addEventListener('resize', updateSize);

  // AI-generated scene code (includes lighting and objects)
  ${geometryCode}

  // Setup orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Call user animation code if it exists
    if (animate.userCode) {
      animate.userCode();
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer, controls };
}`;
					} else {
						// Simple object - bright template with controlled lighting
						generatedCode = `import * as THREE from 'https://esm.sh/three@0.182.0';
import { OrbitControls } from 'https://esm.sh/three@0.182.0/examples/jsm/controls/OrbitControls.js';

export async function createScene(canvas) {
  // Initialize scene with bright background
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8e8e8); // Bright light gray background

  // Setup camera
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // Setup renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Handle canvas resizing
  function updateSize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  updateSize();
  window.addEventListener('resize', updateSize);

  // Add bright lighting (studio setup)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);

  // User-generated geometry code
  ${geometryCode}

  // Setup orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Call user animation code if it exists
    if (animate.userCode) {
      animate.userCode();
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer, controls };
}`;
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
