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
import { useStore } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import type { SkillLevel } from "../lib/skills-data";
import {
	type SkillItem,
	skillsActions,
	skillsStore,
} from "../lib/skills-store";
import { SkillCard } from "./SkillCard";
import { SkillsStats } from "./SkillsStats";

const columns: ColumnDef<SkillItem>[] = [
	{
		accessorKey: "name",
		header: "Skill",
	},
	{
		accessorKey: "level",
		header: "Level",
	},
	{
		accessorKey: "proficiency",
		header: "Proficiency",
	},
	{
		accessorKey: "categoryName",
		header: "Category",
	},
];

export function SkillsDashboard() {
	const filterLevel = useStore(skillsStore, (state) => state.filterLevel);
	const searchQuery = useStore(skillsStore, (state) => state.searchQuery);
	const filteredCategories = skillsActions.getFilteredCategories();
	const filteredSkills = filteredCategories.flatMap((category) =>
		category.skills.map((skill) => ({
			...skill,
			categoryName: category.name,
			categoryColor: category.color,
		})),
	);

	const table = useReactTable({
		data: filteredSkills,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const levelCounts = skillsActions.getLevelCounts();

	const levelFilters = [
		{ id: "all" as const, label: "All", count: levelCounts.all },
		{ id: "expert" as const, label: "Expert", count: levelCounts.expert },
		{ id: "advanced" as const, label: "Advanced", count: levelCounts.advanced },
		{
			id: "intermediate" as const,
			label: "Intermediate",
			count: levelCounts.intermediate,
		},
		{ id: "beginner" as const, label: "Beginner", count: levelCounts.beginner },
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
							onChange={(event) =>
								skillsActions.setSearchQuery(event.currentTarget.value)
							}
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
									onClick={() => skillsActions.setFilterLevel(filter.id)}
								>
									{filter.label} ({filter.count})
								</Badge>
							))}
						</Group>
					</Stack>

					{/* Statistics */}
					{searchQuery === "" && filterLevel === "all" && (
						<Stack mb="xl">
							<SkillsStats allSkills={skillsActions.getAllSkills()} />
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
