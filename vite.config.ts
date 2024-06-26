import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";

	return {
		plugins: [
			svgr(),
			remix({
				future: {
					v3_fetcherPersist: true,
					v3_relativeSplatPath: true,
					v3_throwAbortReason: true,
				},
			}),
			tsconfigPaths(),
			sentryVitePlugin({
				disable: isDev,
				org: "rohit-reddy",
				project: "varsync",
				silent: true,
			}),
		],

		server: {
			port: 3000,
			host: true,
		},

		esbuild: {
			supported: {
				"top-level-await": true,
			},
		},

		build: {
			sourcemap: isDev,
		},
	};
});
