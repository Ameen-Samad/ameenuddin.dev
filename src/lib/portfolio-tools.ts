/**
 * Portfolio Chat Tools - Tool Definitions and Execution
 *
 * Tools for recommending projects, explaining skills, and retrieving experience
 */

import { projects } from './projects-data'
import { skillCategories } from './skills-data'
import { experiences } from './experience-data'

// Tool Definitions
export const PORTFOLIO_TOOLS = [
	{
		name: 'recommendProject',
		description:
			'Recommend one or more projects to showcase a specific skill or technology. This displays interactive project cards with images, descriptions, and links.',
		parameters: {
			type: 'object',
			properties: {
				projectIds: {
					type: 'array',
					items: { type: 'string' },
					description:
						"Array of project IDs to recommend (e.g., ['tetris-ai', 'guitar-concierge'])",
				},
				reason: {
					type: 'string',
					description:
						'Why these projects demonstrate the requested skill/technology (1-2 sentences)',
				},
			},
			required: ['projectIds', 'reason'],
		},
	},
	{
		name: 'explainSkill',
		description:
			'Provide detailed information about a specific technical skill, including proficiency level, years of experience, and related projects',
		parameters: {
			type: 'object',
			properties: {
				skillName: {
					type: 'string',
					description:
						"Name of the skill (e.g., 'React', 'Cloudflare Workers', 'TypeScript')",
				},
			},
			required: ['skillName'],
		},
	},
	{
		name: 'getExperience',
		description:
			'Retrieve work experience details, either for all companies or a specific company',
		parameters: {
			type: 'object',
			properties: {
				company: {
					type: 'string',
					description:
						'Company name (optional - if not provided, returns all experience)',
				},
			},
		},
	},
]

// Tool Result Types
export interface ProjectRecommendation {
	type: 'project_recommendation'
	projects: Array<{
		id: string
		title: string
		description: string
		image: string
		links: {
			demo: string
			github: string
			docs: string
		}
		techStack: any
		status: string
		tags: string[]
		category: string
	}>
	reason: string
}

export interface SkillDetail {
	type: 'skill_detail'
	skill: {
		name: string
		level: string
		years: number
		proficiency: number
		projects: string[]
		certifications: string[]
		lastUsed: string
		category: string
	}
}

export interface ExperienceDetail {
	type: 'experience_detail'
	experience: Array<{
		company: string
		title: string
		duration: string
		location: string
		isCurrent: boolean
		description: string
		responsibilities: string[]
		achievements: string[]
		skills: string[]
		techStack: any
	}>
}

export type ToolResult =
	| ProjectRecommendation
	| SkillDetail
	| ExperienceDetail
	| { error: string }

/**
 * Execute a tool call and return structured data
 */
export function executePortfolioTool(
	toolName: string,
	toolInput: Record<string, unknown>,
): ToolResult {
	switch (toolName) {
		case 'recommendProject':
			return handleRecommendProject(toolInput)

		case 'explainSkill':
			return handleExplainSkill(toolInput)

		case 'getExperience':
			return handleGetExperience(toolInput)

		default:
			return { error: `Unknown tool: ${toolName}` }
	}
}

/**
 * Handle recommendProject tool - return project details for display
 */
function handleRecommendProject(
	input: Record<string, unknown>,
): ProjectRecommendation | { error: string } {
	const projectIds = (input.projectIds || input.project_ids) as string[]

	if (!projectIds || !Array.isArray(projectIds)) {
		return { error: 'projectIds must be an array' }
	}

	const matchedProjects = projects.filter((p) => projectIds.includes(p.id))

	if (matchedProjects.length === 0) {
		return { error: 'No matching projects found' }
	}

	return {
		type: 'project_recommendation',
		projects: matchedProjects.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description,
			image: p.screenshots?.[0] || '',
			links: {
				demo: p.demo || p.link || '',
				github: p.github || '',
				docs: p.docs || '',
			},
			techStack: p.techStack,
			status: p.status,
			tags: p.tags,
			category: p.category,
		})),
		reason: input.reason as string,
	}
}

/**
 * Handle explainSkill tool - return skill details
 */
function handleExplainSkill(
	input: Record<string, unknown>,
): SkillDetail | { error: string } {
	const skillName = (input.skillName || input.skill_name) as string

	if (!skillName) {
		return { error: 'skillName is required' }
	}

	// Search through all skill categories
	for (const category of skillCategories) {
		const skill = category.skills.find(
			(s) => s.name.toLowerCase() === skillName.toLowerCase(),
		)

		if (skill) {
			return {
				type: 'skill_detail',
				skill: {
					name: skill.name,
					level: skill.level,
					years: skill.years,
					proficiency: skill.proficiency,
					projects: skill.projects || [],
					certifications: skill.certifications || [],
					lastUsed: skill.lastUsed || '',
					category: category.name,
				},
			}
		}
	}

	return { error: `Skill "${skillName}" not found` }
}

/**
 * Handle getExperience tool - return work experience details
 */
function handleGetExperience(
	input: Record<string, unknown>,
): ExperienceDetail | { error: string } {
	const company = input.company as string | undefined

	const results = company
		? experiences.filter(
				(e) => e.company.toLowerCase() === company.toLowerCase(),
			)
		: experiences

	if (results.length === 0) {
		return {
			error: company
				? `No experience found at ${company}`
				: 'No experience data available',
		}
	}

	return {
		type: 'experience_detail',
		experience: results.map((e) => ({
			company: e.company,
			title: e.title,
			duration: e.duration,
			location: e.location,
			isCurrent: e.isCurrent,
			description: e.description,
			responsibilities: e.responsibilities,
			achievements: e.achievements,
			skills: e.skills,
			techStack: e.techStack,
		})),
	}
}
