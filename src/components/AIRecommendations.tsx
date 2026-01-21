import { AnimatePresence, motion } from "framer-motion";
import { GitFork, Sparkles, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecommendations } from "~/lib/cloudflare-ai";
import type { Project } from "~/lib/projects-data";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AIRecommendationsProps {
	type: "trending" | "similar" | "personalized";
	projectId?: string;
	userInterests?: string[];
	projects: Project[];
	limit?: number;
}

export function AIRecommendations({
	type,
	projectId,
	userInterests = [],
	projects,
	limit = 4,
}: AIRecommendationsProps) {
	const [recommendations, setRecommendations] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [explanations, setExplanations] = useState<Record<string, string>>({});

	useEffect(() => {
		async function loadRecommendations() {
			setIsLoading(true);
			try {
				let recs: any[] = [];

				if (type === "trending") {
					recs = projects
						.filter((p) => p.featured)
						.sort((a, b) => (b.stats?.stars || 0) - (a.stats?.stars || 0))
						.slice(0, limit);
					setExplanations({
						...recs.reduce(
							(acc, p) => {
								acc[p.id] = `Trending with ${p.stats?.stars || 0} stars`;
								return acc;
							},
							{} as Record<string, string>,
						),
					});
				} else if (type === "similar" && projectId) {
					const results = await getRecommendations(projectId);
					const recIds = results.map((r) => r.id);
					recs = projects.filter((p) => recIds.includes(p.id)).slice(0, limit);
					setExplanations({
						...recs.reduce(
							(acc, p) => {
								const similarity = results.find((r) => r.id === p.id)?.distance;
								acc[p.id] = `${Math.round((1 - similarity) * 100)}% similar`;
								return acc;
							},
							{} as Record<string, string>,
						),
					});
				} else if (type === "personalized" && userInterests.length > 0) {
					const results = await getRecommendations("", userInterests);
					const recIds = results.map((r) => r.id);
					recs = projects.filter((p) => recIds.includes(p.id)).slice(0, limit);
					setExplanations({
						...recs.reduce(
							(acc, p) => {
								acc[p.id] =
									`Based on your interest in ${userInterests.join(", ")}`;
								return acc;
							},
							{} as Record<string, string>,
						),
					});
				}

				setRecommendations(recs);
			} catch (error) {
				console.error("Error loading recommendations:", error);
				setRecommendations([]);
			}
			setIsLoading(false);
		}

		loadRecommendations();
	}, [type, projectId, userInterests, projects, limit]);

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{Array.from({ length: limit }).map((_, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: i * 0.1 }}
						className="h-64 bg-slate-800/50 rounded-lg animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (recommendations.length === 0) {
		return (
			<div className="text-center py-12 text-gray-400">
				<Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
				<p>No recommendations available yet</p>
			</div>
		);
	}

	const getTitle = () => {
		switch (type) {
			case "trending":
				return "Trending Projects";
			case "similar":
				return "Similar Projects";
			case "personalized":
				return "Recommended for You";
			default:
				return "Recommendations";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				{type === "trending" ? (
					<TrendingUp className="w-6 h-6 text-cyan-500" />
				) : (
					<Sparkles className="w-6 h-6 text-cyan-500" />
				)}
				<h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<AnimatePresence>
					{recommendations.map((project, index) => (
						<motion.div
							key={project.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden group">
								<div className="p-4 space-y-3">
									<div className="flex items-start gap-3">
										<div
											className="p-2 rounded-lg"
											style={{ backgroundColor: `${project.color}20` }}
										>
											<div style={{ color: project.color }}>{project.icon}</div>
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-lg font-semibold text-white truncate">
												{project.title}
											</h3>
											<p className="text-sm text-gray-400 line-clamp-2">
												{project.description}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2 text-xs text-gray-500">
										{type === "trending" && project.stats && (
											<>
												<div className="flex items-center gap-1">
													<Star className="w-3 h-3" />
													<span>{project.stats.stars || 0}</span>
												</div>
												{project.stats.views && (
													<div className="flex items-center gap-1">
														<span>{project.stats.views}</span>
														<span>views</span>
													</div>
												)}
											</>
										)}
									</div>

									{explanations[project.id] && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="text-xs text-cyan-400 flex items-center gap-1"
										>
											<Sparkles className="w-3 h-3" />
											{explanations[project.id]}
										</motion.div>
									)}

									<div className="flex flex-wrap gap-1">
										{project.tags.slice(0, 3).map((tag) => (
											<Badge
												key={tag}
												variant="outline"
												className="text-xs border-slate-600 text-gray-300"
											>
												{tag}
											</Badge>
										))}
										{project.tags.length > 3 && (
											<Badge
												variant="outline"
												className="text-xs border-slate-600 text-gray-300"
											>
												+{project.tags.length - 3}
											</Badge>
										)}
									</div>

									<Button
										asChild
										className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
										size="sm"
									>
										<a href={project.link}>View Project</a>
									</Button>
								</div>
							</Card>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
