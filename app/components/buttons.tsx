import { type ComponentProps, type ComponentPropsWithRef, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { LuCopy, LuCheck } from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";

interface ButtonProps extends ComponentPropsWithRef<typeof AriaButton> {
	variant?: "primary" | "secondary" | "tertiary";
}

export const Button = ({ variant, className, ...rest }: ButtonProps) => {
	switch (variant) {
		case "primary":
			return (
				<AriaButton
					className={`flex h-9 items-center justify-center gap-2 rounded bg-blue-500 px-6 font-semibold text-white disabled:cursor-not-allowed disabled:brightness-75 ${className}`}
					{...rest}
				/>
			);
		case "secondary":
			return (
				<AriaButton
					className={`flex h-9 items-center justify-center gap-2 rounded bg-white px-6 font-semibold text-black ${className}`}
					{...rest}
				/>
			);
		case "tertiary":
			return (
				<AriaButton
					className={`flex h-9 items-center justify-center gap-2 rounded bg-transparent px-6 font-semibold text-black ${className}`}
					{...rest}
				/>
			);
		default:
			return <AriaButton className={className} {...rest} />;
	}
};

interface CopyButtonProps extends ComponentProps<typeof Button> {
	text: string;
}

export const CopyButton = ({ text, className, isDisabled, onPress, ...rest }: CopyButtonProps) => {
	const [status, setStatus] = useState<"idle" | "copying" | "copied">("idle");
	return (
		<Button
			className={`ml-2 rounded border border-white/10 p-1.5 align-middle outline-none ${className}`}
			onPress={async () => {
				try {
					setStatus("copying");
					await navigator.clipboard.writeText(text);
					setTimeout(() => {
						setStatus("copied");
						setTimeout(() => setStatus("idle"), 1000);
					}, 400);
				} catch {
					setStatus("idle");
				}
			}}
			isDisabled={status !== "idle"}
			{...rest}
		>
			{status === "copying" ? (
				<Spinner className="mx-auto size-4 fill-white" />
			) : status === "copied" ? (
				<LuCheck />
			) : (
				<LuCopy />
			)}
		</Button>
	);
};
