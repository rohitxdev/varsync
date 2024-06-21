import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
	Form,
	json,
	useFetcher,
	useLoaderData,
	useSearchParams,
	useRevalidator,
	redirect,
} from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';
import {
	LuPlus,
	LuPen,
	LuX,
	LuTrash2,
	LuCheck,
	LuUpload,
	LuSave,
	LuCalendar,
} from 'react-icons/lu';

import { Switch } from '~/components/switch';
import { deleteVariable, setVariable } from '~/utils/db.server';
import {
	Button,
	ListBox,
	ListBoxItem,
	Dialog,
	TextField,
	Label,
	Input,
	TooltipTrigger,
	Tooltip,
	OverlayArrow,
} from 'react-aria-components';
import { Modal } from '~/components/modal';
import toast from 'react-hot-toast';
import { Select } from '~/components/select';
import { ImportVariablesDialog } from '~/components/dialogs';
import { useProject } from '~/hooks/useProject';

const newVarsSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	value: z.union([z.string().min(1), z.boolean()]),
});

const updateVariableRequest = z.object({
	name: z.string(),
	type: z.enum(['boolean', 'text']),
	value: z.union([z.string(), z.boolean()]),
});

const deleteVariableRequest = z.object({ name: z.string() });

export const action = async (args: ActionFunctionArgs) => {
	const { searchParams } = new URL(args.request.url);
	const env = searchParams.get('env');
	const projectId = args.params.projectId;

	if (!env || !projectId) return null;

	const formData = Object.fromEntries((await args.request.formData()).entries());
	console.log(formData);

	switch (args.request.method) {
		case 'POST': {
			const parsed = newVarsSchema.safeParse(formData);
			if (!parsed.success) return null;

			const { name, value } = parsed.data;

			setVariable({ projectId, env, name, value });
			return json(null, { status: 200 });
		}
		case 'PUT': {
			const { name, value } = updateVariableRequest.parse(formData);
			setVariable({ name, value, env, projectId });
			return null;
		}
		case 'DELETE': {
			const { name } = deleteVariableRequest.parse(formData);
			deleteVariable({ name, env, projectId });
			return null;
		}
		default:
			break;
	}

	return null;
};

const varTypeSchema = z.enum(['boolean', 'text']);

const NewVarDialog = () => {
	const [varType, setVarType] = useState<z.infer<typeof varTypeSchema>>('boolean');

	return (
		<Dialog>
			{({ close }) => (
				<Form
					className="relative flex size-80 flex-col gap-2 rounded-lg bg-neutral-100 px-8 py-4 outline-none"
					method="POST"
					onSubmit={() => {
						toast.success('Added new variable!', { position: 'top-right' });
						close();
					}}
				>
					<Button className="absolute right-0 top-0 p-3" onPress={close}>
						<LuX className="size-5" />
					</Button>
					<h2 className="mb-4 text-center font-medium">Add new variable</h2>
					<TextField name="name">
						<Label className="block text-sm font-medium">Name</Label>
						<Input className="w-full rounded bg-neutral-300 p-1" />
					</TextField>
					<Label className="w-fit text-sm font-medium">
						Type
						<Select
							className="w-28"
							defaultSelectedKey="boolean"
							onSelectionChange={(key) => setVarType(varTypeSchema.parse(key.toString()))}
							name="type"
							options={['boolean', 'text']}
						/>
					</Label>

					{varType === 'boolean' ? (
						<Label className="flex flex-col text-sm font-medium">
							Default Value
							<Switch name="value" />
						</Label>
					) : (
						<TextField name="value">
							<Label className="block text-sm font-medium">Default Value</Label>
							<Input className="w-full rounded bg-neutral-300 p-1" />
						</TextField>
					)}
					<Button
						className="mx-auto mt-4 w-fit rounded bg-green-500 px-6 py-1 font-medium text-white"
						type="submit"
					>
						Save
					</Button>
				</Form>
			)}
		</Dialog>
	);
};

const TextVar = ({
	defaultValue,
	onChange,
}: {
	defaultValue: string;
	onChange?: (val: string) => void;
}) => {
	const [isEdited, setIsEdited] = useState(false);
	const [value, setValue] = useState(defaultValue);

	return (
		<TextField
			className="flex w-44"
			value={value}
			onChange={setValue}
			onKeyUp={(e) => {
				if (e.code !== 'Escape') return;
				setIsEdited(false);
				setValue(defaultValue);
			}}
		>
			<Input
				className={`min-w-0 overflow-hidden text-ellipsis rounded p-1 ${isEdited ? 'bg-neutral-200' : 'text-end'}`}
				disabled={!isEdited}
			/>
			{isEdited ? (
				<>
					<Button
						className="p-1"
						onPress={() => {
							setIsEdited(false);
							setValue(defaultValue);
						}}
					>
						<LuX className="size-5" />
					</Button>
					<Button
						className="p-1"
						onPress={() => {
							setIsEdited(false);
							onChange?.(value);
						}}
					>
						<LuCheck className="size-5" />
					</Button>
				</>
			) : (
				<Button className="p-1" onPress={() => setIsEdited(true)}>
					<LuPen />
				</Button>
			)}
		</TextField>
	);
};

