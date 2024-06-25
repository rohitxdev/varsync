import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { Button, Dialog, Heading } from 'react-aria-components';
import Spinner from '~/assets/spinner.svg?react';

interface DeleteAccessTokenDialogProps {
	token: string;
}
export const DeleteAccessTokenDialog = ({ token }: DeleteAccessTokenDialogProps) => {
	const fetcher = useFetcher();
	const closeFn = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (fetcher.state === 'idle') {
			closeFn.current?.();
		}
	}, [fetcher.state]);

	return (
		<Dialog className="grid w-[60ch] gap-2 rounded bg-white p-6">
			{({ close }) => (
				<>
					<Heading className="text-lg font-semibold">Delete access token</Heading>
					<p className="text-sm text-neutral-400">
						Are you sure you want to delete this token? Apps using this token will no longer be able
						to access this project's vault.
					</p>
					<div className="mt-2 flex justify-end gap-4 text-sm font-semibold">
						<Button className="rounded bg-neutral-300 px-6 py-2 text-black" onPress={close}>
							Cancel
						</Button>
						<Button
							className="h-9 w-32 rounded bg-red-500 text-white disabled:brightness-75"
							onPress={() => {
								fetcher.submit({ token }, { method: 'DELETE', encType: 'application/json' });
								closeFn.current = close;
							}}
							isDisabled={fetcher.state === 'submitting'}
						>
							{fetcher.state === 'submitting' ? (
								<Spinner className="mx-auto size-4 fill-white" />
							) : (
								'Delete'
							)}
						</Button>
					</div>
				</>
			)}
		</Dialog>
	);
};
