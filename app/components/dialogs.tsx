import { Form } from "@remix-run/react";
import { Dialog, Heading } from "react-aria-components";
import { Button } from "./buttons";

export const LogOutDialog = () => (
	<Dialog className="grid w-96 gap-2 rounded-md p-6">
		{({ close }) => (
			<>
				<Heading className="mb-4 font-semibold text-xl">Do you want to log out?</Heading>
				<div className="mt-2 flex justify-end gap-4 font-semibold text-sm">
					<Button variant="secondary" onPress={close}>
						Cancel
					</Button>
					<Form method="POST" action="/auth/log-out">
						<Button className="bg-red-500" variant="primary" type="submit">
							Log out
						</Button>
					</Form>
				</div>
			</>
		)}
	</Dialog>
);
