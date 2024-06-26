import "~/root.css";
import { Toaster } from "react-hot-toast";

import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSession, getUserFromSession } from "./utils/auth.server";
import { LOCALE_UK } from "./utils/misc";
import { config } from "./utils/config.server";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

export const ErrorBoundary = () => {
	const error = useRouteError();
	captureRemixErrorBoundaryError(error);

	return (
		<div
			style={{
				padding: "1rem",
				fontFamily: "sans-serif",
			}}
		>
			{error instanceof Error ? (
				<>
					<h1
						style={{
							fontSize: "1.75rem",
							marginTop: 0,
						}}
					>
						Application error
					</h1>
					<pre
						style={{
							padding: "1.5rem",
							borderRadius: "0.5rem",
							backgroundColor: "rgba(255, 0, 0, 0.1)",
							color: "red",
							fontFamily: "monospace",
							lineHeight: 1.25,
							overflowX: "auto",
						}}
					>
						{error.stack}
					</pre>
				</>
			) : (
				<h1 style={{ fontSize: "1.75rem", marginTop: 0 }}>Something went wrong.</h1>
			)}
		</div>
	);
};

const clientConfig = {
	APP_ENV: config.APP_ENV,
	IS_SIGN_UP_ENABLED: config.IS_SIGN_UP_ENABLED,
	IS_LOG_IN_ENABLED: config.IS_LOG_IN_ENABLED,
	IS_PAYMENT_ENABLED: config.IS_PAYMENT_ENABLED,
	PADDLE_CLIENT_TOKEN: config.VITE_PADDLE_CLIENT_TOKEN,
	PADDLE_ENVIRONMENT: config.VITE_PADDLE_ENVIRONMENT,
} as const;

export const loader = async (args: LoaderFunctionArgs) => {
	const locale = args.request.headers.get("Accept-Language")?.split(",")[0] ?? LOCALE_UK;
	const session = await getSession(args.request.headers.get("Cookie"));
	const user = await getUserFromSession(session);

	return {
		config: clientConfig,
		user,
		locale,
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
		<body className="bg-dark font-inter text-white">
			<Toaster />
			<Outlet />
			<ScrollRestoration />
			<Scripts />
		</body>
	</html>
);

export default App;
