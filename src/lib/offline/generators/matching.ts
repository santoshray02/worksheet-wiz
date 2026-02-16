import type { MatchingData, MatchingPair } from '$lib/types/activity';
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

interface PairPool {
	pairs: MatchingPair[];
	title: string;
}

const MATH_PAIRS: PairPool = {
	title: 'Match Numbers to Words',
	pairs: [
		{ left: '1', right: 'one' },
		{ left: '2', right: 'two' },
		{ left: '3', right: 'three' },
		{ left: '4', right: 'four' },
		{ left: '5', right: 'five' },
		{ left: '6', right: 'six' },
		{ left: '7', right: 'seven' },
		{ left: '8', right: 'eight' },
		{ left: '9', right: 'nine' },
		{ left: '10', right: 'ten' }
	]
};

const MATH_EQUATIONS: PairPool = {
	title: 'Match the Equations',
	pairs: [
		{ left: '1 + 1', right: '2' },
		{ left: '2 + 1', right: '3' },
		{ left: '2 + 2', right: '4' },
		{ left: '3 + 2', right: '5' },
		{ left: '4 + 2', right: '6' },
		{ left: '5 + 2', right: '7' },
		{ left: '3 + 5', right: '8' },
		{ left: '4 + 5', right: '9' },
		{ left: '5 + 5', right: '10' }
	]
};

const ENGLISH_PAIRS: PairPool = {
	title: 'Match Letters to Words',
	pairs: [
		{ left: 'A', right: 'Apple', rightAssetId: 'apple' },
		{ left: 'B', right: 'Ball', rightAssetId: 'ball' },
		{ left: 'C', right: 'Cat', rightAssetId: 'cat' },
		{ left: 'D', right: 'Dog', rightAssetId: 'dog' },
		{ left: 'F', right: 'Fish', rightAssetId: 'fish' },
		{ left: 'S', right: 'Star', rightAssetId: 'star' },
		{ left: 'T', right: 'Tree', rightAssetId: 'tree' },
		{ left: 'H', right: 'House', rightAssetId: 'house' }
	]
};

const SCIENCE_PAIRS: PairPool = {
	title: 'Match the Pairs',
	pairs: [
		{ left: 'Sun', right: 'Day', leftAssetId: 'sun' },
		{ left: 'Moon', right: 'Night', leftAssetId: 'moon' },
		{ left: 'Fish', right: 'Water', leftAssetId: 'fish' },
		{ left: 'Bird', right: 'Sky', leftAssetId: 'bird' },
		{ left: 'Frog', right: 'Pond', leftAssetId: 'frog' },
		{ left: 'Rabbit', right: 'Burrow', leftAssetId: 'rabbit' },
		{ left: 'Butterfly', right: 'Flower', leftAssetId: 'butterfly' },
		{ left: 'Turtle', right: 'Shell', leftAssetId: 'turtle' }
	]
};

const HINDI_PAIRS: PairPool = {
	title: 'Match Hindi Words',
	pairs: [
		{ left: 'क', right: 'कमल' },
		{ left: 'ख', right: 'खरगोश' },
		{ left: 'ग', right: 'गाय' },
		{ left: 'घ', right: 'घर' },
		{ left: 'च', right: 'चाँद' },
		{ left: 'छ', right: 'छाता' },
		{ left: 'ज', right: 'जहाज़' },
		{ left: 'झ', right: 'झंडा' }
	]
};

const DEFAULT_PAIRS: PairPool = {
	title: 'Match the Pairs',
	pairs: [
		{ left: 'Cat', right: 'Meow', leftAssetId: 'cat' },
		{ left: 'Dog', right: 'Woof', leftAssetId: 'dog' },
		{ left: 'Bird', right: 'Tweet', leftAssetId: 'bird' },
		{ left: 'Fish', right: 'Splash', leftAssetId: 'fish' },
		{ left: 'Lion', right: 'Roar', leftAssetId: 'lion' },
		{ left: 'Frog', right: 'Croak', leftAssetId: 'frog' }
	]
};

function getPool(subject: string, age: number): PairPool {
	switch (subject) {
		case 'math':
			return age >= 6 ? MATH_EQUATIONS : MATH_PAIRS;
		case 'english':
			return ENGLISH_PAIRS;
		case 'hindi':
			return HINDI_PAIRS;
		case 'science':
			return SCIENCE_PAIRS;
		default:
			return DEFAULT_PAIRS;
	}
}

export function generateMatching(config: OfflineGeneratorConfig): MatchingData {
	const pool = getPool(config.subject, config.age);
	const count = Math.min(config.difficulty.itemsPerPage, pool.pairs.length, 6);
	const pairs = shuffle(pool.pairs).slice(0, count);

	return {
		id: `act-matching-${config.index}`,
		type: 'matching',
		title: pool.title,
		instructions: 'Draw a line to match each item on the left with its pair on the right.',
		difficulty: config.difficulty.level,
		pairs
	};
}
