export interface Experience {
	id: string;
	company: string;
	logo?: string;
	location: string;
	title: string;
	startDate: string;
	endDate?: string | null;
	duration: string;
	isCurrent: boolean;
	type: "full-time" | "part-time" | "contract" | "internship";
	category: "software-engineering" | "ai-ml" | "cloud" | "devops";
	description: string;
	responsibilities: string[];
	achievements: string[];
	skills: string[];
	techStack: {
		frontend: string[];
		backend: string[];
		cloud: string[];
		ai: string[];
		tools: string[];
	};
	projects?: string[];
	teamSize?: number;
	highlights?: string[];
}

export const experiences: Experience[] = [
	{
		id: "replikate-labs",
		company: "Replikate Labs",
		location: "Singapore",
		title: "Software Engineer",
		startDate: "2025-12-01",
		endDate: null,
		duration: "1 month",
		isCurrent: true,
		type: "full-time",
		category: "cloud",
		description:
			"Building and deploying multiple SaaS products using AI-powered development tools and cloud platforms.",
		responsibilities: [
			"Developed and launched multiple SaaS products from concept to production",
			"Utilized AI-assisted coding tools to accelerate development velocity",
			"Architected and deployed applications across multiple cloud platforms",
			"Implemented scalable, secure, and performant cloud architectures",
			"Optimized deployment pipelines for multi-cloud environments",
			"Collaborated with cross-functional teams to deliver products on time",
		],
		achievements: [
			"Successfully deployed production applications on AWS, GCP, DigitalOcean, and Cloudflare Workers",
			"Reduced development time by 40% using AI-assisted coding workflows",
			"Implemented high-availability architecture with 99.9% uptime",
			"Built CI/CD pipelines reducing deployment time from hours to minutes",
			"Led a team of 3 engineers on SaaS product development",
		],
		skills: [
			"AI-Assisted Development",
			"Cloud Architecture",
			"Multi-Cloud Deployment",
			"CI/CD Pipelines",
			"SaaS Development",
			"Team Leadership",
			"Performance Optimization",
		],
		techStack: {
			frontend: ["React", "TypeScript", "Tailwind CSS", "Mantine"],
			backend: ["Node.js", "Cloudflare Workers", "API Design"],
			cloud: ["AWS", "Google Cloud Platform", "DigitalOcean", "Cloudflare"],
			ai: ["Claude Code", "LLM Integration", "AI Workflows"],
			tools: ["Git", "GitHub Actions", "Docker", "Wrangler", "VS Code"],
		},
		projects: [
			"Customer Portal",
			"Admin Dashboard",
			"API Gateway",
			"Analytics Platform",
		],
		teamSize: 4,
		highlights: [
			"🚀 Multi-cloud architecture expertise",
			"🤖 AI-native development pioneer",
			"📊 Built scalable SaaS from scratch",
			"⚡ Optimized deployments by 90%",
		],
	},
];

export const getExperienceById = (id: string): Experience | undefined => {
	return experiences.find((exp) => exp.id === id);
};

export const getExperienceByCategory = (category: string): Experience[] => {
	return experiences.filter((exp) => exp.category === category);
};

export const getCurrentExperience = (): Experience | undefined => {
	return experiences.find((exp) => exp.isCurrent);
};

export const getTotalExperienceYears = (): number => {
	return experiences.reduce((total, exp) => {
		const start = new Date(exp.startDate);
		const end = exp.endDate ? new Date(exp.endDate) : new Date();
		const years =
			(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
		return total + years;
	}, 0);
};

interface CareerStats {
	totalYears: number;
	totalPositions: number;
	companiesWorked: number;
	currentCompany: string | undefined;
	topSkills: string[];
	achievementsCount: number;
	avgTechStackSize: number;
}

export const getCareerStats = (): CareerStats => {
	const totalYears = getTotalExperienceYears();
	const companiesWorked = new Set(experiences.map((exp) => exp.company)).size;
	const allSkills = experiences.flatMap((exp) => exp.skills);
	const skillCounts = allSkills.reduce(
		(acc, skill) => {
			acc[skill] = (acc[skill] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topSkills = Object.entries(skillCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 6)
		.map(([skill]) => skill);
	const achievementsCount = experiences.reduce(
		(sum, exp) => sum + exp.achievements.length,
		0,
	);
	const avgTechStackSize =
		experiences.reduce((sum, exp) => {
			const size = Object.values(exp.techStack).flat().length;
			return sum + size;
		}, 0) / experiences.length;

	return {
		totalYears: Math.round(totalYears * 10) / 10,
		totalPositions: experiences.length,
		companiesWorked,
		currentCompany:
			experiences.find((exp) => exp.isCurrent)?.company || undefined,
		topSkills,
		achievementsCount,
		avgTechStackSize: Math.round(avgTechStackSize),
	};
};

export const calculateDuration = (
	startDate: string,
	endDate?: string | null,
): string => {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : new Date();

	const months =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years === 0) {
		return remainingMonths === 1 ? "1 month" : `${remainingMonths} months`;
	} else if (remainingMonths === 0) {
		return years === 1 ? "1 year" : `${years} years`;
	} else {
		return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
	}
};
