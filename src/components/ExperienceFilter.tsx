import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import type { Experience } from "@/lib/experience-data";

interface ExperienceFilterProps {
	currentFilter: string;
	onFilterChange: (filter: string) => void;
	experiences: Experience[];
}

const filters = [
	{ id: "all", label: "All Experience" },
	{ id: "current", label: "Current Position" },
	{ id: "software-engineering", label: "Software Engineering" },
	{ id: "ai-ml", label: "AI/ML" },
	{ id: "cloud", label: "Cloud/DevOps" },
];

export const ExperienceFilter = ({
	currentFilter,
	onFilterChange,
	experiences,
}: ExperienceFilterProps) => {
	const getFilterCount = (filterId: string): number => {
		switch (filterId) {
			case "all":
				return experiences.length;
			case "current":
				return experiences.filter((e) => e.isCurrent).length;
			case "software-engineering":
				return experiences.filter((e) => e.category === "software-engineering")
					.length;
			case "ai-ml":
				return experiences.filter((e) => e.category === "ai-ml").length;
			case "cloud":
				return experiences.filter(
					(e) => e.category === "cloud" || e.category === "devops",
				).length;
			default:
				return 0;
		}
	};

	return (
		<div className="flex items-center gap-2 mb-8 flex-wrap">
			<Filter size={20} className="text-slate-400" />
			{filters.map((filter) => {
				const count = getFilterCount(filter.id);
				const isActive = currentFilter === filter.id;

				return (
					<motion.button
						key={filter.id}
						onClick={() => onFilterChange(filter.id)}
						className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
								isActive
									? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
									: "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
							}
            `}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{filter.label}
						<span
							className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20" : "bg-white/10"}`}
						>
							{count}
						</span>
					</motion.button>
				);
			})}
		</div>
	);
};
