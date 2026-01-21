import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		TanStackRouterVite(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		contentCollections(),
		tailwindcss(),
	],
});
