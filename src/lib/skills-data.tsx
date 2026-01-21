import {
	Brain,
	Cloud,
	Cpu,
	Database,
	MessageSquare,
	Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { FaAws, FaGitAlt, FaNodeJs as FaNode, FaReact } from "react-icons/fa";
import {
	SiCloudflareworkers,
	SiDigitalocean,
	SiDocker,
	SiFramer,
	SiGooglecloud,
	SiMantine,
	SiNextdotjs,
	SiPython,
	SiTailwindcss,
	SiTensorflow,
	SiTypescript,
} from "react-icons/si";

export type SkillLevel = "intermediate" | "learning" | "beginner";

export interface Skill {
	name: string;
	level: SkillLevel;
	years: number;
	proficiency: number;
	icon: ReactNode;
	category: SkillCategory;
	projects?: string[];
	certifications?: string[];
	lastUsed?: string;
	rapidlyLearning?: boolean; // NEW: Badge for active learning
}

export interface SkillCategory {
	name: string;
	icon: ReactNode;
	color: string;
	description: string;
	skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
	{
		name: "Frontend Development",
		icon: <Database size={24} />,
		color: "#3b82f6",
		description: "Building responsive and interactive user interfaces",
		skills: [
			{
				name: "React",
				level: "intermediate",
				years: 1.5,
				proficiency: 75,
				icon: <FaReact size={32} />,
				projects: ["tetris-ai", "ai-chatbot"],
				lastUsed: "Jan 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "TypeScript",
				level: "intermediate",
				years: 1,
				proficiency: 70,
				icon: <SiTypescript size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "Tailwind CSS",
				level: "intermediate",
				years: 1,
				proficiency: 70,
				icon: <SiTailwindcss size={32} />,
				projects: ["tetris-ai", "ai-chatbot", "3d-builder"],
				lastUsed: "Jan 2025",
			} as Skill,
			{
				name: "Next.js / TanStack",
				level: "intermediate",
				years: 1,
				proficiency: 65,
				icon: <SiNextdotjs size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
		],
	},
	{
		name: "Backend Development",
		icon: <Database size={24} />,
		color: "#10b981",
		description: "Building robust server-side applications and APIs",
		skills: [
			{
				name: "Node.js",
				level: "intermediate",
				years: 1,
				proficiency: 65,
				icon: <FaNode size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "Python (FastAPI, Flask)",
				level: "intermediate",
				years: 1,
				proficiency: 60,
				icon: <SiPython size={32} />,
				certifications: ["FastAPI", "Flask", "OpenAI SDK", "Claude SDK"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "Cloudflare Workers",
				level: "intermediate",
				years: 0.5,
				proficiency: 65,
				icon: <SiCloudflareworkers size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
		],
	},
	{
		name: "AI & Machine Learning",
		icon: <Brain size={24} />,
		color: "#8b5cf6",
		description: "Integrating AI models and building intelligent systems",
		skills: [
			{
				name: "Cloudflare AI",
				level: "intermediate",
				years: 0.5,
				proficiency: 70,
				icon: <SiCloudflareworkers size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "Python Data Science",
				level: "learning",
				years: 0.5,
				proficiency: 55,
				icon: <SiPython size={32} />,
				certifications: [
					"Streamlit",
					"Pandas",
					"Polars",
					"NumPy",
					"Scikit-learn",
				],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "RAG Implementation",
				level: "learning",
				years: 0.5,
				proficiency: 60,
				icon: <Database size={32} />,
				projects: ["ai-chatbot"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "LLM Integration",
				level: "intermediate",
				years: 1,
				proficiency: 65,
				icon: <Cpu size={32} />,
				projects: ["3d-builder", "ai-chatbot"],
				lastUsed: "Nov 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "Prompt Engineering",
				level: "intermediate",
				years: 1,
				proficiency: 70,
				icon: <MessageSquare size={32} />,
				projects: ["ai-chatbot", "3d-builder"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "TensorFlow / PyTorch",
				level: "learning",
				years: 0.5,
				proficiency: 45,
				icon: <SiTensorflow size={32} />,
				projects: ["tetris-ai"],
				lastUsed: "Jan 2025",
				rapidlyLearning: true,
			} as Skill,
		],
	},
	{
		name: "Cloud & DevOps",
		icon: <Cloud size={24} />,
		color: "#f59e0b",
		description: "Managing cloud infrastructure and CI/CD pipelines",
		skills: [
			{
				name: "AWS",
				level: "learning",
				years: 0.5,
				proficiency: 50,
				icon: <FaAws size={32} />,
				projects: ["replikate-labs"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "Google Cloud Platform",
				level: "learning",
				years: 0.5,
				proficiency: 45,
				icon: <SiGooglecloud size={32} />,
				projects: ["replikate-labs"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "DigitalOcean",
				level: "learning",
				years: 0.5,
				proficiency: 50,
				icon: <SiDigitalocean size={32} />,
				projects: ["replikate-labs"],
				lastUsed: "Dec 2025",
			} as Skill,
			{
				name: "Docker & Kubernetes",
				level: "learning",
				years: 0.5,
				proficiency: 45,
				icon: <SiDocker size={32} />,
				projects: ["replikate-labs"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "Git & CI/CD",
				level: "intermediate",
				years: 2,
				proficiency: 75,
				icon: <FaGitAlt size={32} />,
				projects: ["all"],
				lastUsed: "Jan 2025",
			} as Skill,
		],
	},
	{
		name: "Tools & Productivity",
		icon: <Wrench size={24} />,
		color: "#6366f1",
		description: "Development tools and workflow optimization",
		skills: [
			{
				name: "Claude Code",
				level: "intermediate",
				years: 0.5,
				proficiency: 70,
				icon: <Cpu size={32} />,
				projects: ["replikate-labs"],
				lastUsed: "Dec 2025",
				rapidlyLearning: true,
			} as Skill,
			{
				name: "VS Code",
				level: "intermediate",
				years: 2,
				proficiency: 80,
				icon: <Wrench size={32} />,
				projects: ["all"],
				lastUsed: "Jan 2025",
			} as Skill,
			{
				name: "Framer Motion",
				level: "intermediate",
				years: 1,
				proficiency: 65,
				icon: <SiFramer size={32} />,
				projects: ["tetris-ai", "ai-chatbot", "3d-builder"],
				lastUsed: "Jan 2025",
			} as Skill,
			{
				name: "Mantine",
				level: "intermediate",
				years: 1,
				proficiency: 70,
				icon: <SiMantine size={32} />,
				projects: ["all"],
				lastUsed: "Jan 2025",
			} as Skill,
		],
	},
];
