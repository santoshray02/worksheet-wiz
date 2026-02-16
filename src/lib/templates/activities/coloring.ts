import type { SVGElementNode } from '$lib/engine/types';
import type { ColoringData, ActivityData } from '$lib/types/activity';
import type { LayoutZone } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';
import type { WorksheetLayout } from '$lib/templates/zones';
import { createPath, createText, createGroup, createRect } from '$lib/engine/elements';
import { BaseTemplate } from '$lib/templates/base';
import { templateRegistry } from '$lib/templates/registry';

// ---------------------------------------------------------------------------
// ColoringTemplate
// ---------------------------------------------------------------------------

/**
 * Renders coloring activities. Each region is drawn with its SVG path
 * data as an outlined shape. Optional color labels or numbers are
 * placed inside the region for color-by-number or color-by-name
 * activities.
 */
export class ColoringTemplate extends BaseTemplate {
	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		super(layout, difficulty);
	}

	renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[] {
		if (data.type !== 'coloring') {
			throw new Error(`ColoringTemplate received wrong activity type: ${data.type}`);
		}

		const coloringData = data as ColoringData;
		const { x, y, width, height } = zone.bounds;
		const elements: SVGElementNode[] = [];

		if (coloringData.regions.length === 0) return elements;

		const fontSize = this.difficulty.fontSize;

		// Draw each coloring region
		for (let i = 0; i < coloringData.regions.length; i++) {
			const region = coloringData.regions[i];

			// Region outline path
			elements.push(
				createPath(region.pathData, {
					fill: 'none',
					stroke: '#1f2937',
					'stroke-width': 0.4,
					'stroke-linejoin': 'round'
				})
			);

			// Color label or number inside the region
			// We estimate a center point by bounding the first move command
			const labelText = region.colorLabel ?? (region.number != null ? String(region.number) : '');
			if (labelText) {
				// Extract approximate center from the path data (rough heuristic)
				const center = estimatePathCenter(region.pathData, zone.bounds);
				elements.push(
					createText(center.x, center.y, labelText, {
						'font-size': fontSize * 0.7,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						'dominant-baseline': 'central',
						fill: '#6b7280'
					})
				);
			}
		}

		// If there are numbered regions, add a color legend at the bottom
		const numberedRegions = coloringData.regions.filter((r) => r.number != null);
		if (numberedRegions.length > 0) {
			const legendY = y + height - 12;
			const legendFontSize = fontSize * 0.6;

			elements.push(
				createText(x + width / 2, legendY - 2, 'Color Key', {
					'font-size': legendFontSize,
					'font-family': 'sans-serif',
					'font-weight': 'bold',
					'text-anchor': 'middle',
					fill: '#4b5563'
				})
			);

			const itemWidth = width / numberedRegions.length;
			for (let i = 0; i < numberedRegions.length; i++) {
				const region = numberedRegions[i];
				const cx = x + i * itemWidth + itemWidth / 2;
				const label = `${region.number}: ${region.colorLabel ?? ''}`;
				elements.push(
					createText(cx, legendY + legendFontSize + 1, label, {
						'font-size': legendFontSize,
						'font-family': 'sans-serif',
						'text-anchor': 'middle',
						fill: '#374151'
					})
				);
			}
		}

		return [createGroup(elements, { class: 'coloring-activity' })];
	}
}

/**
 * Roughly estimate the center of an SVG path by parsing the first
 * few numeric coordinates. Falls back to the zone center.
 */
function estimatePathCenter(
	pathData: string,
	bounds: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
	const numbers = pathData.match(/-?\d+(?:\.\d+)?/g);
	if (numbers && numbers.length >= 2) {
		const xs: number[] = [];
		const ys: number[] = [];
		for (let i = 0; i < numbers.length - 1; i += 2) {
			xs.push(parseFloat(numbers[i]));
			ys.push(parseFloat(numbers[i + 1]));
		}
		if (xs.length > 0 && ys.length > 0) {
			const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
			const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
			return { x: avgX, y: avgY };
		}
	}
	return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

templateRegistry.register(
	'coloring',
	(layout, difficulty) => new ColoringTemplate(layout, difficulty)
);
