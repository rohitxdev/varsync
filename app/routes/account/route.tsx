import { type ActionFunctionArgs, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { LuSave } from "react-icons/lu";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { updateUserName } from "~/utils/db.server";
import { useRootLoader } from "~/utils/hooks";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return redirect("/");
	return null;
};

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return redirect("/");

	switch (args.request.method) {
		case "POST": {
			const formData = await args.request.formData();
			const name = formData.get("name");
			if (name) {
				await updateUserName(name.toString().trim(), user._id.toString());
			}
			break;
		}
		default:
			break;
	}

	return null;
};

const Route = () => {
	const { user } = useRootLoader();
	const fetcher = useFetcher();
	const [isModified, setIsModified] = useState(false);

	if (!user) return null;

	return (
		<div className="grid p-6">
			<h1 className="mb-4 font-semibold text-4xl">Account</h1>
			<fetcher.Form
				className="flex w-80 flex-col gap-4"
				method="POST"
				onSubmit={() => setIsModified(false)}
			>
				<h2 className="font-semibold text-xl">Profile</h2>
				<InputField
					className="cursor-not-allowed disabled:brightness-75"
					label="Email"
					name="email"
					defaultValue={user.email}
					isDisabled
				/>
				<InputField
					label="Name"
					name="name"
					defaultValue={user.fullName ?? ""}
					onChange={() => setIsModified(true)}
					isRequired
				/>
				<Button
					className="mr-auto text-sm duration-100 disabled:cursor-not-allowed disabled:brightness-50"
					variant="primary"
					type="submit"
					isDisabled={!isModified || fetcher.state === "submitting"}
				>
					Save <LuSave className="size-4" />
				</Button>
			</fetcher.Form>
		</div>
	);
};

export default Route;