import type { Subject, DifficultyLevel } from '$lib/types/activity';

/** Configuration passed to each offline activity generator */
export interface OfflineGeneratorConfig {
	subject: Subject;
	age: number;
	difficulty: {
		level: DifficultyLevel;
		maxNumber: number;
		itemsPerPage: number;
		showHints: boolean;
	};
	/** Used for unique IDs: act-{type}-{index} */
	index: number;
}
