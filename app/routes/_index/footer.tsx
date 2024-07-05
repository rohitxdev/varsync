import { Link } from "@remix-run/react";
import { LuMail, LuTwitter } from "react-icons/lu";

export const Footer = () => {
	return (
		<footer className="flex w-full flex-wrap justify-start gap-16 bg-white/5 p-8 text-white [&_h3]:font-semibold [&_a:hover]:text-blue-500 [&_h3]:text-sm [&_li]:text-slate-400 [&_li]:text-sm [&_h3]:uppercase [&_a]:duration-100">
			<small className="mr-auto">Varsync &copy; 2024</small>
			<section>
				<h3>Contact Us</h3>
				<ul className="mt-2 flex gap-2 [&_svg:hover]:text-blue-500 [&_svg]:duration-100">
					<li>
						<Link to="/">
							<LuTwitter className="size-5" />
						</Link>
					</li>
					<li>
						<Link to="mailto:support@varsync.com">
							<LuMail className="size-5" />
						</Link>
					</li>
				</ul>
			</section>
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
