import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import toast from "react-hot-toast";
import { LuCopy, LuTrash2, LuMoreVertical, LuPlus, LuTrash } from "react-icons/lu";
import { DeleteAccessTokenDialog, NewKeyDialog } from "./dialogs";
import { Modal } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { useState } from "react";
import { Button, CopyButton } from "~/components/buttons";
import { z } from "zod";
import { generateKey } from "~/utils/keys.server";
import { getAllKeys } from "~/utils/db.server";
import KeysScene from "../../assets/keys-scene.svg?react";

const apiKeySchema = z.object({
	_id: z.string(),
	label: z.string().min(1),
	key: z.string().min(1),
	lastUsed: z.string().min(1),
});

export const loader = async (args: LoaderFunctionArgs) => {
	const { searchParams } = new URL(args.request.url);
	const env = searchParams.get("env");
	if (!env) return json(null, { status: 400, statusText: "Missing env param" });

	const user = await getUserFromRequest(args.request);
	if (!user) return json(null, { status: 401 });

	const { slug } = args.params;
	if (!slug) return json(null, { status: 400, statusText: "Missing slug param" });

	return {
		keys: await getAllKeys(slug, user._id.toString()),
	};
};

export const action = async (args: ActionFunctionArgs) => {
	const { searchParams } = new URL(args.request.url);
	const env = searchParams.get("env");
	if (!env) return null;

	const user = await getUserFromRequest(args.request);
	if (!user) return null;

	const { slug } = args.params;
	if (!slug) return null;

	switch (args.request.method) {
		case "POST": {
			const { projectId, envs, label } = await args.request.json();
			generateKey({ projectId, envs, label });
			break;
		}
		case "DELETE": {
			const { token } = await args.request.json();
			// deleteAccessToken(slug, token, user._id.toString());
			break;
		}
		default:
			break;
	}

	return null;
};

const Token = ({ token }: { token: string }) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	return (
		<div className="flex gap-2 rounded bg-white/10 px-4 py-2" key={token}>
			<p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">{token}</p>
			<MenuTrigger>
				<Button aria-label="Menu">
					<LuMoreVertical />
				</Button>
				<Popover placement="bottom end">
					<Menu className="w-24 overflow-hidden rounded-md bg-neutral-100 font-medium text-black text-sm *:flex [&_svg]:size-4 [&_svg]:shrink-0 *:cursor-pointer *:items-center *:gap-2 [&_*:focus-visible]:bg-neutral-200 *:p-2 [&_*]:outline-none">
						<MenuItem
							onAction={() =>
								toast.promise(navigator.clipboard.writeText(token), {
									loading: "Copying to clipboard...",
									success: "Copied to clipboard!",
									error: "Failed to copy to clipboard",
								})
							}
						>
							<LuCopy /> Copy
						</MenuItem>
						<MenuItem className="text-red-500" onAction={() => setIsDeleteModalOpen(true)}>
							<LuTrash2 /> Delete
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
			<Modal
				dialog={<DeleteAccessTokenDialog token={token} />}
				isOpen={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
			/>
		</div>
	);
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state === "submitting";

	return (
		<div className="h-full p-4">
			<h1 className="mb-2 font-semibold text-2xl">Keys</h1>
			<Modal dialog={<NewKeyDialog />}>
				<Button className="text-sm" variant="primary" type="submit" isDisabled={isSubmitting}>
					<LuPlus className="size-5" /> New Key
				</Button>
			</Modal>
			<div className="flex w-full max-w-[80ch] flex-col gap-2 rounded empty:hidden">
				<table className="text-center [&_tr]:h-14">
					<thead className="border-white/10 border-b">
						<tr className="text-slate-400 *:font-medium">
							<th>Label</th>
							<th>Key</th>
							<th>Last used</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/10">
						{data?.keys.map((item) => (
							<tr key={item?._id}>
								<td>{item.label}</td>
								<td>
									<span>{item.key.slice(0, 8)}</span>
									<span>****************</span>
									<CopyButton className="ml-2 p-1 align-middle" text={item.key} />
								</td>
								<td>
									{new Date(item.lastUsed).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</td>
								<td>
									<Button className="flex rounded border border-red-500/10 p-1.5 text-red-500">
										<LuTrash />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{data?.keys.length === 0 && (
					<div className="p-6 text-center">
						<KeysScene className="mx-auto w-1/2" />
						<p className="text-slate-400 text-sm">No keys yet</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Route;
