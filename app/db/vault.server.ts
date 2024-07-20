import { ObjectId } from "mongodb";
import { projects } from "./projects.server";

export const createProperty = async ({
	name,
	value,
	projectId,
	userId,
}: {
	name: string;
	value: string | boolean;
	projectId: string;
	userId: string;
}) => {
	const project = await projects.findOne({ _id: new ObjectId(projectId), userId });
	if (!project) return;

	const entries = Object.entries(project.envs).map(([key]) => [
		`envs.${key}.properties.${name}`,
		{ value, isEncrypted: false },
	]);
	await projects.updateOne(
		{ _id: new ObjectId(projectId), userId },
		{
			$set: Object.fromEntries(entries),
		},
	);
};

export const updateProperty = async ({
	name,
	value,
	isEncrypted,
	env,
	projectId,
	userId,
}: {
	name: string;
	value: string | boolean;
	isEncrypted: boolean;
	env: string;
	projectId: string;
	userId: string;
}) =>
	await projects.updateOne(
		{
			_id: new ObjectId(projectId),
			userId,
			[`envs.${env}.properties.${name}`]: { $exists: true },
		},
		{
			$set: { [`envs.${env}.properties.${name}`]: { value, isEncrypted } },
		},
	);

export const deleteProperty = async ({
	name,
	projectId,
	userId,
}: {
	name: string;
	env: string;
	projectId: string;
	userId: string;
}) => {
	const _id = new ObjectId(projectId);
	const project = await projects.findOne({ _id, userId });
	if (!project) return;

	const entries = Object.entries(project.envs).map(([key]) => [
		`envs.${key}.properties.${name}`,
		"",
	]);
	await projects.updateOne(
		{ _id: new ObjectId(projectId), userId },
		{
			$unset: Object.fromEntries(entries),
		},
	);
};
