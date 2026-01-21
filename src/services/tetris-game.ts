import * as Phaser from "phaser";
import init, { TetrisAI as WasmTetrisAI } from "../wasm/tetris_wasm.js";

let wasmAI: WasmTetrisAI | null = null;

async function initWasm() {
	if (!wasmAI) {
		await init();
		wasmAI = new WasmTetrisAI();
	}
}

export interface AIMove {
	x: number;
	y: number;
	rotation: number;
	score: number;
}

// Tetromino shapes with correct dimensions
const SHAPES: Record<string, { shape: number[][]; color: number }> = {
	I: {
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		color: 0x00f3ff,
	},
	O: {
		shape: [
			[1, 1],
			[1, 1],
		],
		color: 0xffff00,
	},
	T: {
		shape: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: 0xff00ff,
	},
	S: {
		shape: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		color: 0x00ff00,
	},
	Z: {
		shape: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		color: 0xff0000,
	},
	J: {
		shape: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: 0x0066ff,
	},
	L: {
		shape: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: 0xffa500,
	},
};

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

export class Tetromino {
	shape: number[][];
	color: number;
	rotation: number = 0;
	type: string;

	constructor(type: string) {
		this.type = type;
		const config = SHAPES[type];
		this.shape = config.shape.map((row) => [...row]);
		this.color = config.color;
	}

	rotate() {
		const n = this.shape.length;
		const rotated: number[][] = [];

		for (let i = 0; i < n; i++) {
			rotated[i] = [];
			for (let j = 0; j < n; j++) {
				rotated[i][j] = this.shape[n - 1 - j][i];
			}
		}

		this.shape = rotated;
		this.rotation = (this.rotation + 1) % 4;
	}

	clone(): Tetromino {
		const cloned = new Tetromino(this.type);
		cloned.shape = this.shape.map((row) => [...row]);
		cloned.rotation = this.rotation;
		return cloned;
	}
}

class TetrisAI {
	static async getBestMove(
		grid: (number | null)[][],
		piece: Tetromino,
	): Promise<AIMove> {
		await initWasm();

		if (!wasmAI) {
			throw new Error("WASM AI not initialized");
		}

		const flatGrid = grid.flat();
		const flatPiece = piece.shape.flat();

		const move = wasmAI.get_best_move(
			new Int32Array(
				flatGrid.map((cell) => (cell === null ? 0 : 1) as number),
			),
			grid[0].length,
			grid.length,
			new Int32Array(flatPiece),
			piece.shape[0].length,
			piece.shape.length,
		);

		return {
			x: move[0],
			y: move[1],
			rotation: move[2],
			score: move[3],
		};
	}

	static async getBestMoveWithLookahead(
		grid: (number | null)[][],
		piece: Tetromino,
		nextPiece: Tetromino,
	): Promise<AIMove> {
		await initWasm();

		if (!wasmAI) {
			throw new Error("WASM AI not initialized");
		}

		const flatGrid = grid.flat();
		const flatPiece = piece.shape.flat();
		const flatNextPiece = nextPiece.shape.flat();

		const move = wasmAI.get_best_move_with_lookahead(
			new Int32Array(
				flatGrid.map((cell) => (cell === null ? 0 : 1) as number),
			),
			grid[0].length,
			grid.length,
			new Int32Array(flatPiece),
			piece.shape[0].length,
			piece.shape.length,
			new Int32Array(flatNextPiece),
			nextPiece.shape[0].length,
			nextPiece.shape.length,
		);

		return {
			x: move[0],
			y: move[1],
			rotation: move[2],
			score: move[3],
		};
	}
}

export class TetrisGame extends Phaser.Scene {
	private grid: (number | null)[][] = [];
	private gridCols: number = 10;
	private gridRows: number = 20;
	private blockSize: number = 30;

	private currentPiece: Tetromino | null = null;
	private currentX: number = 0;
	private currentY: number = 0;

	// Next pieces queue
	private nextPieces: Tetromino[] = [];
	private holdPiece: Tetromino | null = null;
	private canHold: boolean = true;

	private dropInterval: number = 1000;
	private lastDropTime: number = 0;
	private score: number = 0;
	private lines: number = 0;
	private level: number = 1;
	private paused: boolean = false;

	// Combo system
	private combo: number = 0;
	private lastClearTime: number = 0;
	private comboTimeout: number = 3000;

