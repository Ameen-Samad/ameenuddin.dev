/**
 * ProjectRecommendations Component
 *
 * Displays a grid of recommended project cards with a reason
 */

import { ProjectCard, type ProjectCardData } from './ProjectCard'

export interface ProjectRecommendation {
	projects: ProjectCardData[]
	reason: string
}

interface ProjectRecommendationsProps {
	recommendation: ProjectRecommendation
}

export function ProjectRecommendations({ recommendation }: ProjectRecommendationsProps) {
	if (!recommendation || recommendation.projects.length === 0) return null

	return (
		<div className="mt-4">
			{recommendation.reason && (
				<div className="text-sm font-medium text-emerald-400 mb-3">
					{recommendation.reason}
				</div>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{recommendation.projects.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	)
}
