import type { SVGElementNode } from '$lib/engine/types';
import type { MathData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createCircle, createGroup, createLine } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { subdivideZone } from '$lib/templates/zones';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// MathTemplate
// ---------------------------------------------------------------------------

/**
 * Renders a grid of arithmetic problems. Each problem is displayed
 * in the format: operand1 operator operand2 = ____
 *
 * Visual aids (dot groups) can optionally be displayed next to each
 * problem when the difficulty setting allows hints.
 */
export class MathTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'math') {
			throw new Error(`MathTemplate received wrong activity type: ${data.type}`);
		}

		const mathData = data as MathData;
		const elements: SVGElementNode[] = [];
		const problems = mathData.problems;

		if (problems.length === 0) return elements;

		// Arrange problems in a grid
		const cols = problems.length <= 4 ? 1 : 2;
		const rows = Math.ceil(problems.length / cols);
		const subZones = subdivideZone(zone, rows, cols, 3);

		const fontSize = this.difficulty.fontSize;
		const blankWidth = fontSize * 3;

		for (let i = 0; i < problems.length && i < subZones.length; i++) {
			const problem = problems[i];
			const sz = subZones[i];
			const { x, y, width, height } = sz.bounds;

			const problemElements: SVGElementNode[] = [];
			const cy = y + height / 2;

			// Problem number label
			problemElements.push(
				createText(x + 2, cy + fontSize * 0.35, `${i + 1}.`, {
					'font-size': fontSize * 0.8,
					'font-family': 'sans-serif',
					'text-anchor': 'start',
					fill: '#888888'
				})
			);

			// Build the problem expression: "operand1 operator operand2 = ____"
			const expression = `${problem.operand1}  ${problem.operator}  ${problem.operand2}  =`;
			const exprX = x + 12;

			problemElements.push(
				createText(exprX, cy + fontSize * 0.35, expression, {
					'font-size': fontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'start',
					fill: '#000000'
				})
			);

			// Answer blank line
			const blankStartX = exprX + expression.length * fontSize * 0.55;
			const blankY = cy + fontSize * 0.5;
			problemElements.push(
				createLine(blankStartX, blankY, blankStartX + blankWidth, blankY, {
					stroke: '#000000',
					'stroke-width': 0.3
				})
			);

			// Optional visual aids: show dots for each operand
			if (mathData.showVisualAids && this.difficulty.showHints) {
				const dotY = cy - fontSize - 2;
				const dotRadius = Math.min(1.2, fontSize * 0.2);
				const dotSpacing = dotRadius * 2.5;

				// Dots for operand 1
				let dotStartX = exprX;
				for (let d = 0; d < Math.min(problem.operand1, 10); d++) {
					problemElements.push(
						createCircle(dotStartX + d * dotSpacing + dotRadius, dotY, dotRadius, {
							fill: '#93c5fd',
							stroke: '#3b82f6',
							'stroke-width': 0.15
						})
					);
				}

				// Dots for operand 2
				dotStartX = exprX + Math.min(problem.operand1, 10) * dotSpacing + dotSpacing * 2;
				for (let d = 0; d < Math.min(problem.operand2, 10); d++) {
					problemElements.push(
						createCircle(dotStartX + d * dotSpacing + dotRadius, dotY, dotRadius, {
							fill: '#fca5a5',
							stroke: '#ef4444',
							'stroke-width': 0.15
						})
					);
				}
			}

			elements.push(createGroup(problemElements, { class: `math-problem-${i}` }));
		}

		return [createGroup(elements, { class: 'math-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register('math', (layout, difficulty) => new MathTemplate(layout, difficulty));
