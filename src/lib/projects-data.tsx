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
		lastUpdated?: string;
	};
	techStack?: {
		frontend?: string[];
		backend?: string[];
		ai?: string[];
		tools?: string[];
	};
	screenshots?: string[];
	learnings?: string[];
	technicalHighlights?: string[];
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
		category: "ai-ml",
		color: "#00f3ff",
		icon: <IconCpu size={32} />,
		tags: ["Phaser", "JavaScript", "AI", "Reinforcement Learning"],
		featured: true,
		status: "production",
		stats: {
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["Phaser", "JavaScript", "Canvas"],
			ai: ["TensorFlow", "Reinforcement Learning", "Q-Learning"],
			tools: ["Git", "VS Code"],
		},
		learnings: [
			"Compiling game logic to WebAssembly for performance",
			"Building AI agents that can play games autonomously",
			"Managing game state synchronization between WASM and JavaScript",
			"Optimizing render loops for smooth 60fps gameplay",
		],
		technicalHighlights: [
			"WebAssembly runs at near-native speed (vs pure JavaScript)",
			"AI agent uses heuristics to evaluate board states",
			"Game loop runs independently from React render cycle",
		],
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
			lastUpdated: "Jan 2026",
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
		learnings: [
			"Building conversational AI with tool calling for product recommendations",
			"Semantic search using vector embeddings for 'vibe-based' queries",
			"TanStack Store for persistent shopping cart with localStorage sync",
			"TanStack Table for sortable, filterable product grids",
			"Side-by-side comparison with AI-generated insights",
		],
		technicalHighlights: [
			"AI tool calling enables structured recommendations in chat",
			"Vector embeddings find guitars by feel/vibe, not just keywords",
			"TanStack Store + localStorage provides seamless cart persistence",
			"Streaming responses give real-time AI chat feedback",
		],
	},
	{
		id: "ai-chatbot",
		title: "AI Chatbot with RAG",
		description:
			"ChatGPT-style interface with document-based RAG, tool calling, and SSE streaming responses.",
		longDescription:
			"A full-featured AI chatbot interface built with TanStack Start, featuring Retrieval-Augmented Generation (RAG) for document-based context, tool calling capabilities, and Server-Sent Events (SSE) for real-time streaming responses.",
		link: "/chatbot",
		category: "ai-ml",
		color: "#ff00ff",
		icon: <IconRobot size={32} />,
		tags: ["RAG", "Cloudflare AI", "TypeScript", "TanStack"],
		featured: true,
		status: "production",
		stats: {
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Tailwind CSS"],
			backend: ["Cloudflare Workers", "Cloudflare AI"],
			ai: ["Cloudflare AI", "RAG", "LLM"],
			tools: ["TanStack", "Vite"],
		},
		learnings: [
			"Building RAG (Retrieval-Augmented Generation) systems with vector search",
			"Document chunking and embedding strategies for semantic search",
			"Context window management for large documents",
			"Combining retrieved context with LLM responses",
		],
		technicalHighlights: [
			"Vector embeddings enable semantic search beyond keyword matching",
			"RAG reduces hallucinations by grounding responses in actual data",
			"Context window limits require smart chunking strategies",
		],
	},
	{
		id: "3d-builder",
		title: "3D Builder",
		description:
			"AI-powered 3D object generator that creates Three.js scenes from text descriptions.",
		longDescription:
			"An innovative 3D object builder that leverages AI to generate Three.js scenes from natural language descriptions. Users can describe objects in plain text and see them rendered in real-time using React Three Fiber.",
		link: "/builder",
		category: "3d-graphics",
		color: "#0066ff",
		icon: <IconChartBar size={32} />,
		tags: ["Three.js", "LLM", "WebGL", "React Three Fiber"],
		featured: true,
		status: "beta",
		stats: {
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "Three.js", "React Three Fiber"],
			ai: ["Cloudflare AI", "LLM"],
			tools: ["Vite", "TypeScript"],
		},
		learnings: [
			"Three.js fundamentals for WebGL-based 3D rendering",
			"Converting AI text descriptions into 3D model parameters",
			"Managing scene graph and object transformations",
			"Performance optimization for real-time 3D interaction",
		],
		technicalHighlights: [
			"Three.js abstracts WebGL complexity while keeping performance",
			"AI can generate parametric 3D models from text descriptions",
			"Scene optimization is critical for smooth 60fps rendering",
		],
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
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "WebSocket", "AudioContext"],
			ai: ["Cloudflare Workers AI", "Speech Recognition"],
			tools: ["TypeScript", "Vite"],
		},
		learnings: [
			"WebSocket binary streaming for real-time audio data",
			"AudioContext API: 16kHz Float32→Int16 PCM conversion",
			"Real-time state synchronization (connection + recording + transcription)",
			"Graceful error recovery for connection failures",
		],
		technicalHighlights: [
			"Browsers use Float32 audio by default, but Cloudflare Workers AI expects Int16 PCM",
			"Binary data must be properly buffered to avoid audio glitches",
			"Connection state must be tracked separately from recording state",
		],
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
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "TypeScript"],
			ai: ["Stable Diffusion XL", "Cloudflare AI"],
			tools: ["Vite", "Base64 Handling"],
		},
		learnings: [
			"Batch processing with Promise.all for parallel image generation",
			"Base64 image handling and rendering in React",
			"Progress tracking for long-running AI operations",
			"Error handling for generation failures",
		],
		technicalHighlights: [
			"Generate 1-4 images in parallel using Cloudflare Workers AI",
			"Handle loading states during generation (15-30 seconds per image)",
			"Convert base64 responses to downloadable files",
		],
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
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "TypeScript"],
			ai: ["Deepgram Aura", "Text-to-Speech"],
			tools: ["Vite", "Audio API"],
		},
		learnings: [
			"Integrating Deepgram Aura API for natural-sounding voice synthesis",
			"Managing audio playback state with React hooks and Audio API",
			"Voice selection UI patterns for 12+ voice options",
			"Converting API audio responses to downloadable MP3 files",
		],
		technicalHighlights: [
			"Deepgram Aura produces near-human quality speech synthesis",
			"Audio blobs can be played inline or downloaded as files",
			"Voice model selection affects tone, speed, and naturalness",
		],
	},
	{
		id: "ai-chat-demo",
		title: "AI Chat Interface",
		description:
			"Interactive chat with streaming responses, context awareness, and tool calling capabilities.",
		longDescription:
			"A full-featured AI chat interface with streaming responses via Server-Sent Events. Includes context management for multi-turn conversations, real-time typing indicators, and tool calling support.",
		link: "/demo/ai-portfolio",
		category: "ai-ml",
		color: "#ffd43b",
		icon: <IconMessage size={32} />,
		tags: ["Chat", "SSE Streaming", "Context Awareness"],
		featured: true,
		status: "production",
		stats: {
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Tailwind CSS"],
			ai: ["Cloudflare AI", "LLM", "SSE"],
			tools: ["Vite", "Streamdown"],
		},
		learnings: [
			"Server-Sent Events (SSE) for real-time streaming responses",
			"Multi-turn conversation context management with message history",
			"Implementing typing indicators and loading states for better UX",
			"Tool calling patterns for extending AI capabilities",
		],
		technicalHighlights: [
			"SSE provides one-way server→client streaming ideal for chat",
			"Context window management requires smart message pruning",
			"Streamdown parses markdown in real-time as tokens arrive",
		],
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
			lastUpdated: "Jan 2026",
		},
		techStack: {
			frontend: ["React", "TypeScript", "Zod"],
			ai: ["Cloudflare AI", "LLM", "JSON Schema"],
			tools: ["Vite", "Streamdown"],
		},
		learnings: [
			"Forcing LLMs to return structured JSON using schemas",
			"Zod runtime validation for type-safe AI outputs",
			"Prompt engineering for consistent structured responses",
			"Handling validation errors and fallback strategies",
		],
		technicalHighlights: [
			"JSON schemas constrain LLM outputs to predictable formats",
			"Zod provides both TypeScript types and runtime validation",
			"Structured output reduces hallucinations and improves reliability",
		],
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
