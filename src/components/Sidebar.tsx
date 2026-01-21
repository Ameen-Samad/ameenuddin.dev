import {
	ActionIcon,
	Box,
	Group,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconCode,
	IconMenu2,
	IconMoon,
	IconSun,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { type NavItem, navItems, socialLinks } from "../lib/navigation-data";
import { downloadResumePDF } from "../lib/generate-pdf";
import { cn } from "../lib/utils";

interface SidebarProps {
	collapsed?: boolean;
	onToggleCollapse?: () => void;
	onMobileOpen?: () => void;
	isDarkMode?: boolean;
	onThemeToggle?: () => void;
}

export function Sidebar({
	collapsed = false,
	onToggleCollapse,
	onMobileOpen,
	isDarkMode = true,
	onThemeToggle,
}: SidebarProps) {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
	const shouldReduceMotion = useReducedMotion();

	const toggleExpand = (itemId: string) => {
		setExpandedItems((prev) => {
			const next = new Set(prev);
			if (next.has(itemId)) {
				next.delete(itemId);
			} else {
				next.add(itemId);
			}
			return next;
		});
	};

	const handleItemClick = (item: NavItem) => {
		if (item.id === "resume") {
			downloadResumePDF();
		} else if (item.children) {
			toggleExpand(item.id);
		}
	};

	const isAnchorLink = (path?: string) => {
		return path?.startsWith("/#");
	};

	const handleAnchorClick = (e: React.MouseEvent, path: string) => {
		e.preventDefault();
		const anchor = path.split("#")[1];
		if (!anchor) return;

		// Check if we're on the home page
		const isOnHomePage = window.location.pathname === "/";

		if (isOnHomePage) {
			// We're already on home, just scroll
			const element = document.getElementById(anchor);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		} else {
			// Navigate to home with hash, browser will handle scroll
			window.location.href = path;
		}
	};

	return (
		<>
			{/* Mobile Hamburger - visible only on mobile */}
			<Box
				className={cn(
					"md:hidden fixed top-4 right-4 z-[1000]",
					"safe-area-inset-top safe-area-inset-right"
				)}
			>
				<ActionIcon
					size="lg"
					variant="filled"
					color="cyan"
					onClick={onMobileOpen}
					aria-label="Open navigation menu"
					className="shadow-lg"
				>
					<IconMenu2 size={20} />
				</ActionIcon>
			</Box>

			{/* Desktop Sidebar - hidden on mobile */}
			<Box
				className={cn(
					"hidden md:flex",
					"fixed top-0 left-0 h-dvh",
					"bg-slate-900/95 backdrop-blur-xl",
					"border-r border-cyan-500/10",
					"z-[100] flex-col overflow-hidden",
					"transition-all duration-300 ease-out",
					collapsed ? "w-20" : "w-70",
					"safe-area-inset-left"
				)}
			>
				{/* Logo Section */}
				<Box className={cn(
					"border-b border-white/5",
					collapsed ? "p-4" : "p-6"
				)}>
					<Link to="/" className="no-underline">
						<Group gap={collapsed ? 0 : "sm"} justify="center">
							<IconCode size={28} className="text-cyan-500 flex-shrink-0" />
							{!collapsed && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{
										duration: shouldReduceMotion ? 0 : 0.2,
										ease: "easeOut"
									}}
								>
									<Text className="text-white text-xl font-bold text-balance">
										Ameenuddin
									</Text>
								</motion.div>
							)}
						</Group>
					</Link>
				</Box>

				{/* Navigation Items */}
				<Stack
					gap="xs"
					className={cn(
						"flex-1 overflow-y-auto overflow-x-hidden",
						collapsed ? "p-2" : "p-4"
					)}
				>
					{navItems.map((item) => (
						<NavItemComponent
							key={item.id}
							item={item}
							collapsed={collapsed}
							expanded={expandedItems.has(item.id)}
							onToggle={() => handleItemClick(item)}
							depth={0}
							shouldReduceMotion={shouldReduceMotion}
							expandedItems={expandedItems}
							toggleExpand={toggleExpand}
						/>
					))}
				</Stack>

				{/* Social Links & Theme Toggle */}
				<Box className={cn(
					"border-t border-white/5",
					collapsed ? "p-2" : "p-4"
				)}>
					<Group gap="sm" justify={collapsed ? "center" : "flex-start"} className="mb-3">
						{socialLinks.map((social) => (
							<Tooltip key={social.id} label={social.label} position="right">
								<ActionIcon
									component="a"
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									size="lg"
									variant="subtle"
									color="gray"
									className={cn(
										"transition-all duration-200 ease-out",
										"hover:text-cyan-500 hover:-translate-y-0.5"
									)}
								>
									{social.icon}
								</ActionIcon>
							</Tooltip>
						))}
					</Group>

					{/* Theme Toggle */}
					<Tooltip
						label={isDarkMode ? "Light Mode" : "Dark Mode"}
						position="right"
					>
						<UnstyledButton
							onClick={onThemeToggle}
							className={cn(
								"w-full rounded-lg bg-white/5",
								"transition-all duration-200 ease-out",
								"hover:bg-cyan-500/10",
								"flex items-center gap-3",
								collapsed ? "p-3 justify-center" : "px-4 py-3 justify-start"
							)}
						>
							{isDarkMode ? (
								<IconSun size={20} className="text-cyan-500 flex-shrink-0" />
							) : (
								<IconMoon size={20} className="text-cyan-500 flex-shrink-0" />
							)}
							{!collapsed && (
								<Text size="sm" className="text-white">
									{isDarkMode ? "Light Mode" : "Dark Mode"}
								</Text>
							)}
						</UnstyledButton>
					</Tooltip>
				</Box>
			</Box>
		</>
	);
}

