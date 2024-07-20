import { ObjectId } from "mongodb";
import { z } from "zod";
import { db } from "./conn.server";

const apiKeySchema = z.object({
	label: z.string().min(1),
	keyPrefix: z.string().min(1),
	keyHash: z.string().min(1),
	env: z.string().min(1),
	lastUsed: z.string().nullish(),
	projectId: z.string().min(1),
	userId: z.string().min(1),
});

type ApiKey = z.infer<typeof apiKeySchema>;

const apiKeys = db.collection<ApiKey>("apiKeys");
await apiKeys.createIndex({ label: 1, projectId: 1 }, { unique: true });

export const addApiKey = async (args: ApiKey) => await apiKeys.insertOne(args);

export const deleteApiKey = async (id: string, projectId: string) =>
	await apiKeys.deleteOne({ _id: new ObjectId(id), projectId });

export const getAllApiKeys = async (projectId: string, userId: string) =>
	(await apiKeys
		.aggregate([
			{ $match: { projectId, userId } },
			{ $project: { keyHash: 0, projectId: 0, userId: 0 } },
		])
		.toArray()) as (Omit<ApiKey, "keyHash" | "projectId" | "userId"> & { _id: string })[];
