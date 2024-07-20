import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { Heading } from "react-aria-components";
import { LuAlertTriangle, LuArrowRight } from "react-icons/lu";
import LockIcon from "~/assets/lock.svg?react";
import { Button } from "~/components/buttons";
import { InputField } from "~/components/ui";
import { pbkdf2Hash } from "~/utils/crypto.client";
import { useProject, useRootLoader } from "~/utils/hooks";

export const InitVault = () => {
	const fetcher = useFetcher();
	const project = useProject();
	const { user } = useRootLoader();
	const [step, setStep] = useState<1 | 2>(1);
	const [masterPassword, setMasterPassword] = useState<string>("");

	return (
		<div className="flex size-full flex-col items-center justify-center gap-3 p-1">
			{step === 1 && (
				<>
					<LockIcon className="size-24" />
					<Heading className="font-semibold text-2xl">Set up master password</Heading>
					<p className="text-center text-slate-400 text-sm">
						You need to set the master password before you can use the vault.
					</p>
					<Button className="mt-2 gap-3" variant="primary" onPress={() => setStep(2)}>
						Continue <LuArrowRight className="size-5" />
					</Button>
				</>
			)}
			{step === 2 && (
				<Form
					className="flex flex-col items-center gap-4 [&_input]:w-64"
					onSubmit={async (e) => {
						e.preventDefault();
						if (!user?.email) return;
						fetcher.submit(
							{ masterPasswordHash: await pbkdf2Hash(masterPassword, user.email) },
							{
								action: `/${project.slug}/master-password`,
								method: "POST",
								encType: "application/json",
							},
						);
					}}
				>
					<div className="flex w-96 gap-2 rounded-md border border-yellow-400/40 bg-yellow-400/5 p-4 text-sm text-yellow-500">
						<LuAlertTriangle className="size-5 shrink-0" />
						<p>
							Make sure to remember your master password. If you forget it, you won't
							be able to view/modify encrypted properties in your vault.
						</p>
					</div>
					<InputField
						label="Master password"
						name="masterPassword"
						onChange={setMasterPassword}
						isRequired
						isSensitive
						autoFocus
					/>
					<InputField
						label="Confirm master password"
						validate={(value) => value === masterPassword || "Passwords must match."}
						isRequired
						isSensitive
					/>
					<Button className="mt-2 text-sm" variant="primary" type="submit">
						Save master password
					</Button>
				</Form>
			)}
		</div>
	);
};
