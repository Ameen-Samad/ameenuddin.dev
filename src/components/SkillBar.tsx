import { Box, Text } from "@mantine/core";
import { motion } from "framer-motion";
import type { SkillLevel } from "../lib/skills-data";

interface SkillBarProps {
	proficiency: number;
	level: SkillLevel;
	color: string;
	animate?: boolean;
}

const getLevelColor = (level: SkillLevel): string => {
	switch (level) {
		case "expert":
			return "#10b981";
		case "advanced":
			return "#3b82f6";
		case "intermediate":
			return "#f59e0b";
		case "beginner":
			return "#6366f1";
		default:
			return "#6b7280";
	}
};

export function SkillBar({
	proficiency,
	level,
	color,
	animate = true,
}: SkillBarProps) {
	const levelColor = getLevelColor(level);

	return (
		<Box pos="relative">
			<Box
				h={8}
				w="100%"
				style={{
					borderRadius: "999px",
					overflow: "hidden",
					background: "rgba(0, 0, 0, 0.3)",
				}}
			>
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: animate ? `${proficiency}%` : `${proficiency}%` }}
					transition={{ duration: 1, ease: "easeOut" }}
					style={{
						height: "100%",
						borderRadius: "999px",
						background: `linear-gradient(90deg, ${color}, ${levelColor})`,
					}}
				/>
			</Box>
			<Text
				size="xs"
				fw={700}
				c="white"
				style={{
					position: "absolute",
					top: -2,
					right: -2,
					padding: "2px 6px",
					borderRadius: "999px",
					fontSize: "0.7rem",
					textTransform: "uppercase",
					background: levelColor,
				}}
			>
				{proficiency}%
			</Text>
		</Box>
	);
}
