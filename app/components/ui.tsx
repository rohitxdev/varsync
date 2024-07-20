import { type ComponentProps, type ReactNode, useId, useState } from "react";
import {
	ComboBox as AriaComboBox,
	Modal as AriaModal,
	ModalOverlay as AriaModalOverlay,
	Select as AriaSelect,
	Button,
	DialogTrigger,
	FieldError,
	Input,
	Label,
	ListBox,
	ListBoxItem,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	SelectValue,
	TextField,
} from "react-aria-components";
import { LuChevronDown, LuChevronsUpDown, LuEye, LuEyeOff } from "react-icons/lu";

interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "onInput"> {}

export const Switch = ({ className, ...rest }: SwitchProps) => {
	return (
		<input
			className={`relative isolate box-content h-5 w-10 appearance-none rounded-full bg-neutral-600 p-0.5 before:absolute before:top-0.5 before:left-0.5 before:z-10 before:size-5 before:rounded-full before:bg-white before:duration-100 before:content-[''] checked:bg-blue-600 checked:duration-200 checked:before:translate-x-full ${className}`}
			type="checkbox"
			{...rest}
		/>
	);
};

interface SelectProps extends ComponentProps<typeof AriaSelect> {
	options: ReactNode[];
	placement?: ComponentProps<typeof Popover>["placement"];
	label?: ReactNode;
}

export const Select = ({ options, placement, label, className, ...rest }: SelectProps) => {
	return (
		<AriaSelect className={`mr-auto ${className}`} {...rest}>
			<Label className="text-slate-400 text-xs empty:hidden">{label}</Label>
			<Button className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-white/5 pr-2 pl-3 font-medium *:shrink-0">
				<SelectValue className="w-3/4 overflow-hidden text-ellipsis text-start capitalize" />
				<LuChevronsUpDown className="stroke-[3]" />
			</Button>
			<Popover placement={placement}>
				<ListBox
					className="w-[--trigger-width] rounded-md border border-white/10 bg-dark p-1 font-medium"
					selectionMode="multiple"
				>
					{options.map((item, i) => (
						<ListBoxItem
							className="overflow-hidden text-ellipsis rounded py-1 pr-2 pl-3 capitalize outline-none focus:bg-white/5"
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

interface ComboBoxProps extends ComponentProps<typeof AriaComboBox> {
	options: ReactNode[];
	placement?: ComponentProps<typeof Popover>["placement"];
	label?: ReactNode;
}

export const ComboBox = ({ options, placement, label, className, ...rest }: ComboBoxProps) => {
	return (
		<AriaComboBox className={`mr-auto ${className}`} {...rest}>
			<Label className="text-slate-400 text-xs empty:hidden">{label}</Label>
			<Button className="flex h-9 w-full items-center justify-between rounded-md border border-white/10 font-medium *:shrink-0">
				<Input className="min-w-0 overflow-hidden text-ellipsis bg-transparent px-2 text-start capitalize" />
				<LuChevronsUpDown className="mx-2 stroke-[3]" />
			</Button>
			<Popover className="bg-dark" placement={placement}>
				<ListBox className="w-[--trigger-width] rounded-md border border-white/10 p-1 font-medium">
					{options.map((item, i) => (
						<ListBoxItem
							className="overflow-hidden text-ellipsis rounded py-1 pr-2 pl-3 capitalize outline-none focus:bg-white/5"
							// biome-ignore lint/suspicious/noArrayIndexKey: No way to get a stable key
							key={i}
							id={item?.toString()}
						>
							{item}
						</ListBoxItem>
					))}
				</ListBox>
			</Popover>
		</AriaComboBox>
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
			<AriaModalOverlay className="fixed inset-0 z-50 flex min-h-full items-center justify-center bg-black/60 duration-150">
				<AriaModal
					className={`entering:zoom-in-95 exiting:zoom-out-95 entering:animate-in exiting:animate-out bg-dark shadow-xl outline-none entering:duration-200 exiting:duration-200 entering:ease-out exiting:ease-in *:max-w-[90vw] *:border *:border-white/20 *:bg-white/5 *:outline-none ${className}`}
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
			className="w-full max-w-[65ch] rounded border border-neutral-600 px-4 py-8"
			aria-expanded={isOpen}
			aria-labelledby={`title-${id}`}
		>
			<button
				className="flex w-full items-center justify-between text-start font-semibold text-lg"
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
				className={`grid text-start text-slate-400 ${
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

interface InputFieldProps extends ComponentProps<typeof TextField> {
	label?: ReactNode;
	placeholder?: string;
	isSensitive?: boolean;
}

export const InputField = ({
	className,
	label,
	placeholder,
	isSensitive,
	...rest
}: InputFieldProps) => {
	const [showInput, setShowInput] = useState(!isSensitive);
	return (
		<TextField className="grid gap-1" {...rest}>
			<Label className="text-slate-400 text-xs empty:hidden">{label}</Label>
			<div
				className={`flex h-9 items-center gap-3 rounded font-medium outline outline-white/20 duration-100 focus-within:outline-blue-500/80 ${className}`}
			>
				<Input
					className="w-full bg-transparent px-3 outline-none"
					placeholder={placeholder}
					type={showInput ? "text" : "password"}
				/>
				{isSensitive && (
					<Button
						className="mr-2 flex items-center justify-center text-slate-400 *:size-5"
						onPress={() => setShowInput((val) => !val)}
					>
						{showInput ? <LuEye /> : <LuEyeOff />}
					</Button>
				)}
			</div>
			<FieldError className="text-red-500 text-xs" />
		</TextField>
	);
};

interface MultiButtonProps extends ComponentProps<typeof Button> {
	options: { label: string; content: ReactNode; action: () => void }[];
}

export const MultiButton = ({ options, ...rest }: MultiButtonProps) => {
	return (
		<div className="flex h-9 w-40 items-center divide-x overflow-hidden rounded border bg-blue-500">
			<Button
				className="flex h-full grow items-center justify-center gap-2 font-semibold text-sm outline-none"
				onPress={options[0].action}
			>
				{options[0].content}
			</Button>
			<MenuTrigger>
				<Button className="flex aspect-square h-full items-center justify-center outline-none">
					<LuChevronDown />
				</Button>
				<Popover placement="bottom right">
					<Menu className="w-40 rounded-md border border-white/10 bg-white font-medium">
						{options.slice(1).map((item, i) => (
							<MenuItem
								className="flex h-9 items-center justify-center gap-2 overflow-hidden text-ellipsis rounded pr-2 pl-3 text-black text-sm outline-none focus:bg-neutral-100"
								// biome-ignore lint/suspicious/noArrayIndexKey: No way to get a stable key
								key={i}
								onAction={item.action}
							>
								{item.content}
							</MenuItem>
						))}
					</Menu>
				</Popover>
			</MenuTrigger>
		</div>
	);
};
