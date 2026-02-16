import { z } from 'zod';
import type { GenerateRequest } from './types';

// ---------------------------------------------------------------------------
// Activity type enum
// ---------------------------------------------------------------------------

const activityTypeEnum = z.enum([
	'tracing',
	'counting',
	'matching',
	'math',
	'maze',
	'pattern',
	'coloring',
	'spelling',
	'handwriting',
	'connect-dots',
	'word-search',
	'crossword',
	'odd-one-out',
	'number-bonds',
	'story-sequencing',
	'cut-and-paste'
]);

const difficultyLevel = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

// ---------------------------------------------------------------------------
// Shared base fields (used in every discriminated variant)
// ---------------------------------------------------------------------------

const baseFields = {
	id: z.string().describe('Unique identifier (e.g. nanoid or uuid)'),
	title: z.string().describe('Short, child-friendly title for the activity'),
	instructions: z.string().describe('Clear instructions a child or parent can read'),
	difficulty: difficultyLevel.describe('1 = easiest, 4 = hardest')
};

// ---------------------------------------------------------------------------
// Per-activity-type schemas
// ---------------------------------------------------------------------------

const tracingSchema = z.object({
	...baseFields,
	type: z.literal('tracing'),
	items: z.array(z.string()).min(1).describe('Items to trace: letters, numbers, shapes, or SVG path data'),
	tracingStyle: z.enum(['dotted', 'dashed', 'light']).describe('Visual style of the trace guides'),
	showArrows: z.boolean().describe('Whether to show directional arrows on the trace path')
});

const countingGroupSchema = z.object({
	assetId: z.string().describe('Asset identifier for the item image'),
	count: z.number().int().min(1).describe('Number of items in this group')
});

const countingSchema = z.object({
	...baseFields,
	type: z.literal('counting'),
	groups: z.array(countingGroupSchema).min(1).describe('Groups of items to count'),
	answerFormat: z.enum(['write', 'circle', 'match']).describe('How the child records their answer')
});

const matchingPairSchema = z.object({
	left: z.string().describe('Left-side label or text'),
	right: z.string().describe('Right-side label or text'),
	leftAssetId: z.string().nullable().describe('Optional asset ID for left-side image'),
	rightAssetId: z.string().nullable().describe('Optional asset ID for right-side image')
});

const matchingSchema = z.object({
	...baseFields,
	type: z.literal('matching'),
	pairs: z.array(matchingPairSchema).min(2).describe('Pairs the child must connect')
});

const mathProblemSchema = z.object({
	operand1: z.number().describe('First operand'),
	operator: z.enum(['+', '-', 'x', '\u00F7']).describe('Arithmetic operator'),
	operand2: z.number().describe('Second operand'),
	answer: z.number().describe('Correct answer')
});

const mathSchema = z.object({
	...baseFields,
	type: z.literal('math'),
	problems: z.array(mathProblemSchema).min(1).describe('Arithmetic problems'),
	showVisualAids: z.boolean().describe('Show pictures as visual aids'),
	assetId: z.string().nullable().describe('Asset used for visual aid illustrations')
});

const pointSchema = z.object({
	x: z.number(),
	y: z.number()
});

const mazeWallSchema = z.object({
	row: z.number().int(),
	col: z.number().int(),
	side: z.enum(['top', 'right', 'bottom', 'left'])
});

const mazeSchema = z.object({
	...baseFields,
	type: z.literal('maze'),
	width: z.number().int().min(3).describe('Number of columns'),
	height: z.number().int().min(3).describe('Number of rows'),
	start: pointSchema.describe('Entry point'),
	end: pointSchema.describe('Exit point'),
	walls: z.array(mazeWallSchema).describe('Wall segments forming the maze')
});

const patternSchema = z.object({
	...baseFields,
	type: z.literal('pattern'),
	sequence: z.array(z.string()).min(3).describe('Full sequence including blanks'),
	missingIndices: z.array(z.number().int()).min(1).describe('Indices hidden for the child to fill'),
	options: z.array(z.string()).min(2).describe('Answer options to choose from')
});

