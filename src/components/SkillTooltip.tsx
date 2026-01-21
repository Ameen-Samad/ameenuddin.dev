import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import type { Skill } from "../lib/skills-data";
import type { SkillItem } from "../lib/skills-store";
import { SkillBar } from "./SkillBar";

interface SkillTooltipProps {
	skill: Skill | SkillItem;
}

export function SkillTooltip({ skill }: SkillTooltipProps) {
	const levelColors = {
		expert: "#10b981",
		advanced: "#3b82f6",
		intermediate: "#f59e0b",
		beginner: "#6366f1",
	};

	return (
		<Box
			p="md"
			style={{
				background: "rgba(26, 26, 26, 0.95)",
				backdropFilter: "blur(12px)",
				border: "1px solid rgba(255, 255, 255, 0.1)",
				borderRadius: "12px",
				minWidth: "280px",
				boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
			}}
		>
			<Stack gap="xs">
				<Group gap="xs">
					<Badge color={levelColors[skill.level]} variant="filled" size="sm">
						{skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
					</Badge>
					<Badge color="blue" variant="light" size="sm">
						{skill.years} {skill.years === 1 ? "year" : "years"}
					</Badge>
				</Group>

				{skill.projects && skill.projects.length > 0 && (
					<Box>
						<Text size="xs" fw={600} c="white" mb={2}>
							Projects:
						</Text>
						<Text size="xs" c="dimmed">
							{skill.projects.join(", ")}
						</Text>
					</Box>
				)}

				{skill.certifications && skill.certifications.length > 0 && (
					<Box>
						<Text size="xs" fw={600} c="white" mb={2}>
							Certifications:
						</Text>
						<Text size="xs" c="dimmed">
							{skill.certifications.join(", ")}
						</Text>
					</Box>
				)}

				{skill.lastUsed && (
					<Box>
						<Text size="xs" fw={600} c="white" mb={2}>
							Last used:
						</Text>
						<Text size="xs" c="dimmed">
							{skill.lastUsed}
						</Text>
					</Box>
				)}

				<Box>
					<Text size="xs" fw={600} c="white" mb={2}>
						Proficiency:
					</Text>
					<SkillBar
						proficiency={skill.proficiency}
						level={skill.level}
						color={'categoryColor' in skill ? skill.categoryColor : skill.category?.color || '#3b82f6'}
						animate={false}
					/>
				</Box>
			</Stack>
		</Box>
	);
}
