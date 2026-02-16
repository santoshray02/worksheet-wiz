import type { SVGElementNode } from '$lib/engine/types';
import type { PatternData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createGroup } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// PatternTemplate
// ---------------------------------------------------------------------------

/**
 * Renders pattern completion activities. A sequence of items is displayed
 * in a horizontal row with some items hidden (blank boxes). Answer options
 * are shown below for the child to choose from.
 */
export class PatternTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'pattern') {
			throw new Error(`PatternTemplate received wrong activity type: ${data.type}`);
		}

		const patternData = data as PatternData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const sequence = patternData.sequence;
		const missingSet = new Set(patternData.missingIndices);
		const fontSize = this.difficulty.fontSize;

		if (sequence.length === 0) return elements;

		// Sequence row
		const cellSize = Math.min((width - 10) / sequence.length, 18);
		const totalWidth = cellSize * sequence.length;
		const startX = x + (width - totalWidth) / 2;
		const seqY = y + 8;

		for (let i = 0; i < sequence.length; i++) {
			const cx = startX + i * cellSize + cellSize / 2;
			const cy = seqY + cellSize / 2;
			const isMissing = missingSet.has(i);

			// Cell background
			elements.push(
				createRect(startX + i * cellSize + 0.5, seqY + 0.5, cellSize - 1, cellSize - 1, {
					fill: isMissing ? '#fef3c7' : '#f8fafc',
					stroke: isMissing ? '#f59e0b' : '#d1d5db',
					'stroke-width': isMissing ? 0.5 : 0.3,
					rx: 1,
					ry: 1
				})
			);

			if (isMissing) {
				// Question mark for missing items
				elements.push(
					createText(cx, cy + fontSize * 0.35, '?', {
						'font-size': fontSize * 1.2,
						'font-family': 'sans-serif',
						'font-weight': 'bold',
						'text-anchor': 'middle',
						fill: '#d97706'
					})
				);
			} else {
				// Show the sequence item
				elements.push(
					createText(cx, cy + fontSize * 0.35, sequence[i], {
						'font-size': fontSize,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						fill: '#1f2937'
					})
				);
			}
		}

		// Options row below the sequence
		if (patternData.options.length > 0) {
			const optionsY = seqY + cellSize + 10;
			const optionWidth = Math.min((width - 10) / patternData.options.length, 20);
			const optionsTotalWidth = optionWidth * patternData.options.length;
			const optionsStartX = x + (width - optionsTotalWidth) / 2;

			// "Choose from:" label
			elements.push(
				createText(x + width / 2, optionsY - 2, 'Choose from:', {
					'font-size': fontSize * 0.7,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					fill: '#6b7280'
				})
			);

			for (let i = 0; i < patternData.options.length; i++) {
				const cx = optionsStartX + i * optionWidth + optionWidth / 2;
				const cy = optionsY + optionWidth / 2;

				elements.push(
					createRect(
						optionsStartX + i * optionWidth + 0.5,
						optionsY + 0.5,
						optionWidth - 1,
						optionWidth - 1,
						{
							fill: '#eff6ff',
							stroke: '#93c5fd',
							'stroke-width': 0.3,
							rx: 1,
							ry: 1
						}
					)
				);

				elements.push(
					createText(cx, cy + fontSize * 0.35, patternData.options[i], {
						'font-size': fontSize,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						fill: '#1e40af'
					})
				);
			}
		}

		return [createGroup(elements, { class: 'pattern-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'pattern',
	(layout, difficulty) => new PatternTemplate(layout, difficulty)
);
