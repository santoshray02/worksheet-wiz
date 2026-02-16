import type { OddOneOutData, OddOneOutGroup } from '$lib/types/activity';
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

interface CategoryGroup {
	category: string[];
	odd: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
	{ category: ['cat', 'dog', 'rabbit'], odd: ['apple', 'car', 'book'] },
	{ category: ['apple', 'banana', 'orange'], odd: ['cat', 'car', 'star'] },
	{ category: ['car', 'bus', 'truck'], odd: ['fish', 'flower', 'sun'] },
	{ category: ['sun', 'moon', 'star'], odd: ['dog', 'apple', 'house'] },
	{ category: ['fish', 'dolphin', 'whale'], odd: ['bird', 'tree', 'ball'] },
	{ category: ['guitar', 'piano', 'drum'], odd: ['frog', 'carrot', 'boat'] },
	{ category: ['carrot', 'broccoli', 'corn'], odd: ['lion', 'guitar', 'airplane'] },
	{ category: ['bird', 'butterfly', 'elephant'], odd: ['train', 'book', 'pencil-obj'] },
	{ category: ['flower', 'tree', 'mushroom'], odd: ['cat', 'bus', 'drum'] },
	{ category: ['ball', 'bicycle', 'boat'], odd: ['tomato', 'frog', 'moon'] }
];

export function generateOddOneOut(config: OfflineGeneratorConfig): OddOneOutData {
	const groupCount = Math.min(config.difficulty.itemsPerPage, CATEGORY_GROUPS.length, 4);
	const selectedGroups = shuffle(CATEGORY_GROUPS).slice(0, groupCount);

	const groups: OddOneOutGroup[] = selectedGroups.map((cg) => {
		const oddItem = cg.odd[randomInt(0, cg.odd.length - 1)];
		const items = shuffle([...cg.category, oddItem]);
		const oddIndex = items.indexOf(oddItem);
		return { items, oddIndex };
	});

	return {
		id: `act-odd-one-out-${config.index}`,
		type: 'odd-one-out',
		title: 'Odd One Out',
		instructions: 'Circle the item that does not belong in each group.',
		difficulty: config.difficulty.level,
		groups
	};
}
