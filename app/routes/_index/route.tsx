import { Link } from "@remix-run/react";
import type { ReactNode } from "react";
import { LuKeySquare, LuLock, LuRefreshCcw, LuUsers2 } from "react-icons/lu";
import { AccordionItem } from "~/components/ui";
import { useRootLoader } from "~/utils/hooks";
import { CodeBlock } from "./code-block";
import { Footer } from "./footer";
import { NavBar } from "./nav";

interface FeatureProps {
	icon: ReactNode;
	title: string;
	description: string;
}

const features: FeatureProps[] = [
	{
		icon: <LuKeySquare />,
		title: "Easy to set up and use.",
		description:
			"Easily manage and synchronize feature flags across multiple environments and servers.",
	},
	{
		icon: <LuRefreshCcw />,
		title: "Real-time updates and notifications.",
		description: "lorem ipsum",
	},
	{
		icon: <LuKeySquare />,
		title: "Automatic environment detection and configuration.",
		description: "lorem ipsum",
	},
	{
		icon: <LuKeySquare />,
		title: "Integration with popular tools and services.",
		description: "lorem ipsum",
	},
	{
		icon: <LuUsers2 />,
		title: "Role-based access control",
		description: "lorem ipsum",
	},
	{
		icon: <LuLock />,
		title: "Secure and private",
		description:
			"All the data is encrypted and stored securely. No one can access your sensitive information but you",
	},
];

const SNo = ({ children }: { children: ReactNode }) => (
	<span className="mr-4 inline-block w-7 rounded border border-blue-500 text-center text-sm leading-7">
		{children}
	</span>
);

const Route = () => {
	const { config } = useRootLoader();

	return (
		<div>
			<div className="grid justify-items-center gap-8 p-6 text-center text-white">
				<NavBar />
				<section className="flex flex-col items-center gap-12 md:flex-row">
					<div className="flex flex-col gap-2 text-start">
						<h1 className="mb-2 font-bold text-5xl *:text-blue-500 max-md:text-3xl">
							Manage <span>feature flags</span> and <span>configs</span> with ease.
						</h1>
						<h2 className="text-slate-400">
							Varsync allows you to effortlessly manage and synchronize environment
							variables across multiple environments. Simplify your configuration
							process and enable smooth, controlled feature rollouts with our
							intuitive interface and real-time updates.
						</h2>
						<div className="flex items-center justify-start gap-6 py-4 text-center *:h-10 *:w-40">
							<Link
								className="flex items-center justify-center rounded bg-white font-semibold text-black active:bg-neutral-100"
								to="/projects"
							>
								Live Demo
							</Link>
							<button
								className="rounded bg-blue-500 font-semibold text-white active:bg-blue-600"
								type="button"
							>
								Start Free Trial
							</button>
						</div>
					</div>
					<img
						className="max-w-full shrink-0 rounded-md border border-white/10 p-1"
						src="/demo-dash.png"
						width={800}
						height={600}
						alt=""
					/>
				</section>
				<section className="flex w-full flex-wrap items-center gap-8 overflow-hidden md:flex-row-reverse md:justify-center md:gap-16">
					<div className="text-start">
						<h2 className="mb-2 font-bold text-4xl max-md:text-3xl">
							Integrate in minutes.
						</h2>
						<p className="text-slate-400">
							Add varsync SDK to your project and get running in minutes.
						</p>
						<ol className="mt-8 max-w-96 space-y-6 text-start [&_p]:ml-12 [&_p]:text-slate-400 [&_p]:text-sm">
							<li>
								<SNo>1</SNo> Install the SDK.
								<p>
									Add the Varsync SDK to your application using your preferred
									package manager.
								</p>
							</li>
							<li>
								<SNo>2</SNo>Initialize the Varsync client.
								<p>
									Initialise the client using an access token generated in your
									dashboard.
								</p>
							</li>
							<li>
								<SNo>3</SNo> Done.
								<p>
									You're all set! Your application can now make requests to the
									Varsync server.
								</p>
							</li>
						</ol>
					</div>
					<CodeBlock />
				</section>
				<section className="grid gap-4">
					<h2 className="my-8 font-bold text-3xl">Why Varsync?</h2>
					<ul className="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
						{features.map((item) => (
							<li
								className="flex justify-evenly gap-2 rounded-md border border-white/10 bg-white/5 p-4 text-start"
								key={item.title}
							>
								<div className="*:size-8">{item.icon}</div>
								<div className="w-3/4">
									<h3 className="mb-1 text-balance font-semibold text-lg">
										{item.title}
									</h3>
									<p className="font-medium text-slate-400 text-sm">
										{item.description}
									</p>
								</div>
							</li>
						))}
					</ul>
				</section>
				<section>
					<h2 className="my-8 font-bold text-3xl">FAQ</h2>
					<div className="flex flex-col gap-4">
						<AccordionItem
							title="Is it safe to expose the access token in my front-end?"
							description="We recommend using the varsync SDK in your backend for security reasons. However, you may choose to expose the access token in your frontend if you don't have sensitive data in your vault."
						/>
						<AccordionItem
							title="Is there a limit to the number of API requests I can make?"
							description={`There is no absolute limit to the number of API requests you can make in a month. However, there is a rate limit of ${config.API_RATE_LIMIT_PER_MINUTE} reqs/minute per IP address, which should be plenty.`}
						/>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
};

export default Route;
