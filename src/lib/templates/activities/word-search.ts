import type { SVGElementNode } from '$lib/engine/types';
import type { WordSearchData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createGroup, createLine } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// WordSearchTemplate
// ---------------------------------------------------------------------------

/**
 * Renders a word search grid and a word bank. The grid is a 2D array
 * of single characters laid out in a square grid. The word list is
 * displayed below or beside the grid for reference.
 */
export class WordSearchTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'word-search') {
			throw new Error(`WordSearchTemplate received wrong activity type: ${data.type}`);
		}

		const wsData = data as WordSearchData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const grid = wsData.grid;
		const rows = wsData.size.rows;
		const cols = wsData.size.cols;

		if (rows === 0 || cols === 0) return elements;

		const cellSize = this.difficulty.gridSize;
		const fontSize = this.difficulty.fontSize * 0.8;

		// Centre the grid in the zone (leaving room for word bank below)
		const gridWidth = cols * cellSize;
		const gridHeight = rows * cellSize;
		const wordBankHeight = 20;
		const totalContentHeight = gridHeight + wordBankHeight + 5;
		const offsetX = x + (width - gridWidth) / 2;
		const offsetY = y + (height - totalContentHeight) / 2;

		// Grid background
		elements.push(
			createRect(offsetX, offsetY, gridWidth, gridHeight, {
				fill: '#fafafa',
				stroke: '#e5e7eb',
				'stroke-width': 0.2
			})
		);

		// Grid lines
		for (let r = 0; r <= rows; r++) {
			elements.push(
				createLine(offsetX, offsetY + r * cellSize, offsetX + gridWidth, offsetY + r * cellSize, {
					stroke: '#d1d5db',
					'stroke-width': 0.15
				})
			);
		}
		for (let c = 0; c <= cols; c++) {
			elements.push(
				createLine(
					offsetX + c * cellSize,
					offsetY,
					offsetX + c * cellSize,
					offsetY + gridHeight,
					{
						stroke: '#d1d5db',
						'stroke-width': 0.15
					}
				)
			);
		}

		// Grid letters
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const letter = grid[r] && grid[r][c] ? grid[r][c].toUpperCase() : '';
				const cx = offsetX + c * cellSize + cellSize / 2;
				const cy = offsetY + r * cellSize + cellSize / 2;

				elements.push(
					createText(cx, cy + fontSize * 0.35, letter, {
						'font-size': fontSize,
						'font-family': 'monospace',
						'font-weight': 'bold',
						'text-anchor': 'middle',
						fill: '#1f2937'
					})
				);
			}
		}

		// Word bank
		const bankY = offsetY + gridHeight + 5;
		const bankFontSize = fontSize * 0.8;

		elements.push(
			createText(x + width / 2, bankY, 'Find these words:', {
				'font-size': bankFontSize,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				'text-anchor': 'middle',
				fill: '#4b5563'
			})
		);

		// Arrange words in columns
		const wordCols = Math.min(wsData.words.length, 4);
		const wordColWidth = width / wordCols;

		for (let i = 0; i < wsData.words.length; i++) {
			const col = i % wordCols;
			const row = Math.floor(i / wordCols);
			const wx = x + col * wordColWidth + wordColWidth / 2;
			const wy = bankY + bankFontSize + 3 + row * (bankFontSize + 2);

			elements.push(
				createText(wx, wy, wsData.words[i].toUpperCase(), {
					'font-size': bankFontSize,
					'font-family': 'monospace',
					'text-anchor': 'middle',
					fill: '#374151'
				})
			);
		}

		return [createGroup(elements, { class: 'word-search-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'word-search',
	(layout, difficulty) => new WordSearchTemplate(layout, difficulty)
);
