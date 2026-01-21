import {
	IconChartBar,
	IconCpu,
	IconRobot,
} from "@tabler/icons-react";

export interface Project {
	id: string;
	title: string;
	description: string;
	longDescription?: string;
	link: string;
	github?: string;
	demo?: string;
	docs?: string;
	icon: React.ReactNode;
	tags: string[];
	color: string;
	category: "ai-ml" | "web-apps" | "3d-graphics" | "tools";

	featured?: boolean;
	status: "production" | "beta" | "archived";
	stats?: {
		stars?: number;
		forks?: number;
		views?: number;
		lastUpdated?: string;
	};
	techStack?: {
		frontend?: string[];
		backend?: string[];
		ai?: string[];
		tools?: string[];
	};
	screenshots?: string[];
}

export const projects: Project[] = [
	{
		id: "tetris-ai",
		title: "Tetris with AI Agent",
		description:
			"Classic Tetris game featuring a reinforcement learning agent that plays autonomously.",
		longDescription:
			"A complete Tetris game built with Phaser featuring a reinforcement learning agent that uses Q-learning to play autonomously. The AI makes smart decisions based on board state analysis and heuristics for optimal piece placement.",
		link: "/tetris",
		demo: "https://ameen-samad.github.io/tetris-ai",
		category: "ai-ml",
		color: "#00f3ff",
		icon: <IconCpu size={32} />,
		tags: ["Phaser", "JavaScript", "AI", "Reinforcement Learning"],
		featured: true,
		status: "production",
		stats: {
			stars: 128,
			views: 2300,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["Phaser", "JavaScript", "Canvas"],
			ai: ["TensorFlow", "Reinforcement Learning", "Q-Learning"],
			tools: ["Git", "VS Code"],
		},
	},
	{
		id: "ai-chatbot",
		title: "AI Chatbot with RAG",
		description:
			"ChatGPT-style interface with document-based RAG, tool calling, and SSE streaming responses.",
		longDescription:
			"A full-featured AI chatbot interface built with TanStack Start, featuring Retrieval-Augmented Generation (RAG) for document-based context, tool calling capabilities, and Server-Sent Events (SSE) for real-time streaming responses.",
		link: "/chatbot",
		github: "https://github.com/Ameen-Samad/ai-chatbot",
		demo: "https://chatbot.aminesamad.dev",
		category: "ai-ml",
		color: "#ff00ff",
		icon: <IconRobot size={32} />,
		tags: ["RAG", "Cloudflare AI", "TypeScript", "TanStack"],
		featured: true,
		status: "production",
		stats: {
			stars: 89,
			views: 1500,
			lastUpdated: "Dec 2024",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Tailwind CSS"],
			backend: ["Cloudflare Workers", "Cloudflare AI"],
			ai: ["Cloudflare AI", "RAG", "LLM"],
			tools: ["TanStack", "Vite"],
		},
	},
	{
		id: "3d-builder",
		title: "3D Builder",
		description:
			"AI-powered 3D object generator that creates Three.js scenes from text descriptions.",
		longDescription:
			"An innovative 3D object builder that leverages AI to generate Three.js scenes from natural language descriptions. Users can describe objects in plain text and see them rendered in real-time using React Three Fiber.",
		link: "/builder",
		github: "https://github.com/Ameen-Samad/3d-builder",
		category: "3d-graphics",
		color: "#0066ff",
		icon: <IconChartBar size={32} />,
		tags: ["Three.js", "LLM", "WebGL", "React Three Fiber"],
		featured: true,
		status: "beta",
		stats: {
			stars: 64,
			views: 980,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "Three.js", "React Three Fiber"],
			ai: ["Cloudflare AI", "LLM"],
			tools: ["Vite", "TypeScript"],
		},
	},
];

export type FilterType =
	| "all"
	| "ai-ml"
	| "web-apps"
	| "3d-graphics"
	| "tools";

export interface FilterOption {
	id: FilterType;
	label: string;
	icon: React.ReactNode;
	count: number;
}

export const getFilters = (
	projectsList: Project[],
): FilterOption[] => [
	{
		id: "all",
		label: "All",
		icon: null,
		count: projectsList.length,
	},
	{
		id: "ai-ml",
		label: "AI/ML",
		icon: null,
		count: projectsList.filter((p) => p.category === "ai-ml").length,
	},
	{
		id: "web-apps",
		label: "Web Apps",
		icon: null,
		count: projectsList.filter((p) => p.category === "web-apps").length,
	},
	{
		id: "3d-graphics",
		label: "3D/Graphics",
		icon: null,
		count: projectsList.filter((p) => p.category === "3d-graphics").length,
	},
	{
		id: "tools",
		label: "Tools",
		icon: null,
		count: projectsList.filter((p) => p.category === "tools").length,
	},
];
