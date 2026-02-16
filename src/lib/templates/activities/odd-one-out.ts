import type { SVGElementNode } from '$lib/engine/types';
import type { OddOneOutData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createCircle, createGroup } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { stackVertically } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// OddOneOutTemplate
// ---------------------------------------------------------------------------

/**
 * Renders odd-one-out activities. Each group displays several items
 * in a horizontal row. The child must identify which item does not
 * belong. Items are represented as labelled circles (using asset IDs
 * as placeholders).
 */
export class OddOneOutTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'odd-one-out') {
			throw new Error(`OddOneOutTemplate received wrong activity type: ${data.type}`);
		}

		const oooData = data as OddOneOutData;
		const elements: SVGElementNode[] = [];
		const groups = oooData.groups;

		if (groups.length === 0) return elements;

		const rows = stackVertically(zone, groups.length, 3);
		const fontSize = this.difficulty.fontSize;

		for (let i = 0; i < groups.length && i < rows.length; i++) {
			const group = groups[i];
			const { x, y, width, height } = rows[i].bounds;
			const rowElements: SVGElementNode[] = [];

			// Group number label
			rowElements.push(
				createText(x + 2, y + height / 2 + fontSize * 0.35, `${i + 1}.`, {
					'font-size': fontSize * 0.8,
					'font-family': 'sans-serif',
					fill: '#888888'
				})
			);

			// Instruction for this row
			rowElements.push(
				createText(x + width / 2, y + 2 + fontSize * 0.6, 'Circle the odd one out', {
					'font-size': fontSize * 0.5,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					fill: '#9ca3af'
				})
			);

			// Items in a horizontal row
			const itemCount = group.items.length;
			const itemAreaX = x + 10;
			const itemAreaWidth = width - 20;
			const itemSpacing = itemAreaWidth / itemCount;
			const circleRadius = Math.min(itemSpacing / 3, height / 3, 8);

			for (let j = 0; j < itemCount; j++) {
				const cx = itemAreaX + j * itemSpacing + itemSpacing / 2;
				const cy = y + height / 2 + 2;

				// Item circle placeholder
				rowElements.push(
					createCircle(cx, cy, circleRadius, {
						fill: '#f0f9ff',
						stroke: '#3b82f6',
						'stroke-width': 0.3
					})
				);

				// Item label (shortened asset ID or placeholder)
				const label = group.items[j].length > 4 ? group.items[j].substring(0, 4) : group.items[j];
				rowElements.push(
					createText(cx, cy + fontSize * 0.3, label, {
						'font-size': fontSize * 0.5,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						'dominant-baseline': 'central',
						fill: '#1e40af'
					})
				);
			}

			elements.push(createGroup(rowElements, { class: `ooo-group-${i}` }));
		}

		return [createGroup(elements, { class: 'odd-one-out-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'odd-one-out',
	(layout, difficulty) => new OddOneOutTemplate(layout, difficulty)
);
