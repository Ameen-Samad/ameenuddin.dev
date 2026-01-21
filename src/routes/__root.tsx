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
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
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
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(true);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<MantineProvider theme={theme} defaultColorScheme={isDarkMode ? "dark" : "light"}>
					<Sidebar
						collapsed={isSidebarCollapsed}
						onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
					<div className="ml-0 md:ml-[280px] min-h-dvh transition-all duration-300 ease-out">
						{children}
					</div>
					<Scripts />
				</MantineProvider>
			</body>
		</html>
	);
}

function RootLayout() {
	return <Outlet />;
}
