import {
	ActionIcon,
	Button,
	Code,
	Container,
	Drawer,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import {
	Icon3dCubeSphere,
	IconClock,
	IconCode,
	IconCube,
	IconTrash,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThreeScene } from "@/components/ThreeScene";

export const Route = createFileRoute("/builder")({
	component: Builder,
});

interface Generation {
	id: string;
	prompt: string;
	code: string;
	timestamp: number;
}

function Builder() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentCode, setCurrentCode] = useState<string | null>(null);
	const [history, setHistory] = useState<Generation[]>([]);

	useEffect(() => {
		const savedHistory = localStorage.getItem("builder-history");
		if (savedHistory) {
			setHistory(JSON.parse(savedHistory));
		}
	}, []);

	const handleGenerate = async () => {
		if (!prompt.trim()) return;

		setIsGenerating(true);
		setCurrentCode(null);

		try {
			const response = await fetch("/api/generate-three", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				throw new Error("Failed to generate 3D scene");
			}

			const data = await response.json();
			setCurrentCode(data.code);

			const newGeneration: Generation = {
				id: String(Date.now()),
				prompt,
				code: data.code,
				timestamp: Date.now(),
			};

			const updatedHistory = [newGeneration, ...history];
			setHistory(updatedHistory);
			localStorage.setItem("builder-history", JSON.stringify(updatedHistory));
		} catch (error) {
			console.error("Generation error:", error);
			alert("Failed to generate 3D scene. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleReplay = (generation: Generation) => {
		setCurrentCode(generation.code);
		setPrompt(generation.prompt);
	};

	const handleDelete = (id: string) => {
		const updatedHistory = history.filter((gen) => gen.id !== id);
		setHistory(updatedHistory);
		localStorage.setItem("builder-history", JSON.stringify(updatedHistory));

		if (currentCode === history.find((gen) => gen.id === id)?.code) {
			setCurrentCode(null);
		}
	};

	const handleClearHistory = () => {
		if (confirm("Are you sure you want to clear all history?")) {
			setHistory([]);
			localStorage.removeItem("builder-history");
			setCurrentCode(null);
			setPrompt("");
		}
	};

	const examplePrompts = [
		"A red sphere with metallic finish",
		"A futuristic spaceship with glowing engine",
		"A medieval castle with towers",
		"A crystal cube with transparency",
		"A rotating torus with wireframe material",
	];

	return (
		<>
			<style>{`
				.builder-grid {
					grid-template-columns: 350px 1fr;
				}
				@media (max-width: 768px) {
					.builder-grid {
						grid-template-columns: 1fr;
					}
					.builder-paper {
						margin-bottom: 1rem;
					}
				}
				@media (max-width: 480px) {
					.builder-paper {
						padding: 0.75rem !important;
					}
				}
			`}</style>
			<div
				style={{
					minHeight: "100vh",
					background: "#0a0a0a",
					paddingBottom: "2rem",
				}}
			>
				<Container size="xl" py={{ base: "md", md: "xl" }}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<Group
							justify="space-between"
							mb={{ base: "md", md: "xl" }}
							wrap="nowrap"
						>
							<Link to="/">
								<Button
									variant="outline"
									size="compact-md"
									style={{ borderColor: "#00f3ff", color: "#00f3ff" }}
								>
									← Back
								</Button>
							</Link>
							<Title order={3} c="white">
								AI 3D Builder
							</Title>
						</Group>

						<Stack
							style={{
								display: "grid",
								gridTemplateColumns: "350px 1fr",
								gap: "lg",
							}}
							className="builder-grid"
						>
							<BuilderPanel
								prompt={prompt}
								setPrompt={setPrompt}
								isGenerating={isGenerating}
								onGenerate={handleGenerate}
								examplePrompts={examplePrompts}
								history={history}
								onReplay={handleReplay}
								onDelete={handleDelete}
								onClearHistory={handleClearHistory}
							/>

							<ViewerPanel
								currentCode={currentCode}
								isGenerating={isGenerating}
							/>
						</Stack>
					</motion.div>
				</Container>
			</div>
		</>
	);
}

function BuilderPanel({
	prompt,
	setPrompt,
	isGenerating,
	onGenerate,
	examplePrompts,
	history,
	onReplay,
	onDelete,
	onClearHistory,
}: {
	prompt: string;
	setPrompt: (prompt: string) => void;
	isGenerating: boolean;
	onGenerate: () => void;
	examplePrompts: string[];
	history: Generation[];
	onReplay: (gen: Generation) => void;
	onDelete: (id: string) => void;
	onClearHistory: () => void;
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={{ base: "md", md: "xl" }}
			className="builder-paper"
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 243, 255, 0.1)",
			}}
		>
			<Stack gap="xl">
				<div>
					<Title order={3} c="white" mb="md">
						<Group gap="sm">
							<Icon3dCubeSphere size={24} style={{ color: "#00f3ff" }} />
							Describe Your 3D Object
						</Group>
					</Title>
					<Textarea
						placeholder="e.g., A red sphere with metallic finish..."
						value={prompt}
						onChange={(e) => setPrompt(e.currentTarget.value)}
						minRows={6}
						maxRows={10}
						disabled={isGenerating}
						style={{
							background: "rgba(0, 0, 0, 0.3)",
							border: "1px solid rgba(0, 243, 255, 0.2)",
							color: "white",
						}}
					/>
				</div>

				<Button
					fullWidth
					size="lg"
					variant="filled"
					onClick={onGenerate}
					disabled={isGenerating || !prompt.trim()}
					style={{
						background:
							isGenerating || !prompt.trim()
								? "#404040"
								: "linear-gradient(45deg, #00f3ff, #0066ff)",
						border: "none",
					}}
				>
					{isGenerating ? (
						<Group gap="sm" justify="center">
							<Loader size="sm" color="white" />
							Generating...
						</Group>
					) : (
						<Group gap="sm" justify="center">
							<IconCode size={20} />
							Generate 3D Scene
						</Group>
					)}
				</Button>

				<div>
					<Title order={4} c="white" mb="md">
						Quick Examples
					</Title>
					<Stack gap="xs">
						{examplePrompts.map((ex) => (
							<Button
								key={`example-${ex.slice(0, 20)}`}
								size="xs"
								variant="light"
								fullWidth
								onClick={() => setPrompt(ex)}
								disabled={isGenerating}
								style={{ background: "rgba(0, 243, 255, 0.1)" }}
							>
								{ex}
							</Button>
						))}
					</Stack>
				</div>

				<div style={{ flex: 1 }}>
					<Group justify="space-between" mb="md">
						<Title order={4} c="white">
							<IconClock size={20} style={{ color: "#ff00ff" }} />
							History ({history.length})
						</Title>
						{history.length > 0 && (
							<Button size="xs" variant="subtle" onClick={onClearHistory}>
								Clear
							</Button>
						)}
					</Group>

					{history.length === 0 ? (
						<Text c="dimmed" ta="center" py="xl">
							No generations yet. Create your first 3D object!
						</Text>
					) : (
						<ScrollArea h={400}>
							<Stack gap="xs">
								{history.slice(0, 20).map((gen) => (
									<Paper
										key={gen.id}
										p="sm"
										radius="sm"
										style={{
											background: "rgba(0, 0, 0, 0.3)",
											border: "1px solid rgba(255, 255, 255, 0.1)",
											cursor: "pointer",
											transition: "all 0.2s",
										}}
										onClick={() => onReplay(gen)}
									>
										<Group justify="space-between" mb="xs">
											<Text size="xs" c="white" lineClamp={2}>
												{gen.prompt}
											</Text>
											<Group gap="xs">
												<ActionIcon
													size={16}
													variant="transparent"
													onClick={(e) => {
														e.stopPropagation();
														onDelete(gen.id);
													}}
													style={{ color: "#ff5555" }}
												>
													<IconTrash size={14} />
												</ActionIcon>
											</Group>
										</Group>
										<Text size="xs" c="dimmed">
											{new Date(gen.timestamp).toLocaleString()}
										</Text>
									</Paper>
								))}
							</Stack>
						</ScrollArea>
					)}
				</div>
			</Stack>
		</Paper>
	);
}

