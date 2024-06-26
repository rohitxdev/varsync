import { useLoaderData } from "@remix-run/react";
import { type Price, initializePaddle } from "@paddle/paddle-js";
import { paddle } from "~/utils/payments.server";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

export const loader = async () => {
	try {
		const getPrices = paddle.prices.list();
		const prices = await getPrices.next();
		return { prices };
	} catch (error) {
		return { prices: [] };
	}
};

const paddleClient = await initializePaddle({
	token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
	environment: import.meta.env.VITE_PADDLE_ENVIRONMENT,
});

const PricingCard = ({ price }: { price: Price }) => {
	return (
		<div className="flex h-64 w-80 flex-col justify-between rounded-md bg-neutral-800 p-6 shadow-lg">
			<div>
				<h2 className="font-semibold text-neutral-300 text-xl">{price.name}</h2>
				<p className="p-2">
					$&nbsp;
					<span className="font-bold text-2xl">
						{Number.parseFloat(price.unitPrice.amount) / 100}
					</span>
				</p>
				<p>{price.description}</p>
			</div>
			<button
				className="mt-4 w-full rounded-lg bg-blue-500 px-6 py-2 font-semibold"
				type="button"
				onClick={() =>
					paddleClient?.Checkout.open({
						items: [{ priceId: price.id, quantity: 1 }],
					})
				}
			>
				Subscribe
			</button>
		</div>
	);
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	const monthlyPrice = data.prices.find((item) => item.billingCycle?.interval === "month");
	const yearlyPrice = data.prices.find((item) => item.billingCycle?.interval === "year");

	return (
		<div className="h-screen p-6">
			<h1 className="mb-4 text-center font-bold text-4xl">Pricing</h1>
			<Tabs className="flex flex-col items-center gap-8">
				<TabList className="flex rounded-full border p-1 font-semibold *:basis-full *:rounded-full *:px-8 *:py-1">
					<Tab className="selected:bg-blue-500" id="monthly">
						Monthly
					</Tab>
					<Tab className="selected:bg-blue-500" id="yearly">
						Yearly
					</Tab>
				</TabList>
				<div className="flex flex-wrap justify-center gap-8">
					<TabPanel id="monthly">
						<PricingCard price={monthlyPrice as Price} />
					</TabPanel>
					<TabPanel id="yearly">
						<PricingCard price={yearlyPrice as Price} />
					</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};

export default Route;
