import type { CountingData, CountingGroup } from '$lib/types/activity';
import type { OfflineGeneratorConfig } from '../types';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COUNTING_ASSETS = ['apple', 'star', 'cat', 'dog', 'fish', 'ball', 'flower', 'tree', 'sun', 'bird'];

export function generateCounting(config: OfflineGeneratorConfig): CountingData {
	const groupCount = Math.min(config.difficulty.itemsPerPage, 6);
	const groups: CountingGroup[] = [];
	const usedAssets = new Set<string>();

	for (let i = 0; i < groupCount; i++) {
		let assetId: string;
		do {
			assetId = COUNTING_ASSETS[randomInt(0, COUNTING_ASSETS.length - 1)];
		} while (usedAssets.has(assetId) && usedAssets.size < COUNTING_ASSETS.length);
		usedAssets.add(assetId);

		groups.push({
			assetId,
			count: randomInt(1, config.difficulty.maxNumber)
		});
	}

	return {
		id: `act-counting-${config.index}`,
		type: 'counting',
		title: 'Count the Objects',
		instructions: 'Count the items in each group and write the number.',
		difficulty: config.difficulty.level,
		groups,
		answerFormat: config.age <= 5 ? 'circle' : 'write'
	};
}
