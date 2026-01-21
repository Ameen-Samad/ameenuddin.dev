import {
	ActionIcon,
	Badge,
	Button,
	Code,
	Container,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconHistory,
	IconPlayerPlay,
	IconRefresh,
	IconRobot,
	IconTrash,
	IconTrophy,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Phaser from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";
import { TetrisGame as TetrisGameService } from "@/services/tetris-game";

export const Route = createFileRoute("/tetris")({
	component: TetrisPage,
});

function TetrisPage() {
	const [gameStarted, setGameStarted] = useState(false);
	const [useAI, setUseAI] = useState(false);
	const [score, setScore] = useState(0);
	const [level, setLevel] = useState(1);
	const [lines, setLines] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const [highScores, setHighScores] = useState<
		Array<{
			id: number;
			name: string;
			score: number;
			level: number;
			lines: number;
			date: string;
		}>
	>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [historyData, setHistoryData] = useState<
		Array<{
			id: number;
			name: string;
			score: number;
			level: number;
			lines: number;
			date: string;
		}>
	>([]);
	const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchLeaderboard = useCallback(async () => {
		try {
			const response = await fetch("/api/leaderboard");
			if (response.ok) {
				const data = await response.json();
				setHighScores(data);
			}
		} catch (error) {
			console.error("Error fetching leaderboard:", error);
		}
	}, []);

	const fetchHistory = useCallback(async (playerName?: string) => {
		setLoading(true);
		try {
			const url = playerName
				? `/api/leaderboard/history?playerName=${encodeURIComponent(playerName)}`
				: "/api/leaderboard/history";
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setHistoryData(data);
			}
		} catch (error) {
			console.error("Error fetching history:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	useEffect(() => {
		if (!gameStarted || !canvasRef.current) return;

		if (gameInstance) {
			gameInstance.destroy(true);
		}

		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.CANVAS,
			width: 300,
			height: 600,
			parent: canvasRef.current,
			background: "#000",
			physics: {
				default: "arcade",
				arcade: {
					debug: false,
					gravity: { x: 0, y: 0 },
				},
			},
		};

		const game = new Phaser.Game(config);
		setGameInstance(game);

		const scene = new TetrisGameService();
		game.scene.add("TetrisGame", scene);

		const handleScoreChange = (event: Event) => {
			const customEvent = event as CustomEvent<{
				detail: { score: number; lines: number; level: number };
			}>;
			if (customEvent.detail) {
				setScore(customEvent.detail.score);
				setLines(customEvent.detail.lines);
				setLevel(customEvent.detail.level);
			}
		};

		window.addEventListener("tetris-score", handleScoreChange);

		return () => {
			window.removeEventListener("tetris-score", handleScoreChange);
			if (gameInstance) {
				gameInstance.destroy(true);
			}
		};
	}, [gameStarted]);

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (!gameInstance || gameOver || useAI) return;

			switch (e.key) {
				case "ArrowLeft":
					gameInstance.scene.keys["TetrisGame"].moveLeft();
					break;
				case "ArrowRight":
					gameInstance.scene.keys["TetrisGame"].moveRight();
					break;
				case "ArrowDown":
					gameInstance.scene.keys["TetrisGame"].moveDown();
					break;
				case "ArrowUp":
					gameInstance.scene.keys["TetrisGame"].rotate();
					break;
				case " ":
					gameInstance.scene.keys["TetrisGame"].hardDrop();
					break;
			}
		},
		[gameInstance, gameOver, useAI],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handleKeyPress]);

	const handleStartGame = () => {
		setGameOver(false);
		setGameStarted(true);
	};

	const handleRestart = () => {
		setGameOver(false);
		if (gameInstance) {
			gameInstance.scene.keys["TetrisGame"].spawnPiece();
		}
	};

	const handleToggleAI = () => {
		setUseAI(!useAI);
		if (gameInstance) {
			gameInstance.scene.keys["TetrisGame"].setUseAI(!useAI);
		}
	};

	const handleSaveScore = async () => {
		if (score === 0) return;

		const name = prompt("Enter your name for the leaderboard:") || "Anonymous";
		if (!name) return;

		try {
			const response = await fetch("/api/leaderboard", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					score,
					level,
					lines,
				}),
			});

			if (response.ok) {
				await fetchLeaderboard();
				setGameOver(true);
				setGameStarted(false);
			} else {
				alert("Failed to save score");
			}
		} catch (error) {
			console.error("Error saving score:", error);
			alert("Failed to save score");
		}
	};

	const handleToggleHistory = () => {
		if (!showHistory) {
			fetchHistory();
		}
		setShowHistory(!showHistory);
	};

	const handlePlayerChange = (value: string | null) => {
		setSelectedPlayer(value);
		if (value) {
			fetchHistory(value);
		} else {
			fetchHistory();
		}
	};

	const playerNames = [
		...new Set([
			...highScores.map((s) => s.name),
			...historyData.map((s) => s.name),
		]),
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
							Tetris with AI Agent (WebAssembly Powered)
						</Title>
					</Group>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "400px 1fr 1fr",
							gap: "lg",
						}}
					>
						<GamePanel
							gameStarted={gameStarted}
							gameOver={gameOver}
							score={score}
							level={level}
							lines={lines}
							onStart={handleStartGame}
							onRestart={handleRestart}
							onToggleAI={handleToggleAI}
							useAI={useAI}
							canvasRef={canvasRef}
						/>

						<ControlsPanel
							gameStarted={gameStarted}
							onStart={handleStartGame}
							onRestart={handleRestart}
							onToggleAI={handleToggleAI}
							useAI={useAI}
						/>

						<LeaderboardPanel
							highScores={highScores}
							onSaveScore={handleSaveScore}
							onToggleHistory={handleToggleHistory}
							showHistory={showHistory}
							historyData={historyData}
							loading={loading}
							selectedPlayer={selectedPlayer}
							onPlayerChange={handlePlayerChange}
							playerNames={playerNames}
						/>
					</div>
				</motion.div>
			</Container>
		</div>
	);
}