	// AI
	private useAI: boolean = false;
	private aiTimeout: number | null = null;
	private isProcessingAIMove: boolean = false;
	private gameOver: boolean = false;

	// Graphics layers
	private boardGraphics!: Phaser.GameObjects.Graphics;
	private gridGraphics!: Phaser.GameObjects.Graphics;
	private pieceGraphics!: Phaser.GameObjects.Graphics;
	private ghostGraphics!: Phaser.GameObjects.Graphics;
	private nextPiecesGraphics!: Phaser.GameObjects.Graphics;
	private holdPieceGraphics!: Phaser.GameObjects.Graphics;

	// Particle emitters
	private lineClearParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
	private comboParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
	private lockParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

	// Text objects
	private comboText!: Phaser.GameObjects.Text;
	private scorePopups: Phaser.GameObjects.Text[] = [];

	// Sound effects
	private moveSfx!: Phaser.Sound.BaseSound;
	private rotateSfx!: Phaser.Sound.BaseSound;
	private dropSfx!: Phaser.Sound.BaseSound;
	private lineClearSfx!: Phaser.Sound.BaseSound;
	private tetrisSfx!: Phaser.Sound.BaseSound;
	private levelUpSfx!: Phaser.Sound.BaseSound;
	private gameOverSfx!: Phaser.Sound.BaseSound;
	private holdSfx!: Phaser.Sound.BaseSound;

	constructor() {
		super({ key: "TetrisGame" });
	}


	create() {
		this.initGrid();

		// Create graphics layers
		this.boardGraphics = this.add.graphics();
		this.gridGraphics = this.add.graphics();
		this.ghostGraphics = this.add.graphics();
		this.pieceGraphics = this.add.graphics();
		this.nextPiecesGraphics = this.add.graphics();
		this.holdPieceGraphics = this.add.graphics();

		// Create particle systems
		this.createParticleSystems();

		// Create combo text
		this.comboText = this.add
			.text(this.gridCols * this.blockSize / 2, 50, "", {
				fontSize: "32px",
				color: "#FFD700",
				fontStyle: "bold",
				stroke: "#000",
				strokeThickness: 4,
			})
			.setOrigin(0.5)
			.setDepth(100)
			.setVisible(false);

		this.drawBoard();
		this.initNextPieces();
		this.spawnPiece();

		// Setup input
		this.setupInput();
	}

	private setupInput() {
		if (!this.input.keyboard) return;

		this.input.keyboard.on("keydown-LEFT", () => {
			if (!this.paused && !this.gameOver) {
				this.moveLeft();
				this.playSound("move");
			}
		});

		this.input.keyboard.on("keydown-RIGHT", () => {
			if (!this.paused && !this.gameOver) {
				this.moveRight();
				this.playSound("move");
			}
		});

		this.input.keyboard.on("keydown-DOWN", () => {
			if (!this.paused && !this.gameOver) {
				this.moveDown();
			}
		});

		this.input.keyboard.on("keydown-UP", () => {
			if (!this.paused && !this.gameOver) {
				this.rotate();
				this.playSound("rotate");
			}
		});

		this.input.keyboard.on("keydown-SPACE", () => {
			if (!this.paused && !this.gameOver) {
				this.hardDrop();
				this.playSound("drop");
			}
		});

		this.input.keyboard.on("keydown-C", () => {
			if (!this.paused && !this.gameOver) {
				this.holdCurrentPiece();
			}
		});

		this.input.keyboard.on("keydown-SHIFT", () => {
			if (!this.paused && !this.gameOver) {
				this.holdCurrentPiece();
			}
		});
	}

	private playSound(soundKey: string) {
		try {
			// Create procedural sound effects
			switch (soundKey) {
				case "move":
					this.createTone(200, 0.05, "sine");
					break;
				case "rotate":
					this.createTone(300, 0.1, "sine");
					break;
				case "drop":
					this.createTone(150, 0.2, "square");
					break;
				case "lineClear":
					this.createChord([400, 500, 600], 0.3);
					break;
				case "tetris":
					this.createChord([600, 750, 900, 1050], 0.5);
					break;
				case "levelUp":
					this.createAscendingTone(400, 800, 0.4);
					break;
				case "gameOver":
					this.createDescendingTone(400, 100, 0.6);
					break;
				case "hold":
					this.createTone(350, 0.08, "sine");
					break;
			}
		} catch (e) {
			console.warn("Could not play sound:", e);
		}
	}

