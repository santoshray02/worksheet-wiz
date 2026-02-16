import type { SVGElementNode } from '$lib/engine/types';
import type { HandwritingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createLine, createGroup, createRect } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// HandwritingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders handwriting practice activities. Each line of text has
 * guide lines (4-line, 3-line, or blank) and a sample character
 * or word to copy.
 */
export class HandwritingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'handwriting') {
			throw new Error(`HandwritingTemplate received wrong activity type: ${data.type}`);
		}

		const hwData = data as HandwritingData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];
		const lines = hwData.lines;

		if (lines.length === 0) return elements;

		const lineHeight = hwData.lineHeight || this.difficulty.lineSpacing;
		const fontSize = this.difficulty.fontSize;
		const guideType = hwData.guideType;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineY = y + i * (lineHeight + 3);
			const lineElements: SVGElementNode[] = [];

			if (lineY + lineHeight > y + height) break;

			// Draw guide lines based on the guide type
			if (guideType === '4-line') {
				// Top line, midline, baseline, bottom line
				const positions = [0, lineHeight * 0.33, lineHeight * 0.66, lineHeight];
				const colors = ['#e5e7eb', '#bfdbfe', '#93c5fd', '#e5e7eb'];
				const widths = [0.15, 0.1, 0.3, 0.15];

				for (let j = 0; j < positions.length; j++) {
					lineElements.push(
						createLine(x, lineY + positions[j], x + width, lineY + positions[j], {
							stroke: colors[j],
							'stroke-width': widths[j]
						})
					);
				}
			} else if (guideType === '3-line') {
				// Top, midline (dashed), baseline
				lineElements.push(
					createLine(x, lineY, x + width, lineY, {
						stroke: '#e5e7eb',
						'stroke-width': 0.15
					})
				);
				lineElements.push(
					createLine(x, lineY + lineHeight / 2, x + width, lineY + lineHeight / 2, {
						stroke: '#bfdbfe',
						'stroke-width': 0.1,
						'stroke-dasharray': '1 1'
					})
				);
				lineElements.push(
					createLine(x, lineY + lineHeight, x + width, lineY + lineHeight, {
						stroke: '#93c5fd',
						'stroke-width': 0.3
					})
				);
			} else {
				// Blank: just a baseline
				lineElements.push(
					createLine(x, lineY + lineHeight, x + width, lineY + lineHeight, {
						stroke: '#d1d5db',
						'stroke-width': 0.2
					})
				);
			}

			// Sample text to copy on the left
			const sampleFontSize = Math.min(fontSize * 1.3, lineHeight * 0.7);
			const baselineY =
				guideType === '4-line'
					? lineY + lineHeight * 0.66
					: lineY + lineHeight * 0.75;

			lineElements.push(
				createText(x + 2, baselineY, line.text, {
					'font-size': sampleFontSize,
					'font-family': line.style === 'cursive' ? 'cursive, serif' : 'sans-serif',
					fill: '#9ca3af',
					'font-style': line.style === 'cursive' ? 'italic' : 'normal'
				})
			);

			elements.push(createGroup(lineElements, { class: `hw-line-${i}` }));
		}

		return [createGroup(elements, { class: 'handwriting-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'handwriting',
	(layout, difficulty) => new HandwritingTemplate(layout, difficulty)
);
