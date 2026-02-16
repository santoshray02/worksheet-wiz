import type { SVGElementNode } from '$lib/engine/types';
import type { SpellingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createGroup, createLine } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { stackVertically } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// SpellingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders spelling activities. Each word is shown with individual
 * letter boxes. An optional hint and/or image reference can appear
 * alongside the word.
 */
export class SpellingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'spelling') {
			throw new Error(`SpellingTemplate received wrong activity type: ${data.type}`);
		}

		const spellingData = data as SpellingData;
		const elements: SVGElementNode[] = [];
		const words = spellingData.words;

		if (words.length === 0) return elements;

		const rows = stackVertically(zone, words.length, 2);
		const fontSize = this.difficulty.fontSize;
		const letterBoxSize = Math.min(fontSize * 2, 10);

		for (let i = 0; i < words.length && i < rows.length; i++) {
			const word = words[i];
			const { x, y, width, height } = rows[i].bounds;
			const wordElements: SVGElementNode[] = [];

			// Word number
			wordElements.push(
				createText(x + 2, y + height / 2 + fontSize * 0.35, `${i + 1}.`, {
					'font-size': fontSize * 0.8,
					'font-family': 'sans-serif',
					fill: '#888888'
				})
			);

			// Hint text (if present)
			const hintOffset = word.hint ? fontSize * 0.8 + 3 : 0;
			if (word.hint) {
				wordElements.push(
					createText(x + 10, y + fontSize + 1, word.hint, {
						'font-size': fontSize * 0.7,
						'font-family': 'sans-serif',
						'font-style': 'italic',
						fill: '#6b7280'
					})
				);
			}

			// Letter boxes
			const letters = word.word.split('');
			const totalBoxWidth = letters.length * (letterBoxSize + 1);
			const boxStartX = x + 10;
			const boxY = y + hintOffset + (height - hintOffset) / 2 - letterBoxSize / 2;

			for (let j = 0; j < letters.length; j++) {
				const bx = boxStartX + j * (letterBoxSize + 1);

				// Box outline
				wordElements.push(
					createRect(bx, boxY, letterBoxSize, letterBoxSize, {
						fill: '#fafafa',
						stroke: '#d1d5db',
						'stroke-width': 0.3,
						rx: 0.5,
						ry: 0.5
					})
				);

				// Guide letter (first letter shown as hint for younger children)
				if (j === 0 && this.difficulty.showHints) {
					wordElements.push(
						createText(
							bx + letterBoxSize / 2,
							boxY + letterBoxSize / 2 + fontSize * 0.35,
							letters[j].toUpperCase(),
							{
								'font-size': fontSize,
								'font-family': 'sans-serif',
								'text-anchor': 'middle',
								fill: '#d1d5db'
							}
						)
					);
				}
			}

			elements.push(createGroup(wordElements, { class: `spelling-word-${i}` }));
		}

		return [createGroup(elements, { class: 'spelling-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'spelling',
	(layout, difficulty) => new SpellingTemplate(layout, difficulty)
);
