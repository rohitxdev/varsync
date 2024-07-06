import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useFetcher, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	LuTrash2,
	LuUpload,
	LuMoreVertical,
	LuPencil,
	LuX,
	LuCheck,
	LuFlag,
	LuVariable,
} from "react-icons/lu";
import { addLog, createVariable, deleteVariable, setVariable } from "~/utils/db.server";
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
import { useProject } from "~/utils/hooks";
import {
	DeleteVariableDialog,
	ImportVariablesDialog,
	NewFeatureFlagDialog,
	NewVariableDialog,
} from "./dialogs";
import { Modal, Select, Switch } from "~/components/ui";
import Void from "~/assets/void.svg?react";
import { SearchBar } from "./search-bar";
import { getUserFromRequest } from "~/utils/auth.server";
import { showToast } from "~/components/toast";
import Spinner from "../../assets/spinner.svg?react";

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
	const user = await getUserFromRequest(args.request);
	if (!user) return null;

	const env = args.params.env!;
	const slug = args.params.slug!;
	const body = await args.request.json();

	switch (args.request.method) {
		case "POST": {
			const parsed = newVarsSchema.safeParse(body);
			if (!parsed.success) return null;
			console.log(parsed.data);

			const { name, value } = parsed.data;

			await createVariable({
				slug,
				name,
				value,
				userId: user._id.toString(),
			});
			await addLog({
				slug,
				env,
				message: `Added new ${typeof value === "string" ? "variable" : "feature flag"} ${name}`,
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
				message: `Updated variable ${name}`,
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

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return redirect("/");

	return null;
};

const highlightText = (text: string, searchTerm?: string) => {
	const regex = new RegExp(searchTerm || "", "gi");
	return text.replace(regex, (match) => `<mark>${match}</mark>`);
};

const Variable = ({
	name,
	value,
	searchTerm,
}: {
	name: string;
	value: string | boolean;
	searchTerm?: string;
}) => {
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
		showToast(
			<p className="font-medium">
				Set&nbsp;
				<span className="rounded px-2 py-1 font-bold font-mono">{name}</span>
				&nbsp;to&nbsp;
				<span className="rounded px-2 py-1 font-bold font-mono">{value.toString()}</span>
			</p>,
			"success",
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
		showToast(
			<p>
				Deleted&nbsp;
				<span className="rounded px-2 py-1 font-bold font-mono">{name}</span>
				&nbsp;successfully!
			</p>,
			"success",
		);
	};

	useEffect(() => {
		if (fetcher.state === "idle") {
			setIsEdited(false);
		}
	}, [fetcher.state]);

	return (
		<div className="flex h-14 items-center gap-8 rounded-md bg-white/5 px-6" key={name}>
			<span
				className="mr-auto font-medium *:rounded-sm *:bg-blue-500/50 *:text-white"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: need to escape HTML
				dangerouslySetInnerHTML={{
					__html: highlightText(name, searchTerm),
				}}
			/>
			{typeof value === "string" ? (
				isEdited ? (
					<div className="flex items-center rounded border border-white/20 bg-white/10 px-2 py-1">
						<Input
							className="bg-transparent outline-none"
							value={newValue.toString()}
							onInput={(e) => setNewValue(e.currentTarget.value)}
							autoFocus
						/>
						<div className="flex gap-2">
							<button
								className="flex items-center justify-center"
								onClick={() => setIsEdited(false)}
								type="button"
							>
								<LuX className="size-4" />
							</button>
							<button
								className="flex items-center justify-center disabled:text-neutral-400"
								onClick={() => updateVariable({ name, value: newValue })}
								type="button"
								disabled={newValue.toString() === value || fetcher.state === "submitting"}
							>
								{fetcher.state === "submitting" ? (
									<Spinner className="size-4 fill-white" />
								) : (
									<LuCheck className="size-4" />
								)}
							</button>
						</div>
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
				<Popover
					className="entering:fade-in entering:zoom-in-95 exiting:fade-out exiting:zoom-out-95 entering:animate-in exiting:animate-out fill-mode-forwards"
					placement="bottom end"
				>
					<Menu className="w-24 overflow-hidden rounded-md bg-white font-medium text-black text-sm *:flex *:cursor-pointer *:items-center *:gap-2 *:p-2 [&_*:focus-visible]:bg-neutral-100 [&_*]:outline-none [&_svg]:size-4 [&_svg]:shrink-0">
						{typeof value === "string" && (
							<MenuItem onAction={() => setIsEdited(true)}>
								<LuPencil /> Edit
							</MenuItem>
						)}
						<MenuItem className="text-red-500" onAction={() => setShowDeleteModal(true)}>
							<LuTrash2 /> Delete
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
			<Modal
				dialog={<DeleteVariableDialog onAction={async () => await deleteVariable(name)} />}
				isOpen={showDeleteModal}
				onOpenChange={() => setShowDeleteModal(false)}
			/>
		</div>
	);
};

export default function Route() {
	const fetcher = useFetcher();
	const navigate = useNavigate();
	const { envs } = useProject() as {
		envs: Record<string, Record<string, string | boolean>>;
	};
	const envNames = Object.keys(envs);
	const { env, slug } = useParams() as { env: string; slug: string };

	const [searchTerm, setSearchTerm] = useState("");
	const regex = new RegExp(searchTerm, "i");
	const variables = Object.entries(envs[env] ?? {}).filter(([key]) => regex.test(key));

	// biome-ignore lint/correctness/useExhaustiveDependencies: only on page load
	useEffect(() => {
		if (!envNames.includes(env!)) {
			navigate(`/projects/${slug}/vault/${envNames[0]}`);
		}
	}, []);

	return (
		<div className="grid size-full">
			<div className="flex flex-col gap-2 rounded p-6">
				<div className="mb-4 flex gap-3">
					<Select
						className="w-40"
						placement="top"
						options={envNames}
						defaultSelectedKey={env}
						onSelectionChange={(key) => navigate(`/projects/${slug}/vault/${key}`)}
					/>
					<SearchBar onTextChange={setSearchTerm} />
					<Modal dialog={<NewFeatureFlagDialog />}>
						<Button className="flex h-9 shrink-0 items-center gap-2 rounded bg-blue-600 px-3 font-medium text-sm text-white">
							<LuFlag className="stroke-[3]" />
							Add flag
						</Button>
					</Modal>
					<Modal dialog={<NewVariableDialog />}>
						<Button className="flex h-9 shrink-0 items-center gap-2 rounded bg-blue-600 px-3 font-medium text-sm text-white">
							<LuVariable className="stroke-[3]" />
							Add variable
						</Button>
					</Modal>
					<Modal
						dialog={
							<ImportVariablesDialog
								onImport={(map) => {
									for (const [key, value] of Object.entries(map)) {
										fetcher.submit(
											{ name: key, value },
											{ method: "POST", encType: "application/json" },
										);
									}
								}}
							/>
						}
					>
						<TooltipTrigger delay={500}>
							<Button className="flex h-9 items-center gap-2 rounded bg-neutral-100 px-4 font-medium text-black">
								<LuUpload />
								Import
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
				<div className="flex h-full flex-col gap-2 rounded-lg">
					{variables.length > 0 ? (
						variables.map(([name, value]) => (
							<Variable name={name} value={value} searchTerm={searchTerm} key={name} />
						))
					) : (
						<div className="m-auto text-center">
							<Void className="size-64" />
							<p className="mt-4 text-slate-400 text-sm">Stare into the abyss long enough...</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
