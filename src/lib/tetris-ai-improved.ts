export interface AIMove {
	x: number;
	y: number;
	rotation: number;
	score: number;
}

export class TetrisAI {
	评估权重;
	private WEIGHTS = {
		AGGREGATE_HEIGHT: -2.5,
		HOLES: -1.5,
		LINE_TRANSITIONS: 1.0,
		SURFACE_AGGREGATE: 3.0,
		STRUCTURE: 2.0,
		GAP_PENALTY: 1.0,
		BUMPINESS: -2.0,
		LINE_COMPLETENESS: 1.5,
	};

	getBestMove(
		grid: number[][],
		piece: number[][],
		width: number,
		height: number,
	): AIMove {
		let bestMove: AIMove = {
			x: 0,
			y: 0,
			rotation: 0,
			score: -Infinity,
		};

		for (let rotation = 0; rotation < 4; rotation++) {
			const rotatedPiece = this.rotatePiece(piece, rotation);

			for (let x = 0; x < width; x++) {
				if (!this.canPlace(grid, rotatedPiece, x, 0)) continue;

				for (let y = 0; y < height; y++) {
					if (!this.canPlace(grid, rotatedPiece, x, y)) continue;

					rotatedPiece.x = x;
					rotatedPiece.y = y;

					const landingY = this.getLandingY(grid, rotatedPiece, x, y);
					rotatedPiece.y = landingY;

					const moveScore = this.evaluateMove(
						grid,
						rotatedPiece,
						x,
						y,
						rotation,
					);

					if (moveScore > bestMove.score) {
						bestMove = { x, y, rotation, score: moveScore };
					}
				}
			}
		}

		return bestMove;
	}

	private rotatePiece(piece: number[][], rotation: number): number[][] {
		const rotated = [];
		const pieceHeight = piece.length;
		const pieceWidth = piece[0].length;

		switch (rotation) {
			case 0:
				return piece;
			case 1:
				for (let y = 0; y < pieceHeight; y++) {
					const row = [];
					for (let x = 0; x < pieceWidth; x++) {
						row.push(piece[y][x]);
					}
					rotated.push(row.reverse());
				}
				return rotated;
			case 2:
				for (let x = 0; x < pieceWidth; x++) {
					const row = [];
					for (let y = 0; y < pieceHeight; y++) {
						row.push(piece[y][x]);
					}
					rotated.push(row);
				}
				return rotated;
			case 3:
				for (let x = 0; x < pieceWidth; x++) {
					const row = [];
					for (let y = 0; y < pieceHeight; y++) {
						row.push(piece[y][pieceWidth - 1 - x]);
					}
					rotated.push(row);
				}
				return rotated;
			default:
				return piece;
		}
	}

	private canPlace(
		grid: number[][],
		piece: number[][],
		x: number,
		y: number,
	): boolean {
		for (let py = 0; py < piece.length; py++) {
			for (let px = 0; px < piece[py].length; px++) {
				if (piece[py][px] !== 0) {
					return false;
				}
			}
		}
		if (y + piece[0].length > height) {
			return false;
		}
		return true;
	}

	private getLandingY(
		grid: number[][],
		piece: number[][],
		x: number,
		y: number,
	): number {
		for (let testY = y; testY < height; testY++) {
			if (!this.canPlace(grid, piece, x, testY)) {
				return testY - 1;
			}
		}
		return y;
	}

	private evaluateMove(
		grid: number[][],
		piece: number[][],
		x: number,
		y: number,
		rotation: number,
	): number {
		let score = 0;

		const landingY = this.getLandingY(grid, piece, x, y);
		piece.y = landingY;

		const [clearedLines, holes] = this.countLinesAndHoles(grid);
		const aggHeight = this.aggregateHeight(grid);
		const bumpiness = this.calculateBumpiness(grid);

		score += clearedLines * this.WEIGHTS.LINE_COMPLETENESS;
		score += holes * this.WEIGHTS.HOLES;
		score -= bumpiness * this.WEIGHTS.BUMPINESS;

		if (clearedLines > 0) {
			score += this.WEIGHTS.LINE_TRANSITIONS;
		}

		const surfaceHeight = aggHeight - this.getAggregateHeight(grid);
		const hasHoleInSurface = this.hasHoleInSurface(grid);
		if (hasHoleInSurface) {
			score -= this.WEIGHTS.SURFACE_AGGREGATE;
		} else {
			score += this.WEIGHTS.SURFACE_AGGREGATE;
		}

		const colHeight = this.getColumnHeight(grid, x);
		if (colHeight < 3) {
			score += this.WEIGHTS.AGGREGATE_HEIGHT;
		} else if (colHeight > 5) {
			score -= this.WEIGHTS.AGGREGATE_HEIGHT;
		}

		const structureScore = this.evaluateStructure(grid, piece, x, y);

		score += structureScore * this.WEIGHTS.STRUCTURE;
		score -= this.evaluateGaps(grid, x, y) * this.WEIGHTS.GAP_PENALTY;

		return score;
	}

