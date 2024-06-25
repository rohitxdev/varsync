import { Button, Dialog, Heading } from "react-aria-components";

interface DeleteAccessTokenDialogProps {
	onDelete?: () => void;
}
export const DeleteAccessTokenDialog = ({
	onDelete,
}: DeleteAccessTokenDialogProps) => (
	<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
		{({ close }) => (
			<>
				<Heading className="text-lg font-semibold">Delete access token</Heading>
				<p className="text-sm text-neutral-600">
					Are you sure you want to delete this token? Apps using this token will
					no longer be able to access this project's vault.
				</p>
				<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
					<Button className="rounded bg-neutral-300 px-6 py-2" onPress={close}>
						Cancel
					</Button>
					<Button
						className="rounded bg-red-500 px-6 py-2 text-white"
						onPress={() => {
							onDelete?.();
							close();
						}}
					>
						Delete
					</Button>
				</div>
			</>
		)}
	</Dialog>
);
