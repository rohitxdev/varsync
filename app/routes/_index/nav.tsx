import { Link } from "@remix-run/react";
import { useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";

export const NavMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<>
			<ul className="flex justify-end gap-8 font-medium max-md:hidden [&_a:hover]:underline">
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
			<div className="md:hidden">
				<button type="button" onClick={() => setIsOpen(true)} >
					<LuMenu className="size-6" />
				</button>
				{isOpen && (
					<div className="fixed right-0 top-0 z-10 w-screen p-1">
						<div className="flex w-full flex-col gap-2 rounded-md border border-neutral-600 bg-neutral-900 p-4 pb-8">
							<button type="button" className="ml-auto p-1" onClick={() => setIsOpen(false)}>
								<LuX className="size-6" />
							</button>
							<ul className="flex flex-col gap-2 text-lg font-medium [&_a:hover]:underline">
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
					</div>
				)}
			</div>
		</>
	);
};

export const Footer = () => {
	return (
		<footer className="[&_h3] flex w-full flex-wrap justify-center gap-8 bg-neutral-950 p-6 text-white [&_a:hover]:underline [&_a]:underline-offset-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:text-sm [&_li]:text-neutral-400">
			<section>
				<h3>Legal</h3>
				<ul className="mt-2 flex flex-col gap-1">
					<li>
						<Link to="/terms-of-service">Terms of Service</Link>
					</li>
					<li>
						<Link to="/privacy-policy">Privacy Policy</Link>
					</li>
					<li>
						<Link to="/refund-policy">Refund Policy</Link>
					</li>
				</ul>
			</section>
		</footer>
	);
};
