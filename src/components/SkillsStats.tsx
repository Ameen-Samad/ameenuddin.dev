import { Badge, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { Skill, SkillLevel } from "../lib/skills-data";

interface SkillsStats {
	total: number;
	byLevel: {
		expert: number;
		advanced: number;
		intermediate: number;
		beginner: number;
	};
	byCategory: Record<string, number>;
	topSkills: Array<{ name: string; proficiency: number }>;
}

interface SkillsStatsProps {
	allSkills: Skill[];
}

export function getSkillsStats(skills: Skill[]): SkillsStats {
	const allSkills = skills;

	return {
		total: allSkills.length,
		byLevel: {
			expert: allSkills.filter((s) => s.level === "expert").length,
			advanced: allSkills.filter((s) => s.level === "advanced").length,
			intermediate: allSkills.filter((s) => s.level === "intermediate").length,
			beginner: allSkills.filter((s) => s.level === "beginner").length,
		},
		byCategory: allSkills.reduce(
			(acc, skill) => {
				acc[skill.category.name] = (acc[skill.category.name] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		),
		topSkills: [...allSkills]
			.sort((a, b) => b.proficiency - a.proficiency)
			.slice(0, 6)
			.map((skill) => ({
				name: skill.name,
				proficiency: skill.proficiency,
			})),
	};
}

const getLevelColor = (level: SkillLevel): string => {
	switch (level) {
		case "expert":
			return "teal";
		case "advanced":
			return "blue";
		case "intermediate":
			return "yellow";
		case "beginner":
			return "indigo";
		default:
			return "gray";
	}
};

export function SkillsStats({ allSkills }: SkillsStatsProps) {
	const stats = getSkillsStats(allSkills);

	return (
		<Paper
			p="xl"
			shadow="md"
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(255, 255, 255, 0.1)",
			}}
		>
			<Title order={3} c="white" mb="lg">
				Skills Overview
			</Title>

			<Text size="xl" fw={700} c="blue-400" mb="md">
				{stats.total} Total Skills
			</Text>

			<SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
				{Object.entries(stats.byLevel).map(([level, count]) => (
					<Badge
						key={level}
						size="xl"
						variant="filled"
						color={getLevelColor(level as SkillLevel)}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}: {count}
					</Badge>
				))}
			</SimpleGrid>

			<Stack>
				<Text size="lg" fw={600} c="white">
					Top Skills
				</Text>
				<SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
					{stats.topSkills.map((skill, index) => (
						<Badge
							key={skill.name}
							size="lg"
							variant="filled"
							color="blue"
							leftSection={
								<span
									style={{
										width: 20,
										height: 20,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background: "rgba(255, 255, 255, 0.3)",
										borderRadius: "50%",
										fontSize: "0.7rem",
										fontWeight: "bold",
									}}
								>
									{index + 1}
								</span>
							}
						>
							{skill.name} ({skill.proficiency}%)
						</Badge>
					))}
				</SimpleGrid>
			</Stack>
		</Paper>
	);
}
