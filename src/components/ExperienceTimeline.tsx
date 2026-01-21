import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { type Experience, experiences } from "@/lib/experience-data";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceFilter } from "./ExperienceFilter";
import { ExperienceStats } from "./ExperienceStats";

interface ExperienceTimelineProps {
	experiences?: Experience[];
	initialFilter?: string;
	initialSort?: string;
	showStats?: boolean;
	enableFilter?: boolean;
	enableSort?: boolean;
	className?: string;
}

export const ExperienceTimeline = ({
	experiences: customExperiences,
	initialFilter = "all",
	// initialSort = 'date', // TODO: Implement sorting
	showStats = true,
	enableFilter = true,
	// enableSort = true, // TODO: Implement sorting
	className = "",
}: ExperienceTimelineProps) => {
	const [activeFilter, setActiveFilter] = useState(initialFilter);
	const [expandedCard, setExpandedCard] = useState<string | null>(
		customExperiences?.find((e) => e.isCurrent)?.id ||
			experiences.find((e) => e.isCurrent)?.id ||
			null,
	);

	const filteredExperiences = useMemo(() => {
		let filtered = customExperiences || experiences;

		if (activeFilter === "current") {
			filtered = filtered.filter((exp) => exp.isCurrent);
		} else if (activeFilter !== "all") {
			filtered = filtered.filter((exp) => exp.category === activeFilter);
		}

		return filtered.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}, [activeFilter, customExperiences]);

	const toggleCard = (id: string) => {
		setExpandedCard((prev) => (prev === id ? null : id));
	};

	return (
		<div className={`max-w-4xl mx-auto px-4 ${className}`}>
			{/* Section Title */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center mb-12"
			>
				<h2 className="text-4xl font-bold text-white mb-4">Work Experience</h2>
				<p className="text-lg text-slate-400 max-w-2xl mx-auto">
					My professional journey, achievements, and technical expertise
				</p>
			</motion.div>

			{/* Stats Section */}
			{showStats && <ExperienceStats layout="compact" />}

			{/* Filters */}
			{enableFilter && (
				<ExperienceFilter
					currentFilter={activeFilter}
					onFilterChange={setActiveFilter}
					experiences={customExperiences || experiences}
				/>
			)}

			{/* Timeline */}
			<div className="relative pl-12">
				{/* Timeline Line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-500/30 rounded-full"
				/>

				{/* Experience Cards */}
				<div className="space-y-6">
					{filteredExperiences.map((experience, index) => (
						<ExperienceCard
							key={experience.id}
							experience={experience}
							isExpanded={expandedCard === experience.id}
							onToggle={() => toggleCard(experience.id)}
							index={index}
						/>
					))}

					{filteredExperiences.length === 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-12"
						>
							<p className="text-slate-400 text-lg">
								No experiences found matching your filter.
							</p>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};
