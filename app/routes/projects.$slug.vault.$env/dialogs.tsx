import { useFetcher } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { Dialog, Heading, TextArea } from "react-aria-components";
import toast from "react-hot-toast";
import Spinner from "~/assets/spinner.svg?react";
import { LuAlertTriangle, LuUpload } from "react-icons/lu";
import { z } from "zod";
import { InputField, Switch } from "~/components/ui";
import { Button } from "~/components/buttons";
import { showToast } from "~/components/toast";

export const NewFeatureFlagDialog = () => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const [value, setValue] = useState(false);
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			closeFn.current();
			showToast("Added new feature flag!", "success");
		}
	}, [fetcher.state]);

	return (
		<Dialog className="relative flex w-96 flex-col gap-2 rounded-lg bg-dark p-6 outline-none">
			{({ close }) => (
				<fetcher.Form
					className="flex flex-col gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit(
							{ name, value },
							{
								method: "POST",
								encType: "application/json",
							},
						);
						closeFn.current = close;
					}}
				>
					<Heading className="mb-2 font-semibold text-xl">Add new feature flag</Heading>
					<InputField label="Name" onChange={setName} autoFocus isRequired />
					<div className="mt-2 flex flex-col gap-1 font-medium text-sm">
						<p className="text-slate-400 text-xs">Default value</p>
						<div className="flex items-center gap-4">
							<Switch
								name="value"
								checked={value}
								onChange={() => setValue((val) => !val)}
							/>
							<span className="font-semibold">{value ? "True" : "False"}</span>
						</div>
					</div>
					<div className="mt-4 flex justify-end gap-4 font-semibold text-sm">
						<Button className="w-24" variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="w-24"
							variant="primary"
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
			closeFn.current();
			showToast("Added variable successfully", "success");
		}
	}, [fetcher.state]);

	return (
		<Dialog className="relative flex flex-col gap-2 rounded-lg bg-dark p-6 outline-none">
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
					<Heading className="font-semibold text-xl">Add new variable</Heading>
					<InputField label="Name" onChange={setName} autoFocus isRequired />
					<InputField label="Default value" onChange={setValue} />
					<div className="mt-4 flex justify-end gap-4 font-semibold text-sm *:h-9 *:w-32">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							variant="primary"
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

interface DeleteVariableDialogProps {
	onAction?: () => void;
}

export const DeleteVariableDialog = ({ onAction }: DeleteVariableDialogProps) => (
	<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
		{({ close }) => (
			<>
				<Heading className="font-semibold text-xl">Delete variable</Heading>
				<p className="text-neutral-300 text-sm">
					It will be deleted from all envs of the project.
				</p>
				<div className="mt-2 flex justify-end gap-4 font-semibold text-sm">
					<Button variant="secondary" onPress={close}>
						Cancel
					</Button>
					<Button
						className="bg-red-500"
						variant="primary"
						onPress={() => {
							onAction?.();
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
	const [text, setText] = useState("");
	const [isSyntaxError, setIsSyntaxError] = useState(false);

	return (
		<Dialog className="relative flex w-[60ch] flex-col gap-2 rounded p-6 text-white outline-none">
			{({ close }) => (
				<>
					<h2 className="font-medium text-sm">Paste your .env file here</h2>
					<TextArea
						className={`min-h-64 w-full resize-none justify-self-stretch rounded border border-white/20 bg-transparent p-2 outline-none ${isSyntaxError ? "border-red-500" : "border-black"}`}
						value={text}
						onInput={(e) => setText(e.currentTarget.value)}
						// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
						placeholder={`HELLO=world\nFOO=bar`}
					/>
					<div
						className={`flex items-center gap-1 font-medium text-red-500 text-sm ${!isSyntaxError && "invisible"}`}
					>
						<LuAlertTriangle className="size-4" /> <p>Syntax error</p>
					</div>
					<div className="flex justify-end gap-4 font-semibold text-sm *:w-28">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 font-medium text-white"
							onPress={() => {
								try {
									onImport(parseEnvFileContent(text));
									setIsSyntaxError(false);
									close();
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
