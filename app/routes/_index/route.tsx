import { Link } from '@remix-run/react';
import type { ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { LuCheckCircle2, LuKeySquare, LuLock, LuRefreshCcw, LuUsers2 } from 'react-icons/lu';
import { CodeBlock } from './code-block';
import { Footer, NavMenu } from './nav';
import { useRootLoader } from '~/utils/hooks';
import { LogOutDialog } from './dialogs';
import { AccordionItem, Modal } from '~/components/ui';

interface FeatureProps {
	icon: ReactNode;
	title: string;
	description: string;
}

const features: FeatureProps[] = [
	{
		icon: <LuKeySquare />,
		title: 'Easy to set up and use.',
		description:
			'Easily manage and synchronize feature flags across multiple environments and servers.',
	},
	{
		icon: <LuRefreshCcw />,
		title: 'Real-time updates and notifications.',
		description: 'lorem ipsum',
	},
	{
		icon: <LuKeySquare />,
		title: 'Automatic environment detection and configuration.',
		description: 'lorem ipsum',
	},
	{
		icon: <LuKeySquare />,
		title: 'Integration with popular tools and services.',
		description: 'lorem ipsum',
	},
	{
		icon: <LuUsers2 />,
		title: 'Role-based access control',
		description: 'lorem ipsum',
	},
	{
		icon: <LuLock />,
		title: 'Secure and private',
		description:
			'All the data is encrypted and stored securely. No one can access your sensitive information but you',
	},
];

interface PricingProps {
	title: string;
	price: number;
	features: string[];
}

const pricing: PricingProps[] = [
	{
		title: 'Free',
		price: 0,
		features: [
			'Upto 20 variables/feature flags',
			'Upto 2 Environments',
			'20k reads per month',
			'Syncs every 10 minutes',
		],
	},
	{
		title: 'Pro',
		price: 4.99,
		features: [
			'Upto 1000 variables/feature flags',
			'Upto 10 environments',
			'2 million reads per month',
			'Syncs every 1 minute',
			'Role based access control',
		],
	},
];

const jsCode = `import { VarsyncClient } from '@varsync/client';

const config = new VarsyncClient({
	env: process.env.NODE_ENV, 
	accessToken:process.env.VARSYNC_ACCESS_TOKEN,
});

const handler = async (req, res) => {
	if (!config.get("IS_FEATURE_ENABLED")) return res.sendStatus(400);

	if(req.user.usedQuota <= config.get("QUOTA_LIMIT")) {
		doStuff();
		return res.sendStatus(200);
	}
		
	return res.sendStatus(403);
};\n`;

const goCode = `package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/varsync/go"
)

func main() {
	config := varsync.New(varsync.Config{
		Env:         os.Getenv("NODE_ENV"),
		AccessToken: os.Getenv("VARSYNC_ACCESS_TOKEN"),
	})

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		if !config.GetBool("IS_FEATURE_ENABLED") {
			c.Status(http.StatusBadRequest)
			return
		}

		user, ok := c.Get("user")
		if !ok {
			c.Status(http.StatusUnauthorized)
			return
		}

		u, ok := user.(User)
		if !ok {
			c.Status(http.StatusInternalServerError)
			return
		}

		if u.UsedQuota >= config.GetInt("QUOTA_LIMIT") {
			c.Status(http.StatusForbidden)
			return
		}
			
		doStuff()
		c.Status(http.StatusOK)
		return
	})

	r.Run()
}
`;

const pythonCode = `from flask import Flask, request, jsonify
from varsync import VarsyncClient
import os

app = Flask(__name__)

config = VarsyncClient(
    env = os.getenv("NODE_ENV"),
    access_token = os.getenv("VARSYNC_ACCESS_TOKEN")
)

@app.route('/api', methods = ['GET'])
def handler():
    if not config.get("IS_FEATURE_ENABLED"):
        return '', 400

    user = get_current_user()

    if user['used_quota'] <= config.get("QUOTA_LIMIT"):
        do_stuff()
        return '', 200

    return '', 403
`;

const Route = () => {
	const { user } = useRootLoader();

	return (
		<div>
			<div className="grid justify-items-center gap-8 p-6 text-center text-white">
				<nav className="flex w-full items-center justify-between">
					<div className="flex items-center justify-center gap-2">
						<img
							className="object-contain max-md:size-6"
							src="/logo.png"
							alt="VarSync"
							height={32}
							width={32}
						/>
						<span className="text-2xl font-bold max-md:text-lg">Varsync</span>
					</div>
					<NavMenu />
					{user ? (
						<div className="flex items-center gap-2">
							{user.pictureUrl && (
								<img
									className="rounded-full"
									src={user.pictureUrl}
									height={48}
									width={48}
									alt="User"
								/>
							)}
							<Modal dialog={<LogOutDialog />}>
								<Button>Log out</Button>
							</Modal>
						</div>
					) : (
						<Link to="/auth/login">Log In</Link>
					)}
				</nav>
				<section className="flex flex-col items-center gap-12 md:flex-row">
					<div className="flex flex-col gap-2 text-start">
						<h1 className="mb-2 text-5xl font-bold *:text-blue-500 max-md:text-3xl">
							Manage <span>feature flags</span> and <span>dynamic configs</span> with ease.
						</h1>
						<h2 className="text-slate-400">
							Varsync allows you to effortlessly manage and synchronize environment variables across
							multiple environments. Simplify your configuration process and enable smooth,
							controlled feature rollouts with our intuitive interface and real-time updates.
						</h2>
						<div className="flex items-center gap-2 text-center *:h-10 *:w-32">
							<Link
								className="m-4 flex w-fit items-center justify-center rounded bg-white font-semibold text-black active:bg-neutral-100"
								to="/projects"
							>
								Demo
							</Link>
							<button
								className="w-fit rounded bg-blue-500 font-semibold text-white active:bg-blue-600"
								type="button"
							>
								Try Free
							</button>
						</div>
					</div>
					<img
						className="max-w-full shrink-0 rounded-xl border border-blue-500/60 p-1"
						src="/demo-dash.png"
						width={800}
						height={600}
						alt=""
					/>
				</section>
				<section className="flex w-full flex-wrap items-center gap-8 overflow-hidden md:flex-row-reverse md:justify-center md:gap-16">
					<div className="text-start">
						<h2 className="mb-2 text-4xl font-bold max-md:text-3xl">Integrate in minutes.</h2>
						<p className="text-neutral-400">
							Add varsync SDK to your project and get running in minutes.
						</p>
					</div>
					<CodeBlock
						data={[
							{ language: 'javascript', code: jsCode },
							{ language: 'go', code: goCode },
							{ language: 'python', code: pythonCode },
						]}
					/>
				</section>
				<section className="grid gap-4">
					<h2 className="text-3xl font-bold">Why Varsync?</h2>
					<ul className="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
						{features.map((item) => (
							<li
								className="flex justify-evenly gap-2 rounded-md bg-white/5 p-4 text-start"
								key={item.title}
							>
								<div className="*:size-8">{item.icon}</div>
								<div className="w-3/4">
									<h3 className="mb-1 text-balance text-lg font-semibold">{item.title}</h3>
									<p className="text-sm font-medium text-neutral-400">{item.description}</p>
								</div>
							</li>
						))}
					</ul>
				</section>
				<section className="grid gap-4">
					<h2 className="text-3xl font-bold">Pricing</h2>
					<ul className="flex flex-wrap justify-center gap-6">
						{pricing.map((item) => (
							<li
								className="flex grow basis-0 flex-col gap-4 rounded-md border p-4"
								key={item.title}
							>
								<h3 className="text-2xl font-bold text-neutral-300">{item.title}</h3>
								<p className="text-sm font-medium">
									<span className="text-4xl font-bold">${item.price}</span> /month
								</p>
								<ul className="px-2 font-medium">
									{item.features.map((feature) => (
										<li className="mb-1 flex max-w-[32ch] items-center gap-2" key={feature}>
											<LuCheckCircle2 className="shrink-0 stroke-[3]" />
											<span className="text-start">{feature}</span>
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</section>
				<section>
					<h2 className="mb-4 text-4xl font-bold">FAQ</h2>
					<div className="flex flex-col gap-4">
						<AccordionItem
							title="How do you store my data?"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor."
						/>
						<AccordionItem
							title="How do I use VarSync?"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor."
						/>
						<AccordionItem
							title="How do I get support?"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor."
						/>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
};

export default Route;
