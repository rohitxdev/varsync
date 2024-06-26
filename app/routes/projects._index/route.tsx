import type { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ProfileMenu } from "~/components/profile-menu";
import { LuPlus, LuTrash2, LuMoreVertical, LuPencil, LuExternalLink } from "react-icons/lu";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { z } from "zod";
import { createProject, deleteProject, getAllProjects, updateProject } from "~/utils/db.server";
import { getUserFromSessionCookie } from "~/utils/auth.server";
import { useState } from "react";
import { NewProjectDialog, EditProjectDialog, DeleteProjectDialog } from "./dialogs";
import { Modal } from "~/components/ui";
import Spinner from "../../assets/spinner.svg?react";

export const loader = async (args: ActionFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	return { projects: user ? await getAllProjects(user._id.toString()) : [] };
};

const newProjectSchema = z.object({
	name: z.string().min(1),
	envs: z.array(z.string().min(1)).min(1),
});

const editProjectSchema = z.object({
	updatedName: z.string().min(1),
	slug: z.string().min(1),
});

const deleteProjectSchema = z.object({
	slug: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get("Cookie"));
	if (!user) return null;

	const body = await args.request.json();

	switch (args.request.method) {
		case "POST": {
			const { name, envs } = newProjectSchema.parse(body);
			await createProject({ name, envs, userId: user._id.toString() });
			break;
		}
		case "PATCH": {
			const { updatedName, slug } = editProjectSchema.parse(body);
			await updateProject({
				slug,
				updatedName,
				userId: user._id.toString(),
			});
			break;
		}
		case "DELETE": {
			const { slug } = deleteProjectSchema.parse(body);
			await deleteProject({ slug, userId: user._id.toString() });
			break;
		}

		default:
			break;
	}
	return null;
};

const ProjectCard = ({
	id,
	name,
	slug,
	envs,
}: {
	id: string;
	name: string;
	slug: string;
	envs: string[];
}) => {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	return (
		<div
			className="flex w-64 items-center gap-4 rounded border border-white/10 bg-white/10 p-4 duration-100"
			key={id}
		>
			<a
				className="group flex items-start gap-2 overflow-hidden text-ellipsis py-1 font-semibold text-lg leading-none underline-offset-4 hover:underline"
				href={`/projects/${slug}/${envs[0]}`}
			>
				<span>{name}</span>
				<LuExternalLink className="hidden size-3 group-hover:block" />
			</a>
			<MenuTrigger>
				<Button className="ml-auto" aria-label="Menu">
					<LuMoreVertical />
				</Button>
				<Popover placement="bottom end">
					<Menu className="w-24 overflow-hidden rounded-md bg-neutral-100 font-medium text-black text-sm outline-none *:flex [&_svg]:size-4 [&_svg]:shrink-0 *:cursor-pointer *:items-center *:gap-2 [&_*:focus-visible]:bg-neutral-200 *:p-2 [&_*]:outline-none">
						<MenuItem onAction={() => setIsEditModalOpen(true)}>
							<LuPencil /> Edit
						</MenuItem>
						<MenuItem className="text-red-500" onAction={() => setIsDeleteModalOpen(true)}>
							<LuTrash2 /> Delete
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
			<Modal
				dialog={<EditProjectDialog projectName={name} slug={slug} />}
				isOpen={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
			/>
			<Modal
				dialog={<DeleteProjectDialog projectName={name} slug={slug} />}
				isOpen={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
			/>
		</div>
	);
};

const Route = () => {
	const { projects } = useLoaderData<typeof loader>();
	const { state } = useNavigation();

	return (
		<div className="p-6">
			<nav className="flex items-center justify-between">
				<h1 className="font-semibold text-4xl">My Apps</h1>
				<ProfileMenu />
			</nav>
			<Modal dialog={<NewProjectDialog />}>
				<Button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-sm text-white">
					<LuPlus className="size-4 stroke-[3]" /> New App
				</Button>
			</Modal>
			{state === "loading" && <Spinner className="size-8 fill-current" />}
			<div className="mt-6 flex gap-4">
				{projects.map((item) => (
					<ProjectCard
						name={item.name}
						slug={item.slug}
						id={item._id}
						envs={Object.keys(item.variables)}
						key={item._id}
					/>
				))}
			</div>
		</div>
	);
};

export default Route;
