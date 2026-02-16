import type { SVGElementNode } from '$lib/engine/types';
import type { TracingData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createText, createPath, createGroup, createTracingGuide } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// TracingTemplate
// ---------------------------------------------------------------------------

/**
 * Renders tracing activities where children follow dotted/dashed paths
 * to practice writing letters, numbers, or shapes.
 */
export class TracingTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'tracing') {
			throw new Error(`TracingTemplate received wrong activity type: ${data.type}`);
		}

		const tracingData = data as TracingData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		const items = tracingData.items;
		const itemCount = items.length;
		if (itemCount === 0) return elements;

		// Determine spacing: items evenly distributed across the zone width
		const itemWidth = width / itemCount;
		const fontSize = this.difficulty.fontSize * 2;
		const strokeDash =
			tracingData.tracingStyle === 'dotted'
				? '0.5 1.5'
				: tracingData.tracingStyle === 'dashed'
					? '2 2'
					: 'none';
		const strokeOpacity = tracingData.tracingStyle === 'light' ? 0.3 : 0.5;

		for (let i = 0; i < itemCount; i++) {
			const item = items[i];
			const cx = x + i * itemWidth + itemWidth / 2;
			const cy = y + height / 2;

			// Render the traced character as dotted text
			const tracedText = createText(cx, cy, item, {
				'font-size': fontSize,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				'text-anchor': 'middle',
				'dominant-baseline': 'central',
				fill: 'none',
				stroke: '#888888',
				'stroke-width': this.difficulty.strokeWidth,
				'stroke-dasharray': strokeDash,
				'stroke-opacity': strokeOpacity,
				'stroke-linecap': 'round'
			});

			elements.push(tracedText);

			// Add directional arrows if requested
			if (tracingData.showArrows) {
				// Place a small arrow above the character pointing down
				const arrowY = cy - fontSize / 2 - 2;
				const arrowPath = `M ${cx} ${arrowY} L ${cx - 1.5} ${arrowY - 2} M ${cx} ${arrowY} L ${cx + 1.5} ${arrowY - 2}`;
				elements.push(
					createPath(arrowPath, {
						fill: 'none',
						stroke: '#cc0000',
						'stroke-width': 0.4,
						'stroke-linecap': 'round',
						'stroke-opacity': 0.7
					})
				);
			}

			// Add a tracing guide path below the character (a baseline to follow)
			const guideY = cy + fontSize / 2 + 3;
			const guideStartX = cx - itemWidth / 3;
			const guideEndX = cx + itemWidth / 3;
			const guidePath = `M ${guideStartX} ${guideY} L ${guideEndX} ${guideY}`;

			const arrowPositions = tracingData.showArrows
				? [{ x: guideStartX, y: guideY }]
				: undefined;

			elements.push(createTracingGuide(guidePath, tracingData.tracingStyle, arrowPositions));
		}

		return [createGroup(elements, { class: 'tracing-activity' })];
	}
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register('tracing', (layout, difficulty) => new TracingTemplate(layout, difficulty));
