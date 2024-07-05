import jwt from "jsonwebtoken";
import { config } from "./config.server";
import { addKeyToProject, getProjectById } from "./db.server";

export const generateKey = async ({
	projectId,
	envs,
	label,
}: {
	projectId: string;
	envs: string[];
	label: string;
}) => {
	const key = jwt.sign({ sub: projectId, envs, seed: crypto.randomUUID() }, config.JWT_SIGNING_KEY);
	await addKeyToProject({ key, projectId, label });
	return key;
};

export const verifyKey = async (key: string) => {
	try {
		const decodedToken = jwt.verify(key, config.JWT_SIGNING_KEY) as jwt.JwtPayload;
		const projectId = decodedToken?.sub;
		const envs = decodedToken?.envs;
		if (!projectId || !envs) return false;

		const project = await getProjectById(projectId);
		if (!project) return false;
		return project.access_tokens.some((token) => token.key === key);
	} catch (error) {
		return false;
	}
};
