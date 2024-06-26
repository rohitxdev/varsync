import { useFetcher, useRevalidator } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { Button, Dialog, Heading, Input, Label, TextArea, TextField } from "react-aria-components";
import toast from "react-hot-toast";
import Spinner from "~/assets/spinner.svg?react";
import { LuAlertTriangle, LuUpload } from "react-icons/lu";
import { z } from "zod";
import { Switch } from "~/components/ui";

export const NewFeatureFlagDialog = () => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const [value, setValue] = useState(false);

	return (
		<Dialog>
			{({ close }) => (
				<fetcher.Form
					className="relative flex w-80 flex-col gap-2 rounded-lg bg-neutral-100 p-6 text-black outline-none"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit(
							{ name, value },
							{
								method: "POST",
								encType: "application/json",
							},
						);
						toast.success("Added new feature flag!", {
							position: "top-right",
						});
						close();
					}}
				>
					<Heading className="mb-4 font-semibold">Add new feature flag</Heading>
					<TextField onChange={setName}>
						<Label className="block text-sm font-medium">Name</Label>
						<Input className="w-full rounded bg-neutral-300 p-1" />
					</TextField>
					<div className="mt-2 flex flex-col gap-1 text-sm font-medium">
						<p>Default Value</p>
						<div className="flex items-center gap-2">
							<Switch
								name="value"
								checked={value}
								onChange={() => setValue((val) => !val)}
							/>
							<span className="text-neutral-600">{value ? "TRUE" : "FALSE"}</span>
						</div>
					</div>
					<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
						<Button className="rounded bg-neutral-300 px-6 py-2" onPress={close}>
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

export const NewVariableDialog = () => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const [value, setValue] = useState("");

	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Created project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="grid gap-2 rounded bg-white p-6">
			{({ close }) => (
				<fetcher.Form
					className="grid w-96 gap-3"
					method="POST"
					onSubmit={async (e) => {
						e.preventDefault();
						fetcher.submit(
							{ name, value },
							{ method: "POST", encType: "application/json" },
						);
						closeFn.current = close;
					}}
				>
					<Heading className="text-xl font-semibold">Add new variable</Heading>
					<TextField className="grid gap-1" value={name} onChange={setName} isRequired>
						<Label className="text-sm font-medium text-neutral-400">Name</Label>
						<Input className="rounded border border-black px-2 py-1 text-black" />
					</TextField>
					<TextField className="grid gap-1" value={value} onChange={setValue} isRequired>
						<Label className="text-sm font-medium text-neutral-400">
							Default value
						</Label>
						<Input className="rounded border border-black px-2 py-1 text-black" />
					</TextField>
					<div className="mt-2 flex justify-end gap-4 text-sm font-semibold *:h-9 *:w-32">
						<Button className="rounded bg-neutral-300 text-black" onPress={close}>
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
								"Save"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};

interface EditVariableDialogProps {
	onSave?: () => void;
}

export const EditVariableDialog = ({ onSave }: EditVariableDialogProps) => {
	const fetcher = useFetcher();

	return (
		<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6 text-black">
			{({ close }) => (
				<>
					<Heading className="text-lg font-semibold">Edit variable</Heading>
					<TextField className="flex flex-col gap-2">
						<Label>Name</Label>
						<Input />
					</TextField>
					<TextField className="flex flex-col gap-2">
						<Label>Value</Label>
						<Input />
					</TextField>
					<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
						<Button className="rounded bg-neutral-300 px-6 py-2" onPress={close}>
							Cancel
						</Button>
						<Button
							className="rounded bg-blue-500 px-6 py-2 text-white"
							onPress={() => {
								onSave?.();
								close();
							}}
						>
							Delete
						</Button>
					</div>
				</>
			)}
		</Dialog>
	);
};

interface DeleteVariableDialogProps {
	onDelete?: () => void;
}

export const DeleteVariableDialog = ({ onDelete }: DeleteVariableDialogProps) => (
	<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6 text-black">
		{({ close }) => (
			<>
				<Heading className="text-lg font-semibold">Delete variable</Heading>
				<p className="text-sm text-neutral-600">
					It will be deleted from all environments of the project.
				</p>
				<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
					<Button className="rounded bg-neutral-300 px-6 py-2" onPress={close}>
						Cancel
					</Button>
					<Button
						className="rounded bg-red-500 px-6 py-2 text-white"
						onPress={() => {
							onDelete?.();
							close();
						}}
					>
						Delete
					</Button>
				</div>
			</>
		)}
	</Dialog>
);

const stringRecordSchema = z.record(z.string());

const parseEnvFileContent = (content: string) => {
	const lines = content.trim().split("\n");
	const entries = lines
		.map((item) => {
			const [key, ...values] = item.trim().split("=");
			return [key, values.join("=")];
		})
		.filter((item) => item[1] !== "");

	if (lines.length !== entries.length) {
		throw new Error("Syntax error in pasted content");
	}
	return stringRecordSchema.parse(Object.fromEntries(entries));
};

export const ImportVariablesDialog = ({
	onImport,
}: {
	onImport: (map: z.infer<typeof stringRecordSchema>) => void;
}) => {
	const { revalidate } = useRevalidator();
	const [text, setText] = useState("");
	const [isSyntaxError, setIsSyntaxError] = useState(false);

	return (
		<Dialog className="relative flex w-[60ch] flex-col gap-2 rounded p-6 text-white outline-none">
			{({ close }) => (
				<>
					<h2 className="text-sm font-medium">Paste your .env file here</h2>
					<TextArea
						className={`min-h-64 w-full resize-none justify-self-stretch rounded border border-white/20 bg-transparent p-2 outline-none ${isSyntaxError ? "border-red-500" : "border-black"}`}
						value={text}
						onInput={(e) => setText(e.currentTarget.value)}
					/>
					<div
						className={`flex items-center gap-1 text-sm font-medium text-red-500 ${!isSyntaxError && "invisible"}`}
					>
						<LuAlertTriangle className="size-4" /> <p>Syntax error</p>
					</div>
					<div className="flex justify-end gap-4 text-sm font-semibold *:w-28">
						<Button
							className="rounded bg-neutral-300 px-6 py-2 text-black"
							onPress={close}
						>
							Cancel
						</Button>
						<Button
							className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 font-medium text-white"
							onPress={() => {
								try {
									onImport(parseEnvFileContent(text));
									setIsSyntaxError(false);
									close();
									revalidate();
								} catch (error) {
									setIsSyntaxError(true);
								}
							}}
						>
							Import <LuUpload className="size-4" />
						</Button>
					</div>
				</>
			)}
		</Dialog>
	);
};
