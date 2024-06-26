import { Form } from "@remix-run/react";
import { Button, Dialog, Heading } from "react-aria-components";

export const LogOutDialog = () => (
	<Dialog className="grid w-[40ch] gap-2 rounded bg-white p-6">
		{({ close }) => (
			<>
				<Heading className="mb-4 font-semibold text-xl">Do you want to log out?</Heading>
				<div className="mt-2 flex justify-end gap-4 font-semibold text-sm">
					<Button className="w-20 rounded bg-neutral-300 py-2 text-black" onPress={close}>
						Cancel
					</Button>
					<Form
						className="flex w-20 rounded-md bg-red-500 py-2 font-semibold text-white"
						method="POST"
						action="/auth/log-out"
					>
						<button className="w-full" type="submit">
							Log out
						</button>
					</Form>
				</div>
			</>
		)}
	</Dialog>
);