function ViewerPanel({
	currentCode,
	isGenerating,
}: {
	currentCode: string | null;
	isGenerating: boolean;
	canvasRef?: React.RefObject<HTMLCanvasElement>;
}) {
	const [codeDrawerOpened, setCodeDrawerOpened] = useState(false);

	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={0}
			className="builder-paper"
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 102, 255, 0.1)",
			}}
		>
			<Group
				justify="space-between"
				p="md"
				style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
			>
				<Title order={4} c="white">
					<IconCube size={20} style={{ color: "#0066ff" }} />
					3D Viewer
				</Title>
				{currentCode && !isGenerating && (
					<Button
						size="xs"
						variant="outline"
						leftSection={<IconCode size={16} />}
						onClick={() => setCodeDrawerOpened(true)}
						style={{ borderColor: "#00f3ff", color: "#00f3ff" }}
					>
						Reveal Code
					</Button>
				)}
			</Group>

			<div style={{ height: "min(600px, 70vh)", position: "relative" }}>
				{/* React Three Fiber Canvas with actual rendering */}
				<div style={{ width: "100%", height: "100%", display: "block" }}>
					<ThreeScene generatedCode={currentCode} />
				</div>

				{!currentCode && !isGenerating && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(0, 0, 0, 0.7)",
							pointerEvents: "none",
						}}
					>
						<Stack align="center" gap="md">
							<IconCube size={64} style={{ color: "#404040" }} />
							<Text size="xl" c="dimmed">
								Your 3D scene will appear here
							</Text>
							<Text c="dimmed">Describe an object and click Generate</Text>
						</Stack>
					</div>
				)}

				{isGenerating && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(0, 0, 0, 0.8)",
							zIndex: 20,
						}}
					>
						<Stack align="center" gap="md">
							<Loader size="xl" color="#00f3ff" />
							<Text size="xl" c="white">
								Generating 3D scene...
							</Text>
							<Text c="dimmed">This may take a few moments</Text>
						</Stack>
					</div>
				)}
			</div>

			{/* Code Drawer */}
			<Drawer
				opened={codeDrawerOpened}
				onClose={() => setCodeDrawerOpened(false)}
				position="right"
				size="xl"
				title={
					<Group gap="sm">
						<IconCode size={20} style={{ color: "#00f3ff" }} />
						<Text fw={600}>Generated Three.js Code</Text>
					</Group>
				}
				styles={{
					header: {
						background: "rgba(26, 26, 26, 0.95)",
						borderBottom: "1px solid rgba(0, 243, 255, 0.2)",
					},
					body: {
						background: "rgba(10, 10, 10, 0.98)",
						padding: 0,
					},
					content: {
						background: "rgba(10, 10, 10, 0.98)",
					},
				}}
			>
				<ScrollArea h="calc(100vh - 80px)" p="md">
					<Code block style={{ fontSize: "12px", lineHeight: "1.6" }}>
						{currentCode}
					</Code>
				</ScrollArea>
			</Drawer>
		</Paper>
	);
}
