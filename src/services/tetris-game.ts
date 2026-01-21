import Phaser from "phaser";

export interface AIMove {
	x: number;
	y: number;
	rotation: number;
	score: number;
}

export class Tetromino {
	shape: number[][];
	color: number;
	width: number;
	height: number;
	rotation: number = 0;

	constructor(type: string, color: number) {
		this.color = color;

		switch (type) {
			case "I":
				this.shape = [
					[0, 0, 0, 0],
					[1, 1, 1, 1],
				];
				this.width = 4;
				this.height = 4;
				break;
			case "O":
				this.shape = [
					[1, 1],
					[1, 1],
				];
				this.width = 4;
				this.height = 4;
				break;
			case "T":
				this.shape = [
					[0, 0, 0],
					[1, 1, 1],
				];
				this.width = 3;
				this.height = 2;
				break;
			case "S":
				this.shape = [
					[0, 1, 1],
					[1, 1, 0],
				];
				this.width = 3;
				this.height = 2;
				break;
			case "Z":
				this.shape = [
					[1, 1, 0],
					[1, 1, 1],
				];
				this.width = 3;
				this.height = 2;
				break;
			case "J":
				this.shape = [
					[0, 0, 0],
					[1, 1, 1],
				];
				this.width = 3;
				this.height = 2;
				break;
			case "L":
				this.shape = [
					[0, 0, 0],
					[1, 1, 1],
				];
				this.width = 3;
				this.height = 2;
				break;
		}
	}

	rotate() {
		const rotated = this.shape[0].map((row, i) =>
			row.map((_, j) => this.shape[this.shape.length - 1 - j][i]),
		);
		this.shape = rotated;
		this.rotation = (this.rotation + 1) % 4;
	}
}

export class TetrisAI {
	static getBestMove(grid: (number | null)[][], piece: Tetromino): AIMove {
		let bestMove: AIMove = {
			x: 0,
			y: 0,
			rotation: 0,
			score: -Infinity,
		};

		for (let rotation = 0; rotation < 4; rotation++) {
			const testPiece = new Tetromino("I", piece.color);

			for (let r = 0; r < rotation; r++) {
				testPiece.rotate();
			}

			for (let y = 0; y < 20; y++) {
				for (let x = 0; x < 10; x++) {
					if (TetrisAI.canPlace(grid, testPiece, x, y)) {
						const moveScore = TetrisAI.evaluatePosition(grid, testPiece, x, y);

						if (moveScore > bestMove.score) {
							bestMove = {
								x,
								y,
								rotation: testPiece.rotation,
								score: moveScore,
							};
						}
					}
				}
			}
		}

		return bestMove;
	}

	private static canPlace(
		grid: (number | null)[][],
		piece: Tetromino,
		x: number,
		y: number,
	): boolean {
		for (let py = 0; py < piece.shape.length; py++) {
			for (let px = 0; px < piece.shape[py].length; px++) {
				if (piece.shape[py][px]) {
					const gridY = y + py;
					const gridX = x + px;

					if (
						gridX < 0 ||
						gridX >= 10 ||
						gridY >= 20 ||
						(gridY >= 0 && grid[gridY] && grid[gridY][gridX])
					) {
						return false;
					}
				}
			}
		}

		return true;
	}

