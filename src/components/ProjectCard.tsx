import { Badge, Button, Group, Paper, Text, Title } from "@mantine/core";
import {
	IconBrandGithub,
	IconExternalLink,
	IconShare,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { Project } from "../lib/projects-data";
import { ProjectStats } from "./ProjectStats";

interface ProjectCardProps {
	project: Project;
	index: number;
}

const _statusColors = {
	production: "#00ff88",
	beta: "#ffaa00",
	archived: "#ff4444",
};

export function ProjectCard({ project, index }: ProjectCardProps) {
	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: project.title,
				text: project.description,
				url: window.location.origin + project.link,
			});
		} else {
			navigator.clipboard.writeText(window.location.origin + project.link);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9, rotateX: -5 }}
			animate={{ opacity: 1, scale: 1, rotateX: 0 }}
			transition={{ duration: 0.5, delay: index * 0.05 }}
			style={{ height: "100%" }}
		>
			<motion.div
				whileHover={{ scale: 1.03, y: -5 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
				style={{ height: "100%" }}
			>
				<Paper
					shadow="xl"
					radius="lg"
					p="xl"
					style={{
						height: "100%",
						background: "rgba(26, 26, 26, 0.6)",
						backdropFilter: "blur(20px)",
						border: `1px solid ${project.color}40`,
						boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
						position: "relative",
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
						cursor: "pointer",
					}}
				>
					<motion.div
						initial={{ opacity: 0 }}
						whileHover={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						style={{
							position: "absolute",
							inset: -2,
							background: `conic-gradient(from 0deg, transparent, ${project.color}, transparent)`,
							borderRadius: "inherit",
							zIndex: -1,
							opacity: 0,
						}}
						className="glow-effect"
					/>

					<Group gap="md" mb="md" style={{ alignItems: "center" }}>
						<div style={{ color: project.color }}>{project.icon}</div>
						<div style={{ flex: 1 }}>
							<Title order={3} c="white" mb={4}>
								{project.title}
							</Title>
							{project.featured && (
								<Badge
									size="sm"
									variant="light"
									style={{
										background: "rgba(255, 215, 0, 0.2)",
										color: "#ffd700",
										border: "1px solid rgba(255, 215, 0, 0.4)",
									}}
								>
									Featured
								</Badge>
							)}
						</div>
						<motion.div
							whileHover={{ scale: 1.1, rotate: 5 }}
							onClick={handleShare}
							style={{ cursor: "pointer" }}
						>
							<IconShare
								size={20}
								style={{ color: "rgba(255, 255, 255, 0.6)" }}
							/>
						</motion.div>
					</Group>

					<Text c="dimmed" mb="md" size="sm" style={{ flex: 1 }}>
						{project.description}
					</Text>

					{project.stats && <ProjectStats {...project.stats} />}

					<Group gap="xs" mb="md">
						{project.tags.slice(0, 3).map((tag) => (
							<Badge
								key={tag}
								size="sm"
								radius="sm"
								style={{
									background: `${project.color}15`,
									border: `1px solid ${project.color}50`,
									color: "white",
								}}
							>
								{tag}
							</Badge>
						))}
						{project.tags.length > 3 && (
							<Badge
								size="sm"
								radius="sm"
								style={{
									background: "rgba(255, 255, 255, 0.1)",
									border: "1px solid rgba(255, 255, 255, 0.2)",
									color: "rgba(255, 255, 255, 0.6)",
								}}
							>
								+{project.tags.length - 3}
							</Badge>
						)}
					</Group>

					<Group gap="sm">
						{project.link && (
							<Button
								size="sm"
								variant="filled"
								flex={1}
								component="a"
								href={project.link}
								style={{
									background: `linear-gradient(135deg, ${project.color}, ${project.color}aa)`,
									border: "none",
								}}
								leftSection={<IconExternalLink size={16} />}
							>
								Demo
							</Button>
						)}
						{project.github && (
							<Button
								size="sm"
								variant="outline"
								component="a"
								href={project.github}
								target="_blank"
								style={{
									borderColor: `${project.color}60`,
									color: "white",
								}}
								leftSection={<IconBrandGithub size={16} />}
							>
								Code
							</Button>
						)}
					</Group>
				</Paper>
			</motion.div>
		</motion.div>
	);
}
