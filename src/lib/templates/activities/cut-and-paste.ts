import type { SVGElementNode } from '$lib/engine/types';
import type { CutAndPasteData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createRect, createLine, createGroup } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// CutAndPasteTemplate
// ---------------------------------------------------------------------------

/**
 * Renders cut-and-paste activities. The zone is divided into two areas:
 *
 *   1. **Target area** (top): labelled slots where items should be pasted.
 *   2. **Cut-out area** (bottom): dashed-border boxes that the child
 *      cuts out and pastes into the correct slot.
 *
 * A scissors-line separator divides the two areas.
 */
export class CutAndPasteTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'cut-and-paste') {
			throw new Error(`CutAndPasteTemplate received wrong activity type: ${data.type}`);
		}

		const capData = data as CutAndPasteData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const items = capData.items;
		const slots = capData.targetSlots;
		const fontSize = this.difficulty.fontSize;

		if (items.length === 0 && slots.length === 0) return elements;

		// Split zone: top 55% for targets, bottom 45% for cut-outs
		const targetHeight = height * 0.55;
		const cutAreaY = y + targetHeight + 5;
		const cutAreaHeight = height - targetHeight - 5;

		// --- Target slots ---
		const slotCols = Math.min(slots.length || 1, 4);
		const slotWidth = (width - (slotCols - 1) * 3) / slotCols;
		const slotHeight = Math.min(targetHeight - 10, 35);

		elements.push(
			createText(x + width / 2, y + fontSize + 1, 'Paste the items in the correct place:', {
				'font-size': fontSize * 0.7,
				'font-family': 'sans-serif',
				'text-anchor': 'middle',
				fill: '#6b7280'
			})
		);

		const slotStartY = y + fontSize + 5;

		for (let i = 0; i < slots.length; i++) {
			const slot = slots[i];
			const col = i % slotCols;
			const row = Math.floor(i / slotCols);
			const sx = x + col * (slotWidth + 3);
			const sy = slotStartY + row * (slotHeight + 3);

			// Slot border (dashed to indicate drop zone)
			elements.push(
				createRect(sx, sy, slotWidth, slotHeight, {
					fill: '#fafafa',
					stroke: '#9ca3af',
					'stroke-width': 0.3,
					'stroke-dasharray': '2 1',
					rx: 1.5,
					ry: 1.5
				})
			);

			// Slot label
			elements.push(
				createText(sx + slotWidth / 2, sy + slotHeight / 2 + fontSize * 0.3, slot.label, {
					'font-size': fontSize * 0.7,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					'dominant-baseline': 'central',
					fill: '#6b7280'
				})
			);
		}

		// --- Scissors cut line ---
		const scissorsY = cutAreaY - 2.5;
		elements.push(
			createLine(x, scissorsY, x + width, scissorsY, {
				stroke: '#9ca3af',
				'stroke-width': 0.2,
				'stroke-dasharray': '3 1.5'
			})
		);

		// Scissors icon (simple text)
		elements.push(
			createText(x + 3, scissorsY + 0.5, '\u2702', {
				'font-size': fontSize * 0.8,
				'font-family': 'sans-serif',
				fill: '#6b7280'
			})
		);

		// --- Cut-out items ---
		const itemCols = Math.min(items.length || 1, 4);
		const itemWidth = (width - (itemCols - 1) * 3) / itemCols;
		const itemHeight = Math.min(cutAreaHeight - 2, 25);

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const col = i % itemCols;
			const row = Math.floor(i / itemCols);
			const ix = x + col * (itemWidth + 3);
			const iy = cutAreaY + row * (itemHeight + 3);

			// Cut-out box with dashed border
			elements.push(
				createRect(ix, iy, itemWidth, itemHeight, {
					fill: '#fffbeb',
					stroke: '#f59e0b',
					'stroke-width': 0.3,
					'stroke-dasharray': '1.5 1',
					rx: 1,
					ry: 1
				})
			);

			// Item label
			const label = item.label ?? item.assetId;
			elements.push(
				createText(ix + itemWidth / 2, iy + itemHeight / 2 + fontSize * 0.3, label, {
					'font-size': fontSize * 0.7,
					'font-family': 'sans-serif',
					'text-anchor': 'middle',
					'dominant-baseline': 'central',
					fill: '#92400e'
				})
			);
		}

		return [createGroup(elements, { class: 'cut-and-paste-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'cut-and-paste',
	(layout, difficulty) => new CutAndPasteTemplate(layout, difficulty)
);
