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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { type NavItem, navItems, socialLinks } from "../lib/navigation-data";
import { downloadResumePDF } from "../lib/generate-pdf";
import { cn } from "../lib/utils";

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
	const shouldReduceMotion = useReducedMotion();

	// Prevent body scroll when mobile nav is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

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
						transition={{
							duration: shouldReduceMotion ? 0 : 0.3,
							ease: "easeOut"
						}}
						onClick={onClose}
						className={cn(
							"md:hidden fixed inset-0 z-[999]",
							"bg-black/70 backdrop-blur-sm",
							"safe-area-inset"
						)}
					/>

					{/* Mobile Menu */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{
							duration: shouldReduceMotion ? 0 : 0.3,
							ease: "easeOut"
						}}
						className={cn(
							"md:hidden fixed top-0 right-0 bottom-0",
							"w-[85%] max-w-sm",
							"bg-slate-900/98 backdrop-blur-xl",
							"border-l border-cyan-500/10",
							"z-[1000] flex flex-col overflow-hidden",
							"safe-area-inset-right safe-area-inset-top safe-area-inset-bottom"
						)}
					>
						{/* Header */}
						<Box className={cn(
							"flex items-center justify-between",
							"p-6 border-b border-white/5"
						)}>
							<Link
								to="/"
								className="no-underline"
								onClick={onClose}
							>
								<Group gap="sm">
									<IconCode size={32} className="text-cyan-500" />
									<Title order={3} className="text-white text-2xl font-bold text-balance">
										Ameenuddin
									</Title>
								</Group>
							</Link>

							<ActionIcon
								size="lg"
								variant="subtle"
								color="gray"
								onClick={onClose}
								aria-label="Close navigation menu"
								className="hover:bg-white/10 transition-colors duration-200"
							>
								<IconX size={24} />
							</ActionIcon>
						</Box>

						{/* Navigation */}
						<Stack
							gap="sm"
							className="flex-1 overflow-y-auto p-6"
						>
							{navItems.map((item) => (
								<MobileNavItem
									key={item.id}
									item={item}
									expanded={expandedItems.has(item.id)}
									onToggle={() => handleItemClick(item)}
									onClose={onClose}
									shouldReduceMotion={shouldReduceMotion}
								/>
							))}
						</Stack>

						{/* Footer */}
						<Box className="p-6 border-t border-white/5">
							{/* Social Links */}
							<Group gap="md" justify="center" className="mb-4">
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
										className={cn(
											"transition-all duration-200 ease-out",
											"hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20"
										)}
										aria-label={social.label}
									>
										{social.icon}
									</ActionIcon>
								))}
							</Group>

							{/* Theme Toggle */}
							<UnstyledButton
								onClick={onThemeToggle}
								className={cn(
									"w-full p-4 rounded-xl bg-cyan-500/10",
									"transition-all duration-200 ease-out",
									"hover:bg-cyan-500/15",
									"flex items-center justify-center gap-3",
									"min-h-[56px]" // Touch target
								)}
							>
								{isDarkMode ? (
									<IconSun size={24} className="text-cyan-500" />
								) : (
									<IconMoon size={24} className="text-cyan-500" />
								)}
								<Text className="text-white font-medium text-base">
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
	shouldReduceMotion: boolean | null;
}

function MobileNavItem({
	item,
	expanded,
	onToggle,
	onClose,
	shouldReduceMotion,
}: MobileNavItemProps) {
	const hasChildren = item.children && item.children.length > 0;

	const ItemButton = (
		<UnstyledButton
			onClick={onToggle}
			className={cn(
				"w-full px-5 py-4 rounded-xl",
				"transition-all duration-200 ease-out",
				"flex items-center justify-between",
				"min-h-[56px]", // Touch target
				expanded
					? "bg-cyan-500/10"
					: "bg-white/5 hover:bg-cyan-500/15 hover:translate-x-1 active:scale-[0.98]"
			)}
		>
			<Group gap="md">
				<Box className="text-cyan-500 flex-shrink-0">{item.icon}</Box>
				<Text className="text-white font-medium text-lg">
					{item.label}
				</Text>
			</Group>
			{hasChildren && (
				<motion.div
					animate={{ rotate: expanded ? 0 : -90 }}
					transition={{
						duration: shouldReduceMotion ? 0 : 0.2,
						ease: "easeOut"
					}}
				>
					<IconChevronDown size={20} className="text-white/50" />
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
					className="no-underline"
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
						transition={{
							duration: shouldReduceMotion ? 0 : 0.3,
							ease: "easeOut"
						}}
						className="overflow-hidden"
					>
						<Stack gap="xs" className="mt-2 ml-4">
							{item.children?.map((child) => (
								<Link
									key={child.id}
									to={child.path || "#"}
									className="no-underline"
									onClick={() => {
										if (child.id === "resume") {
											downloadResumePDF();
										}
										onClose();
									}}
								>
									<UnstyledButton
										className={cn(
											"w-full px-4 py-3.5 rounded-lg",
											"bg-white/5",
											"transition-all duration-200 ease-out",
											"hover:bg-cyan-500/8 hover:translate-x-1.5",
											"active:scale-[0.98]",
											"flex items-center gap-3",
											"min-h-[48px]" // Touch target
										)}
									>
										<Box className="text-cyan-500 flex-shrink-0">
											{child.icon}
										</Box>
										<Text className="text-gray-400 truncate">
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
