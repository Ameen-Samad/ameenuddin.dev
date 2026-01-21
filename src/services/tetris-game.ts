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

export class TetrisAI {
	static async getBestMove(
		grid: (number | null)[][],
		piece: Tetromino,
	): Promise<AIMove> {
		await initWasm();

		if (!wasmAI) {
			throw new Error("WASM AI not initialized");
		}

		// Convert 2D grid to 1D Int32Array
		const flatGrid = new Int32Array(20 * 10);
		for (let y = 0; y < 20; y++) {
			for (let x = 0; x < 10; x++) {
				flatGrid[y * 10 + x] = grid[y][x] ?? 0;
			}
		}

		// Convert piece shape to flat Int32Array
		const pieceHeight = piece.shape.length;
		const pieceWidth = piece.shape[0].length;
		const flatPiece = new Int32Array(pieceHeight * pieceWidth);
		for (let y = 0; y < pieceHeight; y++) {
			for (let x = 0; x < pieceWidth; x++) {
				flatPiece[y * pieceWidth + x] = piece.shape[y][x];
			}
		}

		// Call WASM function
		const result = wasmAI.get_best_move(
			flatGrid,
			10,
			20,
			flatPiece,
			pieceWidth,
			pieceHeight,
		);

		const resultArray = result as unknown as [number, number, number, number];

		return {
			x: resultArray[0],
			y: resultArray[1],
			rotation: resultArray[2],
			score: resultArray[3] / 100.0,
		};
	}
}

export class TetrisGame extends Phaser.Scene {
	private grid: (number | null)[][];
	private gridCols: number = 10;
	private gridRows: number = 20;
	private blockSize: number = 30;
	private currentPiece: Tetromino | null = null;
	private currentX: number = 4;
	private currentY: number = 0;
	private dropInterval: number = 1000;
	private lastDropTime: number = 0;
	private score: number = 0;
	private lines: number = 0;
	private level: number = 1;
	private paused: boolean = false;
	private useAI: boolean = false;
	private aiTimeout: number | null = null;
	private isProcessingAIMove: boolean = false;
	private gameOver: boolean = false;

	// Graphics objects
	private boardGraphics!: Phaser.GameObjects.Graphics;
	private gridGraphics!: Phaser.GameObjects.Graphics;
	private pieceGraphics!: Phaser.GameObjects.Graphics;

	constructor() {
		super({ key: "TetrisGame" });
	}

	create() {
		this.gameOver = false;
		this.score = 0;
		this.lines = 0;
		this.level = 1;
		this.dropInterval = 1000;

		// Initialize graphics layers
		this.boardGraphics = this.add.graphics();
		this.gridGraphics = this.add.graphics();
		this.pieceGraphics = this.add.graphics();

		this.initGrid();
		this.drawBoard();
		this.spawnPiece();
	}

	private initGrid() {
		this.grid = Array(this.gridRows)
			.fill(null)
			.map(() => Array(this.gridCols).fill(null));
	}

	private drawBoard() {
		const boardWidth = this.gridCols * this.blockSize;
		const boardHeight = this.gridRows * this.blockSize;

		// Draw border
		this.boardGraphics.clear();
		this.boardGraphics.lineStyle(2, 0x00f3ff, 1);
		this.boardGraphics.strokeRect(0, 0, boardWidth, boardHeight);

		// Draw grid lines
		this.boardGraphics.lineStyle(1, 0x1a1a1a, 0.3);
		for (let y = 1; y < this.gridRows; y++) {
			this.boardGraphics.lineBetween(0, y * this.blockSize, boardWidth, y * this.blockSize);
		}
		for (let x = 1; x < this.gridCols; x++) {
			this.boardGraphics.lineBetween(x * this.blockSize, 0, x * this.blockSize, boardHeight);
		}
	}

	private renderGrid() {
		this.gridGraphics.clear();

		for (let y = 0; y < this.gridRows; y++) {
			for (let x = 0; x < this.gridCols; x++) {
				if (this.grid[y][x] !== null) {
					const px = x * this.blockSize;
					const py = y * this.blockSize;
					const color = this.grid[y][x] as number;

					// Draw block
					this.gridGraphics.fillStyle(color, 1);
					this.gridGraphics.fillRect(
						px + 1,
						py + 1,
						this.blockSize - 2,
						this.blockSize - 2,
					);

					// Draw highlight
					this.gridGraphics.fillStyle(0xffffff, 0.2);
					this.gridGraphics.fillRect(
						px + 3,
						py + 3,
						this.blockSize - 6,
						this.blockSize - 10,
					);
				}
			}
		}
	}

	spawnPiece() {
		if (this.gameOver) return;

		const shapes = ["I", "O", "T", "S", "Z", "J", "L"];
		const type = shapes[Math.floor(Math.random() * shapes.length)];

		this.currentPiece = new Tetromino(type);
		this.currentX = Math.floor(this.gridCols / 2) - Math.floor(this.currentPiece.shape.length / 2);
		this.currentY = 0;

		// Check for game over
		if (!this.canMove(0, 0)) {
			this.triggerGameOver();
			return;
		}

		this.renderCurrentPiece();
	}

	private triggerGameOver() {
		this.gameOver = true;
		this.paused = true;
		this.stopAI();

		// Dispatch game over event
		const event = new CustomEvent("tetris-gameover", {
			detail: { score: this.score, lines: this.lines, level: this.level },
		});
		window.dispatchEvent(event);
	}

