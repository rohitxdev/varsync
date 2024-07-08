import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import reactAriaPlugin from "tailwindcss-react-aria-components";

export default {
	darkMode: ["selector", '[data-theme="dark"]'],
	content: ["./app/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				archivo: ["Archivo", "sans-serif"],
				"jetbrains-mono": ["JetBrains Mono", "monospace"],
			},
			fontSize: {
				"2xs": "0.625rem",
			},
			colors: {
				dark: "#0A0A11",
				blurple: "#6C63FF",
			},
		},
	},
	plugins: [reactAriaPlugin, animatePlugin],
} satisfies Config;
