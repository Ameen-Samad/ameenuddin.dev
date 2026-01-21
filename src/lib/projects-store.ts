import { Store } from "@tanstack/store";
import {
	type FilterType,
	getFilters,
	type Project,
	projects,
} from "./projects-data";

export interface ProjectsStore {
	activeFilter: FilterType;
	searchQuery: string;
	selectedProject: string | null;
	projects: Project[];
}

export const projectsStore = new Store<ProjectsStore>({
	activeFilter: "all",
	searchQuery: "",
	selectedProject: null,
	projects,
});

export const projectsActions = {
	setActiveFilter: (filter: FilterType) => {
		projectsStore.setState((state) => ({
			...state,
			activeFilter: filter,
		}));
	},

	setSearchQuery: (query: string) => {
		projectsStore.setState((state) => ({
			...state,
			searchQuery: query,
		}));
	},

	setSelectedProject: (projectId: string | null) => {
		projectsStore.setState((state) => ({
			...state,
			selectedProject: projectId,
		}));
	},

	getFilteredProjects: (): Project[] => {
		const state = projectsStore.state;
		let filtered = state.projects;

		if (state.activeFilter !== "all") {
			filtered = filtered.filter((p) => p.category === state.activeFilter);
		}

		if (state.searchQuery) {
			const query = state.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(project) =>
					project.title.toLowerCase().includes(query) ||
					project.description.toLowerCase().includes(query) ||
					project.tags.some((tag) => tag.toLowerCase().includes(query)),
			);
		}

		return filtered;
	},

	getFeaturedProject: (): Project | undefined => {
		const state = projectsStore.state;
		return state.projects.find((p) => p.featured);
	},

	getFeaturedProjectsCount: (): number => {
		const state = projectsStore.state;
		return state.projects.filter((p) => p.featured).length;
	},

	getFilters: () => {
		const state = projectsStore.state;
		return getFilters(state.projects);
	},

	getSelectedProjectData: (): Project | undefined => {
		const state = projectsStore.state;
		return state.projects.find((p) => p.id === state.selectedProject);
	},
};
