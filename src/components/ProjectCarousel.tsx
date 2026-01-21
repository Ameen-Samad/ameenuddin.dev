import { Paper, Text, Badge, Group } from "@mantine/core";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import type { Project } from "../lib/projects-data";
import { projects } from "../lib/projects-data";

export function ProjectCarousel() {
	const navigate = useNavigate();

	// Duplicate projects for seamless loop
	const duplicatedProjects = [...projects, ...projects, ...projects];

	const handleProjectClick = (project: Project) => {
		if (project.link.startsWith("/")) {
			navigate({ to: project.link });
		} else {
			window.open(project.link, "_blank");
		}
	};

	return (
		<div
			style={{
				width: "100%",
				overflow: "hidden",
				position: "relative",
				marginTop: "3rem",
				marginBottom: "2rem",
			}}
		>
			{/* Gradient overlays for fade effect */}
			<div
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: "100px",
					background: "linear-gradient(to right, rgb(18, 18, 18), transparent)",
					zIndex: 2,
					pointerEvents: "none",
				}}
			/>
			<div
				style={{
					position: "absolute",
					right: 0,
					top: 0,
					bottom: 0,
					width: "100px",
					background: "linear-gradient(to left, rgb(18, 18, 18), transparent)",
					zIndex: 2,
					pointerEvents: "none",
				}}
			/>

			<motion.div
				animate={{
					x: ["0%", "-33.333%"],
				}}
				transition={{
					x: {
						repeat: Infinity,
						repeatType: "loop",
						duration: 30,
						ease: "linear",
					},
				}}
				style={{
					display: "flex",
					gap: "1rem",
					width: "max-content",
				}}
			>
				{duplicatedProjects.map((project, index) => (
					<motion.div
						key={`${project.id}-${index}`}
						whileHover={{ scale: 1.05, y: -5 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => handleProjectClick(project)}
						style={{ cursor: "pointer" }}
					>
						<Paper
							shadow="md"
							p="md"
							radius="md"
							style={{
								width: "280px",
								height: "160px",
								background: `linear-gradient(135deg, ${project.color}15, rgba(26, 26, 26, 0.9))`,
								border: `1px solid ${project.color}40`,
								backdropFilter: "blur(10px)",
								transition: "all 0.3s ease",
							}}
						>
							<Group gap="sm" mb="sm" align="center">
								<div style={{ color: project.color }}>{project.icon}</div>
								<Text
									size="md"
									fw={600}
									c="white"
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										flex: 1,
									}}
								>
									{project.title}
								</Text>
							</Group>

							<Text
								size="sm"
								c="dimmed"
								mb="sm"
								style={{
									overflow: "hidden",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									lineHeight: 1.4,
								}}
							>
								{project.description}
							</Text>

							<Group gap="xs">
								{project.tags.slice(0, 2).map((tag) => (
									<Badge
										key={tag}
										size="xs"
										variant="light"
										style={{
											background: `${project.color}20`,
											color: project.color,
										}}
									>
										{tag}
									</Badge>
								))}
								{project.tags.length > 2 && (
									<Badge size="xs" variant="light" c="dimmed">
										+{project.tags.length - 2}
									</Badge>
								)}
							</Group>
						</Paper>
					</motion.div>
				))}
			</motion.div>
		</div>
	);
}
