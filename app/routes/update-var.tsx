import { ActionFunctionArgs } from '@remix-run/node';

export const action = async (args: ActionFunctionArgs) => {
	const formData = Object.fromEntries((await args.request.formData()).entries());
	switch (args.request.method) {
		case 'PUT': {
			console.log(formData);
		}
		default:
			break;
	}

	return null;
};
