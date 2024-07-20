import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Dialog, Heading, Tab, TabList, TabPanel, Tabs, TextArea } from "react-aria-components";
import { LuAlertTriangle, LuUpload } from "react-icons/lu";
import { z } from "zod";
import LockIcon from "~/assets/lock.svg?react";
import { Button } from "~/components/buttons";
import { showToast } from "~/components/toast";
import { InputField } from "~/components/ui";
import { useMasterPassword } from "~/utils/contexts";
import { pbkdf2Hash } from "~/utils/crypto.client";
import { useProject, useRootLoader } from "~/utils/hooks";
import { actionResponseSchema } from "~/utils/misc";

interface DeleteVariableDialogProps {
	name: string;
	onAction?: () => void;
}

export const DeleteVariableDialog = ({ name, onAction }: DeleteVariableDialogProps) => (
	<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
		{({ close }) => (
			<>
				<Heading className="font-semibold text-xl">Delete {name}?</Heading>
				<p className="text-neutral-300 text-sm">
					It will be deleted from all environments of the project.
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

const toEnvFileContent = (map: z.infer<typeof stringRecordSchema>) => {
	const lines = Object.entries(map).map(([key, value]) => `${key}=${value}`);
	return lines.join("\n");
};

export const ImportVariablesDialog = ({
	onImport,
}: {
	onImport: (map: z.infer<typeof stringRecordSchema>) => void;
}) => {
	const [config, setConfig] = useState<z.infer<typeof stringRecordSchema>>({});
	const [isSyntaxError, setIsSyntaxError] = useState(false);

	return (
		<Dialog className="relative flex w-[60ch] flex-col rounded p-6 text-white outline-none">
			{({ close }) => (
				<Tabs className="flex flex-col gap-4">
					<TabList className="flex w-full text-center *:grow">
						<Tab className="border-blue-500 selected:border-b" id="env">
							ENV
						</Tab>
						<Tab className="border-blue-500 selected:border-b" id="json">
							JSON
						</Tab>
					</TabList>
					<TabPanel id="env">
						<h2 className="font-medium text-sm">Paste your .env file here</h2>
						<TextArea
							className={`min-h-64 w-full resize-none justify-self-stretch rounded border border-white/20 bg-transparent p-2 outline-none ${isSyntaxError ? "border-red-500" : "border-black"}`}
							// value={toEnvFileContent(config)}
							onInput={(e) => setConfig(parseEnvFileContent(e.currentTarget.value))}
							// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
							placeholder={`HELLO=world\nFOO=bar`}
						/>
					</TabPanel>
					<TabPanel id="json">
						<h2 className="font-medium text-sm">Paste your JSON file here</h2>
						<TextArea
							className={`min-h-64 w-full resize-none justify-self-stretch rounded border border-white/20 bg-transparent p-2 outline-none ${isSyntaxError ? "border-red-500" : "border-black"}`}
							// value={JSON.stringify(config, null, 2)}
							onInput={(e) => setConfig(JSON.parse(e.currentTarget.value))}
							placeholder={`{\n\thello: "world",\n\tfoo: "bar",\n}`}
						/>
					</TabPanel>
					<div
						className={`flex items-center gap-1 font-medium text-red-500 text-sm ${!isSyntaxError && "invisible"}`}
					>
						<LuAlertTriangle className="size-4" />
						<p>Syntax error</p>
					</div>
					<div className="flex justify-end gap-4 font-semibold text-sm *:w-28">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 font-medium text-white"
							onPress={() => {
								try {
									onImport(config);
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
				</Tabs>
			)}
		</Dialog>
	);
};

interface PromptMasterPasswordDialog {
	onAction: () => void;
}

export const PromptMasterPasswordDialog = (props: PromptMasterPasswordDialog) => {
	const fetcher = useFetcher();
	const project = useProject();
	const { user } = useRootLoader();
	const { setMasterPassword } = useMasterPassword();
	const [text, setText] = useState("");
	const closeFn = useRef<(() => void) | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!fetcher.data) return;
		const data = actionResponseSchema.parse(fetcher.data);
		if (!data) return;
		if (data.success) {
			setMasterPassword(text);
			props.onAction();
			closeFn.current?.();
		} else {
			showToast(data.message, "error");
		}
	}, [fetcher.data, setMasterPassword]);

	return (
		<Dialog className="relative rounded-md p-6 text-white outline-none">
			{({ close }) => (
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						if (!user?.email) return;
						fetcher.submit(
							{
								masterPasswordHash: await pbkdf2Hash(text, user.email),
							},
							{
								action: `/${project.slug}/master-password?verify=true`,
								method: "POST",
								encType: "application/json",
							},
						);
						closeFn.current = close;
					}}
				>
					<LockIcon className="mx-auto size-24" />
					<Heading className="mt-2 text-center font-semibold text-2xl">
						Enter master password
					</Heading>
					<p className="mt-4 mb-2 text-slate-400 text-sm">
						You need to enter your master password for this action.
					</p>
					<InputField onChange={setText} isRequired isSensitive autoFocus />
					<div className="mt-4 flex justify-end gap-4 font-semibold text-sm">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button variant="primary" type="submit">
							Submit
						</Button>
					</div>
				</form>
			)}
		</Dialog>
	);
};
