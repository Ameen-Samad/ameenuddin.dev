import { Badge, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { Skill, SkillLevel } from "../lib/skills-data";

interface SkillsStats {
	total: number;
	byLevel: {
		intermediate: number;
		learning: number;
		beginner: number;
	};
	rapidlyLearning: number;
	byCategory: Record<string, number>;
	topSkills: Array<{ name: string; proficiency: number; rapidlyLearning?: boolean }>;
}

interface SkillsStatsProps {
	allSkills: any[];
}

export function getSkillsStats(skills: any[]): SkillsStats {
	const allSkills = skills;

	return {
		total: allSkills.length,
		byLevel: {
			intermediate: allSkills.filter((s) => s.level === "intermediate").length,
			learning: allSkills.filter((s) => s.level === "learning").length,
			beginner: allSkills.filter((s) => s.level === "beginner").length,
		},
		rapidlyLearning: allSkills.filter((s) => s.rapidlyLearning).length,
		byCategory: allSkills.reduce(
			(acc, skill) => {
				const catName = skill.categoryName || skill.category?.name || "Other";
				acc[catName] = (acc[catName] || 0) + 1;
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
				rapidlyLearning: skill.rapidlyLearning,
			})),
	};
}

const getLevelColor = (level: SkillLevel): string => {
	switch (level) {
		case "intermediate":
			return "blue";
		case "learning":
			return "yellow";
		case "beginner":
			return "gray";
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
				<Badge
					size="xl"
					variant="gradient"
					gradient={{ from: 'orange', to: 'red', deg: 90 }}
				>
					🚀 Rapidly Learning: {stats.rapidlyLearning}
				</Badge>
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
							variant={skill.rapidlyLearning ? "gradient" : "filled"}
							gradient={skill.rapidlyLearning ? { from: 'orange', to: 'red', deg: 90 } : undefined}
							color={skill.rapidlyLearning ? undefined : "blue"}
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
									{skill.rapidlyLearning ? "🚀" : index + 1}
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