const coloringRegionSchema = z.object({
	pathData: z.string().describe('SVG path data for the region boundary'),
	colorLabel: z.string().nullable().describe('Color name label (e.g. "red")'),
	number: z.number().int().nullable().describe('Number for color-by-number activities')
});

const coloringSchema = z.object({
	...baseFields,
	type: z.literal('coloring'),
	regions: z.array(coloringRegionSchema).min(1).describe('Regions the child can color')
});

const spellingWordSchema = z.object({
	word: z.string().describe('The word to spell'),
	hint: z.string().nullable().describe('Optional hint or clue'),
	assetId: z.string().nullable().describe('Optional asset ID for an illustrative image')
});

const spellingSchema = z.object({
	...baseFields,
	type: z.literal('spelling'),
	words: z.array(spellingWordSchema).min(1).describe('Words the child must spell')
});

const handwritingLineSchema = z.object({
	text: z.string().describe('Text to practice'),
	style: z.enum(['print', 'cursive']).describe('Writing style')
});

const handwritingSchema = z.object({
	...baseFields,
	type: z.literal('handwriting'),
	lines: z.array(handwritingLineSchema).min(1).describe('Lines of text to practice'),
	lineHeight: z.number().positive().describe('Height of each writing line in mm'),
	guideType: z.enum(['4-line', '3-line', 'blank']).describe('Type of guide lines shown')
});

const labelledDotSchema = z.object({
	point: pointSchema,
	label: z.union([z.string(), z.number()]).describe('Dot label (number or letter)')
});

const connectDotsSchema = z.object({
	...baseFields,
	type: z.literal('connect-dots'),
	dots: z.array(labelledDotSchema).min(3).describe('Dots the child must connect'),
	sequential: z.boolean().describe('If true, dots must be connected in label order')
});

const wordSearchSchema = z.object({
	...baseFields,
	type: z.literal('word-search'),
	grid: z.array(z.array(z.string())).describe('2-D character grid (row-major)'),
	words: z.array(z.string()).min(1).describe('Words hidden in the grid'),
	size: z.object({
		rows: z.number().int().min(3),
		cols: z.number().int().min(3)
	}).describe('Grid dimensions')
});

const crosswordCellSchema = z.object({
	isBlack: z.boolean(),
	letter: z.string(),
	clueNumber: z.number().int().nullable()
});

const crosswordClueSchema = z.object({
	number: z.number().int(),
	text: z.string(),
	answer: z.string(),
	row: z.number().int(),
	col: z.number().int()
});

const crosswordSchema = z.object({
	...baseFields,
	type: z.literal('crossword'),
	grid: z.array(z.array(crosswordCellSchema)).describe('2-D crossword grid'),
	clues: z.object({
		across: z.array(crosswordClueSchema),
		down: z.array(crosswordClueSchema)
	}).describe('Clues grouped by direction')
});

const oddOneOutGroupSchema = z.object({
	items: z.array(z.string()).min(3).describe('Asset IDs for the items shown'),
	oddIndex: z.number().int().min(0).describe('Index of the odd item')
});

const oddOneOutSchema = z.object({
	...baseFields,
	type: z.literal('odd-one-out'),
	groups: z.array(oddOneOutGroupSchema).min(1).describe('Groups of items to evaluate')
});

const numberBondSchema = z.object({
	whole: z.number().int(),
	part1: z.number().int(),
	part2: z.number().int(),
	missingPart: z.enum(['whole', 'part1', 'part2']).describe('Which value the child must find')
});

const numberBondsSchema = z.object({
	...baseFields,
	type: z.literal('number-bonds'),
	bonds: z.array(numberBondSchema).min(1).describe('Bond exercises')
});

const storyPanelSchema = z.object({
	imageDescription: z.string().describe('Description of what the image should depict'),
	assetId: z.string().nullable().describe('Optional pre-made illustration asset ID'),
	caption: z.string().nullable().describe('Optional text caption beneath the panel'),
	correctOrder: z.number().int().min(1).describe('Correct position in the story (1-based)')
});

const storySequencingSchema = z.object({
	...baseFields,
	type: z.literal('story-sequencing'),
	panels: z.array(storyPanelSchema).min(2).describe('Panels the child must arrange in order')
});

