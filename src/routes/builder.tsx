import {
	ActionIcon,
	Badge,
	Button,
	Code,
	Container,
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
	IconRefresh,
	IconTrash,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
		<div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
			<Container size="xl" py="xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Group justify="space-between" mb="xl">
						<Link to="/">
							<Button
								variant="outline"
								style={{ borderColor: "#00f3ff", color: "#00f3ff" }}
							>
								← Back to Portfolio
							</Button>
						</Link>
						<Title order={1} c="white">
							AI-Powered 3D Builder
						</Title>
					</Group>

					<Stack
						style={{
							display: "grid",
							gridTemplateColumns: "350px 1fr",
							gap: "lg",
						}}
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
							canvasRef={canvasRef}
						/>
					</Stack>
				</motion.div>
			</Container>
		</div>
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
			p="xl"
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
						{examplePrompts.map((ex, idx) => (
							<Button
								key={idx}
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
						<Text c="dimmed" align="center" py="xl">
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
	canvasRef,
}: {
	currentCode: string | null;
	isGenerating: boolean;
	canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
	useEffect(() => {
		if (!currentCode || !canvasRef.current) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		try {
			canvas.width = canvas.offsetWidth * 2;
			canvas.height = canvas.offsetHeight * 2;

			const blob = new Blob([currentCode], { type: "application/javascript" });
			const url = URL.createObjectURL(blob);

			import(url)
				.then((module: any) => {
					if (module.createScene) {
						module.createScene(canvas);
						URL.revokeObjectURL(url);
					}
				})
				.catch((err) => {
					console.error("Failed to load generated scene:", err);
				});
		} catch (err) {
			console.error("Scene rendering error:", err);
		}
	}, [currentCode]);

	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={0}
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
				{currentCode && (
					<ActionIcon
						size={24}
						variant="transparent"
						style={{ color: "#ff00ff" }}
					>
						<IconRefresh size={20} />
					</ActionIcon>
				)}
			</Group>

			<div style={{ height: "600px", position: "relative" }}>
				<canvas
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						display: "block",
					}}
				/>

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

				{currentCode && !isGenerating && (
					<div
						style={{
							position: "absolute",
							bottom: "md",
							right: "md",
							zIndex: 10,
						}}
					>
						<Code block p="sm" style={{ fontSize: "10px", maxWidth: "300px" }}>
							{currentCode.slice(0, 200)}...
						</Code>
					</div>
				)}
			</div>
		</Paper>
	);
}
