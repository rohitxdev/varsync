import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Dialog, Heading } from "react-aria-components";
import { LuKey } from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";
import { InputField, Select } from "~/components/ui";
import { useProject } from "~/utils/hooks";

interface NewKeyDialogProps {
	projectName?: string;
}

export const NewKeyDialog = (props: NewKeyDialogProps) => {
	const fetcher = useFetcher();
	const closeFn = useRef<(() => void) | null>(null);
	const { envs } = useProject();
	const { _id } = useProject();

	useEffect(() => {
		if (fetcher.state === "idle") {
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded bg-white p-6">
			{({ close }) => (
				<fetcher.Form className="grid w-96 gap-2" method="POST">
					<Heading className="flex items-center gap-2 font-semibold text-2xl">
						<LuKey /> Create new key
					</Heading>
					<InputField
						label="Label"
						name="label"
						placeholder="e.g. production-key-1"
						autoFocus
						isRequired
					/>
					<Select
						className="w-52"
						options={Object.keys(envs)}
						label="Environment"
						name="env"
						isRequired
					/>
					<div className="mt-4 ml-auto flex gap-4 *:h-9 *:w-28">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							variant="primary"
							type="submit"
							name="projectId"
							value={_id}
							onPress={() => {
								closeFn.current = close;
							}}
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="mx-auto size-4 fill-white" />
							) : (
								"Create"
							)}
						</Button>
					</div>
				</fetcher.Form>
			)}
		</Dialog>
	);
};

interface DeleteAccessTokenDialogProps {
	token: string;
}
export const DeleteAccessTokenDialog = ({ token }: DeleteAccessTokenDialogProps) => {
	const fetcher = useFetcher();
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (fetcher.state === "idle") {
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded-md bg-dark">
			{({ close }) => (
				<fetcher.Form className="grid w-[60ch] gap-2 p-6" method="DELETE">
					<Heading className="font-semibold text-lg">Delete access token</Heading>
					<p className="text-slate-400 text-sm">
						Are you sure you want to delete `
						<span className="font-semibold">{token}</span>`? Apps using this token will
						no longer be able to access this project's vault.
					</p>
					<div className="mt-2 flex justify-end gap-4 font-semibold text-sm">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button
							className="bg-red-500"
							variant="primary"
							onPress={() => {
								closeFn.current = close;
							}}
							type="submit"
							name="label"
							value={token}
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="mx-auto size-4 fill-white" />
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
