import { MongoClient, ObjectId, type UpdateFilter } from "mongodb";
import slugify from "slugify";
import { z } from "zod";
import { config } from "./config.server";
import { generateApiKey } from "./misc";

const toSlug = (text: string) => slugify(text, { lower: true, trim: true });

//Database

const mongoClient = new MongoClient(config.MONGODB_URL, {
	connectTimeoutMS: 5000,
	monitorCommands: true,
});

const connectToDb = async () => {
	try {
		await mongoClient.connect();
		console.log("connected to mongodb successfully ✔");
	} catch (error) {
		console.error(error);
		console.error("could not connect to mongodb. Trying again...");
		await connectToDb();
	}
};

await connectToDb();

const db = mongoClient.db("varsync");

const projectSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1).optional(),
	slug: z.string().min(1),
	envs: z.record(z.record(z.string().or(z.boolean()))),
	default_values: z.record(z.string().or(z.boolean())),
	userId: z.string().min(1),
});

const projects = db.collection<z.infer<typeof projectSchema>>("projects");
await projects.createIndex({ userId: 1 });
await projects.createIndex({ name: 1, userId: 1 }, { unique: true });

export const getAllProjects = async (userId: string) => {
	const res = await projects
		.find({ userId })
		.project({ _id: 1, slug: 1, name: 1, description: 1, envs: 1 })
		.toArray();
	return res.map((item) => ({
		_id: item._id,
		slug: item.slug,
		name: item.name,
		description: item?.description,
		envs: Object.keys(item.envs),
	}));
};

export const getProjectById = async (id: string) =>
	await projects.findOne({ _id: new ObjectId(id) });

export const getProject = async ({ slug, userId }: { slug: string; userId: string }) =>
	await projects.findOne({ slug, userId });

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
	const updatedEnvs: Record<string, Record<string, string | boolean>> = {};
	for (const env of envs) {
		updatedEnvs[env] = {};
	}
	await projects.insertOne({
		name,
		description,
		slug: toSlug(name),
		envs: updatedEnvs,
		default_values: {},
		userId,
	});
};

export const updateProject = async ({
	name,
	slug,
	envs,
	userId,
}: {
	name: string;
	slug: string;
	envs: string[];
	userId: string;
}) => {
	const project = await projects.findOne({ slug, userId });
	if (!project) return;
	await projects.updateOne({ slug, userId }, { $set: { name: name, slug: toSlug(name), envs } });
};

const apiKeySchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	env: z.string().min(1),
	last_used: z.string().nullish(),
	project_id: z.string().min(1),
	user_id: z.string().min(1),
});

const apiKeys = db.collection<z.infer<typeof apiKeySchema>>("api_keys");
await apiKeys.createIndex({ label: 1, project_id: 1 }, { unique: true });

export const createApiKey = async ({
	label,
	env,
	projectId,
	userId,
}: {
	label: string;
	env: string;
	projectId: string;
	userId: string;
}) => {
	const id = new ObjectId();
	return await apiKeys.insertOne({
		key: generateApiKey({ env, projectId }),
		label,
		env,
		project_id: projectId,
		user_id: userId,
		_id: id,
	});
};

export const deleteApiKey = async ({ label, projectId }: { label: string; projectId: string }) =>
	await apiKeys.deleteOne({ label, project_id: projectId });

export const getAllApiKeys = async (projectId: string, userId: string) =>
	await apiKeys.find({ project_id: projectId, user_id: userId }).toArray();

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

export const deleteProject = async ({ slug, userId }: { slug: string; userId: string }) =>
	await projects.deleteOne({ slug, userId });

//Variables

export const createVariable = async ({
	name,
	value,
	slug,
	userId,
}: {
	name: string;
	value: string | boolean;
	slug: string;
	userId: string;
}) => {
	const project = await projects.findOne({ slug, userId });
	if (!project) return;

	const update: Record<string, string | boolean> = {};
	for (const env of Object.keys(project.envs)) {
		update[`envs.${env}.${name}`] = value;
	}
	await projects.updateOne(
		{ slug, userId },
		{
			$set: update,
		},
	);
};

export const setVariable = async ({
	name,
	value,
	env,
	slug,
	userId,
}: {
	name: string;
	value: string | boolean;
	env: string;
	slug: string;
	userId: string;
}) =>
	await projects.updateOne(
		{ slug, userId },
		{
			$set: { [`envs.${env}.${name}`]: value },
		},
	);

export const deleteVariable = async ({
	name,
	slug,
	userId,
}: {
	name: string;
	env: string;
	slug: string;
	userId: string;
}) => {
	const project = await projects.findOne({ slug, userId });
	if (!project) return;

	const update: Record<string, string | boolean> = {};
	for (const env of Object.keys(project.envs)) {
		update[`envs.${env}.${name}`] = "";
	}
	await projects.updateOne({ slug, userId }, { $unset: update });
};

//Users

export const subscriptionPlanSchema = z.enum(["free", "pro"]);

export const roleSchema = z.enum(["user", "admin"]);

export const userSchema = z.object({
	email: z.string().email(),
	passwordHash: z.string().nullish(),
	fullName: z.string().nullish(),
	pictureUrl: z.string().nullish(),
	role: roleSchema,
	subscriptionPlan: subscriptionPlanSchema,
	subscriptionStartDate: z.date().nullish(),
	subscriptionEndDate: z.date().nullish(),
	isBanned: z.boolean(),
	passwordResetToken: z.string().nullish(),
});

const users = db.collection<z.infer<typeof userSchema>>("users");

export const getUser = async (id: string) => await users.findOne({ _id: new ObjectId(id) });

export const getUserByEmail = async (email: string) => await users.findOne({ email });

export const createUser = async (user: z.infer<typeof userSchema>) => {
	const { insertedId } = await users.insertOne(user);
	return insertedId.toString();
};

export const updateUser = async (
	id: string,
	updatedUser: UpdateFilter<z.infer<typeof userSchema>>,
) => await users.updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });

//Logs

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
	from: Date;
	to: Date;
}) => {
	const project = await getProject({ slug, userId });
	if (!project) return [];
	return await logs
		.find(
			{ projectId: project?._id.toString(), timestamp: { $gte: from, $lte: to } },
			{ sort: { timestamp: -1 } },
		)
		.toArray();
};

export const addLog = async ({
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

//Account

export const updateUserName = async (name: string, userId: string) =>
	await users.updateOne({ _id: new ObjectId(userId) }, { $set: { fullName: name } });

//Webhooks

const webhookSchema = z.object({
	label: z.string().min(1),
	url: z.string().min(1),
	method: z.enum(["GET", "POST", "PUT", "DELETE"]),
	on_action: z.enum(["create", "update", "delete"]),
	variable_name: z.string().min(1),
	project_id: z.string().min(1),
	user_id: z.string().min(1),
});

const webhooks = db.collection<z.infer<typeof webhookSchema>>("webhooks");
