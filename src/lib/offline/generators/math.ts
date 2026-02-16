import type { MathData, MathOperator, MathProblem } from '$lib/types/activity';
import type { OfflineGeneratorConfig } from '../types';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function operatorsForAge(age: number): MathOperator[] {
	if (age <= 4) return ['+'];
	if (age <= 6) return ['+', '-'];
	if (age <= 8) return ['+', '-', 'x'];
	return ['+', '-', 'x', '÷'];
}

function generateProblem(operators: MathOperator[], maxNum: number): MathProblem {
	const operator = operators[randomInt(0, operators.length - 1)];

	let operand1: number;
	let operand2: number;
	let answer: number;

	switch (operator) {
		case '+':
			operand1 = randomInt(1, maxNum);
			operand2 = randomInt(1, maxNum);
			answer = operand1 + operand2;
			break;
		case '-':
			// Ensure non-negative result
			answer = randomInt(0, maxNum);
			operand2 = randomInt(1, maxNum);
			operand1 = answer + operand2;
			break;
		case 'x':
			operand1 = randomInt(1, Math.min(12, maxNum));
			operand2 = randomInt(1, Math.min(12, maxNum));
			answer = operand1 * operand2;
			break;
		case '÷':
			// Pick answer first, then multiply to get operand1
			answer = randomInt(1, Math.min(12, maxNum));
			operand2 = randomInt(1, Math.min(12, maxNum));
			operand1 = answer * operand2;
			break;
		default:
			operand1 = randomInt(1, maxNum);
			operand2 = randomInt(1, maxNum);
			answer = operand1 + operand2;
	}

	return { operand1, operator, operand2, answer };
}

export function generateMath(config: OfflineGeneratorConfig): MathData {
	const operators = operatorsForAge(config.age);
	const count = config.difficulty.itemsPerPage;
	const problems: MathProblem[] = [];

	for (let i = 0; i < count; i++) {
		problems.push(generateProblem(operators, config.difficulty.maxNumber));
	}

	const opNames: Record<string, string> = {
		'+': 'Addition',
		'-': 'Subtraction',
		'x': 'Multiplication',
		'÷': 'Division'
	};
	const opLabel = operators.length === 1 ? opNames[operators[0]] : 'Mixed';

	return {
		id: `act-math-${config.index}`,
		type: 'math',
		title: `${opLabel} Practice`,
		instructions: `Solve each problem. ${config.difficulty.showHints ? 'You can use the pictures to help you count.' : 'Show your work.'}`,
		difficulty: config.difficulty.level,
		problems,
		showVisualAids: config.difficulty.showHints,
		assetId: config.difficulty.showHints ? 'apple' : null
	};
}
