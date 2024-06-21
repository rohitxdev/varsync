import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { ProfileMenu } from '~/components/profile-menu';
import { LuPlus } from 'react-icons/lu';
import { Button, Dialog, Heading } from 'react-aria-components';
import { Modal } from '~/components/modal';
import { NewProjectDialog } from '~/components/dialogs';
import { z } from 'zod';
import { addProject, getProjects } from '~/utils/db.server';

const projectSchema = z.object({ id: z.number().int(), name: z.string().min(1) });
const projectsSchema = z.array(projectSchema);

export const loader = (args: LoaderFunctionArgs) => {
	return { projects: projectsSchema.parse(getProjects()) };
};

const newProjectSchema = z.object({ name: z.string().min(1), envs: z.array(z.string().min(1)) });

export const action = async (args: ActionFunctionArgs) => {
	switch (args.request.method) {
		case 'POST': {
			const { name, envs } = newProjectSchema.parse(await args.request.json());
			addProject(name, ['testing', 'staging', 'development', 'production']);
			break;
		}

		default:
			break;
	}
	return null;
};

const Route = () => {
	const { projects } = useLoaderData<typeof loader>();
	return (
		<div className="p-2">
			<nav className="flex items-center justify-between">
				<h1 className="text-4xl font-semibold">My Projects</h1>
				<ProfileMenu />
			</nav>
			<Modal
				trigger={
					<Button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
						<LuPlus className="size-4 stroke-[3]" /> New Project
					</Button>
				}
				dialog={<NewProjectDialog />}
			/>
			<div className="flex gap-4">
				{projects.map((item) => (
					<Link className="border border-black px-4 py-2" to={`/${item.id}/`} key={item.id}>
						{item.name}
					</Link>
				))}
			</div>
		</div>
	);
};

export default Route;
