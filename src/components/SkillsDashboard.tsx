import {
	Badge,
	Container,
	Group,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { type SkillLevel, skillCategories } from "../lib/skills-data";
import { SkillCard } from "./SkillCard";
import { SkillsStats } from "./SkillsStats";

interface SkillFilters {
	level?: SkillLevel;
	searchQuery?: string;
}

export function SkillsDashboard() {
	const [filterLevel, setFilterLevel] = useState<SkillLevel | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");

	const allSkills = skillCategories.flatMap((category) =>
		category.skills.map((skill) => ({ ...skill, category })),
	);

	const filterSkills = (filters: SkillFilters) => {
		return skillCategories
			.map((category) => ({
				...category,
				skills: category.skills.filter((skill) => {
					if (filters.level && skill.level !== filters.level) return false;
					if (filters.searchQuery) {
						const query = filters.searchQuery.toLowerCase();
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
	};

	const filteredCategories = filterSkills({
		level: filterLevel === "all" ? undefined : filterLevel,
		searchQuery: searchQuery || undefined,
	});

	const filteredSkills = filteredCategories.flatMap((category) =>
		category.skills.map((skill) => ({ ...skill, category })),
	);

	const levelFilters = [
		{ id: "all" as const, label: "All", count: allSkills.length },
		{
			id: "expert" as const,
			label: "Expert",
			count: allSkills.filter((s) => s.level === "expert").length,
		},
		{
			id: "advanced" as const,
			label: "Advanced",
			count: allSkills.filter((s) => s.level === "advanced").length,
		},
		{
			id: "intermediate" as const,
			label: "Intermediate",
			count: allSkills.filter((s) => s.level === "intermediate").length,
		},
		{
			id: "beginner" as const,
			label: "Beginner",
			count: allSkills.filter((s) => s.level === "beginner").length,
		},
	];

	return (
		<section
			id="skills"
			style={{ padding: "100px 0", background: "rgba(0, 0, 0, 0.3)" }}
		>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title order={2} c="white" mb="xl" style={{ textAlign: "center" }}>
						My Expertise
					</Title>

					{/* Search and Filter */}
					<Stack gap="md" mb="xl">
						<TextInput
							placeholder="Search skills..."
							leftSection={<IconSearch size={20} color="#6b7280" />}
							size="lg"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.currentTarget.value)}
							style={{
								maxWidth: 400,
								margin: "0 auto",
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
								borderRadius: "8px",
							}}
						/>

						<Group justify="center" gap="sm">
							{levelFilters.map((filter) => (
								<Badge
									key={filter.id}
									size="lg"
									variant={filterLevel === filter.id ? "filled" : "light"}
									color={filterLevel === filter.id ? "blue" : "gray"}
									style={{
										cursor: "pointer",
										transition: "all 0.2s",
									}}
									onClick={() => setFilterLevel(filter.id)}
								>
									{filter.label} ({filter.count})
								</Badge>
							))}
						</Group>
					</Stack>

					{/* Statistics */}
					{searchQuery === "" && filterLevel === "all" && (
						<Stack mb="xl">
							<SkillsStats allSkills={allSkills} />
						</Stack>
					)}

					{/* Skill Cards Grid */}
					{filteredCategories.length > 0 ? (
						<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
							{filteredCategories.map((category, index) => (
								<SkillCard
									key={category.name}
									category={category}
									index={index}
								/>
							))}
						</SimpleGrid>
					) : (
						<Text size="lg" c="dimmed" ta="center" py="xl">
							No skills found matching your criteria.
						</Text>
					)}
				</motion.div>
			</Container>
		</section>
	);
}
