import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBriefcase,
	IconCode,
	IconCube,
	IconDownload,
	IconFolder,
	IconHome,
	IconMail,
	IconRobot,
} from "@tabler/icons-react";

export interface NavItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	path?: string;
	external?: boolean;
	children?: NavItem[];
	action?: () => void;
}

export interface SocialLink {
	id: string;
	label: string;
	icon: React.ReactNode;
	url: string;
}

export const navItems: NavItem[] = [
	{
		id: "home",
		label: "Home",
		icon: <IconHome size={20} />,
		path: "/",
	},
	{
		id: "projects",
		label: "Projects",
		icon: <IconFolder size={20} />,
		children: [
			{
				id: "projects-all",
				label: "All Projects",
				icon: <IconFolder size={18} />,
				path: "/#projects",
			},
			{
				id: "tetris",
				label: "Tetris AI",
				icon: <IconRobot size={18} />,
				path: "/tetris",
			},
			{
				id: "chatbot",
				label: "AI Chatbot",
				icon: <IconRobot size={18} />,
				path: "/chatbot",
			},
			{
				id: "builder",
				label: "3D Builder",
				icon: <IconCube size={18} />,
				path: "/builder",
			},
		],
	},
	{
		id: "experience",
		label: "Experience",
		icon: <IconBriefcase size={20} />,
		children: [
			{
				id: "skills",
				label: "Skills",
				icon: <IconCode size={18} />,
				path: "/#skills",
			},
			{
				id: "resume",
				label: "Download Resume",
				icon: <IconDownload size={18} />,
				path: "#",
			},
		],
	},
	{
		id: "contact",
		label: "Contact",
		icon: <IconMail size={20} />,
		path: "/#contact",
	},
];

export const socialLinks: SocialLink[] = [
	{
		id: "linkedin",
		label: "LinkedIn",
		icon: <IconBrandLinkedin size={20} />,
		url: "https://www.linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0/",
	},
	{
		id: "github",
		label: "GitHub",
		icon: <IconBrandGithub size={20} />,
		url: "https://github.com/Ameen-Samad",
	},
];