export default function Route() {
	const { id, variables } = useProject();
	const envs = Object.keys(variables);
	const env = envs[0];
	const fetcher = useFetcher();
	const { revalidate } = useRevalidator();
	const [_, setSearchParams] = useSearchParams();
	const [isDeleteable, setIsDeleteable] = useState(false);

	const updateVariable = async ({
		name,
		type,
		value,
	}: {
		name: string;
		type: z.infer<typeof varTypeSchema>;
		value: string | boolean;
	}) => {
		const formData = new FormData();
		formData.set('name', name);
		formData.set('type', type);
		formData.set('value', value.toString());
		await fetch(`/${id}?index&env=${env}`, {
			method: 'PUT',
			body: formData,
		});
		toast.success(
			<p>
				Set&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">{name}</span>
				&nbsp;to&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">
					{value.toString()}
				</span>
				&nbsp;successfully!
			</p>,
			{
				position: 'top-right',
				style: { fontWeight: '500' },
			},
		);
		revalidate();
	};

	const deleteVariable = async (name: string) => {
		const formData = new FormData();
		formData.set('name', name);
		await fetch(`/${id}?index&env=${env}`, {
			method: 'DELETE',
			body: formData,
		});
		toast.success(
			<p>
				Deleted&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">{name}</span>
				&nbsp;successfully!
			</p>,
			{
				position: 'top-right',
				style: { fontWeight: '500' },
			},
		);
		revalidate();
	};

	return (
		<div className="grid size-full content-start">
			<div className="flex w-full flex-col gap-2 rounded p-4">
				<div className="flex">
					<Select
						className="w-40"
						placement="top"
						options={envs}
						defaultSelectedKey={env}
						onSelectionChange={(key) => {
							setSearchParams((val) => {
								val.set('env', key.toString());
								return val;
							});
						}}
					/>
					<Button className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
						Save <LuSave />
					</Button>
					<Modal
						trigger={
							<TooltipTrigger delay={500}>
								<Button className="mr-2 size-8 rounded-md border border-black bg-neutral-100 *:mx-auto">
									<LuPlus />
								</Button>
								<Tooltip className="rounded bg-neutral-300 p-1">
									<OverlayArrow>
										<svg width={8} height={8} viewBox="0 0 8 8">
											<path d="M0 0 L4 4 L8 0" />
										</svg>
									</OverlayArrow>
									<p>Add variable</p>
								</Tooltip>
							</TooltipTrigger>
						}
						dialog={<NewVarDialog />}
					/>
					<Modal
						trigger={
							<TooltipTrigger delay={500}>
								<Button className="mr-2 size-8 rounded-md border border-black bg-neutral-100 *:mx-auto">
									<LuUpload />
								</Button>
								<Tooltip className="rounded bg-neutral-300 p-1">
									<OverlayArrow>
										<svg width={8} height={8} viewBox="0 0 8 8">
											<path d="M0 0 L4 4 L8 0" />
										</svg>
									</OverlayArrow>
									<p>Import variables</p>
								</Tooltip>
							</TooltipTrigger>
						}
						dialog={
							<ImportVariablesDialog
								onImport={(map) => {
									const formData = new FormData();
									const entries = Object.entries(map);
									entries.forEach(([key, value]) => {
										formData.set('name', key);
										formData.set('type', 'text');
										formData.set('value', value);
										fetch('/foo?index&env=development', { method: 'POST', body: formData });
									});
								}}
							/>
						}
					/>

					<Button
						className="size-8 rounded-md border border-black bg-neutral-100"
						onPress={() => setIsDeleteable((val) => !val)}
					>
						<LuTrash2 className="mx-auto" />
					</Button>
				</div>
				<fetcher.Form className="flex flex-col divide-y-[1px] rounded-lg">
					{Object.entries(variables[env])?.map(([key, value]) => (
						<div className="flex gap-16 px-6 py-3" key={key}>
							<span className="mr-auto font-medium">{key}</span>
							{typeof value === 'string' ? (
								<TextVar
									defaultValue={value}
									onChange={async (val) => {
										if (val !== value) {
											await updateVariable({
												name: key,
												type: 'text',
												value: val,
											});
										}
									}}
								/>
							) : (
								<Switch
									defaultChecked={value === 1}
									onChange={async (e) =>
										await updateVariable({
											name: key,
											type: 'boolean',
											value: e.target.checked,
										})
									}
								/>
							)}
							{isDeleteable && (
								<Button onPress={async () => await deleteVariable(key)}>
									<LuTrash2 />
								</Button>
							)}
						</div>
					))}
				</fetcher.Form>
			</div>
		</div>
	);
}
