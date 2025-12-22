import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

export default function App() {
	return (
		// biome-ignore lint/a11y/useHtmlLang: html
		<html>
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<Meta />
				<Links />
			</head>
			<body>
				<h1>Hello world!</h1>
				<Outlet />

				<Scripts />
			</body>
		</html>
	);
}
