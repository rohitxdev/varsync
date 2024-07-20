import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { pbkdf2Hash } from "./crypto.client";
import { useProject } from "./hooks";

const MasterPasswordContext = createContext<{
	masterPassword: string | null;
	setMasterPassword: React.Dispatch<React.SetStateAction<string | null>>;
	masterKey: string | null;
	masterPasswordSalt: string | null;
} | null>(null);

export const MasterPasswordProvider = ({ children }: { children: ReactNode }) => {
	const project = useProject();
	const [masterPassword, setMasterPassword] = useState<string | null>(null);
	const [masterKey, setMasterKey] = useState<string | null>(null);
	const masterPasswordSalt = project.masterPasswordHash?.slice(-44) ?? null;

	useEffect(() => {
		const deriveMasterKey = async () => {
			if (masterPassword && masterPasswordSalt) {
				setMasterKey(await pbkdf2Hash(masterPassword, masterPasswordSalt));
			} else {
				setMasterKey(null);
			}
		};
		deriveMasterKey();
	}, [masterPassword, masterPasswordSalt]);

	return (
		<MasterPasswordContext.Provider
			value={{ masterPassword, setMasterPassword, masterKey, masterPasswordSalt }}
		>
			{children}
		</MasterPasswordContext.Provider>
	);
};

export const useMasterPassword = () => {
	const context = useContext(MasterPasswordContext);
	if (context === null) {
		throw new Error("useMasterPassword must be used within a MasterPasswordProvider");
	}
	return context;
};
