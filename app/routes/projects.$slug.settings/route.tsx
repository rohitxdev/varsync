import { LuSave, LuTrash2 } from "react-icons/lu";
import { InputField, Modal } from "~/components/ui";
import { DeleteProjectDialog } from "./dialogs";
import { useProject } from "~/utils/hooks";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { deleteProject, updateProject2 } from "~/utils/db.server";
import { getUserFromRequest } from "~/utils/auth.server";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/buttons";
import Spinner from "../../assets/spinner.svg?react";
import { useState } from "react";

const deleteProjectSchema = z.object({
	slug: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return null;

	switch (args.request.method) {
		case "POST": {
			const data = await args.request.formData();
			const { name, description, slug } = Object.fromEntries(data.entries());
			await updateProject2({ name, description, slug, userId: user._id.toString() });
			break;
		}
		case "DELETE": {
			const body = await args.request.json();
			await deleteProject({
				...deleteProjectSchema.parse(body),
				userId: user._id.toString(),
			});
			return redirect("/projects");
		}
		default:
			break;
	}
	return null;
};

export default function Route() {
	const { name, description, slug } = useProject();
	const fetcher = useFetcher();
	const [isModified, setIsModified] = useState(false);

	return (
		<div className="grid size-full content-start gap-4 p-6 [&_label]:text-slate-400 [&_label]:text-sm">
			<h1 className="mb-4 font-semibold text-4xl">Settings</h1>
			<fetcher.Form
				className="grid w-full max-w-[500px] gap-4"
				method="POST"
				onSubmit={() => setIsModified(false)}
			>
				<h2 className="font-semibold text-xl">Project</h2>
				<div className="flex flex-col items-start justify-between gap-4 font-medium">
					<InputField
						className="w-72"
						name="name"
						label="Name"
						defaultValue={name}
						onInput={() => setIsModified(true)}
					/>
					<InputField
						className="w-72"
						name="description"
						label="Description"
						defaultValue={description ?? ""}
						onInput={() => setIsModified(true)}
					/>
				</div>
				<Button
					className="w-28"
					variant="primary"
					name="slug"
					value={slug}
					type="submit"
					isDisabled={!isModified || fetcher.state === "submitting"}
				>
					{fetcher.state === "submitting" ? (
						<Spinner className="size-5 fill-white" />
					) : (
						<>
							Save <LuSave className="size-4" />
						</>
					)}
				</Button>
			</fetcher.Form>
			<div className="grid w-full max-w-[500px] gap-4">
				<h2 className="font-semibold text-xl">Danger</h2>
				<div className="flex items-center justify-between gap-4 font-medium text-red-500">
					<p>Delete project</p>
					<Modal dialog={<DeleteProjectDialog slug={slug} projectName={name} />}>
						<Button className="rounded-lg border border-red-500/10 p-2">
							<LuTrash2 />
						</Button>
					</Modal>
				</div>
			</div>
		</div>
	);
}
