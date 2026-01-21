import { Container, SimpleGrid, Text } from "@mantine/core";
import { motion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import { type FilterType, getFilters, projects } from "../lib/projects-data";
import { AIRecommendations } from "./AIRecommendations";
import { ProjectAIAssistant } from "./ProjectAIAssistant";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilter } from "./ProjectFilter";
import { ProjectHero } from "./ProjectHero";

export function ProjectsSection() {
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const projectsId = useId();

	const filters = useMemo(() => getFilters(projects), []);

	const filteredProjects = useMemo(() => {
		let filtered = projects;

		if (activeFilter !== "all") {
			filtered = filtered.filter((p) => p.category === activeFilter);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(project) =>
					project.title.toLowerCase().includes(query) ||
					project.description.toLowerCase().includes(query) ||
					project.tags.some((tag) => tag.toLowerCase().includes(query)),
			);
		}

		return filtered;
	}, [activeFilter, searchQuery]);

	const featuredProjects = projects.filter((p) => p.featured).length;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setSearchQuery("");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<section id={projectsId} style={{ padding: "100px 0" }}>
			<Container size="xl">
				<ProjectHero
					totalProjects={projects.length}
					featuredProjects={featuredProjects}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>

				<ProjectFilter
					filters={filters}
					activeFilter={activeFilter}
					onFilterChange={setActiveFilter}
				/>

				{filteredProjects.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						style={{ textAlign: "center", padding: "60px 0" }}
					>
						<Text c="dimmed" size="lg">
							No projects found matching your criteria
						</Text>
					</motion.div>
				) : (
					<motion.div
						key={activeFilter}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4 }}
					>
						<SimpleGrid
							cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
							spacing="xl"
							style={{ gap: "2rem" }}
						>
							{filteredProjects.map((project, index) => (
								<ProjectCard key={project.id} project={project} index={index} />
							))}
						</SimpleGrid>
					</motion.div>
				)}

				{searchQuery && (
					<Text c="dimmed" size="sm" mt="xl" style={{ textAlign: "center" }}>
						Showing {filteredProjects.length} of {projects.length} projects
					</Text>
				)}
			</Container>
		</section>
	);
}
