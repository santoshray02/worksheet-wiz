import type { TracingData, Subject } from '$lib/types/activity';
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

const POOLS: Record<string, string[]> = {
	english: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' '),
	math: '0 1 2 3 4 5 6 7 8 9 circle triangle square'.split(' '),
	hindi: 'अ आ इ ई उ ऊ ए ऐ ओ औ क ख ग घ च छ ज झ'.split(' '),
	motor: 'circle triangle square star heart diamond'.split(' '),
	science: 'circle triangle square star'.split(' '),
	art: 'circle triangle square star heart diamond'.split(' '),
	logic: '0 1 2 3 4 5 6 7 8 9'.split(' ')
};

export function generateTracing(config: OfflineGeneratorConfig): TracingData {
	const pool = POOLS[config.subject] ?? POOLS['english'];
	const count = Math.min(config.difficulty.itemsPerPage, pool.length);
	const items = shuffle(pool).slice(0, count);

	const subjectLabel: Record<Subject, string> = {
		english: 'Letters',
		math: 'Numbers & Shapes',
		hindi: 'Hindi Letters',
		motor: 'Shapes',
		science: 'Shapes',
		art: 'Shapes',
		logic: 'Numbers'
	};

	return {
		id: `act-tracing-${config.index}`,
		type: 'tracing',
		title: `Trace the ${subjectLabel[config.subject] ?? 'Items'}`,
		instructions: 'Trace along the dotted lines carefully.',
		difficulty: config.difficulty.level,
		items,
		tracingStyle: 'dotted',
		showArrows: config.age <= 5
	};
}
