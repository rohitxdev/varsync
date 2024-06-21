import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import { z } from 'zod';

//Database

const mongoClient = new MongoClient(process.env.MONGODB_URL!, {
	connectTimeoutMS: 5000,
	monitorCommands: true,
});

const connectToDb = async () => {
	try {
		await mongoClient.connect();
		console.log('connected to mongodb successfully ✔');
	} catch (error) {
		console.error(error);
		console.error('could not connect to mongodb. Trying again...');
		await connectToDb();
	}
};

await connectToDb();

const db = mongoClient.db('varsync');

//Projects

const projectSchema = z.object({
	name: z.string(),
	variables: z.object({}),
	access_tokens: z.array(z.string()),
});
const projects = db.collection<z.infer<typeof projectSchema>>('projects');

export const getProjects = async () => await projects.find().toArray();

export const getProject = async (id: string) => await projects.findOne({ _id: new ObjectId(id) });

export const addAccessToken = async (projectId: string, env: string) => {
	const token = jwt.sign({ projectId, env }, process.env.JWT_SIGNING_KEY!);
	await projects.updateOne({ _id: new ObjectId(projectId) }, { $push: { access_tokens: token } });
};

export const getAccessTokens = async (projectId: string) =>
	(await projects.findOne({ _id: new ObjectId(projectId) }))?.access_tokens ?? [];

export const deleteAccessToken = async (id: string) =>
	await projects.updateOne({ _id: new ObjectId(id) }, { $pull: { access_tokens: id } });

export const setVariable = async ({
	projectId,
	env,
	name,
	value,
}: {
	projectId: string;
	env: string;
	name: string;
	value: string | boolean;
}) =>
	await projects.updateOne(
		{ _id: new ObjectId(projectId) },
		{
			$set: { [`variables.${env}.${name}`]: value },
		},
	);

export const deleteVariable = async ({
	projectId,
	env,
	name,
}: {
	projectId: string;
	name: string;
	env: string;
}) =>
	await projects.updateOne(
		{ _id: new ObjectId(projectId) },
		{ $unset: { [`variables.${env}.${name}`]: '' } },
	);

export const getEnvs = () => {
	return ['testing', 'staging', 'development', 'production'];
};

export const addProject = async (name: string, envs: string[]) =>
	await projects.insertOne({ name, variables: {}, access_tokens: [] });

//Users

const users = db.collection('users');

export const getUser = (id: string) => users.findOne({ _id: new ObjectId(id) });
