import {
	Anchor,
	Badge,
	Button,
	Container,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconArrowDown,
	IconBrandGithub,
	IconBrandLinkedin,
	IconMail,
	IconPhone,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ContactSection } from "../components/ContactSection";
import { DemosSection } from "../components/DemosSection";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { ProjectCarousel } from "../components/ProjectCarousel";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsDashboard } from "../components/SkillsDashboard";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<>
			<Hero />
			<About />
			<DemosSection />
			<SkillsDashboard />
			<ExperienceTimeline />
			<ProjectsSection />
			<ContactSection />
		</>
	);
}

function Hero() {
	return (
		<section
			id="hero"
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background:
						"radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.15) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<Text size="sm" c="dimmed" mb="md">
						Welcome to my portfolio
					</Text>
					<Title
						order={1}
						size="h1"
						c="white"
						mb="md"
						style={{ lineHeight: 1.1 }}
					>
						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							style={{ color: "#00f3ff" }}
						>
							AI-Native
						</motion.span>{" "}
						Software Engineer
					</Title>
					<Text size="xl" c="dimmed" mb="xl">
						Delivering{" "}
						<motion.span
							style={{ color: "#ff00ff", fontWeight: 700 }}
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							100x productivity
						</motion.span>{" "}
						with AI-powered development using{" "}
						<motion.span
							style={{ color: "#00f3ff", fontWeight: 600 }}
							animate={{ opacity: [1, 0.7, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							Claude Code
						</motion.span>
						, MCPs, and latest plugins
					</Text>
					<Group gap="md">
						<Button
							component="a"
							href="#demos"
							size="lg"
							variant="filled"
							style={{
								background: "linear-gradient(45deg, #00f3ff, #0066ff)",
								border: "none",
							}}
						>
							View Projects
						</Button>
						<Button
							component="a"
							href="#contact"
							size="lg"
							variant="outline"
							style={{ borderColor: "#ff00ff", color: "#ff00ff" }}
						>
							Get In Touch
						</Button>
					</Group>
					<ProjectCarousel />
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						style={{
							position: "absolute",
							bottom: -100,
							left: "50%",
							transform: "translateX(-50%)",
						}}
					>
						<Anchor href="#about" style={{ color: "#00f3ff" }}>
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
							>
								<IconArrowDown size={40} />
							</motion.div>
						</Anchor>
					</motion.div>
				</motion.div>
			</Container>
		</section>
	);
}

function About() {
	return (
		<section id="about" style={{ padding: "100px 0" }}>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title
						order={2}
						c="white"
						mb="xl"
						style={{ position: "relative", display: "inline-block" }}
					>
						About Me
						<div
							style={{
								position: "absolute",
								bottom: "-8px",
								left: 0,
								width: "100px",
								height: "4px",
								background: "linear-gradient(90deg, #00f3ff, transparent)",
							}}
						/>
					</Title>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(0, 243, 255, 0.1)",
							}}
						>
							<Text size="lg" c="white" mb="md">
								I'm{" "}
								<span style={{ color: "#00f3ff", fontWeight: 700 }}>
									Ameen Samad
								</span>
								, an AI-Native Software Engineer who leverages cutting-edge AI
								tools to deliver exceptional results.
							</Text>
							<Text c="dimmed" mb="md">
								Using{" "}
								<span style={{ color: "#ff00ff", fontWeight: 600 }}>
									Claude Code
								</span>{" "}
								with the latest plugins and MCPs (Model Context Protocols), I
								build production-ready features at{" "}
								<span style={{ color: "#00f3ff", fontWeight: 700 }}>
									100x speed
								</span>{" "}
								while maintaining code quality, proper testing, and strong
								engineering fundamentals.
							</Text>
							<Text c="dimmed">
								Pursuing a Diploma in IT at{" "}
								<span style={{ fontWeight: 600 }}>Ngee Ann Polytechnic</span>{" "}
								while building real-world applications that demonstrate my
								ability to ship quickly without compromising on quality.
							</Text>
							<Text c="dimmed" mb="md">
								Using tools like{" "}
								<span style={{ color: "#ff00ff", fontWeight: 600 }}>
									Cursor
								</span>{" "}
								and{" "}
								<span style={{ color: "#00f3ff", fontWeight: 600 }}>
									Claude Code
								</span>
								, I build and ship features quickly while learning and
								maintaining strong engineering fundamentals.
							</Text>
							<Text c="dimmed">
								Currently a Year 2 student at{" "}
								<span style={{ fontWeight: 600 }}>Ngee Ann Polytechnic</span>,
								pursuing a Diploma in Information Technology with an elective in
								Enterprise Computing.
							</Text>
						</Paper>
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(255, 0, 255, 0.1)",
							}}
						>
							<Title order={3} c="white" mb="md">
								My Superpower
							</Title>
							<Stack gap="md">
								<Group gap="sm">
									<div style={{ color: "#00f3ff", fontSize: "24px" }}>🚀</div>
									<Text c="dimmed">
										<b>100x Productivity with AI</b> - Claude Code + MCPs +
										Latest Plugins = Rapid development without sacrificing
										quality. I ship features faster than traditional developers
										while maintaining proper testing and code standards.
									</Text>
								</Group>
								<Group gap="sm">
									<div style={{ color: "#ff00ff", fontSize: "24px" }}>🤖</div>
									<Text c="dimmed">
										<b>AI-Native Development Stack</b> - Deep expertise in
										Cursor, Claude Code, and AI tooling ecosystem. I don't just
										use AI tools—I master them to maximize efficiency.
									</Text>
								</Group>
								<Group gap="sm">
									<div style={{ color: "#0066ff", fontSize: "24px" }}>💎</div>
									<Text c="dimmed">
										<b>Quality at Speed</b> - Strong fundamentals in Python,
										JavaScript, TypeScript with rigorous testing practices. Fast
										doesn't mean sloppy—it means efficient.
									</Text>
								</Group>
							</Stack>
						</Paper>
					</SimpleGrid>
				</motion.div>
			</Container>
		</section>
	);
}

