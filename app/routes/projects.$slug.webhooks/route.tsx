import type { LoaderFunctionArgs } from "@remix-run/node";
import { LuPlus } from "react-icons/lu";
import { Button } from "~/components/buttons";

export const loader = async (args: LoaderFunctionArgs) => {
	return null;
};

const Route = () => {
	return (
		<div className="h-full px-8 py-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="mb-2 font-semibold text-3xl">Webhooks</h1>
				<Button variant="primary" className="text-sm">
					<LuPlus className="size-5" /> New Webhook
				</Button>
			</div>
		</div>
	);
};

export default Route;
