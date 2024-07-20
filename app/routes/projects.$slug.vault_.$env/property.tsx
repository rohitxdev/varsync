import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Input, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import {
	LuCheck,
	LuEyeOff,
	LuLock,
	LuMoreVertical,
	LuPencil,
	LuTrash2,
	LuUnlock,
	LuX,
} from "react-icons/lu";
import Spinner from "~/assets/spinner.svg?react";
import { Button } from "~/components/buttons";
import { showToast } from "~/components/toast";
import { Modal, Switch } from "~/components/ui";
import { useMasterPassword } from "~/utils/contexts";
import { decryptAES, encryptAES } from "~/utils/crypto.client";
import { actionResponseSchema } from "~/utils/misc";
import { DeleteVariableDialog, PromptMasterPasswordDialog } from "./dialogs";

const highlightText = (text: string, searchTerm?: string) => {
	const regex = new RegExp(searchTerm || "", "gi");
	return text.replace(regex, (match) => `<mark>${match}</mark>`);
};

export const Property = ({
	name,
	value,
	isEncrypted,
	searchTerm,
}: {
	name: string;
	value: string | boolean;
	isEncrypted: boolean;
	searchTerm?: string;
}) => {
	const fetcher = useFetcher();
	const { masterKey } = useMasterPassword();
	const [isEdited, setIsEdited] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [newValue, setNewValue] = useState(value);
	const [promptMasterPassword, setPromptMasterPassword] = useState(false);
	const [showEncrypted, setShowEncrypted] = useState(false);
	const [decryptedValue, setDecryptedValue] = useState(value);

	const updateProperty = async (
		name: string,
		value: string | boolean,
		shouldToggleEncrypt?: boolean,
	) => {
		let newValue = value;
		if (shouldToggleEncrypt && typeof value === "string") {
			if (!masterKey) {
				setPromptMasterPassword(true);
				return;
			}
			newValue = isEncrypted
				? await decryptAES(value, masterKey)
				: await encryptAES(value, masterKey);
		}

		fetcher.submit(
			{
				name,
				value: newValue,
				isEncrypted: shouldToggleEncrypt ? !isEncrypted : isEncrypted,
			},
			{
				method: "PUT",
				encType: "application/json",
			},
		);
	};

	const deleteProperty = (name: string, value: string | boolean) => {
		fetcher.submit(
			{ name, value },
			{
				method: "DELETE",
				encType: "application/json",
			},
		);
	};

	useEffect(() => {
		const valid = actionResponseSchema.safeParse(fetcher.data);

		if (valid.data?.success) {
			showToast(valid.data.message, "success");
		}
	}, [fetcher.data]);

	useEffect(() => {
		if (fetcher.state === "idle") {
			setIsEdited(false);
		}
	}, [fetcher.state]);

	useEffect(() => {
		setShowEncrypted(!isEncrypted);
	}, [isEncrypted]);

	return (
		<div className="flex h-14 items-center gap-8 px-6">
			<p
				className="mr-auto font-medium text-slate-300 *:rounded-sm *:bg-blue-500/50 *:text-slate-300"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: need to escape HTML
				dangerouslySetInnerHTML={{
					__html: highlightText(name, searchTerm),
				}}
			/>
			{typeof value === "string" ? (
				isEdited ? (
					<div className="flex items-center rounded border border-white/20 bg-white/10 px-2 py-1">
						<Input
							className="bg-transparent outline-none"
							value={newValue.toString()}
							onInput={(e) => setNewValue(e.currentTarget.value)}
							onKeyDown={async (e) => {
								if (e.key === "Enter" && newValue.toString() !== value) {
									updateProperty(name, newValue);
									setIsEdited(false);
								}
								if (e.key === "Escape") {
									setIsEdited(false);
								}
							}}
							autoFocus
						/>
						<div className="flex gap-2">
							<button
								className="flex items-center justify-center"
								onClick={() => setIsEdited(false)}
								type="button"
							>
								<LuX className="size-4" />
							</button>
							<button
								className="flex items-center justify-center disabled:text-neutral-400"
								onClick={() => updateProperty(name, newValue)}
								type="button"
								disabled={newValue === value || fetcher.state === "submitting"}
							>
								{fetcher.state === "submitting" ? (
									<Spinner className="size-4 fill-white" />
								) : (
									<LuCheck className="size-4" />
								)}
							</button>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-2 text-slate-400">
						{isEncrypted && (
							<Button
								onPress={async () => {
									if (showEncrypted) {
										setShowEncrypted(false);
									} else {
										if (!masterKey) return setPromptMasterPassword(true);
										setDecryptedValue(await decryptAES(value, masterKey));
										setShowEncrypted(true);
									}
								}}
							>
								{isEncrypted && <LuEyeOff />}
							</Button>
						)}
						<p className="overflow-hidden text-ellipsis">
							{isEncrypted ? (showEncrypted ? decryptedValue : "**********") : value}
						</p>
					</div>
				)
			) : (
				<Switch
					defaultChecked={value}
					onChange={(e) => updateProperty(name, e.currentTarget.checked)}
				/>
			)}
			<Modal
				dialog={
					<DeleteVariableDialog
						name={name}
						onAction={() => deleteProperty(name, value)}
					/>
				}
				isOpen={showDeleteModal}
				onOpenChange={() => setShowDeleteModal(false)}
			/>
			<Modal
				dialog={<PromptMasterPasswordDialog onAction={() => {}} />}
				isOpen={promptMasterPassword}
				onOpenChange={setPromptMasterPassword}
			/>
			<MenuTrigger>
				<Button className="p-1">
					<LuMoreVertical />
				</Button>
				<Popover placement="bottom right">
					<Menu className="w-24 overflow-hidden rounded bg-white font-medium text-black text-sm outline-none *:flex *:items-center *:gap-2 *:px-3 *:py-2 *:outline-none [&>*:focus]:bg-neutral-200 [&_span]:w-2/3">
						{typeof value === "string" && (
							<>
								<MenuItem
									isDisabled={isEncrypted && !masterKey}
									onAction={() => setIsEdited(true)}
								>
									<span>Edit</span>
									<LuPencil />
								</MenuItem>
								<MenuItem
									onAction={() => {
										updateProperty(name, value, true);
									}}
								>
									<span>{isEncrypted ? "Decrypt" : "Encrypt"}</span>
									{isEncrypted ? <LuUnlock /> : <LuLock />}
								</MenuItem>
							</>
						)}
						<MenuItem
							className="text-red-500"
							onAction={() => setShowDeleteModal(true)}
						>
							<span>Delete</span>
							<LuTrash2 />
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
		</div>
	);
};
