import type { Education } from "@/lib/education-data";
import type { Job } from "@/lib/jobs-data";
import type { Project } from "@/lib/projects-data";
import type { Skill } from "@/lib/skills-data";

export interface ResumeData {
	education: Education[];
	jobs: Job[];
	skills: Skill[];
	projects: Project[];
}

export async function getResumeData(): Promise<ResumeData> {
	const { allEducations } = await import("content-collections");
	const { allJobs } = await import("content-collections");
	const { allSkills } = await import("content-collections");

	return {
		education: allEducations as Education[],
		jobs: allJobs as Job[],
		skills: allSkills as Skill[],
		projects: [
			{
				id: "tetris-ai",
				title: "Tetris with AI Agent",
				description:
					"Classic Tetris game featuring a reinforcement learning agent that plays autonomously.",
				longDescription:
					"A complete Tetris game built with Phaser featuring a reinforcement learning agent that uses Q-learning to play autonomously. The AI makes smart decisions based on board state analysis and heuristics for optimal piece placement.",
				link: "/tetris",
				github: "https://github.com/Ameen-Samad/tetris-ai",
				demo: "https://ameen-samad.github.io/tetris-ai",
				category: "ai-ml",
				color: "#00f3ff",
				icon: "cpu",
				tags: ["Phaser", "JavaScript", "AI", "Reinforcement Learning"],
				featured: true,
				status: "production",
				stats: {
					stars: 128,
					views: 2300,
					lastUpdated: "Jan2025",
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
					"AI-powered chatbot using retrieval-augmented generation. Features real-time streaming, tool calling, and knowledge base integration.",
				link: "/chatbot",
				github: "https://github.com/Ameen-Samad/ai-chatbot",
				demo: "https://chatbot.aminesamad.dev",
				category: "ai-ml",
				color: "#ff00ff",
				icon: "robot",
				tags: ["RAG", "Cloudflare AI", "TypeScript", "TanStack"],
				featured: true,
				status: "production",
				stats: {
					stars: 89,
					views: 1500,
					lastUpdated: "Dec2024",
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
					"AI-powered 3D object generator that creates Three.js scenes from natural language descriptions.",
				longDescription:
					"An innovative 3D object builder that leverages AI to generate Three.js environments from natural language prompts. Users can describe objects in plain text and see them rendered in real-time using React Three Fiber.",
				link: "/builder",
				github: "https://github.com/Ameen-Samad/3d-builder",
				demo: "https://3d-builder.aminesamad.dev",
				category: "3d-graphics",
				color: "#0066ff",
				icon: "chart-bar",
				tags: ["Three.js", "LLM", "AI APIs", "TypeScript"],
				featured: true,
				status: "beta",
				stats: {
					stars: 64,
					views: 980,
					lastUpdated: "Jan2025",
				},
				techStack: {
					frontend: ["React", "Three.js", "React Three Fiber"],
					ai: ["Cloudflare AI", "LLM"],
					tools: ["Vite", "TypeScript"],
				},
			},
			{
				id: "portfolio",
				title: "Portfolio Website",
				description:
					"Professional portfolio website with 3D interactive projects, showcasing skills in modern web technologies.",
				longDescription:
					"Modern, responsive portfolio website featuring 3D interactive projects built with Three.js and React. Includes AI integration, real-time animations, and optimized performance for edge deployment.",
				link: "/",
				github: "https://github.com/Ameen-Samad/ameenuddin.dev",
				demo: "https://ameenuddin.dev",
				category: "web-apps",
				color: "#ffd700",
				icon: "globe",
				tags: ["React", "Three.js", "TypeScript", "Mantine"],
				featured: true,
				status: "production",
				stats: {
					stars: 156,
					views: 5200,
					lastUpdated: "Jan2025",
				},
				techStack: {
					frontend: [
						"React",
						"TypeScript",
						"TanStack Start",
						"Three.js",
						"Mantine",
						"Framer Motion",
					],
					backend: ["Cloudflare Pages"],
					ai: [],
					tools: ["Vite", "Framer Motion"],
				},
			},
		],
	};
}
