import {
	Badge,
	Group,
	HoverCard,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { motion } from "framer-motion";
import type { Skill, SkillCategory } from "../lib/skills-data";
import { SkillBar } from "./SkillBar";
import { SkillTooltip } from "./SkillTooltip";

interface SkillCardProps {
	category: SkillCategory;
	index: number;
}

export function SkillCard({ category, index }: SkillCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9, y: 20 }}
			whileInView={{ opacity: 1, scale: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
		>
			<Paper
				p="xl"
				radius="lg"
				style={{
					background: "rgba(26, 26, 26, 0.8)",
					backdropFilter: "blur(12px)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					height: "100%",
					transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				}}
				component={motion.div}
				whileHover={{
					scale: 1.02,
					boxShadow: `0 20px 40px ${category.color}20`,
					borderColor: `${category.color}40`,
				}}
			>
				<Stack gap="md">
					<Group gap="sm" align="flex-start">
						<div
							style={{
								color: category.color,
								animation: "float 3s ease-in-out infinite",
							}}
						>
							{category.icon}
						</div>
						<div style={{ flex: 1 }}>
							<Title order={4} c="white" mb="xs">
								{category.name}
							</Title>
							<Text size="sm" c="dimmed" lineClamp={2}>
								{category.description}
							</Text>
						</div>
					</Group>

					<Stack gap="sm">
						{category.skills.map((skill) => (
							<HoverCard key={skill.name} position="top" shadow="md" withArrow>
								<HoverCard.Target>
									<div
										style={{
											cursor: "pointer",
											transition: "transform 0.2s",
										}}
									>
										<Group gap="xs" mb={4}>
											<div style={{ color: category.color }}>{skill.icon}</div>
											<Text size="sm" fw={600} c="white" style={{ flex: 1 }}>
												{skill.name}
											</Text>
											<Badge
												size="xs"
												variant="light"
												color={
													skill.level === "expert"
														? "teal"
														: skill.level === "advanced"
															? "blue"
															: skill.level === "intermediate"
																? "yellow"
																: "indigo"
												}
											>
												{skill.level}
											</Badge>
										</Group>
										<SkillBar
											proficiency={skill.proficiency}
											level={skill.level}
											color={category.color}
										/>
									</div>
								</HoverCard.Target>
								<HoverCard.Dropdown>
									<SkillTooltip skill={skill} />
								</HoverCard.Dropdown>
							</HoverCard>
						))}
					</Stack>
				</Stack>

				<style>{`
					@keyframes float {
						0%, 100% { transform: translateY(0); }
						50% { transform: translateY(-4px); }
					}
				`}</style>
			</Paper>
		</motion.div>
	);
}
