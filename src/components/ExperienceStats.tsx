import { motion } from "framer-motion";
import { Briefcase, Building, Calendar, Trophy } from "lucide-react";
import { getCareerStats } from "@/lib/experience-data";

interface ExperienceStatsProps {
	layout?: "compact" | "detailed";
}

export const ExperienceStats = ({
	layout = "detailed",
}: ExperienceStatsProps) => {
	const stats = getCareerStats();

	const statsData = [
		{
			icon: Calendar,
			value: `${stats.totalYears} Years`,
			label: "Total Experience",
			color: "blue",
		},
		{
			icon: Briefcase,
			value: stats.totalPositions,
			label: "Positions Held",
			color: "green",
		},
		{
			icon: Building,
			value: stats.companiesWorked,
			label: "Companies",
			color: "purple",
		},
		{
			icon: Trophy,
			value: stats.achievementsCount,
			label: "Achievements",
			color: "orange",
		},
	];

	if (layout === "compact") {
		return (
			<div className="flex items-center gap-6 mb-8">
				{statsData.map((stat) => (
					<div key={stat.label} className="flex items-center gap-2">
						<stat.icon size={18} className={`text-${stat.color}-400`} />
						<span className="text-slate-300 text-sm">
							{stat.label}:{" "}
							<span className="text-white font-semibold">{stat.value}</span>
						</span>
					</div>
				))}
				{stats.currentCompany && (
					<div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
						Currently at {stats.currentCompany}
					</div>
				)}
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="mb-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
		>
			<h3 className="text-2xl font-bold text-white mb-6">Career Statistics</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsData.map((stat) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: statsData.indexOf(stat) * 0.1 }}
						className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all"
					>
						<stat.icon size={32} className={`text-${stat.color}-400 mb-3`} />
						<div className={`text-3xl font-bold text-white mb-1`}>
							{stat.value}
						</div>
						<div className="text-slate-400 text-sm">{stat.label}</div>
					</motion.div>
				))}
			</div>

			{stats.currentCompany && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-6 flex items-center gap-2"
				>
					<div className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
						Currently at {stats.currentCompany}
					</div>
				</motion.div>
			)}

			{stats.topSkills.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-6"
				>
					<h4 className="text-lg font-semibold text-white mb-3">Top Skills</h4>
					<div className="flex flex-wrap gap-2">
						{stats.topSkills.map((skill) => (
							<span
								key={skill}
								className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-sm"
							>
								{skill}
							</span>
						))}
					</div>
				</motion.div>
			)}
		</motion.div>
	);
};
