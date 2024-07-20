import crypto from "node:crypto";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { LuPlus, LuTrash } from "react-icons/lu";
import { z } from "zod";
import { Button } from "~/components/buttons";
import { Modal } from "~/components/ui";
import { addApiKey, deleteApiKey, getAllApiKeys } from "~/db/api-keys.server";
import { getProject } from "~/db/projects.server";
import { getUser } from "~/utils/auth.server";
import KeysScene from "../../assets/keys-scene.svg?react";
import { DeleteApiKeyDialog, NewKeyDialog } from "./dialogs";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return json(null, { status: 401 });

	const project = await getProject({ slug: args.params.slug!, userId: user._id.toString() });
	if (!project) return json(null, { status: 404, statusText: "Project not found" });

	return {
		apiKeys: await getAllApiKeys(project._id.toString(), user._id.toString()),
	};
};

const addApiKeySchema = z.object({
	label: z.string().min(1),
	env: z.string().min(1),
});

const deleteApiKeySchema = z.object({
	id: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return null;

	const { slug } = args.params;
	if (!slug) return null;

	const userId = user._id.toString();
	const project = await getProject({ slug, userId });
	if (!project) return json(null, { status: 404, statusText: "Project not found" });

	const projectId = project._id.toString();
	const formData = await args.request.formData();

	switch (args.request.method) {
		case "POST": {
			const { label, env } = addApiKeySchema.parse(Object.fromEntries(formData));
			const apiKey = crypto.randomBytes(32).toString("base64");
			const salt = crypto.randomBytes(32).toString("base64");
			const apiKeyHash = crypto.scryptSync(apiKey, salt, 64).toString("base64");

			await addApiKey({
				label,
				keyPrefix: apiKey.slice(0, 7),
				keyHash: apiKeyHash + salt,
				env,
				projectId,
				userId,
			});
			return json({ apiKey }, { status: 201, statusText: "Created API key" });
		}
		case "DELETE": {
			const { id } = deleteApiKeySchema.parse(Object.fromEntries(formData));

			await deleteApiKey(id, projectId);
			return json(null, { status: 200, statusText: "Deleted API key" });
		}
		default:
			break;
	}

	return null;
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state === "submitting";

	return (
		<div className="h-full px-8 py-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="mb-2 font-semibold text-3xl">API Keys</h1>
				<Modal dialog={<NewKeyDialog />}>
					<Button
						className="text-sm"
						variant="primary"
						type="submit"
						isDisabled={isSubmitting}
					>
						<LuPlus className="size-5" /> New API Key
					</Button>
				</Modal>
			</div>
			<div className="flex w-full flex-col gap-2 rounded">
				{data?.apiKeys?.length ? (
					<table className="text-center [&_tr]:h-14">
						<thead className="border-white/10 border-b">
							<tr className="text-slate-400 *:font-medium">
								<th>Label</th>
								<th>Key Prefix</th>
								<th>Environment</th>
								<th>Last used</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/10">
							{data.apiKeys.map((item) => (
								<tr key={item?._id}>
									<td>{item.label}</td>
									<td>{item.keyPrefix}</td>
									<td>{item.env}</td>
									<td>
										{item.lastUsed
											? new Date(item.lastUsed).toLocaleString("en-US", {
													dateStyle: "medium",
													timeStyle: "short",
												})
											: "-"}
									</td>
									<td>
										<Modal
											dialog={
												<DeleteApiKeyDialog
													apiKeyLabel={item.label}
													apiKeyId={item._id}
												/>
											}
										>
											<Button className="flex rounded border border-red-500/10 p-1.5 text-red-500">
												<LuTrash />
											</Button>
										</Modal>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="p-6 text-center">
						<KeysScene className="mx-auto w-full max-w-[400px] brightness-90" />
						<p className="text-slate-400 text-sm">No keys yet</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Route;
