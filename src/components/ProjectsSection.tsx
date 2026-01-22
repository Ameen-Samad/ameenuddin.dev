import { Container, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { useStore } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
	type FilterFn,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { motion } from "framer-motion";
import { useEffect, useId } from "react";
import type { Project } from "../lib/projects-data";
import { projectsActions, projectsStore } from "../lib/projects-store";
import { AIRecommendations } from "./AIRecommendations";
import { ProjectAIAssistant } from "./ProjectAIAssistant";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilter } from "./ProjectFilter";
import { ProjectHero } from "./ProjectHero";

const columns: ColumnDef<Project>[] = [
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "category",
		header: "Category",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "tags",
		header: "Tags",
	},
];

export function ProjectsSection() {
	const activeFilter = useStore(projectsStore, (state) => state.activeFilter);
	const searchQuery = useStore(projectsStore, (state) => state.searchQuery);
	const selectedProject = useStore(
		projectsStore,
		(state) => state.selectedProject,
	);
	const projectsId = useId();

	const filters = projectsActions.getFilters();
	const _featuredProject = projectsActions.getFeaturedProject();
	const filteredProjects = projectsActions.getFilteredProjects();
	const featuredProjects = projectsActions.getFeaturedProjectsCount();

	const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
		const itemRank = rankItem(row.getValue(columnId), value);
		addMeta({ itemRank });
		return itemRank.passed;
	};

	const _table = useReactTable({
		data: filteredProjects,
		columns,
		filterFns: { fuzzy: fuzzyFilter },
		getCoreRowModel: getCoreRowModel(),
	});

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				projectsActions.setSearchQuery("");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleProjectClick = (projectId: string) => {
		projectsActions.setSelectedProject(projectId);
	};

	return (
		<section id={projectsId} style={{ padding: "100px 0" }}>
			<Container size="xl">
				<ProjectHero
					totalProjects={filteredProjects.length}
					featuredProjects={featuredProjects}
					searchQuery={searchQuery}
					onSearchChange={projectsActions.setSearchQuery}
				/>

				<ProjectFilter
					filters={filters}
					activeFilter={activeFilter}
					onFilterChange={projectsActions.setActiveFilter}
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
								<UnstyledButton
									key={project.id}
									onClick={() => handleProjectClick(project.id)}
								>
									<ProjectCard project={project} index={index} />
								</UnstyledButton>
							))}
						</SimpleGrid>
					</motion.div>
				)}

				{searchQuery && filteredProjects.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						style={{ marginTop: "60px" }}
					>
						<AIRecommendations
							type="similar"
							projectId={filteredProjects[0]?.id}
							projects={projectsStore.state.projects}
							limit={3}
						/>
					</motion.div>
				)}

				{searchQuery && (
					<Text c="dimmed" size="sm" mt="xl" style={{ textAlign: "center" }}>
						Showing {filteredProjects.length} of{" "}
						{projectsStore.state.projects.length} projects
					</Text>
				)}
			</Container>

			{selectedProject &&
				(() => {
					const projectData = projectsActions.getSelectedProjectData();
					if (!projectData) return null;
					return (
						<ProjectAIAssistant
							projectId={selectedProject}
							projectTitle={projectData.title}
							projectDescription={projectData.description}
							projectTags={projectData.tags}
						/>
					);
				})()}
		</section>
	);
}