function GamePanel({
	gameStarted,
	gameOver,
	score,
	level,
	lines,
	onStart,
	onRestart,
	onToggleAI,
	useAI,
	canvasRef,
}: {
	gameStarted: boolean;
	gameOver: boolean;
	score: number;
	level: number;
	lines: number;
	onStart: () => void;
	onRestart: () => void;
	onToggleAI: () => void;
	useAI: boolean;
	canvasRef: React.RefObject<HTMLDivElement>;
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={0}
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 243, 255, 0.2)",
			}}
		>
			<Group
				justify="space-between"
				p="md"
				style={{ borderBottom: "1px solid rgba(0, 243, 255, 0.1)" }}
			>
				<Group gap="md">
					<Badge
						size="lg"
						color={useAI ? "neonMagenta" : "neonCyan"}
						variant="filled"
					>
						{useAI ? "🤖 AI Mode" : "🎮 Play Mode"}
					</Badge>
					{!gameOver && (
						<Stack gap="xs">
							<Badge color="white" variant="light" size="sm">
								Level {level}
							</Badge>
							<Badge
								color="white"
								variant="light"
								size="sm"
								style={{ marginLeft: "auto" }}
							>
								Lines {lines}
							</Badge>
						</Stack>
					)}
				</Group>
				<Text size="xl" fw={700} c="white">
					Score: {score}
				</Text>
			</Group>

			<div
				ref={canvasRef}
				style={{
					height: "600px",
					background: "#000",
					borderBottom: "1px solid rgba(0, 243, 255, 0.2)",
					position: "relative",
				}}
			>
				{!gameStarted && (
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
							{useAI ? (
								<>
									<IconRobot size={48} style={{ color: "#00f3ff" }} />
									<Text size="xl" c="white">
										AI Agent Ready
									</Text>
									<Text size="sm" c="white">
										Uses WebAssembly-compiled AI algorithms
									</Text>
								</>
							) : (
								<>
									<IconPlayerPlay size={48} style={{ color: "#00f3ff" }} />
									<Text size="xl" c="white">
										Press Start to Play
									</Text>
									<Text size="sm" c="white">
										Arrow keys to move, Space to drop
									</Text>
								</>
							)}
						</Stack>
					</div>
				)}

				{gameOver && (
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
						<Stack align="center" gap="lg">
							<IconTrophy size={64} style={{ color: "#ffd700" }} />
							<Text size="2xl" c="white" fw={700}>
								Game Over!
							</Text>
							<Text size="lg" c="white">
								Score: {score}
							</Text>
						</Stack>
					</div>
				)}
			</div>
		</Paper>
	);
}

function ControlsPanel({
	gameStarted,
	onStart,
	onRestart,
	onToggleAI,
	useAI,
}: {
	gameStarted: boolean;
	onStart: () => void;
	onRestart: () => void;
	onToggleAI: () => void;
	useAI: boolean;
}) {
	return (
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
				Controls
			</Title>
			<Stack gap="md">
				<Button
					fullWidth
					size="lg"
					variant="filled"
					onClick={onStart}
					disabled={gameStarted}
					style={{
						background: gameStarted
							? "#404040"
							: "linear-gradient(45deg, #00f3ff, #0066ff)",
						border: "none",
					}}
				>
					{gameStarted ? "Game Running" : "Start Game"}
				</Button>

				<Button
					fullWidth
					size="lg"
					variant={useAI ? "filled" : "outline"}
					onClick={onToggleAI}
					disabled={gameStarted}
					style={{
						background: useAI
							? "linear-gradient(45deg, #ff00ff, #ff66aa)"
							: "transparent",
						border: useAI ? "none" : "1px solid #ff00ff",
						color: useAI ? "white" : "#ff00ff",
					}}
				>
					<Group gap="sm" justify="center">
						<IconRobot size={20} />
						{useAI ? "AI Playing" : "Play Yourself"}
					</Group>
				</Button>

				{gameStarted && (
					<Button
						fullWidth
						size="lg"
						variant="outline"
						onClick={onRestart}
						style={{ borderColor: "#00f3ff", color: "#00f3ff" }}
					>
						<Group gap="sm" justify="center">
							<IconRefresh size={20} />
							Restart
						</Group>
					</Button>
				)}

				{!gameStarted && (
					<Paper
						p="md"
						radius="md"
						style={{ background: "rgba(0, 0, 0, 0.3)" }}
					>
						<Text size="sm" c="white" fw={600} mb="sm">
							{useAI ? "AI Agent Controls:" : "Manual Controls:"}
						</Text>
						{useAI ? (
							<Stack gap="xs">
								<Text size="sm" c="white">
									• AI plays automatically via WebAssembly
								</Text>
								<Text size="sm" c="white">
									• Advanced heuristic algorithms compiled to WASM
								</Text>
								<Text size="sm" c="white">
									• Optimized for high-performance decision making
								</Text>
							</Stack>
						) : (
							<Stack gap="xs">
								<Text size="sm" c="white">
									• Arrow Left/Right: Move
								</Text>
								<Text size="sm" c="white">
									• Arrow Up: Rotate
								</Text>
								<Text size="sm" c="white">
									• Space: Hard Drop
								</Text>
							</Stack>
						)}
					</Paper>
				)}
			</Stack>
		</Paper>
	);
}

