import { Form } from '@remix-run/react';
import { Button, Dialog, Heading } from 'react-aria-components';

export const LogOutDialog = () => (
	<Dialog className="grid w-[40ch] gap-2 rounded bg-white p-6 text-black">
		{({ close }) => (
			<>
				<Heading className="mb-4 text-xl font-semibold">Do you want to log out?</Heading>
				<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
					<Button className="w-20 rounded bg-neutral-300 py-2" onPress={close}>
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
