import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import {
	ComboBox,
	Dialog,
	Heading,
	Input,
	Label,
	ListBox,
	ListBoxItem,
	Popover,
} from "react-aria-components";
import { LuChevronsUpDown, LuKey, LuPlus, LuX } from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";
import { useProject } from "~/utils/hooks";

interface NewKeyDialogProps {
	projectName?: string;
}

export const NewKeyDialog = (props: NewKeyDialogProps) => {
	const fetcher = useFetcher();
	const closeFn = useRef<(() => void) | null>(null);
	const { envs } = useProject();
	const [permittedEnvs, setPermittedEnvs] = useState<string[]>([]);
	const [showOptions, setShowOptions] = useState(false);
	const { _id } = useProject();

	useEffect(() => {
		if (fetcher.state === "idle") {
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="rounded bg-white p-6">
			{({ close }) => (
				<fetcher.Form
					className="grid w-96 gap-2"
					method="POST"
					onSubmit={(e) => {
						e.preventDefault();
						fetcher.submit(
							{
								label: e.currentTarget.label.value as string,
								envs: permittedEnvs,
								projectId: _id,
							},
							{ encType: "application/json", method: "POST" },
						);
					}}
				>
					<Heading className="flex items-center gap-2 font-semibold text-2xl">
						<LuKey /> Create new key
					</Heading>
					<InputField label="Label" name="label" placeholder="e.g. production-key-1" isRequired />
					<div className="flex flex-wrap gap-1">
						{permittedEnvs.map((item, i) => (
							<div
								className="flex w-fit items-center gap-2 rounded-md border border-white/10 px-2 py-1"
								key={item}
							>
								<span>{item}</span>
								<Button
									onPress={() =>
										setPermittedEnvs((items) => items.filter((_item, idx) => i !== idx))
									}
								>
									<LuX />
								</Button>
							</div>
						))}
					</div>
					{showOptions ? (
						<ComboBox
							onSelectionChange={(key) => setPermittedEnvs((items) => [...items, key!.toString()])}
						>
							<Label className="text-slate-400 text-xs">Environments</Label>
							<div className="flex w-fit items-center rounded-md border-white/5 bg-white/5 px-2 py-1 disabled:brightness-75">
								<Input className="bg-transparent" />
								<Button className="px-1">
									<LuChevronsUpDown />
								</Button>
							</div>
							<Popover className="w-[--trigger-width] rounded bg-dark p-1">
								<ListBox>
									{Object.keys(envs)
										.filter((item) => !permittedEnvs.includes(item))
										.map((item) => (
											<ListBoxItem className="rounded p-1 focus:bg-white/5" key={item} id={item}>
												{item}
											</ListBoxItem>
										))}
								</ListBox>
							</Popover>
						</ComboBox>
					) : (
						<Button
							onPress={() => setShowOptions(true)}
							className="flex w-fit rounded border border-white/10 p-1"
						>
							<LuPlus className="size-5" />
						</Button>
					)}
					<div className="mt-4 ml-auto flex gap-2">
						<Button variant="secondary" onPress={close}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" isDisabled={permittedEnvs.length === 0}>
							Create
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
		<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
			{({ close }) => (
				<>
					<Heading className="font-semibold text-lg">Delete access token</Heading>
					<p className="text-slate-400 text-sm">
						Are you sure you want to delete this token? Apps using this token will no longer be able
						to access this project's vault.
					</p>
					<div className="mt-2 flex justify-end gap-4 font-semibold text-sm">
						<Button className="rounded bg-neutral-300 px-6 py-2 text-black" onPress={close}>
							Cancel
						</Button>
						<Button
							className="h-9 w-32 rounded bg-red-500 text-white disabled:brightness-75"
							onPress={() => {
								fetcher.submit(
									{ token },
									{
										method: "DELETE",
										encType: "application/json",
									},
								);
								closeFn.current = close;
							}}
							isDisabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
								<Spinner className="mx-auto size-4 fill-white" />
							) : (
								"Delete"
							)}
						</Button>
					</div>
				</>
			)}
		</Dialog>
	);
};
