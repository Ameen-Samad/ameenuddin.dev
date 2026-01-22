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
import { IconArrowDown } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { ContactSection } from "../components/ContactSection";
import { DemosSection } from "../components/DemosSection";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { ProjectCarousel } from "../components/ProjectCarousel";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsDashboard } from "../components/SkillsDashboard";
import {
	restoreScrollPosition,
	saveScrollPosition,
} from "../lib/scroll-restoration";

interface GitHubStats {
	commits: number;
	stars: number;
	forks: number;
	lastUpdated: string;
	url: string;
	name: string;
}

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	useEffect(() => {
		restoreScrollPosition();
		return () => {
			saveScrollPosition();
		};
	}, []);

	// Fetch GitHub stats
	const { data: githubStats } = useQuery({
		queryKey: ["github-stats"],
		queryFn: async () => {
			const response = await fetch("/api/github/stats");
			if (!response.ok) throw new Error("Failed to fetch GitHub stats");
			return response.json() as Promise<GitHubStats>;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});

	const commits = githubStats?.commits || 50; // Fallback to 50

	return (
		<>
			<Hero commits={commits} />
			<About commits={commits} />
			<ProjectsSection />
			<SkillsDashboard />
			<ExperienceTimeline />
			<DemosSection />
			<ContactSection />
		</>
	);
}

