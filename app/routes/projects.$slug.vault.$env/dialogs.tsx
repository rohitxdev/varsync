import { useState } from "react";
import { Dialog, Heading, TextArea } from "react-aria-components";
import { LuAlertTriangle, LuUpload } from "react-icons/lu";
import { z } from "zod";
import { Button } from "~/components/buttons";

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
