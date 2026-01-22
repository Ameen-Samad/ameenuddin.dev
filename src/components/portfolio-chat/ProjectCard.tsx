/**
 * ProjectCard Component
 *
 * Displays an individual project recommendation with image, description,
 * tech stack, and links
 */

import { ExternalLink, Github } from 'lucide-react'

export interface ProjectCardData {
	id: string
	title: string
	description: string
	image: string
	links: {
		demo: string
		github: string
		docs: string
	}
	techStack?: {
		frontend?: string[]
		backend?: string[]
		ai?: string[]
		tools?: string[]
	}
	status: string
	tags: string[]
	category: string
}

interface ProjectCardProps {
	project: ProjectCardData
}

export function ProjectCard({ project }: ProjectCardProps) {
	const allTech = [
		...(project.techStack?.frontend || []),
		...(project.techStack?.backend || []),
		...(project.techStack?.ai || []),
	].slice(0, 3) // Show top 3 tech tags

	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-emerald-500/50 transition-all">
			{project.image && (
				<img
					src={project.image}
					alt={project.title}
					className="w-full h-32 object-cover"
				/>
			)}

			<div className="p-4">
				<h4 className="font-bold text-white mb-2">{project.title}</h4>
				<p className="text-sm text-gray-300 mb-3 line-clamp-2">
					{project.description}
				</p>

				{/* Tech Stack Tags */}
				<div className="flex gap-2 mb-3 flex-wrap">
					{project.status === 'production' && (
						<span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
							Production
						</span>
					)}
					{project.status === 'beta' && (
						<span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
							Beta
						</span>
					)}
					{allTech.map((tech) => (
						<span
							key={tech}
							className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
						>
							{tech}
						</span>
					))}
				</div>

				{/* Links */}
				<div className="flex gap-3">
					{project.links.demo && (
						<a
							href={project.links.demo}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
						>
							<ExternalLink className="w-3 h-3" />
							View Demo
						</a>
					)}
					{project.links.github && (
						<a
							href={project.links.github}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-gray-400 hover:underline flex items-center gap-1"
						>
							<Github className="w-3 h-3" />
							GitHub
						</a>
					)}
				</div>
			</div>
		</div>
	)
}
