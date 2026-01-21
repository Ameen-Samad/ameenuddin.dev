import {
	Burger,
	Button,
	Drawer,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconCode,
	IconCube,
	IconRobot,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function Header() {
	const [opened, { toggle }] = useState(false);

	return (
		<>
			<header
				style={{
					padding: "1rem 2rem",
					background: "rgba(10, 10, 10, 0.95)",
					borderBottom: "1px solid rgba(0, 243, 255, 0.1)",
				}}
			>
				<Group justify="space-between">
					<Link to="/" style={{ textDecoration: "none" }}>
						<Group gap="sm">
							<IconCode size={28} style={{ color: "#00f3ff" }} />
							<Title order={3} c="white">
								Ameenuddin.dev
							</Title>
						</Group>
					</Link>

					<Group gap="md">
						<Button
							component={Link}
							to="/"
							variant="subtle"
							size="sm"
							style={{ color: "white" }}
						>
							Home
						</Button>

						<Button
							component={Link}
							to="/tetris"
							variant="subtle"
							size="sm"
							style={{ color: "white" }}
						>
							Tetris
						</Button>

						<Button
							component={Link}
							to="/chatbot"
							variant="subtle"
							size="sm"
							style={{ color: "white" }}
						>
							Chatbot
						</Button>

						<Button
							component={Link}
							to="/builder"
							variant="subtle"
							size="sm"
							style={{ color: "white" }}
						>
							3D Builder
						</Button>

						<a
							href="https://www.linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0/"
							target="_blank"
							style={{ color: "white", textDecoration: "none" }}
							rel="noopener"
						>
							<IconBrandLinkedin size={20} />
						</a>

						<a
							href="https://github.com/Ameen-Samad"
							target="_blank"
							style={{ color: "white", textDecoration: "none" }}
							rel="noopener"
						>
							<IconBrandGithub size={20} />
						</a>

						<Burger
							opened={opened}
							onClick={toggle}
							aria-label="Toggle navigation"
							style={{ color: "white" }}
						/>
					</Group>
				</Group>
			</header>

			<Drawer
				opened={opened}
				onClose={toggle}
				title="Navigation"
				position="right"
				padding="xl"
				size="md"
				style={{ background: "#1a1a1a" }}
			>
				<Stack gap="xl">
					<Link to="/" onClick={toggle} style={{ textDecoration: "none" }}>
						<Group gap="sm" py="sm">
							<IconCode size={24} style={{ color: "#00f3ff" }} />
							<Text size="lg" c="white" fw={600}>
								Home
							</Text>
						</Group>
					</Link>

					<Link
						to="/tetris"
						onClick={toggle}
						style={{ textDecoration: "none" }}
					>
						<Group gap="sm" py="sm">
							<IconRobot size={24} style={{ color: "#ff00ff" }} />
							<Text size="lg" c="white" fw={600}>
								Tetris Game
							</Text>
						</Group>
					</Link>

					<Link
						to="/chatbot"
						onClick={toggle}
						style={{ textDecoration: "none" }}
					>
						<Group gap="sm" py="sm">
							<IconRobot size={24} style={{ color: "#ff00ff" }} />
							<Text size="lg" c="white" fw={600}>
								AI Chatbot
							</Text>
						</Group>
					</Link>

					<Link
						to="/builder"
						onClick={toggle}
						style={{ textDecoration: "none" }}
					>
						<Group gap="sm" py="sm">
							<IconCube size={24} style={{ color: "#0066ff" }} />
							<Text size="lg" c="white" fw={600}>
								3D Builder
							</Text>
						</Group>
					</Link>
				</Stack>
			</Drawer>
		</>
	);
}