	private static evaluatePosition(
		grid: (number | null)[][],
		piece: Tetromino,
		x: number,
		y: number,
	): number {
		let aggregateHeight = 0;
		let completeLines = 0;
		let holes = 0;
		let bumpiness = 0;

		const tempGrid = grid.map((row, i) => {
			if (i < y || i >= y + piece.shape.length) {
				return row;
			}

			const newRow = [...row];
			for (let px = 0; px < piece.shape[px].length; px++) {
				if (piece.shape[px][px]) {
					newRow[x + px] = piece.color;
				}
			}

			return newRow;
		});

		for (let row = 0; row < 20; row++) {
			if (tempGrid[row].every((cell) => cell !== null)) {
				completeLines++;
			}
		}

		for (let col = 0; col < 10; col++) {
			let colHeight = 0;
			let blockFound = false;

			for (let row = 0; row < 20; row++) {
				if (tempGrid[row][col] !== null) {
					if (!blockFound) {
						colHeight = row - col;
						blockFound = true;
					}
				} else if (blockFound && tempGrid[row][col] === null) {
					holes++;
				}
			}

			aggregateHeight += colHeight;

			if (col > 0) {
				const prevHeight = colHeight;
				colHeight = colHeight;
				bumpiness += Math.abs(colHeight - prevHeight);
			}
		}

		return (
			completeLines * 0.76 +
			aggregateHeight * -0.51 +
			holes * -0.36 +
			bumpiness * -0.18
		);
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

	constructor() {
		super({ key: "TetrisGame" });
	}

	create() {
		this.initGrid();
		this.createBoard();
		this.spawnPiece();
	}

	private initGrid() {
		this.grid = Array(this.gridRows)
			.fill(null)
			.map(() => Array(this.gridCols).fill(null));
	}

	private createBoard() {
		const graphics = this.add.graphics();
		this.drawBoard(graphics);
	}

	private drawBoard(graphics: Phaser.GameObjects.Graphics) {
		const boardWidth = this.gridCols * this.blockSize;
		const boardHeight = this.gridRows * this.blockSize;

		graphics.lineStyle(2, 0x00f3ff, 1);
		graphics.strokeRect(0, 0, boardWidth, boardHeight);

		graphics.lineStyle(1, 0x1a1a1a, 0.5);

		for (let y = 0; y < this.gridRows; y++) {
			for (let x = 0; x < this.gridCols; x++) {
				const px = x * this.blockSize;
				const py = y * this.blockSize;

				if (this.grid[y] && this.grid[y][x]) {
					graphics.fillStyle(0x00f3ff, 1);
					graphics.fillRect(
						px + 1,
						py + 1,
						this.blockSize - 2,
						this.blockSize - 2,
					);

					graphics.fillStyle(0x0066ff, 0.3);
					graphics.fillRect(
						px + 5,
						py + 5,
						this.blockSize - 10,
						this.blockSize - 10,
					);
				}
			}
		}
	}

	spawnPiece() {
		const shapes = ["I", "O", "T", "S", "Z", "J", "L"];
		const shape = shapes[Math.floor(Math.random() * shapes.length)];
		const colors = [
			0x00f3ff, 0xff00ff, 0x0066ff, 0xffff00, 0x00ff00, 0x00ff00, 0x00ffff,
		];
		const color = colors[Math.floor(Math.random() * colors.length)];

		this.currentPiece = new Tetromino(shape, color);
		this.currentX =
			Math.floor(this.gridCols / 2) - Math.floor(this.currentPiece.width / 2);
		this.currentY = 0;

		this.renderCurrentPiece();
	}

	private renderCurrentPiece() {
		if (!this.currentPiece) return;

		this.removeCurrentPiece();
		const graphics = this.add.graphics();

		for (let y = 0; y < this.currentPiece.shape.length; y++) {
			for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
				if (this.currentPiece.shape[y][x]) {
					const px = (this.currentX + x) * this.blockSize;
					const py = (this.currentY + y) * this.blockSize;

					graphics.fillStyle(this.currentPiece.color, 1);
					graphics.fillRect(
						px + 1,
						py + 1,
						this.blockSize - 2,
						this.blockSize - 2,
					);

					graphics.fillStyle(0x0066ff, 0.3);
					graphics.fillRect(
						px + 5,
						py + 5,
						this.blockSize - 10,
						this.blockSize - 10,
					);
				}
			}
		}

		this.drawBoard();
	}

	private removeCurrentPiece() {
		this.children.list
			.slice()
			.filter((obj) => obj.type === "Graphics")
			.forEach((graphics) => {
				this.remove(graphics);
			});
	}

	update(time: number) {
		if (this.paused || this.useAI) return;

		if (time - this.lastDropTime > this.dropInterval) {
			this.moveDown();
			this.lastDropTime = time;
		}
	}

	moveLeft() {
		if (this.canMove(-1, 0)) {
			this.currentX--;
			this.renderCurrentPiece();
		}
	}

	moveRight() {
		if (this.canMove(1, 0)) {
			this.currentX++;
			this.renderCurrentPiece();
		}
	}

	moveDown() {
		if (this.canMove(0, 1)) {
			this.currentY++;
		} else {
			this.lockPiece();
		}
		this.renderCurrentPiece();
	}

	rotate() {
		if (!this.currentPiece) return;

		this.currentPiece.rotate();
		if (this.canMove(0, 0)) {
			this.renderCurrentPiece();
		}
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
		if (!this.currentPiece) return;

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
		this.spawnPiece();
	}

	private clearLines() {
		let linesCleared = 0;

		for (let y = this.gridRows - 1; y >= 0; y--) {
			if (this.grid[y] && this.grid[y].every((cell) => cell !== null)) {
				linesCleared++;

				for (let k = y; k > 0; k--) {
					this.grid[k] = this.grid[k - 1];
				}
			}
		}

		if (linesCleared > 0) {
			this.lines += linesCleared;
			this.score += linesCleared * 100 * this.level;
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
	}

	setUseAI(useAI: boolean) {
		this.useAI = useAI;
		if (useAI) {
			this.startAI();
		}
	}

	async startAI() {
		while (this.useAI && !this.paused) {
			await this.makeAIMove();
			await new Promise((resolve) => setTimeout(resolve, 200));
		}
	}

	async makeAIMove() {
		if (!this.currentPiece) {
			this.spawnPiece();
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		const bestMove = TetrisAI.getBestMove(this.grid, this.currentPiece!);

		while (
			this.currentX !== bestMove.x ||
			this.currentY !== bestMove.y ||
			this.currentPiece.rotation !== bestMove.rotation
		) {
			if (bestMove.rotation !== this.currentPiece.rotation) {
				this.rotate();
			} else if (bestMove.x < this.currentX) {
				this.moveLeft();
			} else if (bestMove.x > this.currentX) {
				this.moveRight();
			} else if (bestMove.y > this.currentY) {
				this.moveDown();
			}

			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}

	hardDrop() {
		while (this.canMove(0, 1)) {
			this.moveDown();
		}
	}
}
