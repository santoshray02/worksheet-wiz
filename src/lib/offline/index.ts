import type { ActivityData, ActivityType, Subject } from '$lib/types/activity';
import { difficultyForAge } from '$lib/templates/difficulty';
import { GENERATOR_REGISTRY, OFFLINE_SUBSTITUTIONS, OFFLINE_SUPPORTED_TYPES } from './generators';
import { pickActivities } from './activity-picker';
import type { OfflineGeneratorConfig } from './types';

// ---------------------------------------------------------------------------
// Title generation
// ---------------------------------------------------------------------------

const TITLE_TEMPLATES: Partial<Record<Subject, string[]>> = {
	math: [
		'Math Adventures',
		'Number Fun Worksheet',
		'Math Practice Time',
		'Count & Calculate',
		'Number Explorers'
	],
	english: [
		'English Practice',
		'Word Wizards',
		'Reading & Writing Fun',
		'Letter Land Adventures',
		'Spelling Stars'
	],
	hindi: [
		'Hindi Practice',
		'Hindi Letter Fun',
		'Hindi Writing Adventures',
		'Learn Hindi Words'
	],
	science: [
		'Science Discovery',
		'Nature Explorers',
		'Science Fun Worksheet',
		'Little Scientists'
	],
	logic: [
		'Brain Teasers',
		'Think & Solve',
		'Logic Puzzles',
		'Smart Thinking'
	],
	motor: [
		'Fine Motor Skills',
		'Trace & Draw',
		'Hands-On Practice',
		'Motor Skills Fun'
	],
	art: [
		'Art & Creativity',
		'Draw & Trace',
		'Creative Fun',
		'Art Adventures'
	]
};

function generateTitle(subject: Subject): string {
	const templates = TITLE_TEMPLATES[subject] ?? ['Practice Worksheet'];
	return templates[Math.floor(Math.random() * templates.length)];
}

// ---------------------------------------------------------------------------
// Resolve activity types (substitute unsupported ones)
// ---------------------------------------------------------------------------

function resolveActivityTypes(types: ActivityType[]): ActivityType[] {
	const resolved: ActivityType[] = [];
	const seen = new Set<ActivityType>();

	for (const t of types) {
		let actual = t;
		if (!OFFLINE_SUPPORTED_TYPES.has(t)) {
			actual = OFFLINE_SUBSTITUTIONS.get(t) ?? 'pattern';
		}
		// Avoid duplicates from substitution
		if (!seen.has(actual)) {
			seen.add(actual);
			resolved.push(actual);
		}
	}

	return resolved;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface OfflineGenerateRequest {
	subject: Subject;
	age: number;
	activities: ActivityType[];
	letAIDecide: boolean;
}

export interface OfflineGenerateResult {
	title: string;
	activities: ActivityData[];
}

/**
 * Generate worksheet activities offline using procedural generators.
 * Returns the same data shape as the LLM-powered /api/generate endpoint.
 */
export function generateOffline(request: OfflineGenerateRequest): OfflineGenerateResult {
	const { subject, age } = request;
	const diff = difficultyForAge(age);

	// Determine which activity types to generate
	let requestedTypes: ActivityType[];
	if (request.letAIDecide || request.activities.length === 0) {
		requestedTypes = pickActivities(subject, age);
	} else {
		requestedTypes = request.activities;
	}

	// Resolve unsupported types to their substitutes
	const types = resolveActivityTypes(requestedTypes);

	// Generate each activity
	const activities: ActivityData[] = [];
	for (let i = 0; i < types.length; i++) {
		const type = types[i];
		const generator = GENERATOR_REGISTRY.get(type);
		if (!generator) continue;

		const config: OfflineGeneratorConfig = {
			subject,
			age,
			difficulty: {
				level: diff.level,
				maxNumber: diff.maxNumber,
				itemsPerPage: diff.itemsPerPage,
				showHints: diff.showHints
			},
			index: i
		};

		activities.push(generator(config));
	}

	return {
		title: generateTitle(subject),
		activities
	};
}
