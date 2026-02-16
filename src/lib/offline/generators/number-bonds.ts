import type { NumberBondsData, NumberBond, MissingBondPart } from '$lib/types/activity';
import type { OfflineGeneratorConfig } from '../types';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNumberBonds(config: OfflineGeneratorConfig): NumberBondsData {
	const count = Math.min(config.difficulty.itemsPerPage, 8);
	const bonds: NumberBond[] = [];
	const missingOptions: MissingBondPart[] = ['part1', 'part2', 'whole'];

	for (let i = 0; i < count; i++) {
		const whole = randomInt(2, config.difficulty.maxNumber);
		const part1 = randomInt(1, whole - 1);
		const part2 = whole - part1;
		const missingPart = missingOptions[randomInt(0, missingOptions.length - 1)];

		bonds.push({ whole, part1, part2, missingPart });
	}

	return {
		id: `act-number-bonds-${config.index}`,
		type: 'number-bonds',
		title: 'Number Bonds',
		instructions: 'Fill in the missing number to complete each number bond.',
		difficulty: config.difficulty.level,
		bonds
	};
}
