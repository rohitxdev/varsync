import '~/root.css';
import { Toaster } from 'react-hot-toast';

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
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
			<body className="bg-neutral-900 font-inter">
				<Toaster />
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
