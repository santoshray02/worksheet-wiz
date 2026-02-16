import type { SVGElementNode } from '$lib/engine/types';
import type { CrosswordData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createGroup } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// CrosswordTemplate
// ---------------------------------------------------------------------------

/**
 * Renders crossword puzzle activities. The grid is drawn with black
 * and white cells. Clue numbers are placed in the top-left of relevant
 * cells. Across and down clues are listed below the grid.
 */
export class CrosswordTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'crossword') {
			throw new Error(`CrosswordTemplate received wrong activity type: ${data.type}`);
		}

		const cwData = data as CrosswordData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const grid = cwData.grid;
		const rows = grid.length;
		const cols = rows > 0 ? grid[0].length : 0;

		if (rows === 0 || cols === 0) return elements;

		const cellSize = this.difficulty.gridSize;
		const fontSize = this.difficulty.fontSize;

		// Centre the grid, leaving room for clues below
		const gridWidth = cols * cellSize;
		const gridHeight = rows * cellSize;
		const clueAreaHeight = Math.min(60, height * 0.4);
		const totalContentHeight = gridHeight + clueAreaHeight + 5;
		const offsetX = x + (width - gridWidth) / 2;
		const offsetY = y + Math.max(0, (height - totalContentHeight) / 2);

		// Draw grid cells
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = grid[r][c];
				const cellX = offsetX + c * cellSize;
				const cellY = offsetY + r * cellSize;

				elements.push(
					createRect(cellX, cellY, cellSize, cellSize, {
						fill: cell.isBlack ? '#1f2937' : '#ffffff',
						stroke: '#6b7280',
						'stroke-width': 0.2
					})
				);

				// Clue number in top-left corner
				if (cell.clueNumber != null && !cell.isBlack) {
					elements.push(
						createText(cellX + 0.8, cellY + fontSize * 0.4 + 0.5, String(cell.clueNumber), {
							'font-size': fontSize * 0.35,
							'font-family': 'sans-serif',
							fill: '#374151'
						})
					);
				}
			}
		}

		// Clue area
		const clueY = offsetY + gridHeight + 5;
		const clueFontSize = Math.min(fontSize * 0.6, 3);
		const clueLineHeight = clueFontSize + 1.5;

		// Across clues (left half)
		elements.push(
			createText(x + 2, clueY, 'Across', {
				'font-size': clueFontSize,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				fill: '#1f2937'
			})
		);

		for (let i = 0; i < cwData.clues.across.length; i++) {
			const clue = cwData.clues.across[i];
			elements.push(
				createText(x + 4, clueY + (i + 1) * clueLineHeight, `${clue.number}. ${clue.text}`, {
					'font-size': clueFontSize,
					'font-family': 'sans-serif',
					fill: '#374151'
				})
			);
		}

		// Down clues (right half)
		const downX = x + width / 2 + 2;
		elements.push(
			createText(downX, clueY, 'Down', {
				'font-size': clueFontSize,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				fill: '#1f2937'
			})
		);

		for (let i = 0; i < cwData.clues.down.length; i++) {
			const clue = cwData.clues.down[i];
			elements.push(
				createText(downX + 2, clueY + (i + 1) * clueLineHeight, `${clue.number}. ${clue.text}`, {
					'font-size': clueFontSize,
					'font-family': 'sans-serif',
					fill: '#374151'
				})
			);
		}

		return [createGroup(elements, { class: 'crossword-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'crossword',
	(layout, difficulty) => new CrosswordTemplate(layout, difficulty)
);