const cutItemSchema = z.object({
	assetId: z.string().describe('Asset identifier for the cut-out item'),
	label: z.string().nullable().describe('Optional text label')
});

const pasteSlotSchema = z.object({
	label: z.string().describe('Label identifying where this item goes'),
	position: pointSchema.describe('Position on the worksheet')
});

const cutAndPasteSchema = z.object({
	...baseFields,
	type: z.literal('cut-and-paste'),
	items: z.array(cutItemSchema).min(1).describe('Items the child will cut out'),
	targetSlots: z.array(pasteSlotSchema).min(1).describe('Slots where items should be pasted')
});

// ---------------------------------------------------------------------------
// Discriminated union of all activity types
// ---------------------------------------------------------------------------

const activitySchema = z.discriminatedUnion('type', [
	tracingSchema,
	countingSchema,
	matchingSchema,
	mathSchema,
	mazeSchema,
	patternSchema,
	coloringSchema,
	spellingSchema,
	handwritingSchema,
	connectDotsSchema,
	wordSearchSchema,
	crosswordSchema,
	oddOneOutSchema,
	numberBondsSchema,
	storySequencingSchema,
	cutAndPasteSchema
]);

// ---------------------------------------------------------------------------
// Top-level worksheet schema (used with generateObject)
// ---------------------------------------------------------------------------

export const worksheetSchema = z.object({
	title: z.string().describe('A fun, engaging title for the worksheet'),
	activities: z
		.array(activitySchema)
		.min(1)
		.describe('Ordered list of activities for the worksheet')
});

export type WorksheetSchemaType = z.infer<typeof worksheetSchema>;

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

const ACTIVITY_TYPE_DESCRIPTIONS: Record<string, string> = {
	'tracing': 'Letter, number, or shape tracing with dotted/dashed guides',
	'counting': 'Count groups of illustrated objects',
	'matching': 'Draw lines to connect related pairs',
	'math': 'Arithmetic problems (addition, subtraction, etc.)',
	'maze': 'Navigate from start to finish through a maze grid',
	'pattern': 'Complete a repeating pattern by filling in blanks',
	'coloring': 'Color regions by name or number (color-by-number)',
	'spelling': 'Spell words from hints or pictures',
	'handwriting': 'Practice writing letters, words, or sentences',
	'connect-dots': 'Connect numbered/lettered dots to reveal a picture',
	'word-search': 'Find hidden words in a letter grid',
	'crossword': 'Fill in a crossword puzzle from clues',
	'odd-one-out': 'Identify the item that does not belong in a group',
	'number-bonds': 'Find the missing part in whole = part1 + part2',
	'story-sequencing': 'Arrange story panels in the correct order',
	'cut-and-paste': 'Cut out items and paste them into the correct slots'
};

