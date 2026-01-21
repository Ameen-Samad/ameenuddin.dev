import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "@/integrations/trpc/router";
import Header from "../components/Header";
import appCss from "../styles.css?url";

const theme = createTheme({
	fontFamily: "Inter, sans-serif",
	defaultRadius: "md",
});

interface MyRouterContext {
	queryClient: QueryClient;
	trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Ameenuddin.dev | AI-Native Software Engineer",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	component: RootLayout,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<MantineProvider theme={theme} defaultColorScheme="dark">
					<Header />
					{children}
					<Scripts />
				</MantineProvider>
			</body>
		</html>
	);
}

function RootLayout() {
	return <Outlet />;
}
