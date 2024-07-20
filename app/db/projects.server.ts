import { ObjectId } from "mongodb";
import { z } from "zod";
import { toSlug } from "~/utils/misc";
import { db } from "./conn.server";

const propertySchema = z.object({
	value: z.string().or(z.boolean()),
	isEncrypted: z.boolean(),
});

const envSchema = z.object({
	color: z.string(),
	properties: z.record(z.string(), propertySchema),
});

const projectSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1).optional(),
	slug: z.string().min(1),
	envs: z.record(z.string(), envSchema),
	userId: z.string().min(1),
	masterPasswordHash: z.string().optional(),
});

export const projects = db.collection<z.infer<typeof projectSchema>>("projects");
await projects.createIndex({ userId: 1 });
await projects.createIndex({ name: 1, userId: 1 }, { unique: true });
// await projects.createIndex({ slug: 1, userId: 1 }, { unique: true });

const getAllProjectsResultSchema = projectSchema
	.omit({ envs: true, userId: true })
	.merge(
		z.object({
			envs: envSchema
				.omit({
					properties: true,
				})
				.array(),
		}),
	)
	.array();

export const getAllProjects = async (userId: string) => {
	const result = await projects
		.aggregate([
			{ $match: { userId } },
			{
				$project: {
					name: 1,
					description: 1,
					slug: 1,
					envs: {
						name: 1,
						slug: 1,
					},
				},
			},
		])
		.toArray();
	return result as z.infer<typeof getAllProjectsResultSchema>;
};
export const getProjectById = async (id: string) =>
	await projects.findOne({ _id: new ObjectId(id) });

export const getProject = async ({ slug, userId }: { slug: string; userId: string }) => {
	const project = await projects.findOne({ slug, userId });
	if (!project) return null;
	return { ...project, _id: project._id.toString() };
};

export const createProject = async ({
	name,
	description,
	envs,
	userId,
}: {
	name: string;
	description?: string;
	envs: string[];
	userId: string;
}) => {
	const envEntries = envs.map((env) => [env, { color: "#00000000", properties: {} }]);
	await projects.insertOne({
		name,
		description,
		slug: toSlug(name),
		envs: Object.fromEntries(envEntries),
		userId,
	});
};

export const updateProject = async ({
	name,
	slug,
	userId,
}: {
	name: string;
	slug: string;
	userId: string;
}) => {
	const project = await projects.findOne({ slug, userId });
	if (!project) return;
	const env = project.envs[0];
	if (!env) return;

	await projects.updateOne({ slug, userId }, { $set: { name: name, slug: toSlug(name) } });
};

export const updateProject2 = async ({
	name,
	slug,
	description,
	userId,
}: {
	name: string;
	slug: string;
	description: string;
	userId: string;
}) => {
	const project = await projects.findOne({ slug, userId });

	if (!project) return;
	await projects.updateOne(
		{ slug, userId },
		{ $set: { name: name, slug: toSlug(name), description } },
	);
};

export const updateProject3 = async (
	slug: string,
	userId: string,
	updates: Record<string, unknown>,
) => {
	const project = await projects.findOne({ slug, userId: userId });

	if (!project) return;
	await projects.updateOne({ slug, userId }, { $set: updates });
};

export const deleteProject = async ({ slug, userId }: { slug: string; userId: string }) => {
	await projects.deleteOne({ slug, userId });
};

export const setMasterPassword = async ({
	slug,
	userId,
	masterPasswordHash,
}: { slug: string; userId: string; masterPasswordHash: string }) => {
	await projects.updateOne({ slug, userId }, { $set: { masterPasswordHash } });
};
