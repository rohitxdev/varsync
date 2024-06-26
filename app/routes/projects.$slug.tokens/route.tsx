import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import toast from "react-hot-toast";
import { LuCopy, LuRefreshCw, LuTrash2, LuMoreVertical } from "react-icons/lu";
import { DeleteAccessTokenDialog } from "./dialogs";
import { addAccessToken, deleteAccessToken, getAccessTokens } from "~/utils/db.server";
import { Modal } from "~/components/ui";
import { getUserFromSessionCookie } from "~/utils/auth.server";
import { useState } from "react";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	if (!user) return null;

	const { slug } = args.params;
	if (!slug) return null;

	return { tokens: await getAccessTokens(slug, user._id.toString()) };
};

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	if (!user) return null;

	const { slug } = args.params;
	if (!slug) return null;

	const env = "development";

	switch (args.request.method) {
		case "POST":
			addAccessToken(slug, env, user._id.toString());
			break;
		case "DELETE": {
			const { token } = await args.request.json();
			deleteAccessToken(slug, token, user._id.toString());
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
					<Menu className="w-24 overflow-hidden rounded-md bg-neutral-100 text-sm font-medium text-black *:flex *:cursor-pointer *:items-center *:gap-2 *:p-2 [&_*:focus-visible]:bg-neutral-200 [&_*]:outline-none [&_svg]:size-4 [&_svg]:shrink-0">
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
						<MenuItem
							className="text-red-500"
							onAction={() => setIsDeleteModalOpen(true)}
						>
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

	return (
		<div className="h-full p-4">
			<h1 className="mb-2 text-2xl font-semibold">Access Tokens</h1>
			<fetcher.Form method="POST">
				<Button
					className="flex items-center gap-2 rounded border border-black p-2"
					type="submit"
					isDisabled={fetcher.state === "submitting"}
				>
					Generate <LuRefreshCw />
				</Button>
			</fetcher.Form>
			<div className="flex w-full max-w-[80ch] flex-col gap-2 rounded p-4 empty:hidden">
				{data?.tokens?.map((token) => (
					<Token key={token} token={token} />
				))}
			</div>
		</div>
	);
};

export default Route;
