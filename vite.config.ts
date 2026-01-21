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
				manualChunks(id) {
					// Split large vendor chunks for better caching
					if (id.includes('node_modules')) {
						// Heavy dependencies go into their own chunks
						if (id.includes('mermaid')) return 'vendor-mermaid';
						if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
						if (id.includes('phaser')) return 'vendor-phaser';
						if (id.includes('cytoscape')) return 'vendor-cytoscape';

						// Core React libraries
						if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';

						// TanStack ecosystem
						if (id.includes('@tanstack')) return 'vendor-tanstack';

						// UI libraries
						if (id.includes('@mantine') || id.includes('@radix-ui')) return 'vendor-ui';

						// Everything else goes into vendor
						return 'vendor';
					}
				},
			},
		},
		chunkSizeWarningLimit: 1500, // Some chunks are necessarily large (vendor-phaser, vendor-mermaid)
	},
});
