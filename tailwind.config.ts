import type { Config } from 'tailwindcss';
import reactAriaPlugin from 'tailwindcss-react-aria-components';

export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				'jetbrains-mono': ['JetBrains Mono', 'monospace'],
			},
			colors: {
				'navy-blue': '#020817',
			},
		},
	},
	plugins: [reactAriaPlugin()],
} satisfies Config;
