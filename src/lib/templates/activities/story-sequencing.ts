import type { SVGElementNode } from '$lib/engine/types';
import type { StorySequencingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createGroup, createCircle } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { stackHorizontally } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// StorySequencingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders story sequencing activities. Panels are laid out in a
 * horizontal row. Each panel has a bordered frame with an image
 * placeholder, an optional caption, and a numbering circle at the
 * bottom where the child writes the correct order.
 */
export class StorySequencingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'story-sequencing') {
			throw new Error(`StorySequencingTemplate received wrong activity type: ${data.type}`);
		}

		const seqData = data as StorySequencingData;
		const elements: SVGElementNode[] = [];
		const panels = seqData.panels;

		if (panels.length === 0) return elements;

		const cols = stackHorizontally(zone, panels.length, 3);
		const fontSize = this.difficulty.fontSize;

		for (let i = 0; i < panels.length && i < cols.length; i++) {
			const panel = panels[i];
			const { x, y, width, height } = cols[i].bounds;
			const panelElements: SVGElementNode[] = [];

			// Panel frame
			panelElements.push(
				createRect(x, y, width, height, {
					fill: '#ffffff',
					stroke: '#d1d5db',
					'stroke-width': 0.3,
					rx: 2,
					ry: 2
				})
			);

			// Image placeholder area (top 70% of panel)
			const imageHeight = height * 0.6;
			panelElements.push(
				createRect(x + 2, y + 2, width - 4, imageHeight, {
					fill: '#f3f4f6',
					stroke: '#e5e7eb',
					'stroke-width': 0.15,
					rx: 1,
					ry: 1
				})
			);

			// Image description text (placeholder)
			const descFontSize = fontSize * 0.45;
			const descText =
				panel.imageDescription.length > 30
					? panel.imageDescription.substring(0, 30) + '...'
					: panel.imageDescription;

			panelElements.push(
				createText(x + width / 2, y + 2 + imageHeight / 2, descText, {
					'font-size': descFontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					'dominant-baseline': 'central',
					fill: '#9ca3af'
				})
			);

			// Caption (below image)
			if (panel.caption) {
				const captionY = y + 2 + imageHeight + fontSize * 0.8;
				panelElements.push(
					createText(x + width / 2, captionY, panel.caption, {
						'font-size': fontSize * 0.55,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						fill: '#374151'
					})
				);
			}

			// Order number circle at the bottom
			const circleRadius = Math.min(fontSize, 4);
			const circleCx = x + width / 2;
			const circleCy = y + height - circleRadius - 2;

			panelElements.push(
				createCircle(circleCx, circleCy, circleRadius, {
					fill: '#ffffff',
					stroke: '#6b7280',
					'stroke-width': 0.3
				})
			);

			// Show hint for the first panel if hints are enabled
			if (i === 0 && this.difficulty.showHints) {
				panelElements.push(
					createText(circleCx, circleCy + fontSize * 0.3, String(panel.correctOrder), {
						'font-size': fontSize * 0.6,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						'dominant-baseline': 'central',
						fill: '#d1d5db'
					})
				);
			}

			elements.push(createGroup(panelElements, { class: `story-panel-${i}` }));
		}

		return [createGroup(elements, { class: 'story-sequencing-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'story-sequencing',
	(layout, difficulty) => new StorySequencingTemplate(layout, difficulty)
);
