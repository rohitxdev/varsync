import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Dialog, Heading } from "react-aria-components";
import { LuCheckCircle, LuKey, LuX } from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";
import { Button, CopyButton } from "~/components/buttons";
import { InputField, Select } from "~/components/ui";
import { useProject } from "~/utils/hooks";

export const NewKeyDialog = () => {
	const fetcher = useFetcher();
	const { envs } = useProject();
	const data = fetcher.data as { apiKey: string } | null;
	const apiKey = data?.apiKey;

	return (
		<Dialog className="rounded bg-white p-6">
			{({ close }) => (
				<>
					{apiKey ? (
						<div className="relative grid max-w-96 gap-2">
							<Button className="absolute top-0 right-0" onPress={close}>
								<LuX className="size-5" />
							</Button>
							<Heading className="font-semibold text-2xl">Copy API key</Heading>
							<div className="flex gap-2 rounded-md border border-green-400/40 bg-green-200/10 p-3 text-green-400 text-sm">
								<LuCheckCircle className="float-left size-4 shrink-0 text-green-400" />
								<p>
									API key generated successfully. Please copy this and keep it
									safe. It will not be shown again.
								</p>
							</div>
							<div className="mt-4 grid grid-cols-[auto_1fr] items-center justify-between gap-0.5 font-mono text-sm">
								<p className="shrink overflow-hidden text-ellipsis rounded bg-white/5 px-2 leading-10">
									<span>{apiKey.slice(0, 7)}</span>
									<span>{new Array(apiKey.length).fill("*").join("")}</span>
								</p>
								<CopyButton className="size-10" text={apiKey} />
							</div>
						</div>
					) : (
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
								className="w-56"
								options={Object.keys(envs)}
								label="Environment"
								name="env"
								placeholder="Select environment"
								isRequired
							/>
							<div className="mt-4 ml-auto flex gap-4 *:h-9 *:w-28">
								<Button variant="secondary" onPress={close}>
									Cancel
								</Button>
								<Button
									variant="primary"
									type="submit"
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
				</>
			)}
		</Dialog>
	);
};

interface DeleteApiKeyDialogProps {
	apiKeyId: string;
	apiKeyLabel: string;
}
export const DeleteApiKeyDialog = (props: DeleteApiKeyDialogProps) => {
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
				<fetcher.Form
					className="grid w-[60ch] gap-2 p-6"
					method="DELETE"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit({ id: props.apiKeyId }, { method: "DELETE" });
						closeFn.current = close;
					}}
				>
					<Heading className="font-semibold text-lg">Delete API key</Heading>
					<p className="text-slate-400 text-sm">
						Are you sure you want to delete `
						<span className="font-semibold">{props.apiKeyLabel}</span>`? Apps using this
						key will no longer be able to access this project's vault.
					</p>
					<div className="mt-2 flex justify-end gap-4 font-semibold text-sm *:w-28">
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