export function buildSystemPrompt(): string {
	return `You are an expert pedagogical worksheet designer for children aged 3 to 10. Your role is to create engaging, age-appropriate educational worksheets.

## Guidelines

1. **Age-Appropriate Content**: Match difficulty and vocabulary to the child's age.
   - Ages 3-4: Very simple, focus on recognition, tracing, counting to 5, basic shapes/colors.
   - Ages 5-6: Beginning readers, numbers to 20, simple addition/subtraction, letter formation.
   - Ages 7-8: Short words and sentences, numbers to 100, two-digit operations, basic patterns.
   - Ages 9-10: More complex vocabulary, multiplication/division, multi-step problems, crosswords.

2. **Difficulty Scaling** (1-4):
   - Level 1: Minimal complexity, lots of visual support, very few items.
   - Level 2: Slightly more items, less visual support.
   - Level 3: Moderate complexity, expects some independent thinking.
   - Level 4: Challenging, more items, less scaffolding.

3. **Math Number Ranges by Age**:
   - Age 3-4: Numbers 1-5, counting only.
   - Age 5-6: Numbers 1-20, addition and subtraction within 10.
   - Age 7-8: Numbers 1-100, addition and subtraction within 50, intro to multiplication.
   - Age 9-10: Numbers 1-1000, all four operations, number bonds to 20+.

4. **Content Quality**:
   - Use simple, clear language in instructions.
   - Make titles fun and inviting (e.g. "Counting Safari!" or "Letter Land Adventure").
   - Ensure all answers are mathematically and factually correct.
   - For matching activities, ensure pairs are unambiguous.
   - For word search, ensure words actually exist in the grid.
   - For crosswords, ensure intersecting letters match.

5. **IDs**: Generate unique IDs for each activity using the format "act-{type}-{number}" (e.g. "act-math-1", "act-tracing-2").

6. **Asset IDs**: Use ONLY these exact asset IDs when referencing images:
   - **Animals**: cat, dog, fish, bird, elephant, lion, rabbit, butterfly, frog, turtle
   - **Sea Creatures**: whale, dolphin, octopus, crab, seahorse, starfish, jellyfish, shark
   - **Fruits**: apple, banana, orange, grapes, strawberry, watermelon
   - **Vegetables**: carrot, broccoli, tomato, corn, peas, potato, onion, mushroom
   - **Vehicles**: car, bus, truck, airplane, boat, bicycle, helicopter, train, rocket
   - **Instruments**: guitar, piano, drum, trumpet, violin, flute, tambourine, xylophone
   - **Objects**: ball, house, tree, flower, sun, moon, book, pencil-obj
   - **Shapes**: circle, triangle, square, star, heart, diamond
   Always pick assets from this list. Do NOT invent new asset IDs.

## Available Activity Types

${Object.entries(ACTIVITY_TYPE_DESCRIPTIONS)
	.map(([type, desc]) => `- **${type}**: ${desc}`)
	.join('\n')}

Return a structured JSON object matching the requested schema exactly. Every field must be populated correctly.`;
}

export function buildUserPrompt(request: GenerateRequest): string {
	const { subject, age, activities, count, theme } = request;

	// Determine default activity count based on age
	const activityCount = count ?? (age <= 4 ? 3 : age <= 6 ? 4 : age <= 8 ? 5 : 6);

	const activityInstruction =
		activities.length > 0
			? `Include these specific activity types: ${activities.join(', ')}.`
			: `Choose ${activityCount} appropriate activity types for the subject and age.`;

	const themeInstruction = theme
		? `Use the theme "${theme}" throughout the worksheet (in titles, examples, asset choices, etc.).`
		: '';

	const difficultyGuidance = getDifficultyGuidance(age);

	return `Create a ${subject} worksheet for a ${age}-year-old child.

${activityInstruction}
${themeInstruction}

Generate exactly ${activityCount} activities.

${difficultyGuidance}

Make the worksheet title creative and fun. All content must be appropriate for a ${age}-year-old.`;
}

function getDifficultyGuidance(age: number): string {
	if (age <= 4) {
		return `Difficulty guidance for age ${age}:
- Use difficulty levels 1-2 only.
- Numbers should be in the range 1-5.
- Use very simple, common words (cat, dog, sun, etc.).
- Tracing items should be large and simple (single letters, basic shapes).
- Keep instructions very short (under 10 words).
- Maximum 3-4 items per activity.`;
	}
	if (age <= 6) {
		return `Difficulty guidance for age ${age}:
- Use difficulty levels 1-3.
- Numbers should be in the range 1-20.
- Addition and subtraction within 10.
- Use common CVC words and simple sight words.
- Tracing can include full letters and numbers.
- Keep instructions concise (under 15 words).
- Maximum 5-6 items per activity.`;
	}
	if (age <= 8) {
		return `Difficulty guidance for age ${age}:
- Use difficulty levels 2-3.
- Numbers should be in the range 1-100.
- Addition and subtraction within 50, intro multiplication.
- Use grade-appropriate vocabulary.
- Word search grids can be 8x8 to 10x10.
- Keep instructions clear and direct.
- Maximum 8 items per activity.`;
	}
	return `Difficulty guidance for age ${age}:
- Use difficulty levels 2-4.
- Numbers can range up to 1000.
- All four arithmetic operations are appropriate.
- Use challenging but age-appropriate vocabulary.
- Word search grids can be 10x10 to 12x12.
- Crosswords can have 6-10 clues.
- Maximum 10 items per activity.`;
}
