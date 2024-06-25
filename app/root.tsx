import '~/root.css';
import { Toaster } from 'react-hot-toast';

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getSession, getUserFromSession } from './utils/auth.server';
import { LOCALE_UK } from './utils/misc';
import { config } from './utils/config.server';

const clientConfig = {
	ENV: config.ENV,
	IS_SIGN_UP_ENABLED: config.IS_SIGN_UP_ENABLED,
	IS_LOG_IN_ENABLED: config.IS_LOG_IN_ENABLED,
	IS_PAYMENT_ENABLED: config.IS_PAYMENT_ENABLED,
} as const;

export const loader = async (args: LoaderFunctionArgs) => {
	const locale = args.request.headers.get('Accept-Language')?.split(',')[0] ?? LOCALE_UK;
	const session = await getSession(args.request.headers.get('Cookie'));
	const user = await getUserFromSession(session);

	return {
		user,
		locale,
		config: clientConfig,
	};
};

const App = () => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			<link
				href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
				rel="stylesheet"
			/>
			<link rel="shortcut icon" href="/logo.svg" type="image/svg+xml" />
			<Meta />
			<Links />
		</head>
		<body className="bg-navy-blue font-inter text-white">
			<Toaster />
			<Outlet />
			<ScrollRestoration />
			<Scripts />
		</body>
	</html>
);

export default App;
