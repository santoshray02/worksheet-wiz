import type { ActivityType, Subject } from '$lib/types/activity';

// ---------------------------------------------------------------------------
// Registry entry
// ---------------------------------------------------------------------------

/** Metadata record for a single activity type */
export interface ActivityMeta {
	/** Machine-readable activity type key */
	type: ActivityType;
	/** Human-readable display name */
	name: string;
	/** Short description of the activity */
	description: string;
	/** Recommended age range (inclusive) */
	ageRange: { min: number; max: number };
	/** Subject areas this activity can serve */
	subjects: Subject[];
	/** Icon identifier (maps to an SVG in the icons asset category) */
	icon: string;
}

// ---------------------------------------------------------------------------
// Registry data
// ---------------------------------------------------------------------------

/** Complete registry of all supported activity types */
export const ACTIVITY_REGISTRY: ReadonlyMap<ActivityType, ActivityMeta> = new Map<
	ActivityType,
	ActivityMeta
>([
	[
		'tracing',
		{
			type: 'tracing',
			name: 'Tracing',
			description: 'Trace letters, numbers, or shapes along guided paths',
			ageRange: { min: 3, max: 6 },
			subjects: ['english', 'hindi', 'math', 'motor'],
			icon: 'icon-tracing'
		}
	],
	[
		'counting',
		{
			type: 'counting',
			name: 'Counting',
			description: 'Count groups of objects and write or circle the answer',
			ageRange: { min: 3, max: 7 },
			subjects: ['math'],
			icon: 'icon-counting'
		}
	],
	[
		'matching',
		{
			type: 'matching',
			name: 'Matching',
			description: 'Draw lines to match related items on two columns',
			ageRange: { min: 3, max: 8 },
			subjects: ['math', 'english', 'hindi', 'science', 'logic'],
			icon: 'icon-matching'
		}
	],
	[
		'math',
		{
			type: 'math',
			name: 'Math Problems',
			description: 'Solve addition, subtraction, multiplication, or division problems',
			ageRange: { min: 4, max: 8 },
			subjects: ['math'],
			icon: 'icon-math'
		}
	],
	[
		'maze',
		{
			type: 'maze',
			name: 'Maze',
			description: 'Navigate through a maze from start to finish',
			ageRange: { min: 3, max: 8 },
			subjects: ['logic', 'motor'],
			icon: 'icon-maze'
		}
	],
	[
		'pattern',
		{
			type: 'pattern',
			name: 'Pattern Recognition',
			description: 'Identify and complete repeating patterns',
			ageRange: { min: 3, max: 7 },
			subjects: ['math', 'logic'],
			icon: 'icon-pattern'
		}
	],
	[
		'coloring',
		{
			type: 'coloring',
			name: 'Coloring',
			description: 'Color regions by label, number, or free choice',
			ageRange: { min: 3, max: 8 },
			subjects: ['art', 'motor'],
			icon: 'icon-coloring'
		}
	],
	[
		'spelling',
		{
			type: 'spelling',
			name: 'Spelling',
			description: 'Spell words using picture hints or fill in missing letters',
			ageRange: { min: 5, max: 8 },
			subjects: ['english', 'hindi'],
			icon: 'icon-spelling'
		}
	],
	[
		'handwriting',
		{
			type: 'handwriting',
			name: 'Handwriting Practice',
			description: 'Practice print or cursive writing on guided lines',
			ageRange: { min: 4, max: 8 },
			subjects: ['english', 'hindi', 'motor'],
			icon: 'icon-handwriting'
		}
	],
	[
		'connect-dots',
		{
			type: 'connect-dots',
			name: 'Connect the Dots',
			description: 'Connect numbered or lettered dots to reveal an image',
			ageRange: { min: 3, max: 7 },
			subjects: ['math', 'english', 'motor'],
			icon: 'icon-connect-dots'
		}
	],
	[
		'word-search',
		{
			type: 'word-search',
			name: 'Word Search',
			description: 'Find hidden words in a letter grid',
			ageRange: { min: 5, max: 8 },
			subjects: ['english'],
			icon: 'icon-word-search'
		}
	],
	[
		'crossword',
		{
			type: 'crossword',
			name: 'Crossword',
			description: 'Fill in a crossword puzzle using clues',
			ageRange: { min: 6, max: 8 },
			subjects: ['english'],
			icon: 'icon-crossword'
		}
	],
	[
		'odd-one-out',
		{
			type: 'odd-one-out',
			name: 'Odd One Out',
			description: 'Identify the item that does not belong in a group',
			ageRange: { min: 3, max: 7 },
			subjects: ['logic', 'science'],
			icon: 'icon-odd-one-out'
		}
	],
	[
		'number-bonds',
		{
			type: 'number-bonds',
			name: 'Number Bonds',
			description: 'Complete number bond diagrams showing part-whole relationships',
			ageRange: { min: 4, max: 7 },
			subjects: ['math'],
			icon: 'icon-number-bonds'
		}
	],
	[
		'story-sequencing',
		{
			type: 'story-sequencing',
			name: 'Story Sequencing',
			description: 'Arrange story panels in the correct order',
			ageRange: { min: 4, max: 7 },
			subjects: ['english', 'logic'],
			icon: 'icon-story-sequencing'
		}
	],
	[
		'cut-and-paste',
		{
			type: 'cut-and-paste',
			name: 'Cut and Paste',
			description: 'Cut out items and paste them into the correct slots',
			ageRange: { min: 3, max: 7 },
			subjects: ['motor', 'math', 'english', 'science'],
			icon: 'icon-cut-and-paste'
		}
	]
]);

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Return a filtered list of activity metadata.
 *
 * Both filter parameters are optional. When provided, only activities that
 * match **all** supplied filters are returned.
 *
 * @param subject - If provided, only include activities for this subject
 * @param age     - If provided, only include activities whose age range covers this age
 * @returns Array of matching {@link ActivityMeta} entries
 */
export function getAvailableActivities(subject?: Subject, age?: number): ActivityMeta[] {
	const results: ActivityMeta[] = [];

	for (const meta of ACTIVITY_REGISTRY.values()) {
		if (subject && !meta.subjects.includes(subject)) {
			continue;
		}
		if (age !== undefined && (age < meta.ageRange.min || age > meta.ageRange.max)) {
			continue;
		}
		results.push(meta);
	}

	return results;
}

/**
 * Retrieve the metadata for a specific activity type.
 *
 * @param type - The activity type to look up
 * @returns The {@link ActivityMeta} entry, or `undefined` if not found
 */
export function getActivityMeta(type: ActivityType): ActivityMeta | undefined {
	return ACTIVITY_REGISTRY.get(type);
}
