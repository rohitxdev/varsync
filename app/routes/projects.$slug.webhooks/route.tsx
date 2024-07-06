import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async (args: LoaderFunctionArgs) => {
	return null;
};

const Route = () => {
	return (
		<div className="h-full px-8 py-6">
			<h1 className="mb-2 font-semibold text-3xl">Webhooks</h1>
			<p>Coming soon</p>
		</div>
	);
};

export default Route;
