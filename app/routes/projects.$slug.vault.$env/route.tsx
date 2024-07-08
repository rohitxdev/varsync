import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useFetcher, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Input } from "react-aria-components";
import { LuCheck, LuFlag, LuPencil, LuTrash2, LuUpload, LuVariable, LuX } from "react-icons/lu";
import { z } from "zod";
import Void from "~/assets/void.svg?react";
import { Button } from "~/components/buttons";
import { showToast } from "~/components/toast";
import { Modal, Select, Switch } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { addLog, createVariable, deleteVariable, setVariable } from "~/utils/db.server";
import { useProject } from "~/utils/hooks";
import Spinner from "../../assets/spinner.svg?react";
import { DeleteVariableDialog, ImportVariablesDialog } from "./dialogs";
import { SearchBar } from "./search-bar";

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
			await setVariable({
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
			await deleteVariable({
				name,
				env,
				slug,
				userId: user._id.toString(),
			});
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
		setIsEdited(false);
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
				className="mr-auto font-medium text-slate-300 *:rounded-sm *:bg-blue-500/50"
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
							onKeyDown={async (e) => {
								if (e.key === "Enter" && newValue.toString() !== value) {
									await updateVariable({ name, value: newValue });
								}
								if (e.key === "Escape") {
									setIsEdited(false);
								}
							}}
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
								disabled={
									newValue.toString() === value || fetcher.state === "submitting"
								}
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
					<div className="flex items-center gap-3 text-white">
						<Button onPress={() => setIsEdited(true)}>
							<LuPencil />
						</Button>
						<p>{value}</p>
					</div>
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
			<Button className="p-1 text-red-500" onPress={() => setShowDeleteModal(true)}>
				<LuTrash2 />
			</Button>
			<Modal
				dialog={
					<DeleteVariableDialog
						name={name}
						onAction={async () => await deleteVariable(name)}
					/>
				}
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
	const [showInputType, setShowInputType] = useState<"flag" | "variable" | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only on page load
	useEffect(() => {
		if (!envNames.includes(env!)) {
			navigate(`/projects/${slug}/vault/${envNames[0]}`);
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log(fetcher.formData?.get("name"));

		setShowInputType(null);
	}, [fetcher.state]);

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
					<Button
						className="text-sm"
						variant="primary"
						onPress={() => setShowInputType("flag")}
					>
						<LuFlag className="stroke-[3]" />
						Add flag
					</Button>
					<Button
						className="text-sm"
						variant="primary"
						onPress={() => setShowInputType("variable")}
					>
						<LuVariable className="stroke-[3]" />
						Add variable
					</Button>
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
						<Button className="text-sm" variant="secondary">
							<LuUpload />
							Import
						</Button>
					</Modal>
				</div>
				<div className="flex h-full flex-col gap-2 rounded-lg">
					{showInputType && (
						<fetcher.Form
							className="flex items-center justify-between rounded bg-white/5 px-6 py-4 outline outline-blue-500/50"
							onSubmit={(e) => {
								e.preventDefault();
								const formData = new FormData(e.currentTarget);
								fetcher.submit(
									{
										name: formData.get("name")?.toString()!,
										value: showInputType === "flag" ? false : "--",
									},
									{
										method: "POST",
										encType: "application/json",
									},
								);
								showToast(
									showInputType === "flag"
										? "Added new feature flag!"
										: "Added variable successfully",
									"success",
								);
							}}
						>
							<div className="flex items-center rounded border border-white/20 bg-white/10 px-2 py-1">
								<Input
									className="bg-transparent outline-none"
									name="name"
									type="text"
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											setShowInputType(null);
										}
									}}
									autoFocus
									required
								/>
								<div className="flex gap-2">
									<button
										className="flex items-center justify-center"
										onClick={() => setShowInputType(null)}
										type="button"
									>
										<LuX className="size-4" />
									</button>
									<button
										className="flex items-center justify-center disabled:text-neutral-400"
										type="submit"
										disabled={fetcher.state === "submitting"}
									>
										{fetcher.state === "submitting" ? (
											<Spinner className="size-4 fill-white" />
										) : (
											<LuCheck className="size-4" />
										)}
									</button>
								</div>
							</div>
							{showInputType === "flag" ? <LuFlag /> : <LuVariable />}
						</fetcher.Form>
					)}
					{variables.length > 0 ? (
						variables.map(([name, value]) => (
							<Variable
								name={name}
								value={value}
								searchTerm={searchTerm}
								key={name}
							/>
						))
					) : (
						<div className="m-auto text-center">
							<Void className="size-64" />
							<p className="mt-4 text-slate-400 text-sm">
								Stare into the abyss long enough...
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
