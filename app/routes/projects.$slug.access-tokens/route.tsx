import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { LuPlus, LuTrash } from "react-icons/lu";
import { DeleteAccessTokenDialog, NewKeyDialog } from "./dialogs";
import { Modal } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { Button, CopyButton } from "~/components/buttons";
import { z } from "zod";
import KeysScene from "../../assets/keys-scene.svg?react";
import { createAccessToken, deleteKey, getAllAccessTokens, getProject } from "~/utils/db.server";

const apiKeySchema = z.object({
	_id: z.string(),
	label: z.string().min(1),
	key: z.string().min(1),
	lastUsed: z.string().min(1),
});

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return json(null, { status: 401 });

	const project = await getProject({ slug: args.params.slug!, userId: user._id.toString() });

	if (!project) return json(null, { status: 404, statusText: "Project not found" });

	return {
		accessTokens: await getAllAccessTokens(project._id.toString(), user._id.toString()),
	};
};

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return null;

	const { slug } = args.params;
	if (!slug) return null;

	const formData = await args.request.formData();

	switch (args.request.method) {
		case "POST": {
			const projectId = formData.get("projectId")?.toString()!;
			const env = formData.get("env")?.toString()!;
			const label = formData.get("label")?.toString()!;
			await createAccessToken({ projectId, env, label, userId: user._id.toString() });
			break;
		}
		case "DELETE": {
			const label = formData.get("label")?.toString()!;
			await deleteKey({ label, slug, userId: user._id.toString() });
			break;
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
				<h1 className="mb-2 font-semibold text-3xl">Access Tokens</h1>
				<Modal dialog={<NewKeyDialog />}>
					<Button
						className="text-sm"
						variant="primary"
						type="submit"
						isDisabled={isSubmitting}
					>
						<LuPlus className="size-5" /> New Access Token
					</Button>
				</Modal>
			</div>
			<div className="flex w-full flex-col gap-2 rounded">
				{data?.accessTokens?.length ? (
					<table className="text-center [&_tr]:h-14">
						<thead className="border-white/10 border-b">
							<tr className="text-slate-400 *:font-medium">
								<th>Label</th>
								<th>Token</th>
								<th>Environment</th>
								<th>Last used</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/10">
							{data.accessTokens.map((item) => (
								<tr key={item?._id}>
									<td>{item.label}</td>
									<td>
										<span className="overflow-hidden">
											{new Array(20).fill("*").join("")}
										</span>
										<span>
											{item.access_token.slice(item.access_token.length - 8)}
										</span>
										<CopyButton
											className="ml-2 p-1 align-middle"
											text={item.access_token}
										/>
									</td>
									<td>{item.env}</td>
									<td>
										{item.last_used
											? new Date(item.last_used).toLocaleString("en-US", {
													dateStyle: "medium",
													timeStyle: "short",
												})
											: "-"}
									</td>
									<td>
										<Modal
											dialog={<DeleteAccessTokenDialog token={item.label} />}
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
