import type { SVGElementNode } from '$lib/engine/types';
import type { NumberBondsData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import {
	createText,
	createCircle,
	createLine,
	createGroup,
	createAnswerBox
} from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { subdivideZone } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// NumberBondsTemplate
// ---------------------------------------------------------------------------

/**
 * Renders number bond diagrams. Each bond is drawn as a triangle
 * connecting three circles: the "whole" at the top and two "parts"
 * at the bottom. One of the three values is hidden (shown as a
 * blank answer box) depending on the `missingPart` field.
 */
export class NumberBondsTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'number-bonds') {
			throw new Error(`NumberBondsTemplate received wrong activity type: ${data.type}`);
		}

		const nbData = data as NumberBondsData;
		const elements: SVGElementNode[] = [];
		const bonds = nbData.bonds;

		if (bonds.length === 0) return elements;

		// Layout bonds in a grid
		const cols = Math.min(bonds.length, 3);
		const rows = Math.ceil(bonds.length / cols);
		const subZones = subdivideZone(zone, rows, cols, 4);

		const fontSize = this.difficulty.fontSize;
		const circleRadius = Math.min(fontSize * 1.2, 6);

		for (let i = 0; i < bonds.length && i < subZones.length; i++) {
			const bond = bonds[i];
			const { x, y, width, height } = subZones[i].bounds;
			const bondElements: SVGElementNode[] = [];

			// Positions for the three circles
			const wholeCx = x + width / 2;
			const wholeCy = y + circleRadius + 3;
			const part1Cx = x + width / 3;
			const part1Cy = y + height - circleRadius - 3;
			const part2Cx = x + (2 * width) / 3;
			const part2Cy = y + height - circleRadius - 3;

			// Connecting lines
			bondElements.push(
				createLine(wholeCx, wholeCy + circleRadius, part1Cx, part1Cy - circleRadius, {
					stroke: '#6b7280',
					'stroke-width': 0.3
				})
			);
			bondElements.push(
				createLine(wholeCx, wholeCy + circleRadius, part2Cx, part2Cy - circleRadius, {
					stroke: '#6b7280',
					'stroke-width': 0.3
				})
			);

			// Whole circle
			const wholeIsMissing = bond.missingPart === 'whole';
			bondElements.push(
				createCircle(wholeCx, wholeCy, circleRadius, {
					fill: wholeIsMissing ? '#fef3c7' : '#eff6ff',
					stroke: wholeIsMissing ? '#f59e0b' : '#3b82f6',
					'stroke-width': 0.3
				})
			);
			bondElements.push(
				createText(wholeCx, wholeCy + fontSize * 0.35, wholeIsMissing ? '?' : String(bond.whole), {
					'font-size': fontSize,
					'font-family': 'sans-serif',
					'font-weight': 'bold',
					'text-anchor': 'middle',
					fill: wholeIsMissing ? '#d97706' : '#1e40af'
				})
			);

			// Part 1 circle
			const part1IsMissing = bond.missingPart === 'part1';
			bondElements.push(
				createCircle(part1Cx, part1Cy, circleRadius, {
					fill: part1IsMissing ? '#fef3c7' : '#eff6ff',
					stroke: part1IsMissing ? '#f59e0b' : '#3b82f6',
					'stroke-width': 0.3
				})
			);
			bondElements.push(
				createText(
					part1Cx,
					part1Cy + fontSize * 0.35,
					part1IsMissing ? '?' : String(bond.part1),
					{
						'font-size': fontSize,
						'font-family': 'sans-serif',
						'font-weight': 'bold',
						'text-anchor': 'middle',
						fill: part1IsMissing ? '#d97706' : '#1e40af'
					}
				)
			);

			// Part 2 circle
			const part2IsMissing = bond.missingPart === 'part2';
			bondElements.push(
				createCircle(part2Cx, part2Cy, circleRadius, {
					fill: part2IsMissing ? '#fef3c7' : '#eff6ff',
					stroke: part2IsMissing ? '#f59e0b' : '#3b82f6',
					'stroke-width': 0.3
				})
			);
			bondElements.push(
				createText(
					part2Cx,
					part2Cy + fontSize * 0.35,
					part2IsMissing ? '?' : String(bond.part2),
					{
						'font-size': fontSize,
						'font-family': 'sans-serif',
						'font-weight': 'bold',
						'text-anchor': 'middle',
						fill: part2IsMissing ? '#d97706' : '#1e40af'
					}
				)
			);

			elements.push(createGroup(bondElements, { class: `number-bond-${i}` }));
		}

		return [createGroup(elements, { class: 'number-bonds-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'number-bonds',
	(layout, difficulty) => new NumberBondsTemplate(layout, difficulty)
);
