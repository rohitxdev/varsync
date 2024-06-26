import { useFetcher } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { LuX, LuPlus, LuAlertCircle } from "react-icons/lu";
import { Button, Dialog, Label, Heading, TextField, Input } from "react-aria-components";
import toast from "react-hot-toast";
import Spinner from "~/assets/spinner.svg?react";

export const NewProjectDialog = () => {
	const [envs, setEnvs] = useState<string[]>(["development", "production"]);
	const [text, setText] = useState("");
	const [showInput, setShowInput] = useState(false);
	const [name, setName] = useState("");
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
		<Dialog className="rounded bg-neutral-100 p-6 font-medium text-black">
			{({ close }) => (
				<fetcher.Form
					className="grid w-96 gap-2"
					onSubmit={async (e) => {
						e.preventDefault();
						fetcher.submit(
							{ name, envs },
							{ method: "POST", encType: "application/json" },
						);
						closeFn.current = close;
					}}
				>
					<Heading className="text-lg font-semibold">Add new project</Heading>
					<TextField className="grid gap-1" isRequired>
						<Label className="text-xs text-neutral-600">Name</Label>
						<Input
							className="rounded border px-2 py-1"
							value={name}
							onInput={(e) => setName(e.currentTarget.value)}
						/>
					</TextField>
					<div className="grid gap-1">
						<Label className="text-xs text-neutral-600">Environments</Label>
						<div className="flex flex-wrap gap-1 text-sm [&_svg]:stroke-[3]">
							{envs.map((item, i) => (
								<div
									className={`flex h-8 items-center gap-1 rounded-full bg-blue-100 px-3 text-blue-600 ${envs.length === 1 && "cursor-not-allowed opacity-50"}`}
									key={item}
								>
									<span>{item}</span>
									<Button
										onPress={() =>
											setEnvs((items) =>
												items.filter((_item, idx) => idx !== i),
											)
										}
										isDisabled={envs.length === 1}
									>
										<LuX />
									</Button>
								</div>
							))}
							{showInput ? (
								<div className="flex overflow-hidden rounded-full border border-black">
									<input
										className="rounded-l-full bg-transparent px-2 py-1"
										type="text"
										onInput={(e) => setText(e.currentTarget.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && text) {
												setEnvs((items) => [...items, text.trim()]);
												setText("");
											}
										}}
										value={text}
									/>
									<Button
										className="rounded-r-full px-2 py-1"
										onPress={() => setShowInput(false)}
									>
										<LuX />
									</Button>
								</div>
							) : (
								<Button
									className="size-8 rounded-full bg-blue-100 text-blue-600 *:mx-auto"
									onPress={() => setShowInput(true)}
								>
									<LuPlus />
								</Button>
							)}
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-4 text-sm font-semibold *:w-24">
						<Button className="rounded bg-neutral-300 py-2" onPress={close}>
							Cancel
						</Button>
						<Button
							className="flex h-9 w-32 items-center justify-center rounded bg-blue-500 text-white disabled:brightness-90"
							type="submit"
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Add"
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
}

export const EditProjectDialog = ({ projectName, slug }: EditProjectDialogProps) => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Updated project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded bg-neutral-100 p-6 font-medium text-black">
			{({ close }) => (
				<fetcher.Form
					className="w-80"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit(
							{ slug, updatedName: name },
							{ method: "PATCH", encType: "application/json" },
						);
						closeFn.current = close;
					}}
				>
					<Heading className="text-lg font-semibold">Edit Project</Heading>
					<p className="mt-1 text-sm text-neutral-500">Update project name</p>
					<TextField
						className="group mt-4 flex flex-col gap-1"
						onChange={setName}
						isInvalid={name === projectName}
						isRequired
					>
						<Label className="text-sm">Enter the name of the project</Label>
						<Input className="rounded border px-2 py-1 invalid:outline-red-500" />
						<p
							className="invisible flex items-center gap-1 text-xs text-red-500 group-invalid:visible"
							aria-label="Error"
						>
							<LuAlertCircle />
							<span>New name cannot be the old name</span>
						</p>
					</TextField>
					<div className="mt-4 flex justify-end gap-4 text-sm font-semibold *:h-9 *:w-32">
						<Button className="rounded bg-neutral-300" onPress={close}>
							Cancel
						</Button>
						<Button
							className="flex items-center justify-center rounded bg-blue-500 text-white disabled:brightness-90"
							type="submit"
							isDisabled={fetcher.state === "submitting"}
						>
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

interface DeleteProjectDialogProps {
	projectName: string;
	slug: string;
}

export const DeleteProjectDialog = ({ projectName, slug }: DeleteProjectDialogProps) => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Deleted project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="w-96 rounded bg-neutral-100 p-6 font-medium text-black">
			{({ close }) => (
				<fetcher.Form
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit({ slug }, { method: "DELETE", encType: "application/json" });
						closeFn.current = close;
					}}
				>
					<Heading className="text-lg font-semibold">Delete Project</Heading>
					<p className="mt-1 text-sm text-neutral-500">
						This project and all its environments will be deleted. This action cannot be
						undone.
					</p>
					<TextField
						className="group mt-4 flex flex-col gap-1"
						onChange={setName}
						isInvalid={name.length > 0 && name !== projectName}
						isRequired
					>
						<Label className="text-xs font-normal">
							Please type <span className="font-semibold">{projectName}</span> to
							confirm.
						</Label>
						<Input className="rounded border px-2 py-1 invalid:outline-red-500" />
						<p
							className="invisible flex items-center gap-1 text-xs text-red-500 group-invalid:visible"
							aria-label="Error"
						>
							<LuAlertCircle />
							<span>Project name must match</span>
						</p>
					</TextField>
					<div className="mt-4 flex justify-end gap-4 text-sm font-semibold *:h-9 *:w-32">
						<Button className="rounded bg-neutral-300" onPress={close}>
							Cancel
						</Button>
						<Button
							className="flex items-center justify-center rounded bg-red-500 text-white disabled:brightness-90"
							type="submit"
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Delete"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};
