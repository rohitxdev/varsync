import { z } from "zod";
import { db } from "./conn.server";
import { getProject } from "./projects.server";

const logSchema = z.object({
	projectId: z.string(),
	env: z.string(),
	message: z.string(),
	timestamp: z.date(),
});

const logs = db.collection<z.infer<typeof logSchema>>("logs");

export const getLogs = async ({
	slug,
	userId,
	from,
	to,
}: {
	slug: string;
	userId: string;
	from?: string;
	to?: string;
}) => {
	const project = await getProject({ slug, userId });
	if (!project) return [];
	if (!from || !to) {
		return logs
			.find({ projectId: project?._id.toString() }, { sort: { timestamp: -1 }, limit: 50 })
			.toArray();
	}
	return await logs
		.find(
			{
				projectId: project?._id.toString(),
				timestamp: { $gte: new Date(from), $lte: new Date(to) },
			},
			{ sort: { timestamp: -1 } },
		)
		.toArray();
};

export const logAction = async ({
	slug,
	env,
	message,
	userId,
}: {
	slug: string;
	env: string;
	message: string;
	userId: string;
}) => {
	const project = await getProject({ slug, userId });
	if (!project) return;
	await logs.insertOne({
		projectId: project._id.toString(),
		env,
		message,
		timestamp: new Date(),
	});
};
