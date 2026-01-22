import {
	IconChartBar,
	IconCpu,
	IconFileText,
	IconMessage,
	IconMicrophone,
	IconMusic,
	IconPhoto,
	IconRobot,
	IconVolume,
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
	{
		id: "ai-voice",
		title: "AI Voice Transcription",
		description:
			"Real-time speech-to-text transcription using WebSocket streaming with Cloudflare Workers AI.",
		longDescription:
			"A voice agent that performs real-time speech-to-text transcription using WebSocket streaming. Features audio capture, PCM encoding, and live transcription display with connection status management.",
		link: "/demo/ai-voice",
		category: "ai-ml",
		color: "#339af0",
		icon: <IconMicrophone size={32} />,
		tags: ["WebSocket", "Speech-to-Text", "Real-time", "Cloudflare AI"],
		featured: true,
		status: "production",
		stats: {
			stars: 45,
			views: 720,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "WebSocket", "AudioContext"],
			ai: ["Cloudflare Workers AI", "Speech Recognition"],
			tools: ["TypeScript", "Vite"],
		},
	},
	{
		id: "ai-image",
		title: "AI Image Generator",
		description:
			"Generate stunning images from text prompts using Stable Diffusion XL Lightning via Cloudflare AI.",
		longDescription:
			"An AI image generation tool that creates images from text descriptions using Stable Diffusion XL Lightning. Supports multiple sizes, batch generation, and instant download of generated images.",
		link: "/demo/ai-image",
		category: "ai-ml",
		color: "#ff6b6b",
		icon: <IconPhoto size={32} />,
		tags: ["Image Generation", "Stable Diffusion", "Cloudflare AI"],
		featured: true,
		status: "production",
		stats: {
			stars: 62,
			views: 950,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "TypeScript"],
			ai: ["Stable Diffusion XL", "Cloudflare AI"],
			tools: ["Vite", "Base64 Handling"],
		},
	},
	{
		id: "ai-tts",
		title: "AI Text-to-Speech",
		description:
			"Convert text to natural-sounding speech using Deepgram Aura voices with 12 different options.",
		longDescription:
			"A text-to-speech application that uses Deepgram Aura API to generate natural-sounding speech. Features 12 different voice options, live playback, and MP3 download functionality.",
		link: "/demo/ai-tts",
		category: "ai-ml",
		color: "#51cf66",
		icon: <IconVolume size={32} />,
		tags: ["TTS", "Deepgram Aura", "Voice Synthesis"],
		featured: true,
		status: "production",
		stats: {
			stars: 38,
			views: 540,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "TypeScript"],
			ai: ["Deepgram Aura", "Text-to-Speech"],
			tools: ["Vite", "Audio API"],
		},
	},
	{
		id: "ai-chat-demo",
		title: "AI Chat Interface",
		description:
			"Interactive chat with streaming responses, context awareness, and tool calling capabilities.",
		longDescription:
			"A full-featured AI chat interface with streaming responses via Server-Sent Events. Includes context management for multi-turn conversations, real-time typing indicators, and tool calling support.",
		link: "/demo/ai-chat",
		category: "ai-ml",
		color: "#ffd43b",
		icon: <IconMessage size={32} />,
		tags: ["Chat", "SSE Streaming", "Context Awareness"],
		featured: true,
		status: "production",
		stats: {
			stars: 51,
			views: 810,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Tailwind CSS"],
			ai: ["Cloudflare AI", "LLM", "SSE"],
			tools: ["Vite", "Streamdown"],
		},
	},
	{
		id: "ai-structured",
		title: "AI Structured Output",
		description:
			"Generate structured recipe data with type-safe Zod validation using LLM outputs.",
		longDescription:
			"A demonstration of forcing LLMs to return structured JSON data with Zod schemas for runtime validation. Generates complete recipes with ingredients, instructions, and metadata.",
		link: "/demo/ai-structured",
		category: "ai-ml",
		color: "#cc5de8",
		icon: <IconFileText size={32} />,
		tags: ["Structured Output", "Zod", "JSON Validation"],
		featured: true,
		status: "production",
		stats: {
			stars: 44,
			views: 680,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Zod"],
			ai: ["Cloudflare AI", "LLM", "JSON Schema"],
			tools: ["Vite", "Streamdown"],
		},
	},
	{
		id: "guitar-concierge",
		title: "AI Guitar Concierge",
		description:
			"Full-stack AI-powered shopping experience with chat recommendations, semantic search, and comparison tools.",
		longDescription:
			"A comprehensive e-commerce demo showcasing AI-powered guitar recommendations, semantic search using vector embeddings, intelligent chat assistant with tool calling, shopping cart with persistence, and side-by-side comparison with AI insights. Built with TanStack Store, Table, Pacer, and Cloudflare AI.",
		link: "/demo/guitars",
		category: "ai-ml",
		color: "#10b981",
		icon: <IconMusic size={32} />,
		tags: [
			"E-commerce",
			"AI Chat",
			"Semantic Search",
			"TanStack Store",
			"Embeddings",
		],
		featured: true,
		status: "production",
		stats: {
			stars: 72,
			views: 1150,
			lastUpdated: "Jan 2025",
		},
		techStack: {
			frontend: [
				"React",
				"TypeScript",
				"TanStack Table",
				"TanStack Store",
				"TanStack Pacer",
			],
			ai: [
				"Cloudflare AI",
				"LLM",
				"Vector Embeddings",
				"Semantic Search",
				"Tool Calling",
			],
			tools: ["Vite", "Tailwind CSS", "LocalStorage"],
		},
	},
];

export type FilterType = "all" | "ai-ml" | "web-apps" | "3d-graphics" | "tools";

export interface FilterOption {
	id: FilterType;
	label: string;
	icon: React.ReactNode;
	count: number;
}

export const getFilters = (projectsList: Project[]): FilterOption[] => [
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
