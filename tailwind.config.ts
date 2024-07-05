import type { Config } from "tailwindcss";
import reactAriaPlugin from "tailwindcss-react-aria-components";
import animatePlugin from "tailwindcss-animate";

export default {
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
				dark: "#101116",
				blurple: "#6C63FF",
			},
		},
	},
	plugins: [reactAriaPlugin, animatePlugin],
} satisfies Config;
