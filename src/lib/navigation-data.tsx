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
		id: "demos",
		label: "Demos",
		icon: <IconRobot size={20} />,
		children: [
			{
				id: "demos-overview",
				label: "All Demos",
				icon: <IconRobot size={18} />,
				path: "/#demos",
			},
			{
				id: "demo-ai-voice",
				label: "Voice Agent",
				icon: <IconRobot size={18} />,
				path: "/demo/ai-voice",
			},
			{
				id: "demo-ai-image",
				label: "Image Generation",
				icon: <IconRobot size={18} />,
				path: "/demo/ai-image",
			},
			{
				id: "demo-ai-tts",
				label: "Text-to-Speech",
				icon: <IconRobot size={18} />,
				path: "/demo/ai-tts",
			},
			{
				id: "demo-ai-chat",
				label: "AI Chat",
				icon: <IconRobot size={18} />,
				path: "/demo/ai-chat",
			},
			{
				id: "demo-ai-structured",
				label: "Structured Output",
				icon: <IconRobot size={18} />,
				path: "/demo/ai-structured",
			},
			{
				id: "demo-tanstack-query",
				label: "TanStack Query",
				icon: <IconCode size={18} />,
				path: "/demo/tanstack-query",
			},
			{
				id: "demo-store",
				label: "TanStack Store",
				icon: <IconCode size={18} />,
				path: "/demo/store",
			},
			{
				id: "demo-table",
				label: "TanStack Table",
				icon: <IconCode size={18} />,
				path: "/demo/table",
			},
			{
				id: "demo-trpc-todo",
				label: "tRPC Todo",
				icon: <IconCode size={18} />,
				path: "/demo/trpc-todo",
			},
			{
				id: "demo-form-simple",
				label: "Form (Simple)",
				icon: <IconCode size={18} />,
				path: "/demo/form.simple",
			},
			{
				id: "demo-form-address",
				label: "Form (Address)",
				icon: <IconCode size={18} />,
				path: "/demo/form.address",
			},
			{
				id: "demo-start-ssr-index",
				label: "SSR Overview",
				icon: <IconCode size={18} />,
				path: "/demo/start.ssr.index",
			},
			{
				id: "demo-start-ssr-full",
				label: "Full SSR",
				icon: <IconCode size={18} />,
				path: "/demo/start.ssr.full-ssr",
			},
			{
				id: "demo-start-ssr-data",
				label: "Data-Only SSR",
				icon: <IconCode size={18} />,
				path: "/demo/start.ssr.data-only",
			},
			{
				id: "demo-start-ssr-spa",
				label: "SPA Mode",
				icon: <IconCode size={18} />,
				path: "/demo/start.ssr.spa-mode",
			},
			{
				id: "demo-start-server-funcs",
				label: "Server Functions",
				icon: <IconCode size={18} />,
				path: "/demo/start.server-funcs",
			},
			{
				id: "demo-start-api-request",
				label: "API Routes",
				icon: <IconCode size={18} />,
				path: "/demo/start.api-request",
			},
		],
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
