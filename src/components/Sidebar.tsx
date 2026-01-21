import {
	ActionIcon,
	Box,
	Group,
	Stack,
	Text,
	Title,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronRight,
	IconCode,
	IconMenu2,
	IconMoon,
	IconSun,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { type NavItem, navItems, socialLinks } from "../lib/navigation-data";
import { downloadResumePDF } from "../lib/generate-pdf";

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

	return (
		<>
			{/* Mobile Hamburger - visible only on mobile */}
			<Box
				className="md:hidden"
				style={{
					position: "fixed",
					top: "1rem",
					right: "1rem",
					zIndex: 1000,
				}}
			>
				<ActionIcon
					size="lg"
					variant="filled"
					color="cyan"
					onClick={onMobileOpen}
					aria-label="Open menu"
				>
					<IconMenu2 size={20} />
				</ActionIcon>
			</Box>

			{/* Desktop Sidebar - hidden on mobile */}
			<Box
				className="hidden md:block"
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					height: "100vh",
					width: collapsed ? "80px" : "280px",
					background: "rgba(10, 10, 15, 0.95)",
					backdropFilter: "blur(12px)",
					borderRight: "1px solid rgba(0, 243, 255, 0.1)",
					transition: "width 0.3s ease",
					zIndex: 100,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				{/* Logo Section */}
				<Box
					style={{
						padding: collapsed ? "1.5rem 1rem" : "1.5rem",
						borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
					}}
				>
					<Link to="/" style={{ textDecoration: "none" }}>
						<Group gap={collapsed ? 0 : "sm"} justify="center">
							<IconCode size={28} style={{ color: "#00f3ff" }} />
							{!collapsed && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Title order={4} c="white" size="1.25rem">
										Ameenuddin
									</Title>
								</motion.div>
							)}
						</Group>
					</Link>
				</Box>

				{/* Navigation Items */}
				<Stack
					gap="xs"
					style={{
						padding: collapsed ? "1rem 0.5rem" : "1rem",
						flex: 1,
						overflowY: "auto",
						overflowX: "hidden",
					}}
				>
					{navItems.map((item) => (
						<NavItemComponent
							key={item.id}
							item={item}
							collapsed={collapsed}
							expanded={expandedItems.has(item.id)}
							onToggle={() => handleItemClick(item)}
							depth={0}
						/>
					))}
				</Stack>

				{/* Social Links */}
				<Box
					style={{
						padding: collapsed ? "1rem 0.5rem" : "1rem",
						borderTop: "1px solid rgba(255, 255, 255, 0.05)",
					}}
				>
					<Group gap="sm" justify={collapsed ? "center" : "flex-start"}>
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
									style={{
										transition: "all 0.2s ease",
									}}
									styles={{
										root: {
											"&:hover": {
												color: "#00f3ff",
												transform: "translateY(-2px)",
											},
										},
									}}
								>
									{social.icon}
								</ActionIcon>
							</Tooltip>
						))}
					</Group>

					{/* Theme Toggle */}
					<Box mt="md">
						<Tooltip
							label={isDarkMode ? "Light Mode" : "Dark Mode"}
							position="right"
						>
							<UnstyledButton
								onClick={onThemeToggle}
								style={{
									width: "100%",
									padding: collapsed ? "0.75rem" : "0.75rem 1rem",
									borderRadius: "0.5rem",
									background: "rgba(255, 255, 255, 0.05)",
									transition: "all 0.2s ease",
									display: "flex",
									alignItems: "center",
									justifyContent: collapsed ? "center" : "flex-start",
									gap: "0.75rem",
								}}
								styles={{
									root: {
										"&:hover": {
											background: "rgba(0, 243, 255, 0.1)",
										},
									},
								}}
							>
								{isDarkMode ? (
									<IconSun size={20} color="#00f3ff" />
								) : (
									<IconMoon size={20} color="#00f3ff" />
								)}
								{!collapsed && (
									<Text size="sm" c="white">
										{isDarkMode ? "Light Mode" : "Dark Mode"}
									</Text>
								)}
							</UnstyledButton>
						</Tooltip>
					</Box>
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
}

function NavItemComponent({
	item,
	collapsed,
	expanded,
	onToggle,
	depth,
}: NavItemComponentProps) {
	const hasChildren = item.children && item.children.length > 0;
	const paddingLeft = collapsed ? 0 : depth * 1.5;

	const ItemContent = (
		<UnstyledButton
			onClick={onToggle}
			style={{
				width: "100%",
				padding: collapsed ? "0.75rem" : `0.75rem ${1 + paddingLeft}rem`,
				borderRadius: "0.5rem",
				background: "transparent",
				transition: "all 0.2s ease",
				display: "flex",
				alignItems: "center",
				justifyContent: collapsed ? "center" : "space-between",
				gap: "0.75rem",
			}}
			styles={{
				root: {
					"&:hover": {
						background: "rgba(0, 243, 255, 0.1)",
						transform: collapsed ? "scale(1.1)" : "translateX(4px)",
					},
				},
			}}
		>
			<Group gap="sm" style={{ flex: 1 }}>
				<Box style={{ color: "#00f3ff", flexShrink: 0 }}>{item.icon}</Box>
				{!collapsed && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Text size="sm" c="white" fw={500}>
							{item.label}
						</Text>
					</motion.div>
				)}
			</Group>
			{!collapsed && hasChildren && (
				<motion.div
					animate={{ rotate: expanded ? 0 : -90 }}
					transition={{ duration: 0.2 }}
				>
					<IconChevronDown size={16} color="rgba(255, 255, 255, 0.5)" />
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
			) : (
				<Tooltip
					label={item.label}
					position="right"
					disabled={!collapsed}
					withArrow
				>
					<Link
						to={item.path || "#"}
						style={{ textDecoration: "none", display: "block" }}
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
						transition={{ duration: 0.3, ease: "easeInOut" }}
						style={{ overflow: "hidden" }}
					>
						<Stack gap="xs" mt="xs">
							{item.children?.map((child) => (
								<Link
									key={child.id}
									to={child.path || "#"}
									style={{ textDecoration: "none" }}
									onClick={() => {
										if (child.id === "resume") {
											downloadResumePDF();
										}
									}}
								>
									<UnstyledButton
										style={{
											width: "100%",
											padding: `0.5rem ${2 + paddingLeft}rem`,
											borderRadius: "0.5rem",
											background: "transparent",
											transition: "all 0.2s ease",
											display: "flex",
											alignItems: "center",
											gap: "0.75rem",
										}}
										styles={{
											root: {
												"&:hover": {
													background: "rgba(0, 243, 255, 0.08)",
													transform: "translateX(6px)",
												},
											},
										}}
									>
										<Box style={{ color: "#00f3ff", flexShrink: 0 }}>
											{child.icon}
										</Box>
										<Text size="sm" c="dimmed">
											{child.label}
										</Text>
									</UnstyledButton>
								</Link>
							))}
						</Stack>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