interface NavItemComponentProps {
	item: NavItem;
	collapsed: boolean;
	expanded: boolean;
	onToggle: () => void;
	depth: number;
	shouldReduceMotion: boolean | null;
	expandedItems: Set<string>;
	toggleExpand: (id: string) => void;
}

function NavItemComponent({
	item,
	collapsed,
	expanded,
	onToggle,
	depth,
	shouldReduceMotion,
	expandedItems,
	toggleExpand,
}: NavItemComponentProps) {
	const hasChildren = item.children && item.children.length > 0;
	const paddingLeft = collapsed ? 0 : depth * 1.5;

	const isAnchorLink = (path?: string) => {
		return path?.startsWith("/#");
	};

	const handleAnchorClick = (e: React.MouseEvent, path: string) => {
		e.preventDefault();
		const anchor = path.split("#")[1];
		if (anchor) {
			const element = document.getElementById(anchor);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "start" });
			} else {
				window.location.href = path;
			}
		}
	};

	const ItemContent = (
		<UnstyledButton
			onClick={onToggle}
			className={cn(
				"w-full rounded-lg bg-transparent",
				"transition-all duration-200 ease-out",
				"hover:bg-cyan-500/10",
				"flex items-center justify-between gap-3",
				collapsed
					? "p-3 justify-center hover:scale-110"
					: `px-4 py-3 hover:translate-x-1`,
				collapsed ? "" : `pl-[${1 + paddingLeft}rem]`
			)}
		>
			<Group gap="sm" className="flex-1">
				<Box className="text-cyan-500 flex-shrink-0">{item.icon}</Box>
				{!collapsed && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: shouldReduceMotion ? 0 : 0.2,
							ease: "easeOut"
						}}
					>
						<Text size="sm" className="text-white font-medium truncate">
							{item.label}
						</Text>
					</motion.div>
				)}
			</Group>
			{!collapsed && hasChildren && (
				<motion.div
					animate={{ rotate: expanded ? 0 : -90 }}
					transition={{
						duration: shouldReduceMotion ? 0 : 0.2,
						ease: "easeOut"
					}}
				>
					<IconChevronDown size={16} className="text-white/50" />
				</motion.div>
			)}
		</UnstyledButton>
	);

	return (
		<>
			{hasChildren || item.id === "resume" ? (
				<Tooltip
					label={item.label}
					position="right"
					disabled={!collapsed}
					withArrow
				>
					{ItemContent}
				</Tooltip>
			) : isAnchorLink(item.path) ? (
				<Tooltip
					label={item.label}
					position="right"
					disabled={!collapsed}
					withArrow
				>
					<a
						href={item.path}
						onClick={(e) => handleAnchorClick(e, item.path!)}
						className="no-underline block"
					>
						{ItemContent}
					</a>
				</Tooltip>
			) : (
				<Tooltip
					label={item.label}
					position="right"
					disabled={!collapsed}
					withArrow
				>
					<Link
						to={item.path || "#"}
						className="no-underline block"
					>
						{ItemContent}
					</Link>
				</Tooltip>
			)}

			{/* Children */}
			<AnimatePresence>
				{hasChildren && expanded && !collapsed && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							duration: shouldReduceMotion ? 0 : 0.3,
							ease: "easeOut"
						}}
						className="overflow-hidden"
					>
						<Stack gap="xs" className="mt-2">
							{item.children?.map((child) => {
								// If child has its own children, render as a nested NavItemComponent
								if (child.children && child.children.length > 0) {
									return (
										<NavItemComponent
											key={child.id}
											item={child}
											collapsed={collapsed}
											expanded={expandedItems.has(child.id)}
											onToggle={() => toggleExpand(child.id)}
											depth={depth + 1}
											shouldReduceMotion={shouldReduceMotion}
											expandedItems={expandedItems}
											toggleExpand={toggleExpand}
										/>
									);
								}

								// Otherwise render as a link/button
								const ChildButton = (
									<UnstyledButton
										className={cn(
											"w-full rounded-md bg-transparent",
											"transition-all duration-200 ease-out",
											"hover:bg-cyan-500/8 hover:translate-x-1.5",
											"flex items-center gap-3",
											`px-4 py-2 pl-[${2 + paddingLeft}rem]`,
											"min-h-[44px]" // Touch target
										)}
									>
										<Box className="text-cyan-500 flex-shrink-0">
											{child.icon}
										</Box>
										<Text size="sm" className="text-gray-400 truncate">
											{child.label}
										</Text>
									</UnstyledButton>
								);

								if (child.id === "resume") {
									return (
										<div
											key={child.id}
											className="no-underline cursor-pointer"
										>
											{ChildButton}
										</div>
									);
								}

								if (isAnchorLink(child.path)) {
									return (
										<a
											key={child.id}
											href={child.path}
											onClick={(e) => handleAnchorClick(e, child.path!)}
											className="no-underline"
											style={{ display: 'block' }}
										>
											{ChildButton}
										</a>
									);
								}

								return (
									<Link
										key={child.id}
										to={child.path || "#"}
										className="no-underline"
									>
										{ChildButton}
									</Link>
								);
							})}
						</Stack>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
