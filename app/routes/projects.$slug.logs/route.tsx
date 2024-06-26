import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { getUserFromSessionCookie } from "~/utils/auth.server";
import { getLogs } from "~/utils/db.server";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	if (!user) return redirect("/auth/log-in");

	const logs = await getLogs({
		slug: args.params.slug!,
		userId: user._id.toString(),
	});
	return { logs };
};

const Route = () => {
	const { logs } = useLoaderData<typeof loader>();

	return (
		<div className="grid size-full content-start divide-y-2">
			{logs.map((item) => (
				<div className="flex justify-between p-2" key={item.timestamp}>
					<span>{item.message}</span>
					<small className="text-slate-400">
						{new Date(item.timestamp).toLocaleString("en-US", {
							timeStyle: "short",
							dateStyle: "medium",
						})}
					</small>
				</div>
			))}
		</div>
	);
};

export default Route;
