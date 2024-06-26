import jwt from "jsonwebtoken";
import { MongoClient, ObjectId, type UpdateFilter } from "mongodb";
import { z } from "zod";
import { config } from "./config.server";
import slugify from "slugify";

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

//Projects

const projectSchema = z.object({
	name: z.string(),
	slug: z.string(),
	variables: z.object({}),
	access_tokens: z.array(z.string()),
	userId: z.string(),
});

const projects = db.collection<z.infer<typeof projectSchema>>("projects");
await projects.createIndex({ userId: 1 });
await projects.createIndex({ name: 1, userId: 1 }, { unique: true });

export const getAllProjects = async (userId: string) => await projects.find({ userId }).toArray();

export const getProject = async ({ slug, userId }: { slug: string; userId: string }) =>
	await projects.findOne({ slug, userId });

export const createProject = async ({
	name,
	envs,
	userId,
}: {
	name: string;
	envs: string[];
	userId: string;
}) => {
	const variables: Record<string, Record<string, string | boolean>> = {};
	for (const env of envs) {
		variables[env] = {};
	}
	await projects.insertOne({
		name,
		slug: toSlug(name),
		variables,
		access_tokens: [],
		userId,
	});
};

export const updateProject = async ({
	updatedName,
	slug,
	userId,
}: {
	updatedName: string;
	slug: string;
	userId: string;
}) =>
	await projects.updateOne(
		{ slug, userId },
		{ $set: { name: updatedName, slug: toSlug(updatedName) } },
	);

export const deleteProject = async ({ slug, userId }: { slug: string; userId: string }) =>
	await projects.deleteOne({ slug, userId });

//Access Tokens

export const addAccessToken = async (slug: string, env: string, userId: string) => {
	const token = jwt.sign({ slug, env }, env);
	await projects.updateOne({ slug, userId }, { $push: { access_tokens: token } });
};

export const getAccessTokens = async (slug: string, userId: string) =>
	(await projects.findOne({ slug, userId }))?.access_tokens ?? [];

export const deleteAccessToken = async (slug: string, token: string, userId: string) =>
	await projects.updateOne({ slug, userId }, { $pull: { access_tokens: token } });

//Variables

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
			$set: { [`variables.${env}.${name}`]: value },
		},
	);

export const deleteVariable = async ({
	name,
	env,
	slug,
	userId,
}: {
	name: string;
	env: string;
	slug: string;
	userId: string;
}) => await projects.updateOne({ slug, userId }, { $unset: { [`variables.${env}.${name}`]: "" } });

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

export const getLogs = async ({ slug, userId }: { slug: string; userId: string }) => {
	const project = await getProject({ slug, userId });
	if (!project) return [];
	return await logs
		.find({ projectId: project?._id.toString() }, { sort: { timestamp: -1 } })
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
