import type { SVGElementNode } from '$lib/engine/types';
import type { CountingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import {
	createText,
	createCircle,
	createGroup,
	createAnswerBox
} from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { subdivideZone } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// CountingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders counting activities where groups of objects are displayed
 * and children write the count in an answer box.
 */
export class CountingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'counting') {
			throw new Error(`CountingTemplate received wrong activity type: ${data.type}`);
		}

		const countingData = data as CountingData;
		const elements: SVGElementNode[] = [];
		const groups = countingData.groups;

		if (groups.length === 0) return elements;

		// Determine grid layout based on number of groups
		const cols = Math.min(groups.length, 3);
		const rows = Math.ceil(groups.length / cols);
		const subZones = subdivideZone(zone, rows, cols, 3);

		for (let i = 0; i < groups.length && i < subZones.length; i++) {
			const group = groups[i];
			const sz = subZones[i];
			const { x, y, width, height } = sz.bounds;

			const groupElements: SVGElementNode[] = [];

			// "How many?" label at the top of the sub-zone
			const labelFontSize = this.difficulty.fontSize * 0.8;
			groupElements.push(
				createText(x + width / 2, y + labelFontSize + 1, 'How many?', {
					'font-size': labelFontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					fill: '#555555'
				})
			);

			// Object area: render N circles representing the items
			const objectAreaY = y + labelFontSize + 5;
			const objectAreaHeight = height - labelFontSize - 20;
			const objectCols = Math.min(group.count, 5);
			const objectRows = Math.ceil(group.count / objectCols);
			const objectRadius = Math.min(
				(width - 4) / (objectCols * 2.5),
				objectAreaHeight / (objectRows * 2.5),
				4
			);

			for (let j = 0; j < group.count; j++) {
				const row = Math.floor(j / objectCols);
				const col = j % objectCols;
				const totalColWidth = objectCols * objectRadius * 2.5;
				const startX = x + (width - totalColWidth) / 2 + objectRadius;
				const cx = startX + col * objectRadius * 2.5;
				const cy = objectAreaY + row * objectRadius * 2.5 + objectRadius;

				groupElements.push(
					createCircle(cx, cy, objectRadius, {
						fill: '#e0e7ff',
						stroke: '#6366f1',
						'stroke-width': 0.3
					})
				);
			}

			// Answer box at the bottom
			const answerBoxSize = Math.min(this.difficulty.fontSize * 2, 10);
			const answerBoxX = x + (width - answerBoxSize) / 2;
			const answerBoxY = y + height - answerBoxSize - 2;

			groupElements.push(createAnswerBox(answerBoxX, answerBoxY, answerBoxSize));

			elements.push(createGroup(groupElements, { class: `counting-group-${i}` }));
		}

		return [createGroup(elements, { class: 'counting-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'counting',
	(layout, difficulty) => new CountingTemplate(layout, difficulty)
);
