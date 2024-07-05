import { useFetcher } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { LuX, LuPlus } from "react-icons/lu";
import { Dialog, Label, Heading } from "react-aria-components";
import toast from "react-hot-toast";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";

export const NewProjectDialog = () => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [envs, setEnvs] = useState<string[]>(["development", "production"]);
	const [text, setText] = useState("");
	const [showInput, setShowInput] = useState(false);
	const fetcher = useFetcher();

	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Created project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded-lg bg-neutral-100 p-6 font-medium">
			{({ close }) => (
				<fetcher.Form
					className="grid w-96 gap-3"
					onSubmit={async (e) => {
						e.preventDefault();
						fetcher.submit(
							{ name, description, envs },
							{ method: "POST", encType: "application/json" },
						);
						closeFn.current = close;
					}}
				>
					<Heading className="font-semibold text-xl">Create new project</Heading>
					<InputField
						label="Name"
						value={name}
						onInput={(e) => setName(e.currentTarget.value)}
						isRequired
						autoFocus
					/>
					<InputField
						label={
							<>
								Description <span className="text-2xs text-slate-400">(Optional)</span>
							</>
						}
						value={description}
						onInput={(e) => setDescription(e.currentTarget.value)}
						maxLength={150}
					/>
					<div className="grid gap-1">
						<Label className="text-neutral-300 text-xs">Environments</Label>
						<div className="flex flex-wrap gap-1 text-sm [&_svg]:stroke-[3] [&_button]:outline-none">
							{envs.map((item, i) => (
								<div
									className={`flex h-8 items-center gap-2 rounded border border-white/20 px-3 text-white ${envs.length === 1 && "cursor-not-allowed opacity-50"}`}
									key={item}
								>
									<span>{item}</span>
									<Button
										onPress={() => setEnvs((items) => items.filter((_item, idx) => idx !== i))}
										isDisabled={envs.length === 1}
									>
										<LuX />
									</Button>
								</div>
							))}
							{showInput ? (
								<div className="flex overflow-hidden rounded outline outline-1 outline-white/20 focus-within:outline-blue-500/80">
									<input
										className="h-8 bg-transparent px-3 outline-none"
										type="text"
										onInput={(e) => setText(e.currentTarget.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && text) {
												setEnvs((items) => [...items, text.trim()]);
												setText("");
												setShowInput(false);
											}
										}}
										// biome-ignore lint/a11y/noAutofocus: necessary
										autoFocus
										value={text}
									/>
									<Button className="px-2 py-1" onPress={() => setShowInput(false)}>
										<LuX />
									</Button>
								</div>
							) : (
								<Button
									className="size-8 rounded border border-white/20 *:mx-auto"
									onPress={() => setShowInput(true)}
								>
									<LuPlus />
								</Button>
							)}
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-4 font-semibold text-sm *:w-24">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" isDisabled={fetcher.state === "submitting"}>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Create"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};

interface EditProjectDialogProps {
	projectName: string;
	slug: string;
	envs: string[];
}

export const EditProjectDialog = ({
	projectName,
	slug,
	envs: defaultEnvs,
}: EditProjectDialogProps) => {
	const fetcher = useFetcher();
	const [name, setName] = useState(projectName);
	const [envs, setEnvs] = useState<string[]>(defaultEnvs);
	const [text, setText] = useState("");
	const [showInput, setShowInput] = useState(false);
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Updated project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded-lg p-6 font-medium">
			{({ close }) => (
				<fetcher.Form
					className="w-80"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit({ slug, name, envs }, { method: "PATCH", encType: "application/json" });
						closeFn.current = close;
					}}
				>
					<Heading className="font-semibold text-xl">Edit Project</Heading>
					<InputField
						className="group mt-4 mb-2 invalid:outline-1 invalid:outline-red-500"
						onChange={setName}
						isInvalid={name.length === 0}
						isRequired
						defaultValue={projectName}
					/>
					<div className="grid gap-1">
						<Label className="text-neutral-300 text-xs">Environments</Label>
						<div className="flex flex-wrap gap-1 text-sm [&_svg]:stroke-[3] [&_button]:outline-none">
							{envs.map((item, i) => (
								<div
									className={`flex h-8 items-center gap-2 rounded-full bg-white px-3 ${envs.length === 1 && "cursor-not-allowed opacity-50"}`}
									key={item}
								>
									<span>{item}</span>
									<Button
										onPress={() => setEnvs((items) => items.filter((_item, idx) => idx !== i))}
										isDisabled={envs.length === 1}
									>
										<LuX />
									</Button>
								</div>
							))}
							{showInput ? (
								<div className="flex overflow-hidden rounded-full bg-white focus-within:outline">
									<input
										className="h-8 w-32 rounded-l-full bg-transparent px-3 text-black outline-none"
										type="text"
										onInput={(e) => setText(e.currentTarget.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && text) {
												setEnvs((items) => [...items, text.trim()]);
												setText("");
												setShowInput(false);
											}
										}}
										// biome-ignore lint/a11y/noAutofocus: necessary
										autoFocus
										value={text}
									/>
									<Button
										className="rounded-r-full px-2 py-1 text-black"
										onPress={() => setShowInput(false)}
									>
										<LuX />
									</Button>
								</div>
							) : (
								<Button
									className="size-8 rounded-full bg-white text-black *:mx-auto"
									onPress={() => setShowInput(true)}
								>
									<LuPlus />
								</Button>
							)}
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-4 font-semibold text-sm *:h-9 *:w-32">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" isDisabled={fetcher.state === "submitting"}>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Update"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};
