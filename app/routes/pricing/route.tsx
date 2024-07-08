import { type Paddle, initializePaddle } from "@paddle/paddle-js";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { LuCheckCircle } from "react-icons/lu";
import { useRootLoader } from "~/utils/hooks";
import { paddle } from "~/utils/payments.server";

interface PricingProps {
	title: string;
	price: number;
	features: string[];
}

const pricing: PricingProps[] = [
	{
		title: "Free",
		price: 0,
		features: [
			"Upto 20 variables/feature flags",
			"Upto 2 Environments",
			"20k reads per month",
			"Syncs every 10 minutes",
		],
	},
	{
		title: "Pro",
		price: 4.99,
		features: [
			"Upto 1000 variables/feature flags",
			"Upto 10 environments",
			"2 million reads per month",
			"Syncs every 1 minute",
			"Role based access control",
		],
	},
];

export const loader = async () => {
	try {
		const getPrices = paddle.prices.list();
		const prices = await getPrices.next();
		return { prices };
	} catch (error) {
		return { prices: [] };
	}
};

const PricingCard = ({
	name,
	price,
	billingCycle,
	description,
	actionText,
	onAction,
	features,
	isDisabled,
}: {
	name: string;
	price: number;
	billingCycle: string;
	description: string;
	actionText?: string;
	onAction?: () => void;
	features: string[];
	isDisabled?: boolean;
}) => (
	<div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
		<div>
			<h2 className="font-bold text-2xl">{name}</h2>
			<p className="p-2 font-bold text-2xl">
				${price}&nbsp;
				<span className="font-medium text-slate-400 text-sm">/{billingCycle}</span>
			</p>
			<p className="text-slate-400 text-sm">{description}</p>
		</div>
		<ul className="mt-6 space-y-1.5 *:flex *:items-center *:gap-3 empty:hidden [&_svg]:text-green-500">
			{features.map((item) => (
				<li key={item}>
					<LuCheckCircle />
					{item}
				</li>
			))}
		</ul>
		{actionText && (
			<button
				className="mt-4 w-full rounded-lg bg-blue-500 px-6 py-2 font-semibold disabled:cursor-not-allowed disabled:brightness-75"
				type="button"
				onClick={onAction}
				disabled={isDisabled}
			>
				{actionText}
			</button>
		)}
	</div>
);

const Route = () => {
	const { config, user } = useRootLoader();
	const { prices } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [paddleClient, setPaddleClient] = useState<Paddle | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only need to initialize on page load
	useEffect(() => {
		const initPaddleClient = async () => {
			const client = await initializePaddle({
				token: config.PADDLE_CLIENT_TOKEN,
				environment: config.PADDLE_ENVIRONMENT,
			});
			if (!client) return;

			setPaddleClient(client);
		};

		initPaddleClient();
	}, []);

	return (
		<div className="h-screen p-6">
			<h1 className="mb-4 text-center font-bold text-4xl">Pricing</h1>
			<div
				className="grid auto-rows-fr grid-rows-1 justify-center gap-8"
				style={{
					gridTemplateColumns: "repeat(auto-fit, minmax(250px, 350px))",
				}}
			>
				<PricingCard
					name="Free"
					price={0}
					description="Upto 20 variables/feature flags"
					billingCycle="month"
					actionText={user ? "Go to dashboard" : "Log In"}
					onAction={() => navigate(user ? "/projects" : "/auth/log-in")}
					features={["20 variables/feature flags", "2 Environments", "2 Projects"]}
				/>
				{prices.map((item) => (
					<PricingCard
						name={item.name!}
						price={Number.parseInt(item.unitPrice.amount, 10) / 100}
						description={item.description}
						billingCycle={item.billingCycle?.interval!}
						actionText={item.trialPeriod ? "Start Free Trial" : "Subscribe"}
						onAction={() => {
							if (!user) return navigate("/auth/log-in");
							paddleClient?.Checkout.open({
								items: [{ priceId: item.id, quantity: 1 }],
							});
						}}
						features={[
							"1000 variables/feature flags",
							"10 Environments",
							"20 Projects",
							"Webhooks",
						]}
						isDisabled={!config.IS_PAYMENT_ENABLED}
						key={item.id}
					/>
				))}
			</div>
		</div>
	);
};

export default Route;
