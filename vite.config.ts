import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tanstackStart(),
		react(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		contentCollections(),
		tailwindcss(),
	],
	build: {
		rollupOptions: {
			external: ["@cloudflare/ai", "cloudflare:ai"],
			output: {
				manualChunks: {
					// Split large dependencies into separate chunks
					"vendor-mermaid": ["mermaid"],
					"vendor-three": ["three", "@react-three/fiber", "@react-three/drei"],
					"vendor-react": ["react", "react-dom"],
					"vendor-tanstack": [
						"@tanstack/react-router",
						"@tanstack/react-query",
						"@tanstack/react-start",
					],
				},
			},
		},
		chunkSizeWarningLimit: 1000, // Increase warning limit for known large chunks
	},
});
