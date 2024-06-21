import { Form, useFetcher, useRevalidator } from '@remix-run/react';
import { useRef, useState } from 'react';
import { Button, Dialog, Label, TextArea, Heading, TextField, Input } from 'react-aria-components';
import toast from 'react-hot-toast';
import {
	LuAlertCircle,
	LuAlertTriangle,
	LuCross,
	LuImport,
	LuInfo,
	LuPlus,
	LuUpload,
	LuX,
} from 'react-icons/lu';
import { z } from 'zod';

const stringRecordSchema = z.record(z.string());

const parseEnvFileContent = (content: string) => {
	const lines = content.trim().split('\n');
	const entries = lines
		.map((item) => {
			const [key, ...values] = item.trim().split('=');
			return [key, values.join('=')];
		})
		.filter((item) => item[1] !== '');

	if (lines.length !== entries.length) {
		throw new Error('Syntax error in pasted content');
	}
	return stringRecordSchema.parse(Object.fromEntries(entries));
};

export const ImportVariablesDialog = ({
	onImport,
}: {
	onImport: (map: z.infer<typeof stringRecordSchema>) => void;
}) => {
	const { revalidate } = useRevalidator();
	const [text, setText] = useState('');
	const [isSyntaxError, setIsSyntaxError] = useState(false);

	return (
		<Dialog className="relative flex w-[60ch] flex-col gap-2 rounded bg-neutral-100 p-6 outline-none">
			{({ close }) => (
				<>
					<h2 className="text-sm font-medium">Paste your .env file here</h2>
					<TextArea
						className={`min-h-64 w-full resize-none justify-self-stretch rounded border p-2 outline-none ${isSyntaxError ? 'border-red-500' : 'border-black'}`}
						value={text}
						onInput={(e) => setText(e.currentTarget.value)}
					></TextArea>
					<div
						className={`flex items-center gap-1 text-sm font-medium text-red-500 ${!isSyntaxError && 'invisible'}`}
					>
						<LuAlertTriangle className="size-4" /> <p>Syntax error</p>
					</div>
					<div className="flex justify-end gap-4 text-sm font-semibold *:w-28">
						<Button className="rounded bg-neutral-300 px-6 py-2" onPress={close}>
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

interface DeleteAccessTokenDialogProps {
	onDelete?: () => void;
}
export const DeleteAccessTokenDialog = ({ onDelete }: DeleteAccessTokenDialogProps) => (
	<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
		{({ close }) => (
			<>
				<Heading className="text-lg font-semibold">Delete access token</Heading>
				<p className="text-sm text-neutral-600">
					Are you sure you want to delete this token? Apps using this token will no longer be able
					to access this project's vault.
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

export const NewProjectDialog = () => {
	const [envs, setEnvs] = useState<string[]>(['development', 'production']);
	const [text, setText] = useState('');
	const [showInput, setShowInput] = useState(false);
	const [name, setName] = useState('');

	return (
		<Dialog className="rounded bg-neutral-100 p-6 font-medium">
			{({ close }) => (
				<form
					className="grid w-96 gap-2"
					onSubmit={async () => {
						await fetch('/?index', { method: 'POST', body: JSON.stringify({ name, envs }) });
						toast.success('Created new project successfully!');
						close();
					}}
				>
					<Heading className="text-lg font-semibold">Add new project</Heading>
					<TextField className="grid gap-1">
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
								<div className="flex h-8 items-center gap-1 rounded-full bg-blue-100 px-3 text-blue-600">
									<span>{item}</span>
									<Button
										onPress={() => setEnvs((items) => items.filter((_item, idx) => idx !== i))}
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
											if (e.key === 'Enter' && text) {
												setEnvs((items) => [...items, text.trim()]);
												setText('');
											}
										}}
										value={text}
										autoFocus
									/>
									<Button className="rounded-r-full px-2 py-1" onPress={() => setShowInput(false)}>
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
						<Button className="rounded bg-blue-500 py-2 text-white" type="submit">
							Add
						</Button>
					</div>
				</form>
			)}
		</Dialog>
	);
};
