import type { BoundingBox } from '$lib/engine/types';

// ---------------------------------------------------------------------------
// Layout zone types
// ---------------------------------------------------------------------------

/** A named rectangular region on the worksheet page */
export interface LayoutZone {
	id: string;
	name: string;
	bounds: BoundingBox;
}

/** The standard four-zone layout for an A4 worksheet page */
export interface WorksheetLayout {
	header: LayoutZone;
	instructions: LayoutZone;
	activity: LayoutZone;
	footer: LayoutZone;
}

// ---------------------------------------------------------------------------
// A4 page constants (mm)
// ---------------------------------------------------------------------------

const A4_WIDTH = 210;
const A4_HEIGHT = 297;

const DEFAULT_MARGINS = { top: 10, right: 10, bottom: 10, left: 10 };

// ---------------------------------------------------------------------------
// Standard layout factory
// ---------------------------------------------------------------------------

/**
 * Creates the standard 4-zone layout for an A4 worksheet.
 *
 * Zone breakdown (with default 10 mm margins):
 *   Header:       25 mm tall  (y = 10  to y = 35)
 *   Instructions:  20 mm tall  (y = 35  to y = 55)
 *   Activity:     222 mm tall  (y = 55  to y = 277)
 *   Footer:        10 mm tall  (y = 277 to y = 287)
 */
export function createStandardLayout(
	margins?: { top: number; right: number; bottom: number; left: number }
): WorksheetLayout {
	const m = margins ?? DEFAULT_MARGINS;

	const contentX = m.left;
	const contentWidth = A4_WIDTH - m.left - m.right;
	const contentBottom = A4_HEIGHT - m.bottom;

	// Fixed zone heights
	const headerHeight = 25;
	const instructionsHeight = 20;
	const footerHeight = 10;
	const activityHeight = contentBottom - m.top - headerHeight - instructionsHeight - footerHeight;

	let y = m.top;

	const header: LayoutZone = {
		id: 'header',
		name: 'Header',
		bounds: { x: contentX, y, width: contentWidth, height: headerHeight }
	};
	y += headerHeight;

	const instructions: LayoutZone = {
		id: 'instructions',
		name: 'Instructions',
		bounds: { x: contentX, y, width: contentWidth, height: instructionsHeight }
	};
	y += instructionsHeight;

	const activity: LayoutZone = {
		id: 'activity',
		name: 'Activity',
		bounds: { x: contentX, y, width: contentWidth, height: activityHeight }
	};
	y += activityHeight;

	const footer: LayoutZone = {
		id: 'footer',
		name: 'Footer',
		bounds: { x: contentX, y, width: contentWidth, height: footerHeight }
	};

	return { header, instructions, activity, footer };
}

// ---------------------------------------------------------------------------
// Zone subdivision helpers
// ---------------------------------------------------------------------------

/**
 * Subdivide a zone into a grid of sub-zones.
 *
 * For example, `subdivideZone(zone, 2, 3)` produces a 2-row by 3-column
 * grid of 6 sub-zones ordered left-to-right, top-to-bottom.
 *
 * @param zone  The parent zone to subdivide.
 * @param rows  Number of rows in the grid.
 * @param cols  Number of columns in the grid.
 * @param gap   Gap between sub-zones in mm (default 2).
 */
export function subdivideZone(
	zone: LayoutZone,
	rows: number,
	cols: number,
	gap: number = 2
): LayoutZone[] {
	const { x, y, width, height } = zone.bounds;

	const totalGapX = gap * (cols - 1);
	const totalGapY = gap * (rows - 1);
	const cellWidth = (width - totalGapX) / cols;
	const cellHeight = (height - totalGapY) / rows;

	const zones: LayoutZone[] = [];

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const index = row * cols + col;
			zones.push({
				id: `${zone.id}-${row}-${col}`,
				name: `${zone.name} [${row},${col}]`,
				bounds: {
					x: x + col * (cellWidth + gap),
					y: y + row * (cellHeight + gap),
					width: cellWidth,
					height: cellHeight
				}
			});
		}
	}

	return zones;
}

/**
 * Create a single-column layout within a zone (items stacked vertically).
 *
 * @param zone   The parent zone.
 * @param count  Number of vertical slots.
 * @param gap    Gap between slots in mm (default 2).
 */
export function stackVertically(
	zone: LayoutZone,
	count: number,
	gap: number = 2
): LayoutZone[] {
	const { x, y, width, height } = zone.bounds;
	const totalGap = gap * (count - 1);
	const slotHeight = (height - totalGap) / count;

	const zones: LayoutZone[] = [];

	for (let i = 0; i < count; i++) {
		zones.push({
			id: `${zone.id}-row-${i}`,
			name: `${zone.name} Row ${i}`,
			bounds: {
				x,
				y: y + i * (slotHeight + gap),
				width,
				height: slotHeight
			}
		});
	}

	return zones;
}

/**
 * Create a single-row layout within a zone (items stacked horizontally).
 *
 * @param zone   The parent zone.
 * @param count  Number of horizontal slots.
 * @param gap    Gap between slots in mm (default 2).
 */
export function stackHorizontally(
	zone: LayoutZone,
	count: number,
	gap: number = 2
): LayoutZone[] {
	const { x, y, width, height } = zone.bounds;
	const totalGap = gap * (count - 1);
	const slotWidth = (width - totalGap) / count;

	const zones: LayoutZone[] = [];

	for (let i = 0; i < count; i++) {
		zones.push({
			id: `${zone.id}-col-${i}`,
			name: `${zone.name} Col ${i}`,
			bounds: {
				x: x + i * (slotWidth + gap),
				y,
				width: slotWidth,
				height
			}
		});
	}

	return zones;
}
