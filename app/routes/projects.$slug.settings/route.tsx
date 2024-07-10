import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "react-aria-components";
import { LuEraser, LuSave, LuSkull } from "react-icons/lu";
import { z } from "zod";
import { Button } from "~/components/buttons";
import { InputField, Modal } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { deleteProject, updateProject3 } from "~/utils/db.server";
import { useProject } from "~/utils/hooks";
import Spinner from "../../assets/spinner.svg?react";
import { DeleteProjectDialog } from "./dialogs";

const deleteProjectSchema = z.object({
	slug: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return null;

	switch (args.request.method) {
		case "POST": {
			const data = await args.request.formData();
			const { slug, ...updates } = Object.fromEntries(data.entries());

			await updateProject3(slug.toString(), user._id.toString(), updates);
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
	const { name, description, slug, envs, envThemes } = useProject();
	const fetcher = useFetcher();
	const [isModified, setIsModified] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const inputs = containerRef.current?.querySelectorAll("input");

		if (!inputs) return;

		const handleInput = () => setIsModified(true);

		for (const input of inputs) {
			input.addEventListener("input", handleInput);
		}

		return () => {
			for (const input of inputs) {
				input.removeEventListener("input", handleInput);
			}
		};
	}, []);

	return (
		<div
			className="grid size-full content-start gap-8 p-6 [&_label]:text-slate-400 [&_label]:text-sm"
			ref={containerRef}
		>
			<h1 className="font-semibold text-4xl">Settings</h1>
			<fetcher.Form
				className="grid w-full max-w-[500px] gap-8"
				method="POST"
				onSubmit={() => setIsModified(false)}
			>
				<div className="grid w-full max-w-[500px] gap-4">
					<h2 className="font-semibold text-xl">Project</h2>
					<div className="flex flex-col items-start justify-between gap-4 font-medium">
						<InputField className="w-72" name="name" label="Name" defaultValue={name} />
						<InputField
							className="w-72"
							name="description"
							label="Description"
							defaultValue={description ?? ""}
						/>
					</div>
				</div>
				<div className="grid w-full max-w-[500px] gap-4">
					<h2 className="font-semibold text-xl">Environment Themes</h2>
					<table className="divide-y divide-white/10 text-start">
						<thead>
							<tr className="text-slate-400 text-sm *:p-4">
								<th>Environment</th>
								<th>Color</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/10 text-center">
							{Object.keys(envs).map((item) => (
								<tr className="*:p-4" key={item}>
									<td>{item}</td>
									<td>
										<Input
											type="color"
											defaultValue={envThemes?.[item]}
											name={`envThemes.${item}`}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex flex-wrap gap-2">
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
					{isModified && (
						<Button
							className="w-28 text-blue-400"
							variant="tertiary"
							type="reset"
							onPress={() => setIsModified(false)}
						>
							Cancel
						</Button>
					)}
				</div>
			</fetcher.Form>
			<div className="grid w-full max-w-[500px] gap-4">
				<h2 className="font-semibold text-xl">Danger</h2>
				<div className="flex items-center justify-between gap-4">
					<div>
						<h3 className="font-medium text-red-500">Reset project</h3>
						<p className="text-slate-400 text-sm">
							This will delete all variables in the project but keep the environments.
						</p>
					</div>
					<Modal dialog={null}>
						<Button className="rounded-lg border border-red-500/10 p-2 text-red-500">
							<LuEraser />
						</Button>
					</Modal>
				</div>
				<div className="flex items-center justify-between gap-4">
					<div>
						<h3 className="font-medium text-red-500">Delete project</h3>
						<p className="text-slate-400 text-sm">
							This will delete the project and all its environments forever.
						</p>
					</div>
					<Modal dialog={<DeleteProjectDialog slug={slug} projectName={name} />}>
						<Button className="rounded-lg border border-red-500/10 p-2 text-red-500">
							<LuSkull />
						</Button>
					</Modal>
				</div>
			</div>
		</div>
	);
}
