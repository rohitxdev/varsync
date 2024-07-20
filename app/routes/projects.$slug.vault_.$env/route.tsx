import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Input } from "react-aria-components";
import { LuCheck, LuFlag, LuUpload, LuVariable, LuX } from "react-icons/lu";
import { z } from "zod";
import Void from "~/assets/void.svg?react";
import { Button } from "~/components/buttons";
import { showToast } from "~/components/toast";
import { Modal, Select } from "~/components/ui";
import { logAction } from "~/db/logs.server";
import { getProject } from "~/db/projects.server";
import { createProperty, deleteProperty, updateProperty } from "~/db/vault.server";
import { getUser } from "~/utils/auth.server";
import { useProject } from "~/utils/hooks";
import { actionResponseSchema } from "~/utils/misc";
import Spinner from "../../assets/spinner.svg?react";
import { ImportVariablesDialog } from "./dialogs";
import { InitVault } from "./init-vault";
import { Property } from "./property";
import { SearchBar } from "./search-bar";

const newPropertyInputSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	value: z.union([z.string().min(1), z.boolean()]),
});

const updatePropertyInputSchema = z.object({
	name: z.string(),
	value: z.union([z.string(), z.boolean()]),
	isEncrypted: z.boolean(),
});

const deletePropertyInputSchema = z.object({
	name: z.string(),
	value: z.union([z.string(), z.boolean()]),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return json({ success: false, message: "Unauthorized" }, { status: 401 });

	const env = args.params.env!;
	const slug = args.params.slug!;
	const body = await args.request.json();
	const project = await getProject({ slug, userId: user._id });
	if (!project) return json({ success: false, message: "Project not found" }, { status: 404 });

	switch (args.request.method) {
		case "POST": {
			const { name, value } = newPropertyInputSchema.parse(body);
			await createProperty({
				name,
				value,
				projectId: project._id,
				userId: user._id,
			});
			await logAction({
				slug,
				env,
				message: `Added new ${typeof value === "string" ? "variable" : "flag"} ${name}`,
				userId: user._id,
			});
			return json(
				{
					success: true,
					message: `Added ${typeof value === "string" ? "variable" : "flag"} successfully`,
				},
				{ status: 201 },
			);
		}
		case "PUT": {
			const { name, value, isEncrypted } = updatePropertyInputSchema.parse(body);
			await updateProperty({
				name,
				value,
				isEncrypted,
				env,
				projectId: project._id,
				userId: user._id,
			});
			await logAction({
				slug,
				env,
				message: `Modified ${typeof value === "string" ? "variable" : "flag"} ${name} in ${env} environment`,
				userId: user._id,
			});
			return json(
				{ success: true, message: "Updated variable successfully" },
				{ status: 200 },
			);
		}
		case "DELETE": {
			const { name, value } = deletePropertyInputSchema.parse(body);
			await deleteProperty({
				name,
				env,
				projectId: project._id,
				userId: user._id,
			});
			await logAction({
				slug,
				env,
				message: `Deleted ${typeof value === "string" ? "variable" : "flag"} ${name}`,
				userId: user._id,
			});
			return json(
				{
					success: true,
					message: `Deleted ${typeof value === "string" ? "variable" : "flag"} successfully`,
				},
				{ status: 200 },
			);
		}
		default:
			break;
	}

	return null;
};

export default function Route() {
	const fetcher = useFetcher();
	const navigate = useNavigate();
	const params = useParams() as { env: string; slug: string };
	const [showInputType, setShowInputType] = useState<"flag" | "variable" | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const regex = new RegExp(searchTerm, "i");

	const project = useProject();
	const envs = Object.entries(project.envs).map(([key, value]) => ({ name: key, ...value }));
	const env = envs.find((item) => item.name === params.env);
	const properties = Object.entries(env?.properties ?? {})
		.map(([key, value]) => ({ name: key, ...value }))
		.filter((item) => regex.test(item.name));

	const envNames = Object.keys(project.envs);

	useEffect(() => {
		const res = actionResponseSchema.safeParse(fetcher.data);

		if (res.success && res.data.success) {
			showToast(res.data.message, "success");
		}
	}, [fetcher.data]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only on page load
	useEffect(() => {
		if (!envNames.includes(params.env)) {
			navigate(`/projects/${params.slug}/vault/${envNames[0]}`);
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setShowInputType(null);
	}, [fetcher.state]);

	if (!env) return null;

	if (!project.masterPasswordHash) {
		return <InitVault />;
	}

	console.log(env);

	return (
		<div className="grid size-full" style={{ backgroundColor: `${env.color}20` }}>
			<div className="flex flex-col gap-2 rounded p-6">
				<div className="mb-4 flex flex-wrap items-center gap-3">
					<Select
						className="w-40"
						placement="top"
						options={envNames}
						defaultSelectedKey={env.name}
						onSelectionChange={(key) =>
							navigate(`/projects/${params.slug}/vault/${key}`)
						}
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
				<div className="flex h-full flex-col gap-2 divide-y-[1px] divide-white/20 rounded-lg">
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
							}}
						>
							<div className="flex items-center rounded border border-white/20 bg-white/10 px-2 py-1">
								<Input
									className="bg-transparent outline-none"
									name="name"
									type="text"
									onKeyDown={(e) => e.key === "Escape" && setShowInputType(null)}
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
					{properties.length > 0 ? (
						properties.map((item) => (
							<Property
								name={item.name}
								value={item.value}
								isEncrypted={item.isEncrypted}
								searchTerm={searchTerm}
								key={item.name}
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