	private renderCurrentPiece() {
		if (!this.currentPiece || this.gameOver) return;

		this.pieceGraphics.clear();

		for (let y = 0; y < this.currentPiece.shape.length; y++) {
			for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
				if (this.currentPiece.shape[y][x]) {
					const px = (this.currentX + x) * this.blockSize;
					const py = (this.currentY + y) * this.blockSize;

					// Draw block
					this.pieceGraphics.fillStyle(this.currentPiece.color, 1);
					this.pieceGraphics.fillRect(
						px + 1,
						py + 1,
						this.blockSize - 2,
						this.blockSize - 2,
					);

					// Draw highlight
					this.pieceGraphics.fillStyle(0xffffff, 0.3);
					this.pieceGraphics.fillRect(
						px + 3,
						py + 3,
						this.blockSize - 6,
						this.blockSize - 10,
					);
				}
			}
		}
	}

	update(time: number) {
		if (this.paused || this.gameOver) return;

		// Manual play mode - handle automatic dropping
		if (!this.useAI && time - this.lastDropTime > this.dropInterval) {
			this.moveDown();
			this.lastDropTime = time;
		}
	}

	moveLeft() {
		if (this.gameOver) return;
		if (this.canMove(-1, 0)) {
			this.currentX--;
			this.renderCurrentPiece();
		}
	}

	moveRight() {
		if (this.gameOver) return;
		if (this.canMove(1, 0)) {
			this.currentX++;
			this.renderCurrentPiece();
		}
	}

	moveDown() {
		if (this.gameOver) return;
		if (this.canMove(0, 1)) {
			this.currentY++;
			this.renderCurrentPiece();
		} else {
			this.lockPiece();
		}
	}

	rotate() {
		if (!this.currentPiece || this.gameOver) return;

		const original = this.currentPiece.clone();
		this.currentPiece.rotate();

		if (!this.canMove(0, 0)) {
			// Try wall kicks
			const kicks = [-1, 1, -2, 2];
			let kicked = false;

			for (const kick of kicks) {
				if (this.canMove(kick, 0)) {
					this.currentX += kick;
					kicked = true;
					break;
				}
			}

			if (!kicked) {
				// Restore original if wall kick failed
				this.currentPiece = original;
			}
		}

		this.renderCurrentPiece();
	}

	private canMove(offsetX: number, offsetY: number): boolean {
		if (!this.currentPiece) return false;

		for (let y = 0; y < this.currentPiece.shape.length; y++) {
			for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
				if (this.currentPiece.shape[y][x]) {
					const newX = this.currentX + x + offsetX;
					const newY = this.currentY + y + offsetY;

					if (
						newX < 0 ||
						newX >= this.gridCols ||
						newY >= this.gridRows ||
						(newY >= 0 && this.grid[newY] && this.grid[newY][newX])
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

		for (let y = this.gridRows - 1; y >= 0; y--) {
			if (this.grid[y].every((cell) => cell !== null)) {
				linesCleared++;
				this.grid.splice(y, 1);
				this.grid.unshift(Array(this.gridCols).fill(null));
				y++; // Check this line again
			}
		}

		if (linesCleared > 0) {
			this.lines += linesCleared;
			this.score += [0, 100, 300, 500, 800][linesCleared] * this.level;
			this.level = Math.floor(this.lines / 10) + 1;
			this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

			this.onScoreChange(this.score, this.lines, this.level);
		}
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
			// Resume AI if it was paused
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
		this.dropInterval = 1000;
		this.paused = false;
		this.stopAI();

		this.initGrid();
		this.renderGrid();
		this.spawnPiece();
		this.onScoreChange(0, 0, 1);
	}

	destroy() {
		this.stopAI();
		super.destroy();
	}

	setUseAI(useAI: boolean) {
		this.useAI = useAI;
		if (useAI && !this.gameOver) {
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

	async startAI() {
		if (this.isProcessingAIMove || this.gameOver) return;

		this.isProcessingAIMove = true;
		await this.scheduleNextAIMove();
	}

	private async scheduleNextAIMove() {
		if (!this.useAI || this.paused || !this.isProcessingAIMove || this.gameOver) {
			this.isProcessingAIMove = false;
			return;
		}

		await this.makeAIMove();

		// Schedule next move with a delay
		this.aiTimeout = window.setTimeout(() => {
			this.scheduleNextAIMove();
		}, 200); // 200ms delay between pieces
	}

	private async makeAIMove() {
		if (!this.currentPiece || !this.useAI || this.gameOver) {
			return;
		}

		try {
			const bestMove = await TetrisAI.getBestMove(this.grid, this.currentPiece);

			// Rotate to target rotation
			while (
				this.useAI &&
				!this.paused &&
				this.currentPiece &&
				this.currentPiece.rotation !== bestMove.rotation &&
				!this.gameOver
			) {
				this.rotate();
				await this.sleep(30);
			}

			// Move horizontally to target x
			while (
				this.useAI &&
				!this.paused &&
				this.currentPiece &&
				this.currentX !== bestMove.x &&
				!this.gameOver
			) {
				if (bestMove.x < this.currentX) {
					this.moveLeft();
				} else if (bestMove.x > this.currentX) {
					this.moveRight();
				}
				await this.sleep(30);
			}

			// Drop the piece
			if (this.useAI && !this.paused && this.currentPiece && !this.gameOver) {
				this.hardDrop();
			}
		} catch (error) {
			console.error("AI move error:", error);
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	hardDrop() {
		if (this.gameOver) return;
		while (this.canMove(0, 1)) {
			this.currentY++;
		}
		this.renderCurrentPiece();
		this.lockPiece();
	}
}