function Skills({
	skills,
}: {
	skills: Array<{
		category: string;
		items: string[];
		icon: React.ReactNode;
		color: string;
	}>;
}) {
	return (
		<section
			id="skills"
			style={{ padding: "100px 0", background: "rgba(0, 0, 0, 0.3)" }}
		>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title order={2} c="white" mb="xl" style={{ textAlign: "center" }}>
						Skills & Technologies
					</Title>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
						{skills.map((skillGroup, idx) => (
							<motion.div
								key={skillGroup.category}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: idx * 0.1 }}
							>
								<Paper
									shadow="lg"
									radius="md"
									p="lg"
									style={{
										background: "rgba(26, 26, 26, 0.8)",
										border: `1px solid ${skillGroup.color}40`,
										transition: "transform 0.3s, box-shadow 0.3s",
									}}
									component={motion.div}
									whileHover={{
										scale: 1.05,
										boxShadow: `0 0 20px ${skillGroup.color}30`,
									}}
								>
									<Group gap="sm" mb="md" style={{ alignItems: "center" }}>
										<div style={{ color: skillGroup.color }}>
											{skillGroup.icon}
										</div>
										<Title order={4} c="white">
											{skillGroup.category}
										</Title>
									</Group>
									<Stack gap="xs">
										{skillGroup.items.map((item) => (
											<Badge
												key={item}
												size="lg"
												radius="sm"
												style={{
													background: `${skillGroup.color}15`,
													border: `1px solid ${skillGroup.color}50`,
													color: "white",
												}}
											>
												{item}
											</Badge>
										))}
									</Stack>
								</Paper>
							</motion.div>
						))}
					</SimpleGrid>
				</motion.div>
			</Container>
		</section>
	);
}

function AINativeAdvantage() {
	return (
		<section
			id="ai-advantage"
			style={{ padding: "100px 0", background: "rgba(0, 102, 255, 0.05)" }}
		>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Title
						order={2}
						c="white"
						mb="xl"
						style={{
							textAlign: "center",
							position: "relative",
							display: "inline-block",
						}}
					>
						My AI-Native Advantage
						<div
							style={{
								position: "absolute",
								bottom: "-8px",
								left: "50%",
								transform: "translateX(-50%)",
								width: "150px",
								height: "4px",
								background: "linear-gradient(90deg, #00f3ff, #0066ff)",
							}}
						/>
					</Title>
					<SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(0, 243, 255, 0.2)",
							}}
						>
							<Stack gap="md">
								<div
									style={{
										width: 60,
										height: 60,
										background:
											"linear-gradient(45deg, rgba(0, 243, 255, 0.2), rgba(0, 102, 255, 0.2))",
										borderRadius: "md",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<span style={{ fontSize: "30px" }}>⚡</span>
								</div>
								<Title order={4} c="white">
									100x Productivity
								</Title>
								<Text c="dimmed">
									Claude Code + MCPs + Latest Plugins = Unprecedented
									development speed. I ship features in hours, not weeks.
								</Text>
							</Stack>
						</Paper>
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(255, 0, 255, 0.2)",
							}}
						>
							<Stack gap="md">
								<div
									style={{
										width: 60,
										height: 60,
										background:
											"linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(255, 102, 170, 0.2))",
										borderRadius: "md",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<span style={{ fontSize: "30px" }}>🎯</span>
								</div>
								<Title order={4} c="white">
									Quality at Speed
								</Title>
								<Text c="dimmed">
									Fast doesn't mean sloppy. I maintain proper testing, code
									quality, and best practices while delivering rapidly.
								</Text>
							</Stack>
						</Paper>
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(255, 0, 255, 0.2)",
							}}
						>
							<Stack gap="md">
								<div
									style={{
										width: 60,
										height: 60,
										background:
											"linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(0, 243, 255, 0.2))",
										borderRadius: "md",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<span style={{ fontSize: "30px" }}>🚀</span>
								</div>
								<Title order={4} c="white">
									Future-Ready
								</Title>
								<Text c="dimmed">
									Already equipped with the tools and workflows that will define
									software development tomorrow. Ready to hit the ground
									running.
								</Text>
							</Stack>
						</Paper>
					</SimpleGrid>
				</motion.div>
			</Container>
		</section>
	);
}
