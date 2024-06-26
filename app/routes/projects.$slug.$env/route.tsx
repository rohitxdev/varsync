import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LuPlus, LuTrash2, LuUpload, LuMoreVertical, LuPencil, LuSave } from "react-icons/lu";
import { addLog, deleteVariable, setVariable } from "~/utils/db.server";
import {
	Button,
	TooltipTrigger,
	Tooltip,
	OverlayArrow,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	Input,
} from "react-aria-components";
import toast from "react-hot-toast";
import { useProject } from "~/utils/hooks";
import { getUserFromSessionCookie } from "~/utils/auth.server";
import {
	DeleteVariableDialog,
	ImportVariablesDialog,
	NewFeatureFlagDialog,
	NewVariableDialog,
} from "./dialogs";
import { Modal, Select, Switch } from "~/components/ui";
import Spinner from "~/assets/spinner.svg?react";

const newVarsSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	value: z.union([z.string().min(1), z.boolean()]),
});

const updateVariableRequest = z.object({
	name: z.string(),
	value: z.union([z.string(), z.boolean()]),
});

const deleteVariableRequest = z.object({ name: z.string() });

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	if (!user) return null;

	const env = args.params.env!;
	const slug = args.params.slug!;
	const body = await args.request.json();

	switch (args.request.method) {
		case "POST": {
			const parsed = newVarsSchema.safeParse(body);
			if (!parsed.success) return null;

			const { name, value } = parsed.data;

			await setVariable({
				slug,
				env,
				name,
				value,
				userId: user._id.toString(),
			});
			await addLog({
				slug,
				env,
				message: `Added new ${typeof value === "string" ? "variable" : "feature flag"} ${name} with value ${value}`,
				userId: user._id.toString(),
			});
			return json(null, { status: 200 });
		}
		case "PUT": {
			const { name, value } = updateVariableRequest.parse(body);
			setVariable({
				name,
				value,
				env,
				slug,
				userId: user._id.toString(),
			});

			addLog({
				slug,
				env,
				message: `Set variable ${name} to ${value}`,
				userId: user._id.toString(),
			});
			return null;
		}
		case "DELETE": {
			const { name } = deleteVariableRequest.parse(body);
			deleteVariable({ name, env, slug, userId: user._id.toString() });
			addLog({
				slug,
				env,
				message: `Deleted variable ${name}`,
				userId: user._id.toString(),
			});
			return null;
		}
		default:
			break;
	}

	return null;
};

