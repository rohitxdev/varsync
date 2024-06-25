import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { useLoaderData } from '@remix-run/react';
import { initializePaddle } from '@paddle/paddle-js';
import { useRootLoader } from '~/utils/hooks';
import { config } from '~/utils/config.server';

const paddle = new Paddle(config.PADDLE_API_KEY, {
	environment: Environment.production,
});

export const loader = async () => {
	try {
		const getPrices = paddle.prices.list();
		const prices = await getPrices.next();
		return { prices };
	} catch (error) {
		console.log(error);
	}
	return null;
};

const paddleClient = await initializePaddle({
	token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
});

const Route = () => {
	const { user } = useRootLoader();
	console.log(user);

	const data = useLoaderData<typeof loader>();
	console.log(data?.prices);

	return (
		<div className="h-screen p-6">
			<h1 className="mb-4 text-center text-4xl font-bold">Pricing</h1>
			<div className="flex flex-wrap justify-center gap-8">
				{data?.prices.map((item) => (
					<div className="rounded-md bg-neutral-800 p-6 shadow-lg" key={item.id}>
						<h2 className="text-xl font-semibold text-neutral-300">{item.name}</h2>
						<p className="p-2">
							$&nbsp;
							<span className="text-2xl font-bold">
								{Number.parseFloat(item.unitPrice.amount) / 100}
							</span>
						</p>
						<p>{item.description}</p>
						<button
							className="mt-4 w-full rounded-lg bg-blue-500 px-6 py-2 font-semibold"
							type="button"
							onClick={() =>
								paddleClient?.Checkout.open({
									items: [{ priceId: item.id, quantity: 1 }],
								})
							}
						>
							Subscribe
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default Route;
