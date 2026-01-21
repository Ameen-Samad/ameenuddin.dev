import { Store } from "@tanstack/store";
import {
	type Skill,
	type SkillCategory,
	type SkillLevel,
	skillCategories,
} from "./skills-data";

export interface SkillItem extends Skill {
	categoryName: string;
	categoryColor: string;
}

export interface SkillsStore {
	filterLevel: SkillLevel | "all";
	searchQuery: string;
	categories: SkillCategory[];
}

export const skillsStore = new Store<SkillsStore>({
	filterLevel: "all",
	searchQuery: "",
	categories: skillCategories,
});

export const skillsActions = {
	setFilterLevel: (level: SkillLevel | "all") => {
		skillsStore.setState((state) => ({
			...state,
			filterLevel: level,
		}));
	},

	setSearchQuery: (query: string) => {
		skillsStore.setState((state) => ({
			...state,
			searchQuery: query,
		}));
	},

	getFilteredCategories: (): SkillCategory[] => {
		const state = skillsStore.state;
		return state.categories
			.map((category) => ({
				...category,
				skills: category.skills.filter((skill) => {
					if (
						state.filterLevel !== "all" &&
						skill.level !== state.filterLevel
					) {
						return false;
					}
					if (state.searchQuery) {
						const query = state.searchQuery.toLowerCase();
						if (
							!skill.name.toLowerCase().includes(query) &&
							!category.name.toLowerCase().includes(query)
						) {
							return false;
						}
					}
					return true;
				}),
			}))
			.filter((category) => category.skills.length > 0);
	},

	getAllSkills: (): SkillItem[] => {
		const state = skillsStore.state;
		return state.categories.flatMap((category) =>
			category.skills.map((skill) => ({
				...skill,
				categoryName: category.name,
				categoryColor: category.color,
			})),
		);
	},

	getLevelCounts: () => {
		const allSkills = skillsActions.getAllSkills();
		return {
			all: allSkills.length,
			expert: allSkills.filter((s) => s.level === "expert").length,
			advanced: allSkills.filter((s) => s.level === "advanced").length,
			intermediate: allSkills.filter((s) => s.level === "intermediate").length,
			beginner: allSkills.filter((s) => s.level === "beginner").length,
		};
	},
};
