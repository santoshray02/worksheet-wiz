// ---------------------------------------------------------------------------
// Grade labels
// ---------------------------------------------------------------------------

/**
 * Grade labels used in the Indian K-12 system.
 *
 * These map directly to common school terminology:
 * - Nursery, LKG, UKG for pre-school
 * - Grade 1 through Grade 5 for primary school
 */
export type GradeLabel =
	| 'Nursery'
	| 'LKG'
	| 'UKG'
	| 'Grade 1'
	| 'Grade 2'
	| 'Grade 3'
	| 'Grade 4'
	| 'Grade 5';

// ---------------------------------------------------------------------------
// Age-to-grade mapping
// ---------------------------------------------------------------------------

/** Maps a child's age (years) to a grade label */
export const AGE_TO_GRADE: ReadonlyMap<number, GradeLabel> = new Map<number, GradeLabel>([
	[3, 'Nursery'],
	[4, 'LKG'],
	[5, 'UKG'],
	[6, 'Grade 1'],
	[7, 'Grade 2'],
	[8, 'Grade 3'],
	[9, 'Grade 4'],
	[10, 'Grade 5']
]);

// ---------------------------------------------------------------------------
// Grade-to-age mapping
// ---------------------------------------------------------------------------

/** Maps a grade label back to a representative age */
export const GRADE_TO_AGE: ReadonlyMap<GradeLabel, number> = new Map<GradeLabel, number>([
	['Nursery', 3],
	['LKG', 4],
	['UKG', 5],
	['Grade 1', 6],
	['Grade 2', 7],
	['Grade 3', 8],
	['Grade 4', 9],
	['Grade 5', 10]
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the grade label for a given age.
 *
 * Ages below 3 return "Nursery"; ages above 10 return "Grade 5".
 *
 * @param age - Child's age in years
 * @returns Corresponding grade label
 */
export function getGradeForAge(age: number): GradeLabel {
	const clamped = Math.max(3, Math.min(10, Math.round(age)));
	return AGE_TO_GRADE.get(clamped) ?? 'Nursery';
}

/**
 * Get the typical age range for a grade.
 *
 * Returns a range spanning one year centred on the representative age for
 * the grade. For example, "Grade 1" (age 6) returns `{ min: 5, max: 7 }`.
 *
 * @param grade - Grade label to look up
 * @returns Age range `{ min, max }` in years, or `{ min: 3, max: 4 }` if the
 *          grade is not recognised
 */
export function getAgeRangeForGrade(grade: GradeLabel): { min: number; max: number } {
	const age = GRADE_TO_AGE.get(grade);
	if (age === undefined) {
		return { min: 3, max: 4 };
	}
	return { min: Math.max(3, age - 1), max: Math.min(10, age + 1) };
}

/** All supported grade labels as an ordered array (youngest first) */
export const ALL_GRADES: readonly GradeLabel[] = [
	'Nursery',
	'LKG',
	'UKG',
	'Grade 1',
	'Grade 2',
	'Grade 3',
	'Grade 4',
	'Grade 5'
] as const;
