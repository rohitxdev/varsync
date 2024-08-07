import "~/root.css";
import { Toaster } from "react-hot-toast";

import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
	useLocation,
	useRevalidator,
	useRouteError,
} from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { useEffect } from "react";
import { getUser } from "./utils/auth.server";
import { config } from "./utils/config.server";
import { LOCALE_UK } from "./utils/misc";

declare global {
	interface Window {
		umami?: {
			track: (props: Record<string, string> | CallableFunction) => void;
		};
	}
}

export const ErrorBoundary = () => {
	const error = useRouteError();
	captureRemixErrorBoundaryError(error);

	return (
		<div
			style={{
				padding: "1rem",
				fontFamily: "system-ui",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				minHeight: "100vh",
			}}
		>
			{isRouteErrorResponse(error) ? (
				<>
					<img src={`https://http.cat/${error.status}`} width={500} alt="" />
					<p>{error.data}</p>
				</>
			) : error instanceof Error ? (
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
	UMAMI_WEBSITE_ID: config.UMAMI_WEBSITE_ID,
	API_RATE_LIMIT_PER_MINUTE: config.API_RATE_LIMIT_PER_MINUTE,
} as const;

export const loader = async (args: LoaderFunctionArgs) => {
	const locale = args.request.headers.get("Accept-Language")?.split(",")[0] ?? LOCALE_UK;
	const user = await getUser(args.request);

	return {
		config: clientConfig,
		user,
		locale,
	};
};

const App = () => {
	const { revalidate } = useRevalidator();
	const data = useLoaderData<typeof loader>();
	const location = useLocation();

	useEffect(() => {
		const handleVisibilityChange = () => document.visibilityState === "visible" && revalidate();

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [revalidate]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const url = window.location.href;
		window.umami?.track((props: Record<string, string>) => ({
			...props,
			url: window.location.pathname.includes("/projects")
				? `${url.split("/projects")[0]}/projects`
				: url,
		}));
	}, [location]);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
					rel="stylesheet"
				/>
				{data.config.APP_ENV === "production" && (
					<script
						defer
						src="https://cloud.umami.is/script.js"
						data-website-id={data.config.UMAMI_WEBSITE_ID}
						data-auto-track="false"
					/>
				)}
				<link rel="shortcut icon" href="/logo-bg.svg" type="image/svg+xml" />
				<Meta />
				<Links />
			</head>
			<body className="bg-dark font-archivo text-white">
				<Toaster position="bottom-right" />
				<Outlet />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

export default App;
