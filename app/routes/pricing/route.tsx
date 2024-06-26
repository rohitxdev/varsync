import { useLoaderData, useNavigate } from "@remix-run/react";
import { type Paddle, type Price, initializePaddle } from "@paddle/paddle-js";
import { paddle } from "~/utils/payments.server";
import { useRootLoader } from "~/utils/hooks";
import { useEffect, useState } from "react";

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
	price,
	onAction,
	isDisabled,
}: {
	price: Price;
	onAction: () => void;
	isDisabled: boolean;
}) => (
	<div className="flex h-64 w-80 flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
		<div>
			<h2 className="font-bold text-xl">{price.name}</h2>
			<p className="p-2 font-bold text-2xl">
				${Number.parseFloat(price.unitPrice.amount) / 100}&nbsp;
				<span className="font-medium text-neutral-400 text-sm">
					/{price.billingCycle?.interval}
				</span>
			</p>
			<p className="text-neutral-400 text-sm">{price.description}</p>
		</div>
		<button
			className="mt-4 w-full rounded-lg bg-blue-500 px-6 py-2 font-semibold disabled:cursor-not-allowed disabled:brightness-75"
			type="button"
			onClick={() => {
				onAction();
			}}
			disabled={isDisabled}
		>
			{price.trialPeriod ? "Start Free Trial" : "Subscribe"}
		</button>
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
			<div className="flex flex-wrap justify-center gap-8">
				{prices.map((item) => (
					<PricingCard
						price={item as Price}
						onAction={() => {
							if (!user) return navigate("/auth/log-in");
							paddleClient?.Checkout.open({
								items: [{ priceId: item.id, quantity: 1 }],
							});
						}}
						isDisabled={!config.IS_PAYMENT_ENABLED}
						key={item.id}
					/>
				))}
			</div>
		</div>
	);
};

export default Route;
