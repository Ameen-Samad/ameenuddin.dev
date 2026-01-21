import { Button, Group, Text } from "@mantine/core";
import { motion } from "framer-motion";
import type { FilterOption, FilterType } from "../lib/projects-data";

interface ProjectFilterProps {
	filters: FilterOption[];
	activeFilter: FilterType;
	onFilterChange: (filter: FilterType) => void;
}

export function ProjectFilter({
	filters,
	activeFilter,
	onFilterChange,
}: ProjectFilterProps) {
	return (
		<Group gap="sm" mb="xl" wrap="wrap">
			{filters.map((filter, idx) => (
				<motion.div
					key={filter.id}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: idx * 0.05 }}
				>
					<Button
						variant={activeFilter === filter.id ? "filled" : "outline"}
						size="md"
						radius="md"
						onClick={() => onFilterChange(filter.id)}
						style={
							activeFilter === filter.id
								? {
										background: "linear-gradient(135deg, #00f3ff, #0066ff)",
										border: "none",
									}
								: {
										borderColor: "rgba(255, 255, 255, 0.2)",
										color: "white",
									}
						}
						leftSection={
							filter.icon ? (
								<span style={{ display: "flex" }}>{filter.icon}</span>
							) : null
						}
					>
						{filter.label}
						<Text
							size="xs"
							c="dimmed"
							ml="xs"
							style={{
								color:
									activeFilter === filter.id
										? "white"
										: "rgba(255,255,255,0.6)",
							}}
						>
							{filter.count}
						</Text>
					</Button>
				</motion.div>
			))}
		</Group>
	);
}
