import type { SVGElementNode } from '$lib/engine/types';
import type { MazeData, MazeWall, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createLine, createGroup, createText, createCircle, createRect } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// Maze generation helper
// ---------------------------------------------------------------------------

interface Cell {
	row: number;
	col: number;
	visited: boolean;
	walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

/**
 * Generate maze wall data using a recursive backtracker algorithm.
 *
 * Returns an array of MazeWall objects representing walls that should
 * be drawn. Only walls that remain after carving the maze are included.
 */
export function generateMaze(
	rows: number,
	cols: number,
	seed?: number
): MazeWall[] {
	// Simple seeded pseudo-random number generator
	let s = seed ?? Math.floor(Math.random() * 100000);
	function random(): number {
		s = (s * 1664525 + 1013904223) & 0xffffffff;
		return (s >>> 0) / 0xffffffff;
	}

	// Initialise grid
	const grid: Cell[][] = [];
	for (let r = 0; r < rows; r++) {
		grid[r] = [];
		for (let c = 0; c < cols; c++) {
			grid[r][c] = {
				row: r,
				col: c,
				visited: false,
				walls: { top: true, right: true, bottom: true, left: true }
			};
		}
	}

	// Recursive backtracker
	const stack: Cell[] = [];
	const start = grid[0][0];
	start.visited = true;
	stack.push(start);

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		const neighbours = getUnvisitedNeighbours(current, grid, rows, cols);

		if (neighbours.length === 0) {
			stack.pop();
		} else {
			const next = neighbours[Math.floor(random() * neighbours.length)];
			removeWallBetween(current, next);
			next.visited = true;
			stack.push(next);
		}
	}

	// Remove entrance and exit walls
	grid[0][0].walls.left = false;
	grid[rows - 1][cols - 1].walls.right = false;

	// Collect remaining walls
	const walls: MazeWall[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const cell = grid[r][c];
			if (cell.walls.top) walls.push({ row: r, col: c, side: 'top' });
			if (cell.walls.right) walls.push({ row: r, col: c, side: 'right' });
			if (cell.walls.bottom) walls.push({ row: r, col: c, side: 'bottom' });
			if (cell.walls.left) walls.push({ row: r, col: c, side: 'left' });
		}
	}

	return walls;
}

function getUnvisitedNeighbours(
	cell: Cell,
	grid: Cell[][],
	rows: number,
	cols: number
): Cell[] {
	const neighbours: Cell[] = [];
	const { row, col } = cell;

	if (row > 0 && !grid[row - 1][col].visited) neighbours.push(grid[row - 1][col]);
	if (row < rows - 1 && !grid[row + 1][col].visited) neighbours.push(grid[row + 1][col]);
	if (col > 0 && !grid[row][col - 1].visited) neighbours.push(grid[row][col - 1]);
	if (col < cols - 1 && !grid[row][col + 1].visited) neighbours.push(grid[row][col + 1]);

	return neighbours;
}

function removeWallBetween(a: Cell, b: Cell): void {
	const dr = b.row - a.row;
	const dc = b.col - a.col;

	if (dr === -1) {
		a.walls.top = false;
		b.walls.bottom = false;
	} else if (dr === 1) {
		a.walls.bottom = false;
		b.walls.top = false;
	} else if (dc === -1) {
		a.walls.left = false;
		b.walls.right = false;
	} else if (dc === 1) {
		a.walls.right = false;
		b.walls.left = false;
	}
}

// ---------------------------------------------------------------------------
// MazeTemplate
// ---------------------------------------------------------------------------

/**
 * Renders a maze activity. Walls are drawn as thick line segments.
 * Start and finish markers are placed at the entrance and exit.
 */
export class MazeTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	/** Static convenience method for generating maze wall data */
	static generateMaze(rows: number, cols: number, seed?: number): MazeWall[] {
		return generateMaze(rows, cols, seed);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'maze') {
			throw new Error(`MazeTemplate received wrong activity type: ${data.type}`);
		}

		const mazeData = data as MazeData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const mazeRows = mazeData.height;
		const mazeCols = mazeData.width;
		const cellSize = this.difficulty.gridSize;

		// Calculate the total maze dimensions and centre it in the zone
		const mazeWidth = mazeCols * cellSize;
		const mazeHeight = mazeRows * cellSize;
		const offsetX = x + (width - mazeWidth) / 2;
		const offsetY = y + (height - mazeHeight) / 2;

		const wallStroke = 0.5;

		// Draw walls
		for (const wall of mazeData.walls) {
			const cellX = offsetX + wall.col * cellSize;
			const cellY = offsetY + wall.row * cellSize;

			let x1: number, y1: number, x2: number, y2: number;

			switch (wall.side) {
				case 'top':
					x1 = cellX;
					y1 = cellY;
					x2 = cellX + cellSize;
					y2 = cellY;
					break;
				case 'right':
					x1 = cellX + cellSize;
					y1 = cellY;
					x2 = cellX + cellSize;
					y2 = cellY + cellSize;
					break;
				case 'bottom':
					x1 = cellX;
					y1 = cellY + cellSize;
					x2 = cellX + cellSize;
					y2 = cellY + cellSize;
					break;
				case 'left':
					x1 = cellX;
					y1 = cellY;
					x2 = cellX;
					y2 = cellY + cellSize;
					break;
			}

			elements.push(
				createLine(x1!, y1!, x2!, y2!, {
					stroke: '#1f2937',
					'stroke-width': wallStroke,
					'stroke-linecap': 'round'
				})
			);
		}

		// Start marker
		const startX = offsetX + mazeData.start.x * cellSize + cellSize / 2;
		const startY = offsetY + mazeData.start.y * cellSize + cellSize / 2;
		elements.push(
			createCircle(startX, startY, cellSize * 0.25, {
				fill: '#22c55e',
				'fill-opacity': 0.6
			})
		);
		elements.push(
			createText(startX, startY + this.difficulty.fontSize * 0.35, 'S', {
				'font-size': this.difficulty.fontSize * 0.7,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				'text-anchor': 'middle',
				fill: '#166534'
			})
		);

		// Finish marker
		const endX = offsetX + mazeData.end.x * cellSize + cellSize / 2;
		const endY = offsetY + mazeData.end.y * cellSize + cellSize / 2;
		elements.push(
			createCircle(endX, endY, cellSize * 0.25, {
				fill: '#ef4444',
				'fill-opacity': 0.6
			})
		);
		elements.push(
			createText(endX, endY + this.difficulty.fontSize * 0.35, 'F', {
				'font-size': this.difficulty.fontSize * 0.7,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				'text-anchor': 'middle',
				fill: '#991b1b'
			})
		);

		return [createGroup(elements, { class: 'maze-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register('maze', (layout, difficulty) => new MazeTemplate(layout, difficulty));
