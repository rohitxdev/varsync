import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import { Button } from "react-aria-components";
import { LuPlus } from "react-icons/lu";
import { z } from "zod";
import { ProfileMenu } from "~/components/profile-menu";
import { Modal } from "~/components/ui";
import { createProject, deleteProject, getAllProjects, updateProject } from "~/db/projects.server";
import { getUser } from "~/utils/auth.server";
import { NewProjectDialog } from "./dialogs";

export const loader = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return redirect("/auth/log-in");

	return { projects: await getAllProjects(user._id) };
};

const newProjectSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	envs: z.array(z.string().min(1)).min(1),
});

const editProjectSchema = z.object({
	slug: z.string().min(1),
	name: z.string().min(1),
});

const deleteProjectSchema = z.object({
	slug: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return null;

	const body = await args.request.json();

	switch (args.request.method) {
		case "POST": {
			await createProject({ ...newProjectSchema.parse(body), userId: user._id });
			break;
		}
		case "PATCH": {
			await updateProject({ ...editProjectSchema.parse(body), userId: user._id });
			break;
		}
		case "DELETE": {
			await deleteProject({
				...deleteProjectSchema.parse(body),
				userId: user._id,
			});
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
		<div className="p-6">
			<nav className="flex items-center justify-between">
				<h1 className="font-semibold text-4xl">My Projects</h1>
				<ProfileMenu />
			</nav>
			<Modal dialog={<NewProjectDialog />}>
				<Button className="mt-4 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-semibold text-sm text-white">
					<LuPlus className="size-5 stroke-[3]" /> Create Project
				</Button>
			</Modal>
			<div className="mt-6 flex flex-wrap gap-4">
				{projects.map((item) => (
					<Link
						className="group flex h-48 w-80 grow flex-col items-start gap-4 overflow-hidden text-ellipsis rounded-md border border-white/10 bg-white/5 p-4 font-semibold text-lg leading-none duration-100 hover:bg-white/10 sm:grow-0"
						key={item.slug}
						to={{ pathname: `/projects/${item.slug}`, search: `env=${item.envs[0]}` }}
					>
						<p>{item.name}</p>
						<p className="line-clamp-4 overflow-hidden text-ellipsis font-medium text-slate-400 text-xs">
							{item.description}
						</p>
						<p className="mt-auto font-normal text-slate-400 text-sm">
							{item.envs.length}&nbsp;
							{item.envs.length === 1 ? "environment" : "environments"}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
};

export default Route;