	private createTone(
		frequency: number,
		duration: number,
		type: OscillatorType = "sine",
	) {
		const audioContext = new AudioContext();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

		gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			audioContext.currentTime + duration,
		);

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.start();
		oscillator.stop(audioContext.currentTime + duration);
	}

	private createChord(frequencies: number[], duration: number) {
		frequencies.forEach((freq, index) => {
			setTimeout(() => this.createTone(freq, duration / 2), index * 50);
		});
	}

	private createAscendingTone(
		startFreq: number,
		endFreq: number,
		duration: number,
	) {
		const audioContext = new AudioContext();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(
			endFreq,
			audioContext.currentTime + duration,
		);

		gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			audioContext.currentTime + duration,
		);

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.start();
		oscillator.stop(audioContext.currentTime + duration);
	}

	private createDescendingTone(
		startFreq: number,
		endFreq: number,
		duration: number,
	) {
		this.createAscendingTone(startFreq, endFreq, duration);
	}

	private createParticleSystems() {
		// Create a simple graphics object for particles
		const particleGraphics = this.add.graphics();
		particleGraphics.fillStyle(0xffffff, 1);
		particleGraphics.fillRect(0, 0, 8, 8);
		particleGraphics.generateTexture("particle", 8, 8);
		particleGraphics.destroy();

		// Line clear particles
		this.lineClearParticles = this.add.particles(0, 0, "particle", {
			speed: { min: 100, max: 300 },
			angle: { min: 0, max: 360 },
			scale: { start: 1, end: 0 },
			lifespan: 600,
			gravityY: 200,
			emitting: false,
		});

		// Combo particles
		this.comboParticles = this.add.particles(0, 0, "particle", {
			speed: { min: 150, max: 400 },
			angle: { min: -90, max: 90 },
			scale: { start: 1.5, end: 0 },
			lifespan: 800,
			gravityY: -100,
			tint: [0xffd700, 0xff6600, 0xff0000],
			emitting: false,
		});

		// Lock particles
		this.lockParticles = this.add.particles(0, 0, "particle", {
			speed: { min: 50, max: 150 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.8, end: 0 },
			lifespan: 400,
			emitting: false,
		});
	}

	private initNextPieces() {
		// Initialize with 5 pieces
		for (let i = 0; i < 5; i++) {
			this.addNextPiece();
		}
	}

	private addNextPiece() {
		const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
		this.nextPieces.push(new Tetromino(type));
	}

	private getNextPiece(): Tetromino {
		const piece = this.nextPieces.shift()!;
		this.addNextPiece();
		return piece;
	}

	private initGrid() {
		this.grid = [];
		for (let y = 0; y < this.gridRows; y++) {
			this.grid[y] = Array(this.gridCols).fill(null);
		}
	}

	private drawBoard() {
		this.boardGraphics.clear();

		// Draw background with glow effect
		this.boardGraphics.fillStyle(0x1a1a2e, 0.9);
		this.boardGraphics.fillRect(
			0,
			0,
			this.gridCols * this.blockSize,
			this.gridRows * this.blockSize,
		);

		// Add glow border
		this.boardGraphics.lineStyle(3, 0x4a69ff, 1);
		this.boardGraphics.strokeRect(
			0,
			0,
			this.gridCols * this.blockSize,
			this.gridRows * this.blockSize,
		);

		// Add inner glow
		this.boardGraphics.lineStyle(1, 0x6a89ff, 0.5);
		this.boardGraphics.strokeRect(
			3,
			3,
			this.gridCols * this.blockSize - 6,
			this.gridRows * this.blockSize - 6,
		);

		// Draw grid lines
		this.boardGraphics.lineStyle(1, 0x2a2a4e, 0.3);
		for (let x = 1; x < this.gridCols; x++) {
			this.boardGraphics.lineBetween(
				x * this.blockSize,
				0,
				x * this.blockSize,
				this.gridRows * this.blockSize,
			);
		}
		for (let y = 1; y < this.gridRows; y++) {
			this.boardGraphics.lineBetween(
				0,
				y * this.blockSize,
				this.gridCols * this.blockSize,
				y * this.blockSize,
			);
		}
	}

	private renderGrid() {
		this.gridGraphics.clear();

		for (let y = 0; y < this.gridRows; y++) {
			for (let x = 0; x < this.gridCols; x++) {
				if (this.grid[y][x] !== null) {
					const color = this.grid[y][x] as number;
					this.drawBlock(
						this.gridGraphics,
						x * this.blockSize,
						y * this.blockSize,
						color,
						1.0,
					);
				}
			}
		}
	}

	private drawBlock(
		graphics: Phaser.GameObjects.Graphics,
		x: number,
		y: number,
		color: number,
		alpha: number = 1.0,
	) {
		// Main block
		graphics.fillStyle(color, alpha);
		graphics.fillRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4);

		// Highlight
		graphics.fillStyle(0xffffff, alpha * 0.3);
		graphics.fillRect(x + 2, y + 2, this.blockSize - 4, 4);
		graphics.fillRect(x + 2, y + 2, 4, this.blockSize - 4);

		// Shadow
		graphics.fillStyle(0x000000, alpha * 0.3);
		graphics.fillRect(
			x + 2,
			y + this.blockSize - 6,
			this.blockSize - 4,
			4,
		);
		graphics.fillRect(
			x + this.blockSize - 6,
			y + 2,
			4,
			this.blockSize - 4,
		);

		// Border glow
		graphics.lineStyle(1, color, alpha * 0.5);
		graphics.strokeRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
	}

	private renderGhostPiece() {
		this.ghostGraphics.clear();

		if (!this.currentPiece) return;

		// Find where piece would land
		let ghostY = this.currentY;
		while (this.canMove(0, ghostY - this.currentY + 1)) {
			ghostY++;
		}

		// Draw ghost piece
		const shape = this.currentPiece.shape;
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					this.drawBlock(
						this.ghostGraphics,
						(this.currentX + x) * this.blockSize,
						(ghostY + y) * this.blockSize,
						this.currentPiece.color,
						0.2,
					);
				}
			}
		}
	}

	private renderCurrentPiece() {
		this.pieceGraphics.clear();

		if (!this.currentPiece) return;

		const shape = this.currentPiece.shape;
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					this.drawBlock(
						this.pieceGraphics,
						(this.currentX + x) * this.blockSize,
						(this.currentY + y) * this.blockSize,
						this.currentPiece.color,
						1.0,
					);
				}
			}
		}

		// Render ghost piece
		this.renderGhostPiece();
	}

	private renderNextPieces() {
		this.nextPiecesGraphics.clear();

		const startX = this.gridCols * this.blockSize + 40;
		const startY = 50;
		const spacing = 80;

		// Draw "NEXT" label
		this.nextPiecesGraphics.fillStyle(0xffffff, 1);

		// Draw next 3 pieces
		for (let i = 0; i < Math.min(3, this.nextPieces.length); i++) {
			const piece = this.nextPieces[i];
			const y = startY + i * spacing;

			// Draw container
			this.nextPiecesGraphics.lineStyle(2, 0x4a69ff, 0.5);
			this.nextPiecesGraphics.strokeRect(startX - 5, y - 5, 70, 70);

			// Draw piece
			const shape = piece.shape;
			const pieceWidth = shape[0].length;
			const pieceHeight = shape.length;
			const offsetX = startX + (60 - pieceWidth * 15) / 2;
			const offsetY = y + (60 - pieceHeight * 15) / 2;

			for (let py = 0; py < shape.length; py++) {
				for (let px = 0; px < shape[py].length; px++) {
					if (shape[py][px]) {
						this.nextPiecesGraphics.fillStyle(piece.color, 1);
						this.nextPiecesGraphics.fillRect(
							offsetX + px * 15,
							offsetY + py * 15,
							13,
							13,
						);
					}
				}
			}
		}
	}

	private renderHoldPiece() {
		this.holdPieceGraphics.clear();

		const startX = -120;
		const startY = 50;

		// Draw container
		this.holdPieceGraphics.lineStyle(2, 0x4a69ff, 0.5);
		this.holdPieceGraphics.strokeRect(startX - 5, startY - 5, 70, 70);

		if (this.holdPiece) {
			const shape = this.holdPiece.shape;
			const pieceWidth = shape[0].length;
			const pieceHeight = shape.length;
			const offsetX = startX + (60 - pieceWidth * 15) / 2;
			const offsetY = startY + (60 - pieceHeight * 15) / 2;

			const alpha = this.canHold ? 1.0 : 0.3;

			for (let py = 0; py < shape.length; py++) {
				for (let px = 0; px < shape[py].length; px++) {
					if (shape[py][px]) {
						this.holdPieceGraphics.fillStyle(this.holdPiece.color, alpha);
						this.holdPieceGraphics.fillRect(
							offsetX + px * 15,
							offsetY + py * 15,
							13,
							13,
						);
					}
				}
			}
		}
	}

	private holdCurrentPiece() {
		if (!this.canHold || !this.currentPiece) return;

		this.playSound("hold");

		if (this.holdPiece === null) {
			this.holdPiece = new Tetromino(this.currentPiece.type);
			this.spawnPiece();
		} else {
			const temp = this.holdPiece;
			this.holdPiece = new Tetromino(this.currentPiece.type);
			this.currentPiece = temp;
			this.currentX = Math.floor((this.gridCols - this.currentPiece.shape[0].length) / 2);
			this.currentY = 0;
		}

		this.canHold = false;
		this.renderHoldPiece();
		this.renderCurrentPiece();
	}

	private spawnPiece() {
		this.currentPiece = this.getNextPiece();
		this.currentX = Math.floor(
			(this.gridCols - this.currentPiece.shape[0].length) / 2,
		);
		this.currentY = 0;
		this.canHold = true;

		if (!this.canMove(0, 0)) {
			this.triggerGameOver();
			return;
		}

		this.renderCurrentPiece();
		this.renderNextPieces();
		this.renderHoldPiece();
	}

	private triggerGameOver() {
		this.gameOver = true;
		this.stopAI();
		this.playSound("gameOver");

		// Game over animation
		this.cameras.main.shake(500, 0.01);

		const event = new CustomEvent("tetris-gameover", {
			detail: { score: this.score, lines: this.lines, level: this.level },
		});
		window.dispatchEvent(event);
	}

	update(time: number) {
		if (this.paused || this.gameOver || this.useAI) return;

		if (time > this.lastDropTime + this.dropInterval) {
			this.moveDown();
			this.lastDropTime = time;
		}

		// Check combo timeout
		if (time > this.lastClearTime + this.comboTimeout && this.combo > 0) {
			this.combo = 0;
			this.comboText.setVisible(false);
		}
	}

	private moveLeft() {
		if (this.canMove(-1, 0)) {
			this.currentX--;
			this.renderCurrentPiece();
		}
	}

	private moveRight() {
		if (this.canMove(1, 0)) {
			this.currentX++;
			this.renderCurrentPiece();
		}
	}

	private moveDown() {
		if (this.canMove(0, 1)) {
			this.currentY++;
			this.renderCurrentPiece();
		} else {
			this.lockPiece();
		}
	}

	private rotate() {
		if (!this.currentPiece) return;

		const original = this.currentPiece.clone();
		this.currentPiece.rotate();

		// Wall kick
		if (!this.canMove(0, 0)) {
			if (this.canMove(-1, 0)) {
				this.currentX--;
			} else if (this.canMove(1, 0)) {
				this.currentX++;
			} else if (this.canMove(-2, 0)) {
				this.currentX -= 2;
			} else if (this.canMove(2, 0)) {
				this.currentX += 2;
			} else {
				this.currentPiece = original;
			}
		}

		this.renderCurrentPiece();
	}

	private canMove(offsetX: number, offsetY: number): boolean {
		if (!this.currentPiece) return false;

		const newX = this.currentX + offsetX;
		const newY = this.currentY + offsetY;
		const shape = this.currentPiece.shape;

		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					const gridX = newX + x;
					const gridY = newY + y;

					if (
						gridX < 0 ||
						gridX >= this.gridCols ||
						gridY >= this.gridRows ||
						(gridY >= 0 && this.grid[gridY][gridX] !== null)
					) {
						return false;
					}
				}
			}
		}

		return true;
	}

	private lockPiece() {
		if (!this.currentPiece || this.gameOver) return;

		// Lock piece with particle effect
		const lockX = (this.currentX + this.currentPiece.shape[0].length / 2) * this.blockSize;
		const lockY = (this.currentY + this.currentPiece.shape.length / 2) * this.blockSize;
		this.lockParticles.setPosition(lockX, lockY);
		this.lockParticles.particleTint = this.currentPiece.color;
		this.lockParticles.explode(10);

		for (let y = 0; y < this.currentPiece.shape.length; y++) {
			for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
				if (this.currentPiece.shape[y][x]) {
					const gridY = this.currentY + y;
					const gridX = this.currentX + x;

					if (
						gridY >= 0 &&
						gridY < this.gridRows &&
						gridX >= 0 &&
						gridX < this.gridCols
					) {
						this.grid[gridY][gridX] = this.currentPiece.color;
					}
				}
			}
		}

		this.clearLines();
		this.renderGrid();
		this.spawnPiece();
	}

	private clearLines() {
		let linesCleared = 0;
		const clearedRows: number[] = [];

		for (let y = this.gridRows - 1; y >= 0; y--) {
			if (this.grid[y].every((cell) => cell !== null)) {
				linesCleared++;
				clearedRows.push(y);
			}
		}

		if (linesCleared > 0) {
			// Animate line clear
			this.animateLineClear(clearedRows);

			// Update combo
			this.combo++;
			this.lastClearTime = this.time.now;

			// Calculate score with combo multiplier
			const baseScore = [0, 100, 300, 500, 800][linesCleared];
			const comboBonus = this.combo > 1 ? (this.combo - 1) * 50 : 0;
			const totalScore = (baseScore + comboBonus) * this.level;

			// Show score popup
			this.showScorePopup(totalScore, clearedRows[0]);

			// Update score
			this.score += totalScore;
			this.lines += linesCleared;

			const oldLevel = this.level;
			this.level = Math.floor(this.lines / 10) + 1;
			this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

			// Level up effect
			if (this.level > oldLevel) {
				this.playSound("levelUp");
				this.cameras.main.flash(300, 100, 200, 255);
			}

			// Play sound
			if (linesCleared === 4) {
				this.playSound("tetris");
			} else {
				this.playSound("lineClear");
			}

			// Show combo
			if (this.combo > 1) {
				this.showCombo();
			}

			// Remove cleared lines
			setTimeout(() => {
				clearedRows.sort((a, b) => a - b);
				for (const row of clearedRows) {
					this.grid.splice(row, 1);
					this.grid.unshift(Array(this.gridCols).fill(null));
				}
				this.renderGrid();
			}, 400);

			this.onScoreChange(this.score, this.lines, this.level);
		} else {
			// Reset combo
			this.combo = 0;
			this.comboText.setVisible(false);
		}
	}

	private animateLineClear(rows: number[]) {
		// Flash animation
		for (const row of rows) {
			for (let x = 0; x < this.gridCols; x++) {
				const blockX = x * this.blockSize + this.blockSize / 2;
				const blockY = row * this.blockSize + this.blockSize / 2;

				// Spawn particles
				this.lineClearParticles.setPosition(blockX, blockY);
				this.lineClearParticles.particleTint = this.grid[row][x] as number;
				this.lineClearParticles.explode(5);
			}

			// Flash effect
			const flash = this.add.graphics();
			flash.fillStyle(0xffffff, 0.8);
			flash.fillRect(0, row * this.blockSize, this.gridCols * this.blockSize, this.blockSize);
			flash.setDepth(50);

			this.tweens.add({
				targets: flash,
				alpha: 0,
				duration: 400,
				onComplete: () => flash.destroy(),
			});
		}

		// Screen shake for multiple lines
		if (rows.length >= 2) {
			this.cameras.main.shake(200, 0.005 * rows.length);
		}
	}

	private showScorePopup(score: number, row: number) {
		const text = this.add
			.text(
				this.gridCols * this.blockSize / 2,
				row * this.blockSize,
				`+${score}`,
				{
					fontSize: "24px",
					color: "#FFD700",
					fontStyle: "bold",
					stroke: "#000",
					strokeThickness: 4,
				},
			)
			.setOrigin(0.5)
			.setDepth(100);

		this.tweens.add({
			targets: text,
			y: text.y - 50,
			alpha: 0,
			duration: 1000,
			ease: "Power2",
			onComplete: () => text.destroy(),
		});
	}

	private showCombo() {
		this.comboText.setText(`${this.combo}x COMBO!`);
		this.comboText.setVisible(true);
		this.comboText.setScale(1.5);
		this.comboText.setAlpha(1);

		// Spawn combo particles
		this.comboParticles.setPosition(
			this.gridCols * this.blockSize / 2,
			100,
		);
		this.comboParticles.explode(20 + this.combo * 5);

		// Animate combo text
		this.tweens.add({
			targets: this.comboText,
			scale: 1,
			duration: 200,
			ease: "Back.out",
		});
	}

	private onScoreChange(score: number, lines: number, level: number) {
		const event = new CustomEvent("tetris-score", {
			detail: { score, lines, level },
		});
		window.dispatchEvent(event);
	}

	setPaused(paused: boolean) {
		this.paused = paused;
		if (!paused && this.useAI && !this.isProcessingAIMove && !this.gameOver) {
			this.startAI();
		}
	}

	togglePause() {
		this.setPaused(!this.paused);
	}

	isPaused(): boolean {
		return this.paused;
	}

	isAIMode(): boolean {
		return this.useAI;
	}

	isGameOver(): boolean {
		return this.gameOver;
	}

	restart() {
		this.gameOver = false;
		this.score = 0;
		this.lines = 0;
		this.level = 1;
		this.combo = 0;
		this.dropInterval = 1000;
		this.paused = false;
		this.holdPiece = null;
		this.canHold = true;
		this.stopAI();

		this.initGrid();
		this.initNextPieces();
		this.renderGrid();
		this.spawnPiece();
		this.onScoreChange(0, 0, 1);
	}

	destroy() {
		this.stopAI();
		// Cleanup graphics and particles
		if (this.boardGraphics) this.boardGraphics.destroy();
		if (this.gridGraphics) this.gridGraphics.destroy();
		if (this.pieceGraphics) this.pieceGraphics.destroy();
		if (this.ghostGraphics) this.ghostGraphics.destroy();
		if (this.nextPiecesGraphics) this.nextPiecesGraphics.destroy();
		if (this.holdPieceGraphics) this.holdPieceGraphics.destroy();
		if (this.lineClearParticles) this.lineClearParticles.destroy();
		if (this.comboParticles) this.comboParticles.destroy();
		if (this.lockParticles) this.lockParticles.destroy();
		if (this.comboText) this.comboText.destroy();
	}

	setUseAI(useAI: boolean) {
		this.useAI = useAI;
		if (useAI && !this.paused && !this.gameOver) {
			this.startAI();
		} else {
			this.stopAI();
		}
	}

	private stopAI() {
		if (this.aiTimeout !== null) {
			clearTimeout(this.aiTimeout);
			this.aiTimeout = null;
		}
		this.isProcessingAIMove = false;
	}

	private async startAI() {
		if (!this.useAI || this.paused || this.gameOver) return;
		this.scheduleNextAIMove();
	}

	private scheduleNextAIMove() {
		if (!this.useAI || this.paused || this.gameOver) return;

		const delay = Math.max(50, this.dropInterval / 4);
		this.aiTimeout = window.setTimeout(() => {
			if (!this.paused && !this.gameOver && this.useAI) {
				this.makeAIMove();
				this.scheduleNextAIMove();
			}
		}, delay);
	}

	private makeAIMove() {
		if (
			!this.currentPiece ||
			this.isProcessingAIMove ||
			this.paused ||
			this.gameOver
		)
			return;

		this.isProcessingAIMove = true;

		// Use beam search with lookahead if next piece is available
		const aiPromise =
			this.nextPieces.length > 0
				? TetrisAI.getBestMoveWithLookahead(
						this.grid,
						this.currentPiece,
						this.nextPieces[0],
				  )
				: TetrisAI.getBestMove(this.grid, this.currentPiece);

		aiPromise
			.then(async (move) => {
				if (!this.currentPiece || this.paused || this.gameOver) {
					this.isProcessingAIMove = false;
					return;
				}

				while (this.currentPiece.rotation !== move.rotation) {
					this.currentPiece.rotate();
					await this.sleep(50);
				}

				while (this.currentX !== move.x) {
					if (this.currentX < move.x) {
						this.moveRight();
					} else {
						this.moveLeft();
					}
					await this.sleep(30);
				}

				this.hardDrop();
				this.isProcessingAIMove = false;
			})
			.catch((error) => {
				console.error("AI move failed:", error);
				this.isProcessingAIMove = false;
			});
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private hardDrop() {
		while (this.canMove(0, 1)) {
			this.currentY++;
		}
		this.renderCurrentPiece();
		this.lockPiece();
	}
}
