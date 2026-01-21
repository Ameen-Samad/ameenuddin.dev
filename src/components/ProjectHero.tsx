import { Input, Stack, Text, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface ProjectHeroProps {
	totalProjects: number;
	featuredProjects: number;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

export function ProjectHero({
	totalProjects,
	featuredProjects,
	searchQuery,
	onSearchChange,
}: ProjectHeroProps) {
	return (
		<Stack gap="xl" mb="xl">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<Title
					order={1}
					size="h1"
					c="white"
					mb="xs"
					style={{
						background:
							"linear-gradient(135deg, #00f3ff 0%, #ff00ff 50%, #0066ff 100%)",
						backgroundSize: "200% 200%",
						animation: "gradient 3s ease infinite",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
					}}
				>
					Featured Projects
				</Title>
				<Text c="dimmed" size="lg">
					Showing{" "}
					<Text span c="white" fw={700}>
						{totalProjects}
					</Text>{" "}
					projects ({featuredProjects} featured)
				</Text>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<Input
					placeholder="Search projects..."
					size="lg"
					leftSection={<IconSearch size={20} />}
					value={searchQuery}
					onChange={(event) => onSearchChange(event.currentTarget.value)}
					style={{
						background: "rgba(26, 26, 26, 0.8)",
						border: "1px solid rgba(0, 243, 255, 0.2)",
					}}
					styles={{
						input: {
							color: "white",
							"&::placeholder": {
								color: "rgba(255, 255, 255, 0.5)",
							},
						},
					}}
				/>
			</motion.div>
		</Stack>
	);
}
