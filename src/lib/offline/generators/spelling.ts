import type { SpellingData, SpellingWord } from '$lib/types/activity';
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

interface WordEntry {
	word: string;
	hint: string;
	assetId?: string;
}

const WORDS_EASY: WordEntry[] = [
	{ word: 'cat', hint: 'A furry pet that meows', assetId: 'cat' },
	{ word: 'dog', hint: 'A loyal pet that barks', assetId: 'dog' },
	{ word: 'sun', hint: 'Shines in the sky', assetId: 'sun' },
	{ word: 'fish', hint: 'Swims in water', assetId: 'fish' },
	{ word: 'ball', hint: 'Round toy to play with', assetId: 'ball' },
	{ word: 'star', hint: 'Twinkles at night', assetId: 'star' },
	{ word: 'bird', hint: 'Has wings and can fly', assetId: 'bird' },
	{ word: 'tree', hint: 'Tall plant with leaves', assetId: 'tree' }
];

const WORDS_MEDIUM: WordEntry[] = [
	{ word: 'apple', hint: 'A red fruit', assetId: 'apple' },
	{ word: 'house', hint: 'Where people live', assetId: 'house' },
	{ word: 'flower', hint: 'Grows in a garden', assetId: 'flower' },
	{ word: 'rabbit', hint: 'Hops around', assetId: 'rabbit' },
	{ word: 'moon', hint: 'Visible at night', assetId: 'moon' },
	{ word: 'book', hint: 'You read this', assetId: 'book' },
	{ word: 'train', hint: 'Runs on tracks', assetId: 'train' },
	{ word: 'elephant', hint: 'The biggest land animal', assetId: 'elephant' }
];

const WORDS_HARD: WordEntry[] = [
	{ word: 'butterfly', hint: 'Beautiful insect with colorful wings', assetId: 'butterfly' },
	{ word: 'guitar', hint: 'A stringed instrument', assetId: 'guitar' },
	{ word: 'dolphin', hint: 'Smart marine mammal', assetId: 'dolphin' },
	{ word: 'bicycle', hint: 'Two-wheeled vehicle', assetId: 'bicycle' },
	{ word: 'mushroom', hint: 'Grows on the ground', assetId: 'mushroom' },
	{ word: 'helicopter', hint: 'Flying machine with blades', assetId: 'helicopter' },
	{ word: 'broccoli', hint: 'A green vegetable', assetId: 'broccoli' },
	{ word: 'xylophone', hint: 'You hit it with mallets', assetId: 'xylophone' }
];

function getWordPool(age: number): WordEntry[] {
	if (age <= 5) return WORDS_EASY;
	if (age <= 7) return WORDS_MEDIUM;
	return WORDS_HARD;
}

export function generateSpelling(config: OfflineGeneratorConfig): SpellingData {
	const pool = getWordPool(config.age);
	const count = Math.min(config.difficulty.itemsPerPage, pool.length, 6);
	const selected = shuffle(pool).slice(0, count);

	const words: SpellingWord[] = selected.map((entry) => ({
		word: entry.word,
		hint: config.difficulty.showHints ? entry.hint : null,
		assetId: entry.assetId ?? null
	}));

	return {
		id: `act-spelling-${config.index}`,
		type: 'spelling',
		title: 'Spelling Practice',
		instructions: config.difficulty.showHints
			? 'Look at the picture and hint, then spell the word.'
			: 'Spell each word correctly.',
		difficulty: config.difficulty.level,
		words
	};
}
