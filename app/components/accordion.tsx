import { useId, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

interface AccordionItemProps {
	title: string;
	description: string;
}

export const AccordionItem = ({ title, description }: AccordionItemProps) => {
	const id = useId();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div
			className="w-full max-w-[65ch] rounded border border-neutral-600 px-4 py-8 text-start"
			aria-expanded={isOpen}
			aria-labelledby={`title-${id}`}
		>
			<button
				className="flex w-full items-center justify-between text-xl font-semibold"
				onClick={() => setIsOpen((val) => !val)}
			>
				<header id={`title-${id}`} aria-describedby={`description-${id}`}>
					{title}
				</header>
				<LuChevronDown
					height={24}
					width={24}
					className={`shrink-0 duration-150 ${isOpen && 'rotate-180'}`}
				/>
			</button>
			<div
				className={`grid ${
					isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
				} duration-150`}
				aria-hidden={!isOpen}
			>
				<div className="overflow-hidden">
					<p className="pt-4" id={`description-${id}`}>
						{description}
					</p>
				</div>
			</div>
		</div>
	);
};
