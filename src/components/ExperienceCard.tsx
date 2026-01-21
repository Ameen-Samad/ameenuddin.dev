import { AnimatePresence, motion } from "framer-motion";
import {
	Award,
	Calendar,
	ChevronDown,
	Code2,
	MapPin,
	Users,
} from "lucide-react";
import type { Experience } from "@/lib/experience-data";
import { CompanyLogo } from "./CompanyLogo";

interface ExperienceCardProps {
	experience: Experience;
	isExpanded: boolean;
	onToggle: () => void;
	index: number;
}

export const ExperienceCard = ({
	experience,
	isExpanded,
	onToggle,
	index,
}: ExperienceCardProps) => {
	return (
		<motion.article
			initial={{ opacity: 0, x: -50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay: index * 0.15 }}
			className={`
        relative bg-white/5 backdrop-blur-lg border rounded-2xl overflow-hidden
        transition-all duration-300
        ${
					experience.isCurrent
						? "border-blue-500 shadow-lg shadow-blue-500/20"
						: "border-white/10 hover:border-white/20"
				}
      `}
		>
			{/* Timeline dot */}
			<div
				className={`
          absolute -left-6 top-6 w-3 h-3 rounded-full z-10
          ${experience.isCurrent ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-slate-600"}
        `}
			/>

			{/* Header - Always Visible */}
			<button
				type="button"
				aria-expanded={isExpanded}
				onClick={onToggle}
				className="p-6 cursor-pointer hover:bg-white/5 transition-colors w-full text-left bg-transparent border-0"
			>
				<div className="flex items-start gap-4">
					<CompanyLogo logo={experience.logo} company={experience.company} />

					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="text-xl font-bold text-white">
								{experience.title}
							</h3>
							{experience.isCurrent && (
								<span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
									Current
								</span>
							)}
						</div>

						<h4 className="text-lg font-semibold text-slate-300 mb-2">
							{experience.company}
						</h4>

						<div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
							<div className="flex items-center gap-1">
								<Calendar size={14} />
								<span>
									{new Date(experience.startDate).toLocaleDateString("en-US", {
										month: "short",
										year: "numeric",
									})}
									{" - "}
									{experience.endDate
										? new Date(experience.endDate).toLocaleDateString("en-US", {
												month: "short",
												year: "numeric",
											})
										: "Present"}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<MapPin size={14} />
								<span>{experience.duration}</span>
							</div>
							<div className="flex items-center gap-1">
								<MapPin size={14} />
								<span>{experience.location}</span>
							</div>
							{experience.teamSize && (
								<div className="flex items-center gap-1">
									<Users size={14} />
									<span>Team: {experience.teamSize}</span>
								</div>
							)}
						</div>

						<p className="text-slate-400 text-sm line-clamp-2">
							{experience.description}
						</p>
					</div>

					<motion.div
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className="text-slate-400" />
					</motion.div>
				</div>

				{/* Highlights (if any) */}
				{experience.highlights && experience.highlights.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{experience.highlights.map((highlight) => (
							<span
								key={highlight}
								className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-sm"
							>
								{highlight}
							</span>
						))}
					</div>
				)}
			</button>

			{/* Expanded Details */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="px-6 pb-6 border-t border-white/10 pt-4">
							{/* Responsibilities */}
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
									<Code2 size={16} />
									Responsibilities
								</h5>
								<ul className="space-y-1">
									{experience.responsibilities.map((resp) => (
										<li
											key={resp}
											className="text-sm text-slate-400 flex items-start gap-2"
										>
											<span className="text-slate-500 mt-1">•</span>
											<span>{resp}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Achievements */}
							{experience.achievements.length > 0 && (
								<div className="mb-4">
									<h5 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
										<Award size={16} />
										Achievements
									</h5>
									<ul className="space-y-1">
										{experience.achievements.map((achievement) => (
											<li
												key={achievement}
												className="text-sm text-slate-400 flex items-start gap-2"
											>
												<span className="text-green-400 mt-1">✓</span>
												<span>{achievement}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Tech Stack */}
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-slate-300 mb-2">
									Tech Stack
								</h5>
								<div className="space-y-3">
									{Object.entries(experience.techStack).map(
										([category, techs]) =>
											techs.length > 0 ? (
												<div key={category}>
													<span className="text-xs text-slate-500 capitalize mb-1 block">
														{category}
													</span>
													<div className="flex flex-wrap gap-1">
														{techs.map((tech) => (
															<span
																key={tech}
																className="px-2 py-1 bg-white/5 text-slate-300 rounded text-xs"
															>
																{tech}
															</span>
														))}
													</div>
												</div>
											) : null,
									)}
								</div>
							</div>

							{/* Projects */}
							{experience.projects && experience.projects.length > 0 && (
								<div>
									<h5 className="text-sm font-semibold text-slate-300 mb-2">
										Key Projects
									</h5>
									<div className="flex flex-wrap gap-2">
										{experience.projects.map((project) => (
											<span
												key={project}
												className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
											>
												{project}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.article>
	);
};
