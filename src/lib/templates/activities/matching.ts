import type { SVGElementNode } from '$lib/engine/types';
import type { MatchingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createCircle, createGroup, createLine } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// MatchingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders matching activities with a left column and a shuffled right
 * column. Dots at connection points indicate where children should
 * draw lines to match pairs.
 */
export class MatchingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'matching') {
			throw new Error(`MatchingTemplate received wrong activity type: ${data.type}`);
		}

		const matchingData = data as MatchingData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];
		const pairs = matchingData.pairs;

		if (pairs.length === 0) return elements;

		const fontSize = this.difficulty.fontSize;
		const rowHeight = Math.min(height / pairs.length, 20);
		const leftColX = x + 10;
		const rightColX = x + width - 10;
		const dotLeftX = x + width * 0.35;
		const dotRightX = x + width * 0.65;
		const dotRadius = 1.2;

		// Shuffle right column indices for display (deterministic simple shuffle)
		const rightIndices = pairs.map((_, idx) => idx);
		for (let i = rightIndices.length - 1; i > 0; i--) {
			const j = (i * 7 + 3) % (i + 1); // deterministic pseudo-shuffle
			[rightIndices[i], rightIndices[j]] = [rightIndices[j], rightIndices[i]];
		}

		for (let i = 0; i < pairs.length; i++) {
			const pair = pairs[i];
			const rowY = y + i * rowHeight + rowHeight / 2 + fontSize * 0.35;

			// Left label
			elements.push(
				createText(leftColX, rowY, pair.left, {
					'font-size': fontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'start',
					fill: '#000000'
				})
			);

			// Left dot (connection point)
			elements.push(
				createCircle(dotLeftX, rowY, dotRadius, {
					fill: '#374151',
					stroke: '#374151',
					'stroke-width': 0.2
				})
			);

			// Right dot (connection point)
			elements.push(
				createCircle(dotRightX, rowY, dotRadius, {
					fill: '#374151',
					stroke: '#374151',
					'stroke-width': 0.2
				})
			);

			// Right label (shuffled)
			const rightPair = pairs[rightIndices[i]];
			elements.push(
				createText(rightColX, rowY, rightPair.right, {
					'font-size': fontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'end',
					fill: '#000000'
				})
			);
		}

		// Draw a light vertical separator in the middle
		elements.push(
			createLine(x + width / 2, y, x + width / 2, y + pairs.length * rowHeight, {
				stroke: '#e5e7eb',
				'stroke-width': 0.2,
				'stroke-dasharray': '1 2'
			})
		);

		return [createGroup(elements, { class: 'matching-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'matching',
	(layout, difficulty) => new MatchingTemplate(layout, difficulty)
);
