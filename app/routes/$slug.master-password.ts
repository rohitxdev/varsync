import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { getProject, setMasterPassword } from "~/db/projects.server";
import { getUser } from "~/utils/auth.server";

const createMasterPasswordInputSchema = z.object({
	masterPasswordHash: z.string().min(1),
});

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return json({ success: false, message: "Unauthorized" }, { status: 401 });

	const slug = args.params.slug!;
	const project = await getProject({ slug, userId: user._id });
	if (!project) return json({ success: false, message: "Project not found" }, { status: 404 });

	switch (args.request.method) {
		case "POST": {
			const { masterPasswordHash } = createMasterPasswordInputSchema.parse(
				await args.request.json(),
			);
			const { searchParams } = new URL(args.request.url);
			if (searchParams.has("verify")) {
				if (!project.masterPasswordHash)
					return json(
						{ success: false, message: "Master password is not set" },
						{ status: 422 },
					);

				if (masterPasswordHash === project.masterPasswordHash) {
					return json(
						{ success: true, message: "Master password is correct" },
						{ status: 200 },
					);
				}
				return json(
					{ success: false, message: "Master password is incorrect" },
					{ status: 200 },
				);
			}
			await setMasterPassword({
				slug,
				userId: user._id,
				masterPasswordHash,
			});
			return json(
				{ success: true, message: "Master password set successfully" },
				{ status: 201 },
			);
		}

		default:
			break;
	}
	return null;
};
