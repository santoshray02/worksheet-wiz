import type { ActivityType, Subject } from '$lib/types/activity';
import { getAvailableActivities } from '$lib/activities/registry';
import { OFFLINE_SUPPORTED_TYPES } from './generators';

/** Core activity types prioritized per subject */
const CORE_TYPES: Partial<Record<Subject, ActivityType[]>> = {
	math: ['math', 'counting', 'number-bonds', 'pattern'],
	english: ['spelling', 'handwriting', 'tracing', 'matching'],
	hindi: ['handwriting', 'tracing', 'matching'],
	science: ['matching', 'odd-one-out', 'counting'],
	logic: ['pattern', 'odd-one-out', 'matching'],
	motor: ['tracing', 'counting', 'pattern'],
	art: ['tracing', 'pattern', 'counting']
};

/** How many activities to generate based on age */
function activityCountForAge(age: number): number {
	if (age <= 4) return 3;
	if (age <= 6) return 4;
	if (age <= 8) return 5;
	return 6;
}

/**
 * Pick activity types for offline generation when "Let AI Decide" / auto-select is enabled.
 * Filters to age-appropriate, subject-relevant, offline-supported types.
 */
export function pickActivities(subject: Subject, age: number): ActivityType[] {
	const count = activityCountForAge(age);

	// Get all activities appropriate for this subject + age
	const available = getAvailableActivities(subject, age)
		.map((m) => m.type)
		.filter((t) => OFFLINE_SUPPORTED_TYPES.has(t));

	if (available.length === 0) {
		// Fallback: just use whatever is offline-supported
		return [...OFFLINE_SUPPORTED_TYPES].slice(0, count);
	}

	// Prioritize core types for this subject
	const core = (CORE_TYPES[subject] ?? []).filter((t) => available.includes(t));
	const nonCore = available.filter((t) => !core.includes(t));

	const result: ActivityType[] = [];

	// Add core types first
	for (const t of core) {
		if (result.length >= count) break;
		result.push(t);
	}

	// Fill remaining with non-core types
	for (const t of nonCore) {
		if (result.length >= count) break;
		result.push(t);
	}

	return result;
}
