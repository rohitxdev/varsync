import { useFetcher } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { Dialog, Label, Heading, TextField, Input } from "react-aria-components";
import toast from "react-hot-toast";
import { LuAlertCircle } from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";

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
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit({ slug }, { method: "DELETE", encType: "application/json" });
						closeFn.current = close;
					}}
				>
					<Heading className="font-semibold text-xl">Delete Project</Heading>
					<p className="mt-1 text-slate-400 text-sm">
						This project and all its environments will be deleted. This action cannot be
						undone.
					</p>
					<TextField
						className="group mt-6 flex flex-col gap-1"
						onChange={setName}
						isInvalid={name.length > 0 && name !== projectName}
						isRequired
					>
						<Label className="font-normal text-xs">
							Please type{" "}
							<span className="select-none font-semibold">{projectName}</span> to
							confirm.
						</Label>
						<Input className="rounded border border-white/10 bg-transparent px-2 py-1 invalid:outline-red-500" />
						<p
							className="invisible flex items-center gap-1 text-red-500 text-xs group-invalid:visible"
							aria-label="Error"
						>
							<LuAlertCircle />
							<span>Project name must match</span>
						</p>
					</TextField>
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
