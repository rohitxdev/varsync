import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData, useSearchParams } from "@remix-run/react";
import { getUserFromRequest } from "~/utils/auth.server";
import { getLogs } from "~/utils/db.server";
import { DateRangePicker } from "./date-range-picker";
import { z } from "zod";
import { LuCalendar } from "react-icons/lu";
import { QuotaUsage } from "./quota-usage";

const logSchema = z.object({
	projectId: z.string(),
	env: z.string(),
	key: z.string(),
	action: z.enum(["create", "update", "delete"]),
	timestamp: z.date(),
});

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return redirect("/auth/log-in");

	const { searchParams } = new URL(args.request.url);
	const from = searchParams.get("from");
	const to = searchParams.get("to");

	const logs = await getLogs({
		slug: args.params.slug!,
		userId: user._id.toString(),
		from: from ? new Date(from) : new Date(),
		to: to ? new Date(to) : new Date(),
	});
	return { logs };
};

const Route = () => {
	const { logs } = useLoaderData<typeof loader>();
	const [_, setSearchParams] = useSearchParams();

	return (
		<div className="grid size-full max-h-screen grid-rows-[auto_1fr] content-start gap-4 p-6">
			<div className="flex justify-between">
				<h1 className="font-semibold text-4xl">Logs</h1>
				<div className="flex items-center gap-2">
					<LuCalendar className="size-6" />
					<DateRangePicker
						onChange={({ start, end }) => {
							const from = start.toDate("IST").toISOString();
							const to = end.toDate("IST").toISOString();
							setSearchParams((params) => {
								params.set("from", from);
								params.set("to", to);
								return params;
							});
						}}
					/>
				</div>
			</div>
			<div className="grid gap-2 overflow-y-auto rounded border border-white/10 p-2">
				{logs.map((item) => (
					<div className="rounded bg-white/5 px-2 py-1" key={item.timestamp}>
						<span className="mb-2 text-neutral-300 text-sm">{item.message}</span>
						<p className="text-2xs text-slate-400">
							{new Date(item.timestamp).toLocaleString("en-US", {
								timeStyle: "short",
								dateStyle: "medium",
							})}
						</p>
					</div>
				))}
			</div>
			<QuotaUsage usedQuota={100000} quotaLimit={1000000} />
		</div>
	);
};

export default Route;