const Variable = ({ name, value }: { name: string; value: string | boolean }) => {
	const fetcher = useFetcher();
	const [isEdited, setIsEdited] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [newValue, setNewValue] = useState(value);

	const updateVariable = async ({ name, value }: { name: string; value: string | boolean }) => {
		fetcher.submit(
			{ name, value },
			{
				method: "PUT",
				encType: "application/json",
			},
		);
		toast.success(
			<p>
				Set&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">
					{name}
				</span>
				&nbsp;to&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">
					{value.toString()}
				</span>
				&nbsp;successfully!
			</p>,
			{
				position: "top-right",
				style: { fontWeight: "500" },
			},
		);
	};

	const deleteVariable = async (name: string) => {
		fetcher.submit(
			{ name },
			{
				method: "DELETE",
				encType: "application/json",
			},
		);
		toast.success(
			<p>
				Deleted&nbsp;
				<span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-600">
					{name}
				</span>
				&nbsp;successfully!
			</p>,
			{
				position: "top-right",
				style: { fontWeight: "500" },
			},
		);
	};

	useEffect(() => {
		if (fetcher.state === "idle") {
			setIsEdited(false);
		}
	}, [fetcher.state]);

	return (
		<div className="flex gap-16 px-6 py-3" key={name}>
			<span className="mr-auto font-medium">{name}</span>
			{typeof value === "string" ? (
				isEdited ? (
					<div className="flex rounded border border-white/20 bg-white/10 px-2 py-1">
						<Input
							className="bg-transparent outline-none"
							value={newValue.toString()}
							onInput={(e) => setNewValue(e.currentTarget.value)}
						/>
						{fetcher.state === "submitting" ? (
							<Spinner className="size-4 fill-white" />
						) : (
							<button
								className="flex items-center justify-center"
								onClick={() => updateVariable({ name, value: newValue })}
								type="button"
								disabled={newValue.toString() === value}
							>
								<LuSave className="size-4" />
							</button>
						)}
					</div>
				) : (
					<p className="text-slate-400">{value}</p>
				)
			) : (
				<Switch
					defaultChecked={value}
					onChange={async (e) =>
						await updateVariable({
							name: name,
							value: e.target.checked,
						})
					}
				/>
			)}
			<MenuTrigger>
				<Button aria-label="Menu">
					<LuMoreVertical />
				</Button>
				<Popover placement="bottom end">
					<Menu className="w-24 overflow-hidden rounded-md bg-neutral-100 text-sm font-medium text-black *:flex *:cursor-pointer *:items-center *:gap-2 *:p-2 [&_*:focus-visible]:bg-neutral-200 [&_*]:outline-none [&_svg]:size-4 [&_svg]:shrink-0">
						{typeof value === "string" && (
							<MenuItem onAction={() => setIsEdited(true)}>
								<LuPencil /> Edit
							</MenuItem>
						)}
						<MenuItem
							className="text-red-500"
							onAction={() => setShowDeleteModal(true)}
						>
							<LuTrash2 /> Delete
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
			<Modal
				dialog={<DeleteVariableDialog onDelete={async () => await deleteVariable(name)} />}
				isOpen={showDeleteModal}
				onOpenChange={() => setShowDeleteModal(false)}
			/>
		</div>
	);
};

export default function Route() {
	const { variables, slug } = useProject();
	const envs = Object.keys(variables);
	const env = envs[0];
	const navigate = useNavigate();

	return (
		<div className="grid size-full content-start">
			{/* <QuotaUsage usedQuota={400} quotaLimit={10000} /> */}
			<div className="flex w-full flex-col gap-2 rounded p-4">
				<div className="flex gap-2">
					<Select
						className="w-40"
						placement="top"
						options={envs}
						defaultSelectedKey={env}
						onSelectionChange={(key) => navigate(`/projects/${slug}/${key.toString()}`)}
					/>
					<Modal dialog={<NewFeatureFlagDialog />}>
						<Button className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
							<LuPlus />
							Feature flag
						</Button>
					</Modal>
					<Modal dialog={<NewVariableDialog />}>
						<Button className="flex items-center gap-2 rounded bg-purple-700 px-3 py-1.5 text-sm font-medium text-white">
							<LuPlus />
							Variable
						</Button>
					</Modal>
					<Modal
						dialog={
							<ImportVariablesDialog
								onImport={(map) => {
									const formData = new FormData();
									for (const [key, value] of Object.entries(map)) {
										formData.set("name", key);
										formData.set("type", "text");
										formData.set("value", value);
										fetch("/foo?index&env=development", {
											method: "POST",
											body: formData,
										});
									}
								}}
							/>
						}
					>
						<TooltipTrigger delay={500}>
							<Button className="mr-2 size-8 rounded-md border border-black bg-neutral-100 text-black *:mx-auto">
								<LuUpload />
							</Button>
							<Tooltip className="rounded bg-neutral-300 px-2 py-1 text-black">
								<OverlayArrow>
									{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
									<svg width={8} height={8} viewBox="0 0 8 8">
										<path d="M0 0 L4 4 L8 0" />
									</svg>
								</OverlayArrow>
								<p>Import from .env file</p>
							</Tooltip>
						</TooltipTrigger>
					</Modal>
				</div>
				<hr className="mt-4 h-0.5 w-full rounded-full border-none bg-white/30" />
				<div className="flex flex-col divide-y-[1px] rounded-lg">
					{Object.entries(
						(variables as Record<string, Record<string, string | boolean>>)[env],
					).map(([name, value]) => (
						<Variable name={name} value={value} key={name} />
					))}
				</div>
			</div>
		</div>
	);
}
