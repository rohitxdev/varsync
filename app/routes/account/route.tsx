import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { LuSave } from "react-icons/lu";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";
import { updateUserName } from "~/db/user.server";
import { getUser } from "~/utils/auth.server";
import { useRootLoader } from "~/utils/hooks";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return redirect("/");
	return null;
};

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
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
		<div className="p-6">
			<h1 className="mb-4 font-semibold text-4xl">Account</h1>
			<div className="grid gap-8">
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
				<fetcher.Form className="flex w-80 flex-col gap-4" method="POST">
					<h2 className="font-semibold text-xl">Billing</h2>
					<Button className="border border-red-500 text-red-500" variant="tertiary">
						Cancel subscription
					</Button>
				</fetcher.Form>
			</div>
		</div>
	);
};

export default Route;