function LeaderboardPanel({
	highScores,
	onSaveScore,
	onToggleHistory,
	showHistory,
	historyData,
	loading,
	selectedPlayer,
	onPlayerChange,
	playerNames,
}: {
	highScores: Array<{
		id: number;
		name: string;
		score: number;
		level: number;
		lines: number;
		date: string;
	}>;
	onSaveScore: () => void;
	onToggleHistory: () => void;
	showHistory: boolean;
	historyData: Array<{
		id: number;
		name: string;
		score: number;
		level: number;
		lines: number;
		date: string;
	}>;
	loading: boolean;
	selectedPlayer: string | null;
	onPlayerChange: (value: string | null) => void;
	playerNames: string[];
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p="xl"
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(255, 215, 0, 0.1)",
			}}
		>
			<Group justify="space-between" mb="md">
				<Title order={3} c="white">
					{showHistory ? "📜 Leaderboard History" : "🏆 Leaderboard"}
				</Title>
				<ActionIcon
					variant="light"
					onClick={onToggleHistory}
					style={{ color: "#ffd700" }}
				>
					<IconHistory size={20} />
				</ActionIcon>
			</Group>

			{showHistory && (
				<Stack gap="xs" mb="md">
					<Select
						label="Filter by Player"
						placeholder="All Players"
						data={[
							{ value: "", label: "All Players" },
							...playerNames.map((name) => ({ value: name, label: name })),
						]}
						value={selectedPlayer}
						onChange={onPlayerChange}
						styles={{
							input: {
								background: "rgba(0, 0, 0, 0.3)",
								borderColor: "rgba(255, 215, 0, 0.3)",
								color: "white",
							},
							label: { color: "#ffd700" },
							dropdown: {
								background: "#1a1a1a",
								borderColor: "rgba(255, 215, 0, 0.3)",
							},
							item: {
								color: "white",
								"&[data-hovered]": {
									background: "rgba(255, 215, 0, 0.1)",
								},
							},
						}}
					/>
				</Stack>
			)}

			<Stack gap="xs">
				{loading ? (
					<Text c="dimmed" ta="center">
						Loading...
					</Text>
				) : (showHistory ? historyData : highScores).length === 0 ? (
					<Text c="dimmed" ta="center">
						No scores yet
					</Text>
				) : (
					(showHistory ? historyData : highScores).map((entry, idx) => (
						<Paper
							key={entry.id}
							p="sm"
							radius="md"
							style={{
								background: "rgba(0, 0, 0, 0.3)",
								border:
									idx === 0 && !showHistory ? "1px solid #ffd700" : "none",
							}}
						>
							<Group justify="space-between">
								<Group gap="md">
									<Text
										size="sm"
										fw={700}
										c={idx === 0 && !showHistory ? "#ffd700" : "white"}
									>
										{!showHistory ? `#${idx + 1}` : ""}
									</Text>
									<Text size="sm" fw={600} c="white">
										{entry.name}
									</Text>
								</Group>
								<Text
									fw={700}
									c={idx === 0 && !showHistory ? "#ffd700" : "white"}
								>
									{entry.score}
								</Text>
							</Group>
							<Text size="xs" c="dimmed">
								{new Date(entry.date).toLocaleDateString()} • Level{" "}
								{entry.level} • Lines {entry.lines}
							</Text>
						</Paper>
					))
				)}
			</Stack>

			{!showHistory && highScores.length > 0 && (
				<Button
					fullWidth
					size="sm"
					variant="light"
					onClick={onSaveScore}
					style={{ background: "rgba(0, 243, 255, 0.1)" }}
					mt="md"
				>
					Save Current Score
				</Button>
			)}

			{!showHistory && highScores.length === 0 && (
				<Text c="dimmed" ta="center" mt="md">
					No scores yet. Play to get on the leaderboard!
				</Text>
			)}
		</Paper>
	);
}
