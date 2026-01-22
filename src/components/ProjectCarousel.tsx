import { Badge, Group, Paper, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import {
	motion,
	type PanInfo,
	useAnimation,
	useMotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../lib/projects-data";
import { projects } from "../lib/projects-data";

export function ProjectCarousel() {
	const navigate = useNavigate();
	const x = useMotionValue(0);
	const controls = useAnimation();
	const [isDragging, setIsDragging] = useState(false);
	const [dragDistance, setDragDistance] = useState(0);
	const currentOffset = useRef(0);

	const duplicatedProjects = [...projects, ...projects, ...projects];

	const handleProjectClick = (project: Project, e: React.MouseEvent) => {
		e.stopPropagation();
		if (isDragging || Math.abs(dragDistance) > 5) return;
		if (project.link.startsWith("/")) {
			navigate({ to: project.link });
		} else {
			window.open(project.link, "_blank");
		}
	};

	const handleDragStart = () => {
		setIsDragging(true);
		setDragDistance(0);
		controls.stop();
		currentOffset.current = x.get();
	};

	const handleDrag = (_: any, info: PanInfo) => {
		setDragDistance(info.offset.x);
		x.set(currentOffset.current + info.offset.x);
	};

	const handleDragEnd = (_: any, info: PanInfo) => {
		setIsDragging(false);
		setDragDistance(0);

		const singleSetWidth = 33.333;
		const dragOffset = info.offset.x;
		const currentPos = currentOffset.current + dragOffset;

		const startPosition = currentPos % singleSetWidth;
		const endPosition = startPosition - singleSetWidth;

		controls.start({
			x: [`${startPosition}%`, `${endPosition}%`],
			transition: {
				x: {
					repeat: Infinity,
					repeatType: "loop",
					duration: 30,
					ease: "linear",
				},
			},
		});

		currentOffset.current = endPosition;
	};

	useEffect(() => {
		controls.start({
			x: ["0%", "-33.333%"],
			transition: {
				x: {
					repeat: Infinity,
					repeatType: "loop",
					duration: 30,
					ease: "linear",
				},
			},
		});
	}, [controls]);

	return (
		<motion.div
			style={{
				width: "100%",
				overflow: "hidden",
				position: "relative",
				marginTop: "3rem",
				marginBottom: "2rem",
			}}
		>
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
				animate={controls}
				drag="x"
				dragConstraints={{ left: -2000, right: 2000 }}
				dragElastic={0.1}
				dragMomentum={false}
				onDragStart={handleDragStart}
				onDrag={handleDrag}
				onDragEnd={handleDragEnd}
				style={{
					display: "flex",
					gap: "1rem",
					width: "max-content",
					cursor: "grab",
					userSelect: "none",
				}}
				whileDrag={{ cursor: "grabbing" }}
			>
				{duplicatedProjects.map((project, index) => (
					<motion.div
						key={`${project.id}-${index}`}
						whileHover={{ scale: 1.05, y: -5 }}
						whileTap={{ scale: 0.95 }}
						onClick={(e) => handleProjectClick(project, e)}
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
		</motion.div>
	);
}