function Hero({ commits }: { commits: number }) {
	return (
		<section
			id="hero"
			className="flex items-center relative overflow-hidden p-8 md:p-16 min-h-dvh"
		>
			<div className="absolute inset-0 pointer-events-none bg-blue-500/5" />
			<Container size="xl" className="w-full">
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
						c="white"
						mb="md"
						className="text-balance leading-tight"
					>
						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-blue-400"
						>
							Fast Learner
						</motion.span>{" "}
						Who Builds to Understand
					</Title>
					<Text
						c="dimmed"
						mb="xl"
						className="text-pretty text-lg md:text-xl leading-relaxed max-w-full"
					>
						Not an expert—I show{" "}
						<span className="text-purple-400 font-bold">
							proof through code
						</span>
						. This portfolio contains{" "}
						<span className="text-blue-400 font-semibold">
							15+ working demos
						</span>{" "}
						and a git history of {commits}+ commits showing real problem-solving
					</Text>
					<Group gap="md" className="flex-wrap">
						<Button
							component="a"
							href="#demos"
							size="lg"
							variant="filled"
							className="bg-blue-500 border-none text-base md:text-lg"
						>
							View Projects
						</Button>
						<Button
							component="a"
							href="#contact"
							size="lg"
							variant="outline"
							className="border-purple-500 text-purple-500 text-base md:text-lg"
						>
							Get In Touch
						</Button>
					</Group>
					<ProjectCarousel />
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						className="absolute bottom-0 left-1/2 -translate-x-1/2"
					>
						<Anchor href="#about" className="text-blue-400">
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

function About({ commits }: { commits: number }) {
	return (
		<section id="about" className="py-24 px-4">
			<Container size="xl" className="max-w-full px-4">
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
						className="relative inline-block text-balance"
					>
						About Me
						<div className="absolute -bottom-2 left-0 w-[100px] h-1 bg-gradient-to-r from-blue-400 to-transparent" />
					</Title>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(0, 243, 255, 0.1)",
								overflow: "hidden",
							}}
						>
							<Text
								size="lg"
								c="white"
								mb="md"
								style={{
									wordWrap: "break-word",
									overflowWrap: "break-word",
									hyphens: "auto",
								}}
							>
								I'm{" "}
								<span style={{ color: "#00f3ff", fontWeight: 700 }}>
									Ameenuddin Bin Abdul Samad
								</span>
								, a fast learner who proves it through working code. I don't
								claim expertise—I show evidence of learning through
								implementation.
							</Text>
							<Text
								c="dimmed"
								mb="md"
								style={{
									wordWrap: "break-word",
									overflowWrap: "break-word",
									hyphens: "auto",
								}}
							>
								This portfolio contains{" "}
								<span style={{ color: "#ff00ff", fontWeight: 600 }}>
									15+ live demos
								</span>{" "}
								with{" "}
								<span style={{ color: "#00f3ff", fontWeight: 700 }}>
									"What I Learned"
								</span>{" "}
								sections showing technical challenges solved, skills developed,
								and code evidence. From building a real-time voice agent with
								WebSocket streaming to optimizing API costs by 80%, I learn by
								implementing production features.
							</Text>
							<Text
								c="dimmed"
								mb="md"
								style={{
									wordWrap: "break-word",
									overflowWrap: "break-word",
									hyphens: "auto",
								}}
							>
								My{" "}
								<span style={{ color: "#ff00ff", fontWeight: 600 }}>
									git history
								</span>{" "}
								shows the journey: commit{" "}
								<code
									style={{
										background: "rgba(0,243,255,0.1)",
										padding: "2px 6px",
										borderRadius: "4px",
										color: "#00f3ff",
										fontSize: "0.9em",
										wordBreak: "break-all",
									}}
								>
									8581789
								</code>{" "}
								documents migrating from OpenAI to Cloudflare Workers AI for
								security. Multiple "Fix X" commits show I iterate until it
								works.
							</Text>
							<Text
								c="dimmed"
								style={{
									wordWrap: "break-word",
									overflowWrap: "break-word",
									hyphens: "auto",
								}}
							>
								Pursuing a Diploma in IT at{" "}
								<span style={{ fontWeight: 600 }}>Ngee Ann Polytechnic</span>{" "}
								(Year 2), I'm open to internships and junior roles where I can
								learn from experienced engineers and contribute to production
								systems.
							</Text>
						</Paper>
						<Paper
							shadow="xl"
							radius="lg"
							p="xl"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "1px solid rgba(255, 0, 255, 0.1)",
								overflow: "hidden",
							}}
						>
							<Title
								order={3}
								c="white"
								mb="md"
								style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
							>
								How I Learn
							</Title>
							<Stack gap="md">
								<Group
									gap="sm"
									align="flex-start"
									style={{ flexWrap: "nowrap" }}
								>
									<div
										style={{
											color: "#00f3ff",
											fontSize: "24px",
											flexShrink: 0,
										}}
									>
										🔨
									</div>
									<Text
										c="dimmed"
										style={{
											wordWrap: "break-word",
											overflowWrap: "break-word",
											hyphens: "auto",
										}}
									>
										<b>Build to Understand</b> - I don't watch tutorials—I build
										real features. Each demo on this site documents what I
										learned, from WebSocket binary streaming to performance
										optimization.
									</Text>
								</Group>
								<Group
									gap="sm"
									align="flex-start"
									style={{ flexWrap: "nowrap" }}
								>
									<div
										style={{
											color: "#ff00ff",
											fontSize: "24px",
											flexShrink: 0,
										}}
									>
										🔄
									</div>
									<Text
										c="dimmed"
										style={{
											wordWrap: "break-word",
											overflowWrap: "break-word",
											hyphens: "auto",
										}}
									>
										<b>Iterate Until It Works</b> - My git history has{" "}
										{Math.floor(commits * 0.2)}+ "Fix X" commits. That's not
										failure—that's learning. I debug, refactor, and improve
										until it's production-ready.
									</Text>
								</Group>
								<Group
									gap="sm"
									align="flex-start"
									style={{ flexWrap: "nowrap" }}
								>
									<div
										style={{
											color: "#0066ff",
											fontSize: "24px",
											flexShrink: 0,
										}}
									>
										📦
									</div>
									<Text
										c="dimmed"
										style={{
											wordWrap: "break-word",
											overflowWrap: "break-word",
											hyphens: "auto",
										}}
									>
										<b>Ship to Production</b> - Every demo is deployed on
										Cloudflare Workers with real infrastructure (D1, KV, Workers
										AI). Deployment is part of development, not an afterthought.
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
