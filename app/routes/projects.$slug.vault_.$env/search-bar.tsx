import { type ComponentRef, useEffect, useId, useRef, useState } from "react";
import { Button, type Input } from "react-aria-components";
import { LuSearch, LuX } from "react-icons/lu";
interface SearchBarProps {
	onTextChange: (text: string) => void;
}
export const SearchBar = ({ onTextChange }: SearchBarProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const inputRef = useRef<ComponentRef<typeof Input> | null>(null);
	const id = useId();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "/" && document.activeElement === document.body) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		addEventListener("keydown", handleKeyDown);

		return () => {
			removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<div className="group flex h-9 items-center gap-2 rounded border border-white/10 bg-white/5 px-3">
			<label className="flex" htmlFor={id}>
				<LuSearch />
			</label>
			<input
				className="bg-transparent px-1 outline-none placeholder:text-sm"
				placeholder="Search"
				onInput={(e) => {
					const text = e.currentTarget.value;
					setSearchTerm(text);
					onTextChange(text);
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setSearchTerm("");
						onTextChange("");
						e.currentTarget.blur();
					}
				}}
				value={searchTerm}
				ref={inputRef}
				id={id}
			/>
			<Button
				className="hidden w-4 outline-none group-focus-within:inline"
				onPress={() => setSearchTerm("")}
				isDisabled={searchTerm.length === 0}
			>
				<LuX />
			</Button>
			<span className="w-4 rounded-sm border border-white/10 px-1 text-center font-semibold text-slate-400 text-sm group-focus-within:hidden">
				/
			</span>
		</div>
	);
};
