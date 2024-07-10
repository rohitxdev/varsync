import { Link } from "@remix-run/react";
import { useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { Button } from "~/components/buttons";
import { LogOutDialog } from "~/components/dialogs";
import { Modal } from "~/components/ui";
import { useRootLoader } from "~/utils/hooks";

export const NavBar = () => {
	const { user } = useRootLoader();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="relative top-0 z-10 flex w-full items-center justify-between gap-6 bg-dark max-md:sticky max-md:py-6">
			<div className="flex items-center justify-center gap-2">
				<img
					className="object-contain max-md:size-6"
					src="/logo.png"
					alt="VarSync"
					height={36}
					width={36}
				/>
				<span className="font-bold text-2xl max-md:text-lg">Varsync</span>
			</div>
			<ul className="mr-auto flex justify-end gap-8 border-white/20 border-l-2 px-6 py-2 font-medium max-md:hidden [&_a:hover]:underline">
				<li>
					<Link to="/projects">Dashboard</Link>
				</li>
				<li>
					<Link to="/pricing">Pricing</Link>
				</li>
				<li>
					<Link to="/docs">Docs</Link>
				</li>
			</ul>
			<div className="md:hidden">
				<button type="button" onClick={() => setIsOpen((val) => !val)}>
					{isOpen ? <LuX className="size-6" /> : <LuMenu className="size-6" />}
				</button>
				{isOpen && (
					<div className="absolute left-0 z-10 flex w-screen flex-col gap-2 rounded-md border border-neutral-600 bg-neutral-900 p-4 pb-8">
						<ul className="flex flex-col gap-2 font-medium text-lg [&_a:hover]:underline">
							<li>
								<Link to="/pricing">Pricing</Link>
							</li>
							<li>
								<Link to="/docs">Docs</Link>
							</li>
							<li>
								<Link to="/support">Support</Link>
							</li>
						</ul>
					</div>
				)}
			</div>
			<div className="flex h-10 items-center gap-2">
				{user ? (
					<>
						<Modal dialog={<LogOutDialog />}>
							<Button className="text-white" variant="tertiary">
								Log out
							</Button>
						</Modal>
						{user.pictureUrl && (
							<Link to="/account">
								<img
									className="rounded-full border border-white/10"
									src={user.pictureUrl}
									height={40}
									width={40}
									alt="User"
								/>
							</Link>
						)}
					</>
				) : (
					<Link
						className="rounded-md border border-blue-600 px-4 py-2 duration-100 hover:bg-blue-600"
						to="/auth/login"
					>
						Log In
					</Link>
				)}
			</div>
		</nav>
	);
};
