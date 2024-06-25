import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useRevalidator } from '@remix-run/react';
import { Button } from 'react-aria-components';
import toast from 'react-hot-toast';
import { LuCopy, LuRefreshCw, LuTrash2 } from 'react-icons/lu';
import { DeleteAccessTokenDialog } from './dialogs';
import { addAccessToken, deleteAccessToken, getAccessTokens } from '~/utils/db.server';
import { Modal } from '~/components/ui';

export const loader = (args: LoaderFunctionArgs) => {
	return { tokens: getAccessTokens(args.params.projectId!) };
};

export const action = async (args: ActionFunctionArgs) => {
	const { searchParams } = new URL(args.request.url);
	const {
		params: { projectId },
	} = args;
	if (!projectId) throw new Error('projectId missing');

	const env = searchParams.get('env') ?? 'development';

	switch (args.request.method) {
		case 'POST':
			addAccessToken(projectId, env);
			break;
		case 'DELETE': {
			const { id } = await args.request.json();
			deleteAccessToken(id);
			break;
		}
		default:
			break;
	}

	return null;
};

const Route = () => {
	const { tokens } = useLoaderData<typeof loader>();
	const { revalidate } = useRevalidator();

	return (
		<div className="h-full p-4">
			<h1 className="mb-2 text-2xl font-semibold">Access Tokens</h1>
			<Form method="POST">
				<Button className="flex items-center gap-2 rounded border border-black p-2" type="submit">
					Generate <LuRefreshCw />
				</Button>
			</Form>
			<div className="flex w-full max-w-[80ch] flex-col gap-2 rounded bg-neutral-100 p-4">
				{(tokens as { id: string; token: string }[]).map(({ id, token }) => (
					<div className="flex gap-4" key={id}>
						<p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">{token}</p>
						<Button
							onPress={() =>
								toast.promise(navigator.clipboard.writeText(token), {
									loading: 'Copying to clipboard...',
									success: 'Copied to clipboard!',
									error: 'Failed to copy to clipboard',
								})
							}
						>
							<LuCopy />
						</Button>
						<Modal
							dialog={
								<DeleteAccessTokenDialog
									onDelete={() =>
										fetch(location.href, {
											method: 'DELETE',
											body: JSON.stringify({ id }),
										})
											.then(revalidate)
											.catch(alert)
									}
								/>
							}
						>
							<Button>
								<LuTrash2 />
							</Button>
						</Modal>
					</div>
				))}
			</div>
		</div>
	);
};

export default Route;
