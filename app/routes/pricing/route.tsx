import { type Paddle, initializePaddle } from "@paddle/paddle-js";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { type ComponentProps, useEffect, useState } from "react";
import { Tab as AriaTab, TabList, TabPanel, Tabs } from "react-aria-components";
import { LuCheckCircle } from "react-icons/lu";
import { useRootLoader } from "~/utils/hooks";
import { paddle } from "~/utils/payments.server";

export const loader = async () => {
	try {
		const getPrices = paddle.prices.list();
		const prices = await getPrices.next();
		const getProducts = paddle.products.list();
		const products = await getProducts.next();
		return { prices, products };
	} catch (error) {
		return { prices: [], products: [] };
	}
};

const Tab = ({ className, ...props }: ComponentProps<typeof AriaTab>) => (
	<AriaTab
		className={`rounded-full text-center font-semibold text-slate-400 leading-10 ${className} w-32 selected:bg-blue-500 selected:text-white`}
		{...props}
	/>
);

const PricingCard = ({
	name,
	price,
	billingCycle,
	actionText,
	onAction,
	features,
	isDisabled,
}: {
	name: string;
	price: number;
	billingCycle: string;
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
		</div>
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
		<ul className="mt-6 h-1/2 space-y-1.5 *:flex *:items-center *:gap-3 empty:hidden [&_svg]:text-green-500">
			{features.map((item) => (
				<li key={item}>
					<LuCheckCircle />
					{item}
				</li>
			))}
		</ul>
	</div>
);

const Route = () => {
	const { config, user } = useRootLoader();
	const { prices, products } = useLoaderData<typeof loader>();

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
			<Tabs className="flex flex-col gap-8">
				<TabList className="mx-auto flex w-fit items-center justify-center rounded-full border border-white/10 bg-white/10">
					<Tab id="Monthly">Monthly</Tab>
					<Tab id="Annually">Annually</Tab>
				</TabList>
				<div
					className="grid auto-rows-fr grid-rows-1 justify-center gap-8"
					style={{
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 350px))",
					}}
				>
					<PricingCard
						name="Free"
						price={0}
						billingCycle="month"
						actionText={user ? "Go to dashboard" : "Log In"}
						onAction={() => navigate(user ? "/projects" : "/auth/log-in")}
						features={[
							"20 variables/feature flags per environment",
							"2 Environments per project",
							"2 Projects",
						]}
					/>
					{prices.map((item) => (
						<TabPanel id={item.name!} key={item.id}>
							<PricingCard
								name={products.find((p) => p.id === item.productId)?.name!}
								price={Number.parseInt(item.unitPrice.amount, 10) / 100}
								billingCycle={item.billingCycle?.interval!}
								actionText={item.trialPeriod ? "Start Free Trial" : "Subscribe"}
								onAction={() => {
									if (!user) return navigate("/auth/log-in");
									paddleClient?.Checkout.open({
										items: [{ priceId: item.id, quantity: 1 }],
									});
								}}
								features={[
									"1000 variables/feature flags per environment",
									"10 Environments per project",
									"20 Projects",
									"Webhooks",
								]}
								isDisabled={!config.IS_PAYMENT_ENABLED}
								key={item.id}
							/>
						</TabPanel>
					))}
				</div>
			</Tabs>
		</div>
	);
};

export default Route;
