import type { PatternData } from '$lib/types/activity';
import type { OfflineGeneratorConfig } from '../types';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = randomInt(0, i);
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const SHAPE_ELEMENTS = ['circle', 'triangle', 'square', 'star', 'heart', 'diamond'];
const NUMBER_ELEMENTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const LETTER_ELEMENTS = 'A B C D E F G H I J K L'.split(' ');
const ASSET_ELEMENTS = ['apple', 'cat', 'dog', 'star', 'sun', 'flower', 'fish', 'bird'];

function pickPool(subject: string): string[] {
	switch (subject) {
		case 'math':
			return Math.random() > 0.5 ? NUMBER_ELEMENTS : SHAPE_ELEMENTS;
		case 'english':
			return LETTER_ELEMENTS;
		default:
			return Math.random() > 0.5 ? SHAPE_ELEMENTS : ASSET_ELEMENTS;
	}
}

export function generatePattern(config: OfflineGeneratorConfig): PatternData {
	const pool = pickPool(config.subject);
	// Pick 2-3 unique elements for the repeating unit
	const unitSize = config.age <= 5 ? 2 : randomInt(2, 3);
	const unit = shuffle(pool).slice(0, unitSize);

	// Repeat to get full sequence length (6-10 items)
	const totalLength = config.age <= 5 ? 6 : randomInt(7, 10);
	const sequence: string[] = [];
	for (let i = 0; i < totalLength; i++) {
		sequence.push(unit[i % unitSize]);
	}

	// Randomly blank 2-3 indices (not the first few to give context)
	const blankCount = config.age <= 5 ? 2 : 3;
	const candidateIndices = [];
	for (let i = unitSize; i < totalLength; i++) {
		candidateIndices.push(i);
	}
	const missingIndices = shuffle(candidateIndices).slice(0, blankCount).sort((a, b) => a - b);

	// Options: the correct answers + distractors
	const correctAnswers = new Set(missingIndices.map((i) => sequence[i]));
	const distractors = pool.filter((e) => !correctAnswers.has(e));
	const options = shuffle([...correctAnswers, ...shuffle(distractors).slice(0, 2)]);

	return {
		id: `act-pattern-${config.index}`,
		type: 'pattern',
		title: 'Complete the Pattern',
		instructions: 'Look at the pattern and fill in the missing items.',
		difficulty: config.difficulty.level,
		sequence,
		missingIndices,
		options
	};
}
