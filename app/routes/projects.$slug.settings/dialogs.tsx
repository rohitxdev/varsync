import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Dialog, Heading } from "react-aria-components";
import toast from "react-hot-toast";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";

type ResetMasterPasswordDialogProps = {};

export const ResetMasterPasswordDialog = ({}: ResetMasterPasswordDialogProps) => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Deleted project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="w-[50ch] rounded-md p-6 font-medium">
			{({ close }) => (
				<fetcher.Form
					className="grid gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit(
							{ password },
							{ method: "PUT", encType: "application/json" },
						);
						closeFn.current = close;
					}}
				>
					<div>
						<Heading className="font-semibold text-xl">Reset Master Password</Heading>
						<p className="mt-1 text-slate-400 text-sm">
							All the encrypted properties in this project will be erased.
						</p>
					</div>
					<InputField label="Account password" name="password" isSensitive isRequired />
					<InputField
						label="New master password"
						name="master-password"
						isSensitive
						isRequired
					/>
					<InputField label="Confirm new master password" isSensitive isRequired />
					<div className="mt-4 flex justify-end gap-4 font-semibold text-black text-sm *:h-9 *:w-32">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="bg-red-500"
							variant="primary"
							type="submit"
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Reset"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};

interface DeleteProjectDialogProps {
	projectName: string;
	slug: string;
}

export const DeleteProjectDialog = ({ projectName, slug }: DeleteProjectDialogProps) => {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (closeFn.current && fetcher.state === "idle") {
			toast.dismiss();
			toast.success("Deleted project successfully");
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="w-[50ch] rounded-md p-6 font-medium">
			{({ close }) => (
				<fetcher.Form
					className="grid gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit({ slug }, { method: "DELETE", encType: "application/json" });
						closeFn.current = close;
					}}
				>
					<div>
						<Heading className="font-semibold text-xl">Delete Project</Heading>
						<p className="mt-1 text-slate-400 text-sm">
							This project and all its environments will be deleted. This action
							cannot be undone.
						</p>
					</div>
					<InputField label="Password" isRequired />
					<InputField
						label={
							<>
								Please type&nbsp;&nbsp;
								<span className="select-none font-semibold text-white">
									'{projectName}'
								</span>
								&nbsp; to confirm.
							</>
						}
						onChange={setName}
						isInvalid={name.length > 0 && name !== projectName}
						isRequired
					/>
					<div className="mt-4 flex justify-end gap-4 font-semibold text-black text-sm *:h-9 *:w-32">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="bg-red-500"
							variant="primary"
							type="submit"
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="size-5 fill-white" />
							) : (
								"Delete"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};
