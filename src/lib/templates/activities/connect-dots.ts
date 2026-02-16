import type { SVGElementNode } from '$lib/engine/types';
import type { ConnectDotsData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createCircle, createGroup, createLine } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// ConnectDotsTemplate
// ---------------------------------------------------------------------------

/**
 * Renders connect-the-dots activities. Numbered or labelled dots are
 * placed at specified coordinates within the zone. If the activity
 * is sequential, faint guide lines are drawn between consecutive dots.
 */
export class ConnectDotsTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'connect-dots') {
			throw new Error(`ConnectDotsTemplate received wrong activity type: ${data.type}`);
		}

		const dotsData = data as ConnectDotsData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];
		const dots = dotsData.dots;

		if (dots.length === 0) return elements;

		const fontSize = this.difficulty.fontSize;
		const dotRadius = Math.max(1, fontSize * 0.3);

		// Scale dot positions to fit within the zone
		// Dots are given as relative points that we map into the zone bounds
		const allX = dots.map((d) => d.point.x);
		const allY = dots.map((d) => d.point.y);
		const minX = Math.min(...allX);
		const maxX = Math.max(...allX);
		const minY = Math.min(...allY);
		const maxY = Math.max(...allY);
		const rangeX = maxX - minX || 1;
		const rangeY = maxY - minY || 1;

		const padding = 8;
		const usableWidth = width - padding * 2;
		const usableHeight = height - padding * 2;

		function scaleX(px: number): number {
			return x + padding + ((px - minX) / rangeX) * usableWidth;
		}

		function scaleY(py: number): number {
			return y + padding + ((py - minY) / rangeY) * usableHeight;
		}

		// Draw faint guide lines between sequential dots if sequential mode
		if (dotsData.sequential && dots.length > 1) {
			for (let i = 0; i < dots.length - 1; i++) {
				const from = dots[i];
				const to = dots[i + 1];
				// Very light hint line for younger children
				if (this.difficulty.showHints) {
					elements.push(
						createLine(
							scaleX(from.point.x),
							scaleY(from.point.y),
							scaleX(to.point.x),
							scaleY(to.point.y),
							{
								stroke: '#e5e7eb',
								'stroke-width': 0.15,
								'stroke-dasharray': '0.5 1.5'
							}
						)
					);
				}
			}
		}

		// Draw dots and labels
		for (const dot of dots) {
			const cx = scaleX(dot.point.x);
			const cy = scaleY(dot.point.y);

			// Dot circle
			elements.push(
				createCircle(cx, cy, dotRadius, {
					fill: '#1f2937',
					stroke: '#1f2937',
					'stroke-width': 0.2
				})
			);

			// Label (number or text), positioned slightly above and to the right
			const labelStr = String(dot.label);
			elements.push(
				createText(cx + dotRadius + 1, cy - dotRadius - 0.5, labelStr, {
					'font-size': fontSize * 0.6,
					'font-family': 'sans-serif',
					'font-weight': 'bold',
					fill: '#374151'
				})
			);
		}

		return [createGroup(elements, { class: 'connect-dots-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'connect-dots',
	(layout, difficulty) => new ConnectDotsTemplate(layout, difficulty)
);
