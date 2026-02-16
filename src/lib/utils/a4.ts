import type { BoundingBox, Margins, Point } from '$lib/engine/types';
import {
	A4_WIDTH_MM as _A4_WIDTH_MM,
	A4_HEIGHT_MM as _A4_HEIGHT_MM,
	A4_WIDTH_PX as _A4_WIDTH_PX,
	A4_HEIGHT_PX as _A4_HEIGHT_PX,
	MM_TO_PX as _MM_TO_PX,
	mmToPx as _mmToPx,
	pxToMm as _pxToMm
} from '$lib/engine/units';

// ---------------------------------------------------------------------------
// Re-export core constants and functions from engine/units for convenience
// ---------------------------------------------------------------------------

/** A4 width in pixels at 96 DPI (~793.7 px) */
export const A4_WIDTH_PX = _A4_WIDTH_PX;

/** A4 height in pixels at 96 DPI (~1122.5 px) */
export const A4_HEIGHT_PX = _A4_HEIGHT_PX;

/** A4 width in millimeters */
export const A4_WIDTH_MM = _A4_WIDTH_MM;

/** A4 height in millimeters */
export const A4_HEIGHT_MM = _A4_HEIGHT_MM;

/** Conversion factor: 1 mm = 3.7795275591 px (96 DPI) */
export const MM_TO_PX = _MM_TO_PX;

/** Convert millimeters to pixels (96 DPI) */
export const mmToPx = _mmToPx;

/** Convert pixels (96 DPI) to millimeters */
export const pxToMm = _pxToMm;

// ---------------------------------------------------------------------------
// Default page margins (mm)
// ---------------------------------------------------------------------------

/** Default margins applied to every worksheet page */
export const DEFAULT_MARGINS: Readonly<Margins> = {
	top: 10,
	right: 10,
	bottom: 10,
	left: 10
} as const;

// ---------------------------------------------------------------------------
// Printable content area (mm)
// ---------------------------------------------------------------------------

/** Usable content width after subtracting left + right margins */
export const CONTENT_WIDTH = A4_WIDTH_MM - DEFAULT_MARGINS.left - DEFAULT_MARGINS.right; // 190 mm

/** Usable content height after subtracting top + bottom margins */
export const CONTENT_HEIGHT = A4_HEIGHT_MM - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom; // 277 mm

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the x coordinate that horizontally centres an element of the
 * given width within the printable content area.
 *
 * @param width - Element width in mm
 * @returns x position in mm (relative to the page left edge, accounting for the left margin)
 */
export function centerX(width: number): number {
	return DEFAULT_MARGINS.left + (CONTENT_WIDTH - width) / 2;
}

/**
 * Calculate evenly distributed grid positions within an arbitrary bounding box.
 *
 * Returns one {@link Point} per cell, ordered left-to-right then top-to-bottom.
 * Each point marks the top-left corner of the cell.
 *
 * @param rows - Number of rows in the grid
 * @param cols - Number of columns in the grid
 * @param area - Bounding box to subdivide
 * @returns Array of grid cell origin points (length = rows * cols)
 */
export function gridPositions(rows: number, cols: number, area: BoundingBox): Point[] {
	if (rows <= 0 || cols <= 0) {
		return [];
	}

	const cellWidth = area.width / cols;
	const cellHeight = area.height / rows;
	const points: Point[] = [];

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			points.push({
				x: area.x + c * cellWidth,
				y: area.y + r * cellHeight
			});
		}
	}

	return points;
}

/**
 * Return the default content bounding box (the printable area inside the
 * default margins).
 */
export function contentArea(): BoundingBox {
	return {
		x: DEFAULT_MARGINS.left,
		y: DEFAULT_MARGINS.top,
		width: CONTENT_WIDTH,
		height: CONTENT_HEIGHT
	};
}
