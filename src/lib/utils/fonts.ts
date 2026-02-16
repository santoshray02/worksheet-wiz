// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

/** Pre-configured font family groups */
export const FONT_FAMILIES = {
	/** Display / title font */
	display: 'Fredoka One',
	/** Handwriting practice font (child-friendly) */
	handwriting: 'Patrick Hand',
	/** General body text font */
	body: 'Comic Neue'
} as const;

export type FontRole = keyof typeof FONT_FAMILIES;

// ---------------------------------------------------------------------------
// Age-based sizing
// ---------------------------------------------------------------------------

/**
 * Font size look-up table keyed by age.
 *
 * Sizes are in millimeters and represent the default body text size for that
 * age group.  Younger children get larger text.
 *
 * | Age | Size (mm) | Rationale                        |
 * |-----|-----------|----------------------------------|
 * |  3  |   7.0     | Very large for pre-readers       |
 * |  4  |   6.0     | Large for early pre-K            |
 * |  5  |   5.5     | Kindergarten readability         |
 * |  6  |   5.0     | Grade 1                          |
 * |  7  |   4.5     | Grade 2                          |
 * |  8  |   4.0     | Grade 3+                         |
 */
const FONT_SIZE_BY_AGE: Record<number, number> = {
	3: 7.0,
	4: 6.0,
	5: 5.5,
	6: 5.0,
	7: 4.5,
	8: 4.0
};

/**
 * Line height look-up table keyed by age (mm).
 *
 * Line height is approximately 1.6x the font size, rounded for clean ruling.
 */
const LINE_HEIGHT_BY_AGE: Record<number, number> = {
	3: 12.0,
	4: 10.0,
	5: 9.0,
	6: 8.0,
	7: 7.5,
	8: 7.0
};

// Fallback bounds
const MIN_AGE = 3;
const MAX_AGE = 8;

/**
 * Clamp an age value to the supported range.
 */
function clampAge(age: number): number {
	return Math.max(MIN_AGE, Math.min(MAX_AGE, Math.round(age)));
}

/**
 * Return the recommended body-text font size (mm) for a given age.
 *
 * Ages outside the 3-8 range are clamped to the nearest bound.
 *
 * @param age - Child's age in years
 * @returns Font size in millimeters
 */
export function fontSizeForAge(age: number): number {
	return FONT_SIZE_BY_AGE[clampAge(age)];
}

/**
 * Return the recommended line height (mm) for a given age.
 *
 * Ages outside the 3-8 range are clamped to the nearest bound.
 *
 * @param age - Child's age in years
 * @returns Line height in millimeters
 */
export function lineHeightForAge(age: number): number {
	return LINE_HEIGHT_BY_AGE[clampAge(age)];
}
