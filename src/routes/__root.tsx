import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { trpcClient } from "@/integrations/tanstack-query/root-provider";
import { TRPCProvider } from "@/integrations/trpc/react";
import type { TRPCRouter } from "@/integrations/trpc/router";
import { MobileNav } from "../components/MobileNav";
import { Sidebar } from "../components/Sidebar";
import { WhatsAppButton } from "../components/WhatsAppButton";
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
				content:
					"width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
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
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(true);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<MantineProvider
					theme={theme}
					defaultColorScheme={isDarkMode ? "dark" : "light"}
				>
					<TRPCProvider
						trpcClient={trpcClient}
						queryClient={useTRPCQueryClient()}
					>
						<Sidebar
							collapsed={isSidebarCollapsed}
							onToggleCollapse={() =>
								setIsSidebarCollapsed(!isSidebarCollapsed)
							}
							onMobileOpen={() => setIsMobileNavOpen(true)}
							isDarkMode={isDarkMode}
							onThemeToggle={() => setIsDarkMode(!isDarkMode)}
						/>
						<MobileNav
							isOpen={isMobileNavOpen}
							onClose={() => setIsMobileNavOpen(false)}
							isDarkMode={isDarkMode}
							onThemeToggle={() => setIsDarkMode(!isDarkMode)}
						/>
						<div
							className="ml-0 md:ml-[280px] min-h-dvh transition-all duration-300 ease-out"
							style={{ overflowX: "hidden" }}
						>
							{children}
						</div>
						<WhatsAppButton />
						<Notifications position="top-right" zIndex={9999} />
						<Scripts />
					</TRPCProvider>
				</MantineProvider>
			</body>
		</html>
	);
}

function RootLayout() {
	return <Outlet />;
}
