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
	resolve: {
		dedupe: ['react', 'react-dom'],
	},
	server: {
		watch: {
			// Ignore generated files to prevent watch loops
			ignored: [
				'**/routeTree.gen.ts',
				'**/.content-collections/**',
				'**/node_modules/**',
			],
		},
	},
	optimizeDeps: {
		exclude: ['@cloudflare/ai', 'cloudflare:ai', '@tanstack/react-router-ssr-query'],
	},
	ssr: {
		noExternal: ['react', 'react-dom'],
	},
	build: {
		rollupOptions: {
			external: ["@cloudflare/ai", "cloudflare:ai"],
			output: {
				manualChunks(id) {
					// Only split out the truly massive libraries (>1MB each)
					// Let Vite handle everything else to avoid circular dependencies
					if (id.includes('node_modules')) {
						if (id.includes('mermaid')) return 'vendor-mermaid';
						if (id.includes('phaser')) return 'vendor-phaser';
						if (id.includes('cytoscape')) return 'vendor-cytoscape';
						if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
					}
				},
			},
		},
		chunkSizeWarningLimit: 2000, // Some chunks are necessarily large (vendor-phaser, vendor-mermaid)
	},
});
