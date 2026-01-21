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
	IconChartBar,
	IconCode,
	IconCpu,
	IconDatabase,
	IconDevices,
	IconMail,
	IconPhone,
	IconRobot,
	IconSchool,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const skills = [
		{
			category: "Programming",
			items: ["Python", "JavaScript", "TypeScript"],
			icon: <IconCode size={24} />,
			color: "#00f3ff",
		},
		{
			category: "Tools",
			items: ["VS Code", "Jira", "PowerBI", "Tableau"],
			icon: <IconDevices size={24} />,
			color: "#ff00ff",
		},
		{
			category: "AI Tools",
			items: ["Cursor", "Claude Code", "GitHub Copilot"],
			icon: <IconRobot size={24} />,
			color: "#0066ff",
		},
		{
			category: "Languages",
			items: ["English", "Malay"],
			icon: <IconDatabase size={24} />,
			color: "#00f3ff",
		},
	];

	const projects = [
		{
			title: "Tetris with AI Agent",
			description:
				"Classic Tetris game featuring a reinforcement learning agent that plays autonomously with smart heuristics.",
			link: "/tetris",
			icon: <IconCpu size={32} />,
			tags: ["Phaser", "JavaScript", "AI"],
			color: "#00f3ff",
		},
		{
			title: "AI Chatbot with RAG",
			description:
				"ChatGPT-style interface with document-based RAG, tool calling, and SSE streaming responses.",
			link: "/chatbot",
			icon: <IconRobot size={32} />,
			tags: ["RAG", "Cloudflare AI", "TypeScript"],
			color: "#ff00ff",
		},
		{
			title: "3D Builder",
			description:
				"AI-powered 3D object generator that creates Three.js scenes from text descriptions.",
			link: "/builder",
			icon: <IconChartBar size={32} />,
			tags: ["Three.js", "LLM", "WebGL"],
			color: "#0066ff",
		},
	];

	return (
		<>
			<Hero />
			<About />
			<Skills skills={skills} />
			<Projects projects={projects} />
			<Education />
			<Contact />
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
						Building the future with{" "}
						<motion.span
							style={{ color: "#ff00ff" }}
							animate={{ opacity: [1, 0.5, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							Cursor
						</motion.span>{" "}
						and{" "}
						<motion.span
							style={{ color: "#00f3ff" }}
							animate={{ opacity: [1, 0.5, 1] }}
							transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
						>
							Claude Code
						</motion.span>
					</Text>
					<Group gap="md">
						<Button
							component="a"
							href="#projects"
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
								, a Junior Software Engineer with a passion for AI-native
								development.
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
								, I build and ship features faster than ever before while
								maintaining strong engineering fundamentals.
							</Text>
							<Text c="dimmed">
								Graduated from{" "}
								<span style={{ fontWeight: 600 }}>Ngee Ann Polytechnic</span>{" "}
								with a Diploma in Information Technology, specializing in
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
								My Approach
							</Title>
							<Stack gap="md">
								<Group gap="sm">
									<div style={{ color: "#00f3ff", fontSize: "24px" }}>⚡</div>
									<Text c="dimmed">
										<b>Speed without Sacrifice</b> - Use AI tools to accelerate
										development while maintaining code quality and testing
										standards
									</Text>
								</Group>
								<Group gap="sm">
									<div style={{ color: "#ff00ff", fontSize: "24px" }}>🧪</div>
									<Text c="dimmed">
										<b>Grounded Fundamentals</b> - Strong foundation in Python,
										JavaScript/TypeScript, with proper testing practices
									</Text>
								</Group>
								<Group gap="sm">
									<div style={{ color: "#0066ff", fontSize: "24px" }}>🎯</div>
									<Text c="dimmed">
										<b>User-Focused</b> - Build features that solve real
										problems with excellent UX
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

function Projects({
	projects,
}: {
	projects: Array<{
		title: string;
		description: string;
		link: string;
		icon: React.ReactNode;
		tags: string[];
		color: string;
	}>;
}) {
	return (
		<section id="projects" style={{ padding: "100px 0" }}>
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
						Featured Projects
						<div
							style={{
								position: "absolute",
								bottom: "-8px",
								left: 0,
								width: "100px",
								height: "4px",
								background: "linear-gradient(90deg, #ff00ff, transparent)",
							}}
						/>
					</Title>
					<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
						{projects.map((project, idx) => (
							<motion.div
								key={project.title}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: idx * 0.1 }}
							>
								<Paper
									shadow="xl"
									radius="lg"
									p="xl"
									component="a"
									href={project.link}
									style={{
										background: "rgba(26, 26, 26, 0.8)",
										border: "1px solid rgba(0, 243, 255, 0.1)",
										height: "100%",
										cursor: "pointer",
										textDecoration: "none",
										display: "block",
										transition: "transform 0.3s, box-shadow 0.3s",
									}}
								>
									<Group gap="md" mb="md" style={{ alignItems: "center" }}>
										<div style={{ color: project.color }}>{project.icon}</div>
										<Title order={3} c="white">
											{project.title}
										</Title>
									</Group>
									<Text c="dimmed" mb="lg" size="sm">
										{project.description}
									</Text>
									<Group gap="xs" mb="md">
										{project.tags.map((tag) => (
											<Badge
												key={tag}
												variant="light"
												size="sm"
												style={{
													background: `${project.color}15`,
													color: "white",
												}}
											>
												{tag}
											</Badge>
										))}
									</Group>
									<Button
										fullWidth
										variant="filled"
										style={{
											background: `linear-gradient(45deg, ${project.color}, ${project.color}aa)`,
											border: "none",
										}}
										onClick={(e) => e.preventDefault()}
									>
										Try It Out →
									</Button>
								</Paper>
							</motion.div>
						))}
					</SimpleGrid>
				</motion.div>
			</Container>
		</section>
	);
}

function Education() {
	return (
		<section
			id="education"
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
						Education
					</Title>
					<Paper
						shadow="xl"
						radius="lg"
						p="xl"
						style={{
							background: "rgba(26, 26, 26, 0.8)",
							border: "1px solid rgba(255, 0, 255, 0.1)",
						}}
					>
						<Group gap="lg" align="flex-start">
							<div
								style={{
									width: 80,
									height: 80,
									background:
										"linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(0, 243, 255, 0.2))",
									borderRadius: "md",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<IconSchool size={40} style={{ color: "#ff00ff" }} />
							</div>
							<div style={{ flex: 1 }}>
								<Title order={3} c="white" mb="xs">
									Ngee Ann Polytechnic
								</Title>
								<Text size="lg" c="neonCyan" fw={600} mb="sm">
									Diploma in Information Technology
								</Text>
								<Text c="dimmed" mb="md">
									Elective in{" "}
									<span style={{ color: "white", fontWeight: 600 }}>
										Enterprise Computing
									</span>
								</Text>
								<Text c="dimmed" size="sm">
									Focused on building strong fundamentals in software
									development, databases, and enterprise systems. Developed
									practical skills through hands-on projects and
									industry-relevant coursework.
								</Text>
							</div>
						</Group>
					</Paper>
				</motion.div>
			</Container>
		</section>
	);
}

function Contact() {
	const contactInfo = [
		{
			icon: <IconBrandLinkedin size={28} />,
			label: "LinkedIn",
			value: "linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0",
			href: "https://www.linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0/",
			color: "#0077b5",
		},
		{
			icon: <IconBrandGithub size={28} />,
			label: "GitHub",
			value: "github.com/Ameen-Samad",
			href: "https://github.com/Ameen-Samad",
			color: "#ffffff",
		},
		{
			icon: <IconMail size={28} />,
			label: "Email",
			value: "amenddin@gmail.com",
			href: "mailto:amenddin@gmail.com",
			color: "#00f3ff",
		},
		{
			icon: <IconPhone size={28} />,
			label: "Phone",
			value: "+65 9649 4212",
			href: "tel:+6596494212",
			color: "#ff00ff",
		},
	];

	return (
		<section id="contact" style={{ padding: "100px 0" }}>
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
						Get In Touch
						<div
							style={{
								position: "absolute",
								bottom: "-8px",
								left: 0,
								width: "100px",
								height: "4px",
								background: "linear-gradient(90deg, #0066ff, transparent)",
							}}
						/>
					</Title>
					<Text
						c="dimmed"
						size="lg"
						mb="xl"
						style={{
							textAlign: "center",
							maxWidth: 600,
							marginLeft: "auto",
							marginRight: "auto",
						}}
					>
						I'm always interested in hearing about new opportunities,
						collaborations, or just having a chat about technology and AI.
					</Text>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
						{contactInfo.map((contact, idx) => (
							<motion.div
								key={contact.label}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: idx * 0.1 }}
							>
								<Paper
									shadow="xl"
									radius="lg"
									p="xl"
									component={Anchor}
									href={contact.href}
									target={
										contact.href.startsWith("http") ? "_blank" : undefined
									}
									style={{
										background: "rgba(26, 26, 26, 0.8)",
										border: "1px solid rgba(0, 243, 255, 0.1)",
										height: "100%",
										display: "block",
										textDecoration: "none",
										transition: "transform 0.3s, box-shadow 0.3s",
									}}
								>
									<Group gap="md" mb="md" style={{ alignItems: "center" }}>
										<div style={{ color: contact.color }}>{contact.icon}</div>
										<div>
											<Text size="sm" c="dimmed" fw={600}>
												{contact.label}
											</Text>
											<Text c="white">{contact.value}</Text>
										</div>
									</Group>
								</Paper>
							</motion.div>
						))}
					</SimpleGrid>
				</motion.div>
			</Container>
		</section>
	);
}
