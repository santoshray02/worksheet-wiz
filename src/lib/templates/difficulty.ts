import { MM_TO_PT } from '$lib/engine/units';

// ---------------------------------------------------------------------------
// Difficulty configuration
// ---------------------------------------------------------------------------

/** Difficulty configuration derived from the child's age */
export interface DifficultyConfig {
	/** Difficulty tier: 1 (easiest) through 4 (hardest) */
	level: 1 | 2 | 3 | 4;
	/** Upper bound for numbers used in activities */
	maxNumber: number;
	/** How many items to place on a single page */
	itemsPerPage: number;
	/** Whether to display hint text or visual aids */
	showHints: boolean;
	/** Font size in mm */
	fontSize: number;
	/** Font size in points (derived from mm) */
	fontSizePt: number;
	/** Stroke width in mm for tracing activities */
	strokeWidth: number;
	/** Vertical spacing between handwriting lines in mm */
	lineSpacing: number;
	/** Cell size for grid-based activities (mazes, word search) */
	gridSize: number;
}

// ---------------------------------------------------------------------------
// Internal difficulty table
// ---------------------------------------------------------------------------

interface DifficultyRow {
	level: 1 | 2 | 3 | 4;
	maxNumber: number;
	itemsPerPage: number;
	showHints: boolean;
	fontSize: number;
	strokeWidth: number;
	lineSpacing: number;
	gridSize: number;
}

/**
 * Difficulty parameters indexed by level.
 *
 * | Age   | Level | maxNumber | items | hints | fontSize | stroke | lineSpacing | gridSize |
 * |-------|-------|-----------|-------|-------|----------|--------|-------------|----------|
 * | 3-4   |   1   |     5     |   4   | true  |  7 mm    | 1.5 mm |   12 mm     |  15 mm   |
 * | 5-6   |   2   |    10     |   6   | true  |  5 mm    | 1.0 mm |   10 mm     |  12 mm   |
 * | 7-8   |   3   |    20     |   8   | false |  5 mm    | 0.7 mm |    8 mm     |  10 mm   |
 * | 9-10  |   4   |   100     |  10   | false |  3.5 mm  | 0.5 mm |    7 mm     |   8 mm   |
 */
const DIFFICULTY_TABLE: Record<1 | 2 | 3 | 4, DifficultyRow> = {
	1: {
		level: 1,
		maxNumber: 5,
		itemsPerPage: 4,
		showHints: true,
		fontSize: 7,
		strokeWidth: 1.5,
		lineSpacing: 12,
		gridSize: 15
	},
	2: {
		level: 2,
		maxNumber: 10,
		itemsPerPage: 6,
		showHints: true,
		fontSize: 5,
		strokeWidth: 1.0,
		lineSpacing: 10,
		gridSize: 12
	},
	3: {
		level: 3,
		maxNumber: 20,
		itemsPerPage: 8,
		showHints: false,
		fontSize: 5,
		strokeWidth: 0.7,
		lineSpacing: 8,
		gridSize: 10
	},
	4: {
		level: 4,
		maxNumber: 100,
		itemsPerPage: 10,
		showHints: false,
		fontSize: 3.5,
		strokeWidth: 0.5,
		lineSpacing: 7,
		gridSize: 8
	}
};

// ---------------------------------------------------------------------------
// Age to level mapping
// ---------------------------------------------------------------------------

/** Map an age (3-10) to a difficulty level (1-4) */
function levelForAge(age: number): 1 | 2 | 3 | 4 {
	if (age <= 4) return 1;
	if (age <= 6) return 2;
	if (age <= 8) return 3;
	return 4;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the full difficulty configuration for a given age (3-10).
 *
 * Ages outside the 3-10 range are clamped to the nearest boundary.
 */
export function difficultyForAge(age: number): DifficultyConfig {
	const clampedAge = Math.max(3, Math.min(10, age));
	const level = levelForAge(clampedAge);
	const row = DIFFICULTY_TABLE[level];

	return {
		level: row.level,
		maxNumber: row.maxNumber,
		itemsPerPage: row.itemsPerPage,
		showHints: row.showHints,
		fontSize: row.fontSize,
		fontSizePt: Math.round(row.fontSize * MM_TO_PT * 10) / 10,
		strokeWidth: row.strokeWidth,
		lineSpacing: row.lineSpacing,
		gridSize: row.gridSize
	};
}

/**
 * Helper: get appropriate font size in mm for a given age.
 */
export function fontSizeForAge(age: number): number {
	return difficultyForAge(age).fontSize;
}

/**
 * Helper: get stroke width for tracing activities based on age.
 */
export function strokeWidthForAge(age: number): number {
	return difficultyForAge(age).strokeWidth;
}

/**
 * Helper: get the number range (min and max) for math activities based on age.
 *
 * The minimum is always 1. The maximum comes from the difficulty table.
 */
export function numberRangeForAge(age: number): { min: number; max: number } {
	const config = difficultyForAge(age);
	return { min: 1, max: config.maxNumber };
}
