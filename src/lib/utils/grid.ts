import type { BoundingBox, Point, Size } from '$lib/engine/types';

// ---------------------------------------------------------------------------
// Grid layout calculation
// ---------------------------------------------------------------------------

/** Result of a grid calculation */
export interface GridResult {
	/** Top-left origin of each cell, ordered left-to-right then top-to-bottom */
	positions: Point[];
	/** Dimensions of a single cell (including any gap already subtracted) */
	cellSize: Size;
}

/**
 * Lay out a fixed number of items in a grid within a bounding box.
 *
 * The caller supplies the desired item size; this function computes how many
 * rows and columns are needed and returns the top-left positions for each item
 * along with the actual cell size (which may be smaller than the requested
 * size if the items don't fit perfectly).
 *
 * @param itemCount - Total number of items to place
 * @param area      - Bounding box available for the grid (mm)
 * @param itemSize  - Desired size of each item (mm)
 * @param gap       - Optional gap between items in mm (default 2)
 * @returns Grid positions and resolved cell size
 */
export function calculateGrid(
	itemCount: number,
	area: BoundingBox,
	itemSize: Size,
	gap: number = 2
): GridResult {
	if (itemCount <= 0) {
		return { positions: [], cellSize: { width: 0, height: 0 } };
	}

	// How many columns fit?
	const cols = Math.max(1, Math.floor((area.width + gap) / (itemSize.width + gap)));
	const rows = Math.max(1, Math.ceil(itemCount / cols));

	// Recompute cell size so items distribute evenly within the area
	const cellWidth = (area.width - gap * (cols - 1)) / cols;
	const cellHeight = (area.height - gap * (rows - 1)) / rows;

	// Clamp to requested item size so cells never exceed what was asked for
	const finalWidth = Math.min(cellWidth, itemSize.width);
	const finalHeight = Math.min(cellHeight, itemSize.height);

	const positions: Point[] = [];

	for (let i = 0; i < itemCount; i++) {
		const r = Math.floor(i / cols);
		const c = i % cols;

		positions.push({
			x: area.x + c * (finalWidth + gap),
			y: area.y + r * (finalHeight + gap)
		});
	}

	return {
		positions,
		cellSize: { width: finalWidth, height: finalHeight }
	};
}

// ---------------------------------------------------------------------------
// Zone fitting
// ---------------------------------------------------------------------------

/** Result of fitting items into a zone */
export interface FitResult {
	rows: number;
	cols: number;
	cellWidth: number;
	cellHeight: number;
}

/**
 * Determine the best grid dimensions (rows x cols) to fit a given number of
 * items within a zone, optionally preserving a cell aspect ratio.
 *
 * The algorithm tries every possible column count from 1 to itemCount and
 * picks the arrangement that maximises cell area while respecting the zone
 * boundaries and the requested aspect ratio.
 *
 * @param itemCount   - Number of items to fit
 * @param zone        - Available space (mm)
 * @param aspectRatio - Optional desired width/height ratio for each cell
 *                      (e.g. 1.0 for square, 1.5 for landscape). When omitted
 *                      the cells will fill all available space.
 * @returns Best-fit grid dimensions and cell sizes
 */
export function fitItemsInZone(
	itemCount: number,
	zone: BoundingBox,
	aspectRatio?: number
): FitResult {
	if (itemCount <= 0) {
		return { rows: 0, cols: 0, cellWidth: 0, cellHeight: 0 };
	}

	let bestCols = 1;
	let bestRows = itemCount;
	let bestArea = 0;
	let bestCellW = 0;
	let bestCellH = 0;

	for (let cols = 1; cols <= itemCount; cols++) {
		const rows = Math.ceil(itemCount / cols);

		let cellW = zone.width / cols;
		let cellH = zone.height / rows;

		// Enforce aspect ratio by shrinking the larger dimension
		if (aspectRatio !== undefined && aspectRatio > 0) {
			const desiredW = cellH * aspectRatio;
			if (desiredW <= cellW) {
				cellW = desiredW;
			} else {
				cellH = cellW / aspectRatio;
			}
		}

		const cellArea = cellW * cellH;

		if (cellArea > bestArea) {
			bestArea = cellArea;
			bestCols = cols;
			bestRows = rows;
			bestCellW = cellW;
			bestCellH = cellH;
		}
	}

	return {
		rows: bestRows,
		cols: bestCols,
		cellWidth: bestCellW,
		cellHeight: bestCellH
	};
}
