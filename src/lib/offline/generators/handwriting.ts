import type { HandwritingData, HandwritingLine, HandwritingGuideType } from '$lib/types/activity';
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

const YOUNG_WORDS_EN = ['cat', 'dog', 'sun', 'hat', 'red', 'big', 'run', 'the', 'and', 'mom', 'dad', 'cup'];
const OLDER_WORDS_EN = ['apple', 'house', 'water', 'happy', 'green', 'book', 'sleep', 'friend', 'school', 'plant'];
const SENTENCES_EN = [
	'The cat sat on the mat.',
	'I like to read books.',
	'The sun is very bright.',
	'My dog is my best friend.',
	'She ran to the big tree.',
	'We play in the garden.',
	'The bird can fly high.',
	'I love to draw and paint.'
];

const YOUNG_WORDS_HI = ['कम', 'घर', 'पर', 'नल', 'जल', 'फल', 'बस', 'दस', 'मन', 'रस'];
const OLDER_WORDS_HI = ['कमल', 'नमक', 'सड़क', 'पानी', 'खाना', 'बच्चा', 'स्कूल', 'किताब'];
const SENTENCES_HI = [
	'यह मेरा घर है।',
	'मुझे फल पसंद हैं।',
	'सूरज गर्म है।',
	'मैं स्कूल जाता हूँ।'
];

export function generateHandwriting(config: OfflineGeneratorConfig): HandwritingData {
	const isHindi = config.subject === 'hindi';
	const isYoung = config.age <= 5;

	let lines: HandwritingLine[];
	let guideType: HandwritingGuideType;
	let title: string;

	if (isYoung) {
		const pool = isHindi ? YOUNG_WORDS_HI : YOUNG_WORDS_EN;
		const count = Math.min(config.difficulty.itemsPerPage, pool.length);
		const words = shuffle(pool).slice(0, count);
		lines = words.map((text) => ({ text, style: 'print' as const }));
		guideType = '4-line';
		title = isHindi ? 'Hindi Handwriting Practice' : 'Handwriting Practice';
	} else if (config.age <= 7) {
		const pool = isHindi ? OLDER_WORDS_HI : OLDER_WORDS_EN;
		const count = Math.min(config.difficulty.itemsPerPage, pool.length);
		const words = shuffle(pool).slice(0, count);
		lines = words.map((text) => ({ text, style: 'print' as const }));
		guideType = '3-line';
		title = isHindi ? 'Hindi Word Practice' : 'Word Practice';
	} else {
		const pool = isHindi ? SENTENCES_HI : SENTENCES_EN;
		const count = Math.min(4, pool.length);
		const sentences = shuffle(pool).slice(0, count);
		lines = sentences.map((text) => ({ text, style: 'print' as const }));
		guideType = '3-line';
		title = isHindi ? 'Hindi Sentence Practice' : 'Sentence Practice';
	}

	return {
		id: `act-handwriting-${config.index}`,
		type: 'handwriting',
		title,
		instructions: `Copy each ${isYoung ? 'word' : 'line'} carefully on the lines below.`,
		difficulty: config.difficulty.level,
		lines,
		lineHeight: isYoung ? 12 : 10,
		guideType
	};
}
