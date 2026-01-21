import { Group, Stack, Text } from "@mantine/core";
import { IconBrandGithub, IconEye, IconStar } from "@tabler/icons-react";

interface ProjectStatsProps {
	stars?: number;
	views?: number;
	forks?: number;
	lastUpdated?: string;
}

export function ProjectStats({
	stars,
	views,
	forks,
	lastUpdated,
}: ProjectStatsProps) {
	return (
		<Stack gap="xs">
			{(stars || views) && (
				<Group gap="md">
					{stars && (
						<Group gap={4}>
							<IconStar size={16} style={{ color: "#ffd700" }} />
							<Text size="sm" c="dimmed">
								{stars}
							</Text>
						</Group>
					)}
					{views && (
						<Group gap={4}>
							<IconEye size={16} style={{ color: "#00f3ff" }} />
							<Text size="sm" c="dimmed">
								{views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
							</Text>
						</Group>
					)}
					{forks && (
						<Group gap={4}>
							<IconBrandGithub size={16} style={{ color: "#ffffff" }} />
							<Text size="sm" c="dimmed">
								{forks}
							</Text>
						</Group>
					)}
				</Group>
			)}
			{lastUpdated && (
				<Text size="xs" c="dimmed">
					Last updated: {lastUpdated}
				</Text>
			)}
		</Stack>
	);
}