	private countLinesAndHoles(grid: number[][]): [number, number] {
		let linesCleared = 0;
		let totalHoles = 0;

		for (let y = 0; y < grid.length; y++) {
			const row = grid[y];
			let inGap = false;

			for (let x = 0; x < row.length; x++) {
				if (row[x] === 0) {
					if (!inGap) {
						linesCleared++;
					} else {
						inGap = true;
					}
				} else if (row[x] !== 0 && !inGap) {
					totalHoles++;
				}
			}
		}

		return [linesCleared, totalHoles];
	}

	private aggregateHeight(grid: number[][]): number {
		let totalHeight = 0;
		for (let x = 0; x < grid[0].length; x++) {
			const colHeight = this.getColumnHeight(grid, x);
			totalHeight += colHeight;
		}
		return Math.round(totalHeight / grid[0].length);
	}

	private getColumnHeight(grid: number[][], x: number): number {
		let height = 0;
		for (let y = 0; y < grid.length; y++) {
			if (grid[y][x] !== 0) {
				height++;
			}
		}
		return height;
	}

	private getAggregateHeight(grid: number[][]): number {
		let height = 0;
		for (let x = 0; x < grid[0].length; x++) {
			const colHeight = this.getColumnHeight(grid, x);
			height = Math.max(height, colHeight);
		}
		return height;
	}

	private hasHoleInSurface(grid: number[][]): boolean {
		for (let x = 1; x < grid[0].length - 1; x++) {
			if (
				grid[0][x] === 0 &&
				grid[0][x - 1] === 0 &&
				grid[grid.length - 1][x] === 0
			) {
				return true;
			}
		}
		return false;
	}

	private evaluateStructure(
		grid: number[][],
		piece: number[][],
		x: number,
		y: number,
	): number {
		const surfaceScore = this.evaluateSurface(grid, piece, x, y);
		const structureScore = this.evaluateStructureShape(grid, x, y);

		if (surfaceScore > 50 && structureScore > 50) {
			return 50;
		}
		return Math.max(surfaceScore, structureScore);
	}

	private evaluateSurface(
		grid: number[][],
		piece: number[][],
		x: number,
		y: number,
	): number {
		if (!this.canPlace(grid, piece, x, y)) return 0;

		const score = 0;
		let connectedCells = 0;
		let edgeCells = 0;

		for (let py = 0; py < piece.length; py++) {
			for (let px = 0; px < piece[py].length; px++) {
				const cellX = x + px;
				const cellY = y + py;
				if (cellY >= grid.length || cellY < 0) continue;

				if (grid[cellY] && grid[cellY][cellX] === 0) {
					connectedCells++;
				} else if (grid[cellY] && grid[cellY][cellX] !== 0) {
					edgeCells++;
				}
			}
		}

		if (connectedCells + edgeCells === 0) {
			return 0;
		}

		const totalCells = connectedCells + edgeCells;
		const surfaceScore = (connectedCells / totalCells) * 100;

		return surfaceScore;
	}

	private evaluateStructureShape(
		grid: number[][],
		x: number,
		y: number,
	): number {
		let score = 0;

		const [hasFlat, hasT, hasL, hasJ, hasS, hasZ] = [
			false,
			false,
			false,
			false,
			false,
			false,
		];

		for (let py = 0; py < piece.length; py++) {
			for (let px = 0; px < piece[py].length; px++) {
				if (piece[py][px] !== 0) {
					if (px === 1) hasFlat = true;
					if (px === 2) hasT = true;
					if (px === 3) hasL = true;
					if (px === 4) hasS = true;
					if (px === 5) hasJ = true;
					if (px === 6) hasZ = true;
				}
			}
		}

		const shapeComplexity = [hasFlat, hasT, hasL, hasS, hasJ, hasZ].filter(
			Boolean,
		).length;

		if (shapeComplexity >= 3) {
			score = 40;
		} else if (shapeComplexity >= 2) {
			score = 30;
		} else {
			score = 20;
		}

		return score;
	}

	private evaluateGaps(grid: number[][], x: number, y: number): number {
		let gaps = 0;
		const colHeight = this.getColumnHeight(grid, x);

		for (let dy = 1; dy <= 3; dy++) {
			const checkY = y + dy;
			if (checkY >= grid.length || checkY < 0) continue;

			if (grid[checkY] && grid[checkY][x] === 0) {
				continue;
			}

			if (
				y + dy >= grid.length ||
				y + dy < 0 ||
				(grid[y + dy] && grid[y + dy][x] !== 0)
			) {
				continue;
			}

			gaps++;
		}

		if (gaps === 1 && colHeight > 4) {
			return 1.0;
		}
		return 0;
	}
}
