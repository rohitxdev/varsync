import { useRouteLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { loader } from '~/routes/$projectId';
const variablesSchema = z.record(z.string(), z.union([z.string(), z.number().int()]));

const envsSchema = z.record(z.string(), variablesSchema);

const projectSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		variables: z.string(),
		access_tokens: z.string(),
	})
	.transform((item) => {
		return {
			...item,
			variables: envsSchema.parse(JSON.parse(item.variables)),
			access_tokens: z.array(z.string()).parse(JSON.parse(item.access_tokens)),
		};
	});

export const useProject = () => {
	const { project } = useRouteLoaderData<typeof loader>('routes/$projectId')!;

	return projectSchema.parse(project);
};
