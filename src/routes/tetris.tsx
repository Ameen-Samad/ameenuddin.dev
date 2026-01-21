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
	TextInput,
	Title,
} from "@mantine/core";
import {
	IconHistory,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerStop,
	IconRefresh,
	IconRobot,
	IconTrash,
	IconTrophy,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// Dynamic imports for heavy dependencies
const loadPhaser = () => import("phaser");
const loadTetrisGame = () =>
	import("@/services/tetris-game").then((m) => m.TetrisGame);

export const Route = createFileRoute("/tetris")({
	component: TetrisPage,
});

function TetrisPage() {
	const [gameStarted, setGameStarted] = useState(false);
	const [useAI, setUseAI] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [score, setScore] = useState(0);
	const [level, setLevel] = useState(1);
	const [lines, setLines] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [gameInstance, setGameInstance] = useState<any | null>(null);
	const [isLoadingGame, setIsLoadingGame] = useState(false);
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
	const [playerName, setPlayerName] = useState("");

	const fetchLeaderboard = useCallback(async () => {
		try {
			const response = await fetch("/api/tetris/leaderboard");
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
				? `/api/tetris/leaderboard/history?playerName=${encodeURIComponent(playerName)}`
				: "/api/tetris/leaderboard/history";
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

		// Dynamically load Phaser and TetrisGame to reduce initial bundle size
		setIsLoadingGame(true);
		Promise.all([loadPhaser(), loadTetrisGame()])
			.then(([Phaser, TetrisGameService]) => {
				const config: any = {
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
				game.scene.start("TetrisGame"); // Start the scene!

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

				const handleGameOver = (event: Event) => {
					const customEvent = event as CustomEvent<{
						detail: { score: number; lines: number; level: number };
					}>;
					if (customEvent.detail) {
						setScore(customEvent.detail.score);
						setLines(customEvent.detail.lines);
						setLevel(customEvent.detail.level);
						setGameOver(true);
						setIsPaused(false);
					}
				};

				window.addEventListener("tetris-score", handleScoreChange);
				window.addEventListener("tetris-gameover", handleGameOver);
				setIsLoadingGame(false);

				// Cleanup function returned from Promise
				return () => {
					window.removeEventListener("tetris-score", handleScoreChange);
					window.removeEventListener("tetris-gameover", handleGameOver);
					if (game) {
						game.destroy(true);
					}
				};
			})
			.catch((error) => {
				console.error("Failed to load game:", error);
				setIsLoadingGame(false);
			});

		return () => {
			if (gameInstance) {
				gameInstance.destroy(true);
			}
		};
	}, [gameStarted]);

	const handleStartGame = () => {
		setGameOver(false);
		setGameStarted(true);
		setIsPaused(false);
	};

	const handleRestart = () => {
		if (gameInstance && gameInstance.scene.keys["TetrisGame"]) {
			gameInstance.scene.keys["TetrisGame"].restart();
			setGameOver(false);
			setIsPaused(false);
		}
	};

	const handleToggleAI = () => {
		const newAIState = !useAI;
		setUseAI(newAIState);
		if (gameInstance && gameStarted) {
			gameInstance.scene.keys["TetrisGame"].setUseAI(newAIState);
		}
	};

	const handleTogglePause = () => {
		if (!gameInstance || !gameStarted || gameOver) return;
		const newPausedState = !isPaused;
		setIsPaused(newPausedState);
		gameInstance.scene.keys["TetrisGame"].setPaused(newPausedState);
	};

	const handleStopGame = () => {
		if (!gameInstance) return;
		setGameStarted(false);
		setIsPaused(false);
		setGameOver(true);
	};

	const handleSaveScore = async () => {
		if (score === 0) return;
		if (!playerName.trim()) return;

		try {
			const response = await fetch("/api/tetris/leaderboard", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: playerName,
					score,
					level,
					lines,
				}),
			});

			if (response.ok) {
				await fetchLeaderboard();
				setGameOver(true);
				setGameStarted(false);
				setPlayerName("");
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

					<Paper
						p="md"
						style={{
							background: "rgba(26, 26, 46, 0.8)",
							border: "1px solid rgba(74, 105, 255, 0.3)",
						}}
					>
						<Group gap="xs" wrap="wrap">
							<Badge color="cyan" variant="light">
								Next Piece Preview
							</Badge>
							<Badge color="yellow" variant="light">
								Hold Piece (C/Shift)
							</Badge>
							<Badge color="green" variant="light">
								Ghost Piece Shadow
							</Badge>
							<Badge color="orange" variant="light">
								Combo System
							</Badge>
							<Badge color="pink" variant="light">
								Particle Effects
							</Badge>
							<Badge color="violet" variant="light">
								Dynamic Sounds
							</Badge>
							<Badge color="red" variant="light">
								Screen Shake
							</Badge>
							<Badge color="lime" variant="light">
								Score Animations
							</Badge>
						</Group>
					</Paper>

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
							isPaused={isPaused}
							score={score}
							level={level}
							lines={lines}
							onStart={handleStartGame}
							onRestart={handleRestart}
							onToggleAI={handleToggleAI}
							useAI={useAI}
							canvasRef={canvasRef}
							playerName={playerName}
							setPlayerName={setPlayerName}
							onSaveScore={handleSaveScore}
						/>

						<ControlsPanel
							gameStarted={gameStarted}
							isPaused={isPaused}
							onStart={handleStartGame}
							onRestart={handleRestart}
							onTogglePause={handleTogglePause}
							onStop={handleStopGame}
							onToggleAI={handleToggleAI}
							useAI={useAI}
						/>

						<LeaderboardPanel
							highScores={highScores}
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
	isPaused,
	score,
	level,
	lines,
	onStart,
	onRestart,
	onToggleAI,
	useAI,
	canvasRef,
	playerName,
	setPlayerName,
	onSaveScore,
}: {
	gameStarted: boolean;
	gameOver: boolean;
	isPaused: boolean;
	score: number;
	level: number;
	lines: number;
	onStart: () => void;
	onRestart: () => void;
	onToggleAI: () => void;
	useAI: boolean;
	canvasRef: React.RefObject<HTMLDivElement>;
	playerName: string;
	setPlayerName: (name: string) => void;
	onSaveScore: () => void;
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

				{isPaused && gameStarted && !gameOver && (
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
							<Text size="2xl" c="white" fw={700}>
								⏸️ PAUSED
							</Text>
							<Text size="sm" c="white">
								Click Resume to continue
							</Text>
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
							<TextInput
								placeholder="Enter your name"
								value={playerName}
								onChange={(e) => setPlayerName(e.currentTarget.value)}
								style={{
									background: "rgba(255, 255, 255, 0.1)",
									borderColor: "rgba(0, 243, 255, 0.3)",
									color: "white",
									width: "250px",
								}}
								maxLength={20}
							/>
							<Button
								onClick={onSaveScore}
								disabled={!playerName.trim()}
								style={{
									background: playerName.trim()
										? "linear-gradient(45deg, #00f3ff, #0066ff)"
										: "#404040",
									border: "none",
								}}
							>
								Save Score
							</Button>
						</Stack>
					</div>
				)}
			</div>
		</Paper>
	);
}

function ControlsPanel({
	gameStarted,
	isPaused,
	onStart,
	onRestart,
	onTogglePause,
	onStop,
	onToggleAI,
	useAI,
}: {
	gameStarted: boolean;
	isPaused: boolean;
	onStart: () => void;
	onRestart: () => void;
	onTogglePause: () => void;
	onStop: () => void;
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
					<Group gap="sm" justify="center">
						<IconPlayerPlay size={20} />
						{gameStarted ? "Game Running" : "Start Game"}
					</Group>
				</Button>

				<Button
					fullWidth
					size="lg"
					variant={useAI ? "filled" : "outline"}
					onClick={onToggleAI}
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
						{useAI ? "Switch to Human" : "Switch to AI"}
					</Group>
				</Button>

				{gameStarted && (
					<>
						<Button
							fullWidth
							size="lg"
							variant="outline"
							onClick={onTogglePause}
							style={{ borderColor: "#ffaa00", color: "#ffaa00" }}
						>
							<Group gap="sm" justify="center">
								{isPaused ? (
									<>
										<IconPlayerPlay size={20} />
										Resume
									</>
								) : (
									<>
										<IconPlayerPause size={20} />
										Pause
									</>
								)}
							</Group>
						</Button>

						<Button
							fullWidth
							size="lg"
							variant="outline"
							onClick={onStop}
							style={{ borderColor: "#ff0000", color: "#ff0000" }}
						>
							<Group gap="sm" justify="center">
								<IconPlayerStop size={20} />
								Stop Game
							</Group>
						</Button>

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
					</>
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
									• Arrow Down: Soft Drop
								</Text>
								<Text size="sm" c="white">
									• Space: Hard Drop
								</Text>
								<Text size="sm" c="yellow" fw={700}>
									• C or Shift: Hold Piece
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

			{!showHistory && highScores.length === 0 && (
				<Text c="dimmed" ta="center" mt="md">
					No scores yet. Play to get on the leaderboard!
				</Text>
			)}
		</Paper>
	);
}
