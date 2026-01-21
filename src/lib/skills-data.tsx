import {
	Brain,
	Cloud,
	Cpu,
	Database,
	MessageSquare,
	Tools,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type {
	FaAws,
	FaGitAlt,FaNodeJs as FaNode, 
	FaReact
} from 'react-icons/fa';
import type {
	SiCloudflareworkers,
	SiDigitalocean,
	SiDocker,
	SiFramer,
	SiGooglecloud,
	SiMantine,
	SiNextdotjs,
	SiTailwindcss,
	SiTensorflow,
	SiTypescript,
	SiVisualstudiocode,
} from 'react-icons/si';

export type SkillLevel = 'expert' | 'advanced' | 'intermediate' | 'beginner';

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
		name: 'Frontend Development',
		icon: <Database size={24} />,
		color: '#3b82f6',
		description: 'Building responsive and interactive user interfaces',
		skills: [
			{
				name: 'React',
				level: 'expert',
				years: 4,
				proficiency: 95,
				icon: <FaReact size={32} />,
				projects: ['tetris-ai', 'ai-chatbot'],
				certifications: ['Meta React Professional Certificate'],
				lastUsed: 'Jan 2025',
			} as Skill,
			{
				name: 'TypeScript',
				level: 'expert',
				years: 3,
				proficiency: 90,
				icon: <SiTypescript size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'Tailwind CSS',
				level: 'advanced',
				years: 3,
				proficiency: 85,
				icon: <SiTailwindcss size={32} />,
				projects: ['tetris-ai', 'ai-chatbot', '3d-builder'],
				lastUsed: 'Jan 2025',
			} as Skill,
			{
				name: 'Next.js / TanStack',
				level: 'advanced',
				years: 3,
				proficiency: 80,
				icon: <SiNextdotjs size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
		],
	},
	{
		name: 'Backend Development',
		icon: <Database size={24} />,
		color: '#10b981',
		description: 'Building robust server-side applications and APIs',
		skills: [
			{
				name: 'Node.js',
				level: 'expert',
				years: 3,
				proficiency: 90,
				icon: <FaNode size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'Cloudflare Workers',
				level: 'advanced',
				years: 2,
				proficiency: 75,
				icon: <SiCloudflareworkers size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
		],
	},
	{
		name: 'AI & Machine Learning',
		icon: <Brain size={24} />,
		color: '#8b5cf6',
		description: 'Integrating AI models and building intelligent systems',
		skills: [
			{
				name: 'Cloudflare AI',
				level: 'expert',
				years: 2,
				proficiency: 85,
				icon: <SiCloudflareworkers size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'RAG Implementation',
				level: 'advanced',
				years: 1,
				proficiency: 75,
				icon: <Database size={32} />,
				projects: ['ai-chatbot'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'LLM Integration',
				level: 'intermediate',
				years: 1,
				proficiency: 60,
				icon: <Cpu size={32} />,
				projects: ['3d-builder', 'ai-chatbot'],
				lastUsed: 'Nov 2025',
			} as Skill,
			{
				name: 'Prompt Engineering',
				level: 'advanced',
				years: 1,
				proficiency: 80,
				icon: <MessageSquare size={32} />,
				projects: ['ai-chatbot', '3d-builder'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'TensorFlow / PyTorch',
				level: 'intermediate',
				years: 1,
				proficiency: 55,
				icon: <SiTensorflow size={32} />,
				projects: ['tetris-ai'],
				lastUsed: 'Jan 2025',
			} as Skill,
		],
	},
	{
		name: 'Cloud & DevOps',
		icon: <Cloud size={24} />,
		color: '#f59e0b',
		description: 'Managing cloud infrastructure and CI/CD pipelines',
		skills: [
			{
				name: 'AWS',
				level: 'intermediate',
				years: 2,
				proficiency: 65,
				icon: <FaAws size={32} />,
				projects: ['replikate-labs'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'Google Cloud Platform',
				level: 'intermediate',
				years: 1,
				proficiency: 60,
				icon: <SiGooglecloud size={32} />,
				projects: ['replikate-labs'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'DigitalOcean',
				level: 'intermediate',
				years: 2,
				proficiency: 70,
				icon: <SiDigitalocean size={32} />,
				projects: ['replikate-labs'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'Docker & Kubernetes',
				level: 'intermediate',
				years: 2,
				proficiency: 60,
				icon: <SiDocker size={32} />,
				projects: ['replikate-labs'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'Git & CI/CD',
				level: 'expert',
				years: 4,
				proficiency: 95,
				icon: <FaGitAlt size={32} />,
				projects: ['all'],
				lastUsed: 'Jan 2025',
			} as Skill,
		],
	},
	{
		name: 'Tools & Productivity',
		icon: <Tools size={24} />,
		color: '#6366f1',
		description: 'Development tools and workflow optimization',
		skills: [
			{
				name: 'Claude Code',
				level: 'expert',
				years: 2,
				proficiency: 90,
				icon: <Cpu size={32} />,
				projects: ['replikate-labs'],
				lastUsed: 'Dec 2025',
			} as Skill,
			{
				name: 'VS Code',
				level: 'expert',
				years: 5,
				proficiency: 95,
				icon: <SiVisualstudiocode size={32} />,
				projects: ['all'],
				lastUsed: 'Jan 2025',
			} as Skill,
			{
				name: 'Framer Motion',
				level: 'advanced',
				years: 3,
				proficiency: 80,
				icon: <SiFramer size={32} />,
				projects: ['tetris-ai', 'ai-chatbot', '3d-builder'],
				lastUsed: 'Jan 2025',
			} as Skill,
			{
				name: 'Mantine',
				level: 'advanced',
				years: 2,
				proficiency: 75,
				icon: <SiMantine size={32} />,
				projects: ['all'],
				lastUsed: 'Jan 2025',
			} as Skill,
		],
	},
];

export type { Skill, SkillCategory, SkillLevel };
