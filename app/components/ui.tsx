import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { LuChevronDown, LuChevronsUpDown } from "react-icons/lu";
import {
	Select as AriaSelect,
	SelectValue,
	Button,
	Popover,
	ListBox,
	ListBoxItem,
	DialogTrigger,
	ModalOverlay as AriaModalOverlay,
	Modal as AriaModal,
} from "react-aria-components";

interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "onInput"> {}

export const Switch = ({ className, ...rest }: SwitchProps) => {
	return (
		<input
			className={`relative isolate box-content h-5 w-10 appearance-none rounded-full bg-neutral-600 p-1 before:absolute before:left-1 before:top-1 before:z-10 before:size-5 before:rounded-full before:bg-white before:duration-100 before:content-[''] checked:bg-blue-600 checked:duration-200 checked:before:translate-x-full ${className}`}
			type="checkbox"
			{...rest}
		/>
	);
};

interface SelectProps extends ComponentProps<typeof AriaSelect> {
	options: ReactNode[];
	placement?: ComponentProps<typeof Popover>["placement"];
}

export const Select = ({ options, placement, className, ...rest }: SelectProps) => {
	return (
		<AriaSelect className={`mr-auto ${className}`} {...rest}>
			<Button className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-black bg-white/10 px-2 pl-3 text-sm font-medium *:shrink-0">
				<SelectValue className="w-3/4 overflow-hidden text-ellipsis text-start capitalize" />
				<LuChevronsUpDown className="stroke-[3]" />
			</Button>
			<Popover placement={placement}>
				<ListBox className="w-[--trigger-width] rounded-md border border-black bg-slate-800 p-1 text-sm font-medium">
					{options.map((item, i) => (
						<ListBoxItem
							className="overflow-hidden text-ellipsis rounded p-1 capitalize outline-none focus:bg-white/10"
							// biome-ignore lint/suspicious/noArrayIndexKey: No way to get a stable key
							key={i}
							id={item?.toString()}
						>
							{item}
						</ListBoxItem>
					))}
				</ListBox>
			</Popover>
		</AriaSelect>
	);
};

interface ModalProps extends ComponentProps<typeof AriaModal> {
	children?: ReactNode;
	dialog: ReactNode;
}

export const Modal = ({
	children,
	dialog,
	className,
	isOpen,
	onOpenChange,
	...rest
}: ModalProps) => {
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			{children}
			<AriaModalOverlay className="fixed inset-0 flex min-h-full items-center justify-center bg-black/60 duration-150">
				<AriaModal
					className={`bg-navy-blue shadow-xl outline-none duration-150 *:max-w-[90vw] *:border *:border-white/20 *:bg-white/5 *:outline-none entering:scale-95 entering:ease-out ${className}`}
					{...rest}
				>
					{dialog}
				</AriaModal>
			</AriaModalOverlay>
		</DialogTrigger>
	);
};

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
				type="button"
				onClick={() => setIsOpen((val) => !val)}
			>
				<header id={`title-${id}`} aria-describedby={`description-${id}`}>
					{title}
				</header>
				<LuChevronDown
					height={24}
					width={24}
					className={`shrink-0 duration-150 ${isOpen && "rotate-180"}`}
				/>
			</button>
			<div
				className={`grid ${
					isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
