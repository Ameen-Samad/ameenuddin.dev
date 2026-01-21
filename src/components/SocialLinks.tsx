import { Group } from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

interface SocialLink {
	id: string;
	label: string;
	url: string;
	icon: React.ReactNode;
	color: string;
}

const socialLinks: SocialLink[] = [
	{
		id: "linkedin",
		label: "LinkedIn",
		url: "https://sg.linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0",
		icon: <IconBrandLinkedin size={24} />,
		color: "#0077b5",
	},
	{
		id: "github",
		label: "GitHub",
		url: "https://github.com/Ameen-Samad/ameenuddin.dev",
		icon: <IconBrandGithub size={24} />,
		color: "#333333",
	},
	{
		id: "email",
		label: "Email",
		url: "mailto:amenddin@gmail.com",
		icon: <IconMail size={24} />,
		color: "#ea4335",
	},
];

interface SocialLinksProps {
	direction?: "row" | "column";
	size?: "sm" | "md" | "lg";
	justify?: "center" | "flex-start" | "flex-end" | "space-between";
}

export function SocialLinks({
	direction = "row",
	size = "md",
	justify = "center",
}: SocialLinksProps) {
	const sizeClasses = {
		sm: "h-10 w-10",
		md: "h-12 w-12",
		lg: "h-14 w-14",
	};

	return (
		<Group
			gap="md"
			justify={justify}
			style={{
				display: "flex",
				flexDirection: direction === "column" ? "column" : "row",
				flexWrap: "wrap",
			}}
		>
			{socialLinks.map((link, index) => (
				<motion.a
					key={link.id}
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={link.label}
					initial={{ scale: 0, opacity: 0 }}
					whileHover={{ scale: 1.1, rotate: 5 }}
					whileTap={{ scale: 0.95 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 17,
						delay: index * 0.1,
					}}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "0.5rem",
						background: "rgba(255, 255, 255, 0.05)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						color: link.color,
						textDecoration: "none",
						transition: "all 0.2s ease",
						cursor: "pointer",
					}}
					onHoverStart={(e) => {
						const target = e.currentTarget as HTMLAnchorElement;
						if (target) {
							target.style.background = "rgba(255, 255, 255, 0.1)";
							target.style.boxShadow = `0 4px 12px ${link.color}40`;
						}
					}}
					onHoverEnd={(e) => {
						const target = e.currentTarget as HTMLAnchorElement;
						if (target) {
							target.style.background = "rgba(255, 255, 255, 0.05)";
							target.style.boxShadow = "none";
						}
					}}
					className={sizeClasses[size]}
				>
					{link.icon}
				</motion.a>
			))}
		</Group>
	);
}
