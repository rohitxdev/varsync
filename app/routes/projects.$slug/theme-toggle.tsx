import { useEffect, useState } from "react";
import { Switch } from "react-aria-components";
import { LuMoon, LuSun } from "react-icons/lu";

export const ThemeToggle = () => {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		const isDark =
			localStorage.theme === "dark" ||
			(!localStorage.getItem("theme") &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
	}, []);

	return (
		<div className="flex items-center px-4 text-slate-400">
			<p className="text-sm capitalize">{theme}</p>
			<Switch
				className="group ml-auto h-7 w-12 rounded-full bg-slate-400/20 p-0.5"
				onChange={(val) => {
					setTheme(val ? "dark" : "light");
					localStorage.setItem("theme", val ? "dark" : "light");
					document.documentElement.setAttribute("data-theme", val ? "dark" : "light");
				}}
			>
				{({ isSelected }) => (
					<div className="size-6 rounded-full bg-white text-slate-800 duration-100 *:size-full *:p-1 group-selected:translate-x-5 dark:bg-dark/40 dark:text-slate-400">
						{isSelected ? <LuMoon /> : <LuSun />}
					</div>
				)}
			</Switch>
		</div>
	);
};
