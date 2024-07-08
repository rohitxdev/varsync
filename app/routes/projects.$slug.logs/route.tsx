import { parseDate } from "@internationalized/date";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { getUserFromRequest } from "~/utils/auth.server";
import { getLogs } from "~/utils/db.server";
import { DateRangePicker } from "./date-range-picker";

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

	const url = new URL(args.request.url);
	const from = url.searchParams.get("from");
	const to = url.searchParams.get("to");

	if (!from || !to) {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		url.searchParams.set("from", date.toISOString().split("T")[0]);
		date.setHours(23, 59, 59, 999);
		url.searchParams.set("to", date.toISOString().split("T")[0]);
		return redirect(url.toString());
	}

	const logs = await getLogs({
		slug: args.params.slug!,
		userId: user._id.toString(),
		from: new Date(from),
		to: new Date(to),
	});

	return {
		logs,
		locale: args.request.headers.get("Accept-Language")!.split(",")[0] ?? "en-US",
	};
};

const Route = () => {
	const { logs, locale } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<div className="grid size-full max-h-screen grid-rows-[auto_1fr] content-start gap-4 p-6">
			<div className="flex justify-between">
				<h1 className="font-semibold text-3xl">Logs</h1>
				<DateRangePicker
					onChange={({ start, end }) => {
						setSearchParams((params) => {
							params.set("from", start.toString());
							params.set("to", end.toString());
							return params;
						});
					}}
					defaultValue={{
						start: parseDate(searchParams.get("from")!),
						end: parseDate(searchParams.get("to")!),
					}}
				/>
			</div>
			<div className="grid content-start gap-2 overflow-y-auto rounded border border-white/10 p-2">
				{logs.length > 0 ? (
					logs.map((item) => (
						<div className="rounded bg-white/5 px-3 py-2" key={item.timestamp}>
							<span className="mb-2 text-neutral-300 text-sm">{item.message}</span>
							<p className="text-2xs text-slate-400">
								{new Date(item.timestamp).toLocaleString(locale, {
									timeStyle: "short",
									dateStyle: "medium",
								})}
							</p>
						</div>
					))
				) : (
					<div className="grid place-items-center text-lg">
						<p>No logs here.</p>
					</div>
				)}
			</div>
			{/* <QuotaUsage usedQuota={100000} quotaLimit={1000000} /> */}
		</div>
	);
};

export default Route;
