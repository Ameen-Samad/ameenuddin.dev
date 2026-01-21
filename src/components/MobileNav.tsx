import {
	ActionIcon,
	Box,
	Group,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconCode,
	IconMoon,
	IconSun,
	IconX,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { type NavItem, navItems, socialLinks } from "../lib/navigation-data";
import { downloadResumePDF } from "../lib/generate-pdf";

interface MobileNavProps {
	isOpen: boolean;
	onClose: () => void;
	isDarkMode?: boolean;
	onThemeToggle?: () => void;
}

export function MobileNav({
	isOpen,
	onClose,
	isDarkMode = true,
	onThemeToggle,
}: MobileNavProps) {
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
			onClose();
		} else if (item.children) {
			toggleExpand(item.id);
		} else {
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						onClick={onClose}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(0, 0, 0, 0.7)",
							backdropFilter: "blur(8px)",
							zIndex: 999,
						}}
						className="md:hidden"
					/>

					{/* Mobile Menu */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						style={{
							position: "fixed",
							top: 0,
							right: 0,
							bottom: 0,
							width: "85%",
							maxWidth: "400px",
							background: "rgba(10, 10, 15, 0.98)",
							backdropFilter: "blur(12px)",
							borderLeft: "1px solid rgba(0, 243, 255, 0.1)",
							zIndex: 1000,
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
						className="md:hidden"
					>
						{/* Header */}
						<Box
							style={{
								padding: "1.5rem",
								borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Link
								to="/"
								style={{ textDecoration: "none" }}
								onClick={onClose}
							>
								<Group gap="sm">
									<IconCode size={32} style={{ color: "#00f3ff" }} />
									<Title order={3} c="white" size="1.5rem">
										Ameenuddin
									</Title>
								</Group>
							</Link>

							<ActionIcon
								size="lg"
								variant="subtle"
								color="gray"
								onClick={onClose}
								aria-label="Close menu"
							>
								<IconX size={24} />
							</ActionIcon>
						</Box>

						{/* Navigation */}
						<Stack
							gap="sm"
							style={{
								padding: "1.5rem",
								flex: 1,
								overflowY: "auto",
							}}
						>
							{navItems.map((item) => (
								<MobileNavItem
									key={item.id}
									item={item}
									expanded={expandedItems.has(item.id)}
									onToggle={() => handleItemClick(item)}
									onClose={onClose}
								/>
							))}
						</Stack>

						{/* Footer */}
						<Box
							style={{
								padding: "1.5rem",
								borderTop: "1px solid rgba(255, 255, 255, 0.05)",
							}}
						>
							{/* Social Links */}
							<Group gap="md" justify="center" mb="md">
								{socialLinks.map((social) => (
									<ActionIcon
										key={social.id}
										component="a"
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										size="xl"
										variant="light"
										color="cyan"
										style={{
											transition: "all 0.2s ease",
										}}
									>
										{social.icon}
									</ActionIcon>
								))}
							</Group>

							{/* Theme Toggle */}
							<UnstyledButton
								onClick={onThemeToggle}
								style={{
									width: "100%",
									padding: "1rem",
									borderRadius: "0.75rem",
									background: "rgba(0, 243, 255, 0.1)",
									transition: "all 0.2s ease",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "0.75rem",
								}}
								styles={{
									root: {
										"&:hover": {
											background: "rgba(0, 243, 255, 0.15)",
										},
									},
								}}
							>
								{isDarkMode ? (
									<IconSun size={24} color="#00f3ff" />
								) : (
									<IconMoon size={24} color="#00f3ff" />
								)}
								<Text size="md" c="white" fw={500}>
									{isDarkMode ? "Light Mode" : "Dark Mode"}
								</Text>
							</UnstyledButton>
						</Box>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

interface MobileNavItemProps {
	item: NavItem;
	expanded: boolean;
	onToggle: () => void;
	onClose: () => void;
}

function MobileNavItem({
	item,
	expanded,
	onToggle,
	onClose,
}: MobileNavItemProps) {
	const hasChildren = item.children && item.children.length > 0;

	const ItemButton = (
		<UnstyledButton
			onClick={onToggle}
			style={{
				width: "100%",
				padding: "1rem 1.25rem",
				borderRadius: "0.75rem",
				background: expanded
					? "rgba(0, 243, 255, 0.1)"
					: "rgba(255, 255, 255, 0.03)",
				transition: "all 0.2s ease",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				minHeight: "56px",
			}}
			styles={{
				root: {
					"&:hover": {
						background: "rgba(0, 243, 255, 0.15)",
						transform: "translateX(4px)",
					},
					"&:active": {
						transform: "scale(0.98)",
					},
				},
			}}
		>
			<Group gap="md">
				<Box style={{ color: "#00f3ff", flexShrink: 0 }}>{item.icon}</Box>
				<Text size="lg" c="white" fw={500}>
					{item.label}
				</Text>
			</Group>
			{hasChildren && (
				<motion.div
					animate={{ rotate: expanded ? 0 : -90 }}
					transition={{ duration: 0.2 }}
				>
					<IconChevronDown size={20} color="rgba(255, 255, 255, 0.5)" />
				</motion.div>
			)}
		</UnstyledButton>
	);

	return (
		<>
			{hasChildren || item.id === "resume" ? (
				ItemButton
			) : (
				<Link
					to={item.path || "#"}
					style={{ textDecoration: "none" }}
					onClick={onClose}
				>
					{ItemButton}
				</Link>
			)}

			{/* Children */}
			<AnimatePresence>
				{hasChildren && expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						style={{ overflow: "hidden" }}
					>
						<Stack gap="xs" mt="sm" ml="md">
							{item.children?.map((child) => (
								<Link
									key={child.id}
									to={child.path || "#"}
									style={{ textDecoration: "none" }}
									onClick={() => {
										if (child.id === "resume") {
											downloadResumePDF();
										}
										onClose();
									}}
								>
									<UnstyledButton
										style={{
											width: "100%",
											padding: "0.875rem 1rem",
											borderRadius: "0.5rem",
											background: "rgba(255, 255, 255, 0.02)",
											transition: "all 0.2s ease",
											display: "flex",
											alignItems: "center",
											gap: "0.75rem",
											minHeight: "48px",
										}}
										styles={{
											root: {
												"&:hover": {
													background: "rgba(0, 243, 255, 0.08)",
													transform: "translateX(6px)",
												},
												"&:active": {
													transform: "scale(0.98)",
												},
											},
										}}
									>
										<Box style={{ color: "#00f3ff", flexShrink: 0 }}>
											{child.icon}
										</Box>
										<Text size="md" c="dimmed">
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
