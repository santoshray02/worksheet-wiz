import type { Point } from '$lib/engine/types';

// ---------------------------------------------------------------------------
// Subject areas
// ---------------------------------------------------------------------------

/** Subject areas supported by the worksheet generator */
export type Subject = 'math' | 'english' | 'hindi' | 'science' | 'art' | 'logic' | 'motor';

// ---------------------------------------------------------------------------
// Activity types
// ---------------------------------------------------------------------------

/** All supported activity types */
export type ActivityType =
	| 'tracing'
	| 'counting'
	| 'matching'
	| 'math'
	| 'maze'
	| 'pattern'
	| 'coloring'
	| 'spelling'
	| 'handwriting'
	| 'connect-dots'
	| 'word-search'
	| 'crossword'
	| 'odd-one-out'
	| 'number-bonds'
	| 'story-sequencing'
	| 'cut-and-paste';

// ---------------------------------------------------------------------------
// Difficulty levels
// ---------------------------------------------------------------------------

/** Difficulty level: 1 (easiest) to 4 (hardest) */
export type DifficultyLevel = 1 | 2 | 3 | 4;

// ---------------------------------------------------------------------------
// Base activity data
// ---------------------------------------------------------------------------

/** Fields shared by every activity */
interface BaseActivityData {
	id: string;
	type: ActivityType;
	title: string;
	instructions: string;
	difficulty: DifficultyLevel;
}

// ---------------------------------------------------------------------------
// Tracing
// ---------------------------------------------------------------------------

/** Style used to render trace guides */
export type TracingStyle = 'dotted' | 'dashed' | 'light';

export interface TracingData extends BaseActivityData {
	type: 'tracing';
	/** Items to trace (letters, numbers, shapes, or SVG path data) */
	items: string[];
	/** Visual style of the trace lines */
	tracingStyle: TracingStyle;
	/** Whether to show directional arrows on the trace path */
	showArrows: boolean;
}

// ---------------------------------------------------------------------------
// Counting
// ---------------------------------------------------------------------------

/** A group of identical items to count */
export interface CountingGroup {
	assetId: string;
	count: number;
}

export interface CountingData extends BaseActivityData {
	type: 'counting';
	/** Groups of items the child must count */
	groups: CountingGroup[];
	/** How the child records their answer */
	answerFormat: 'write' | 'circle' | 'match';
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** A single left-right pair to match */
export interface MatchingPair {
	left: string;
	right: string;
	leftAssetId?: string | null;
	rightAssetId?: string | null;
}

export interface MatchingData extends BaseActivityData {
	type: 'matching';
	/** Pairs the child must connect */
	pairs: MatchingPair[];
}

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

/** Supported arithmetic operators */
export type MathOperator = '+' | '-' | 'x' | '÷';

/** A single arithmetic problem */
export interface MathProblem {
	operand1: number;
	operator: MathOperator;
	operand2: number;
	answer: number;
}

export interface MathData extends BaseActivityData {
	type: 'math';
	/** List of arithmetic problems */
	problems: MathProblem[];
	/** Whether to show pictures as visual aids (e.g. apples for addition) */
	showVisualAids: boolean;
	/** Asset used for visual aid illustrations */
	assetId?: string | null;
}

// ---------------------------------------------------------------------------
// Maze
// ---------------------------------------------------------------------------

/** A wall segment within the maze grid */
export interface MazeWall {
	/** Row of the cell that owns this wall */
	row: number;
	/** Column of the cell that owns this wall */
	col: number;
	/** Which side of the cell the wall is on */
	side: 'top' | 'right' | 'bottom' | 'left';
}

export interface MazeData extends BaseActivityData {
	type: 'maze';
	/** Number of columns in the maze grid */
	width: number;
	/** Number of rows in the maze grid */
	height: number;
	/** Entry point of the maze */
	start: Point;
	/** Exit point of the maze */
	end: Point;
	/** Wall segments that form the maze */
	walls: MazeWall[];
}

// ---------------------------------------------------------------------------
// Pattern
// ---------------------------------------------------------------------------

export interface PatternData extends BaseActivityData {
	type: 'pattern';
	/** Full sequence including the blanks (text labels or asset IDs) */
	sequence: string[];
	/** Indices within the sequence that are hidden for the child to fill */
	missingIndices: number[];
	/** Answer options to choose from */
	options: string[];
}

// ---------------------------------------------------------------------------
// Coloring
// ---------------------------------------------------------------------------

/** A region inside a coloring activity */
export interface ColoringRegion {
	/** SVG path data describing the region boundary */
	pathData: string;
	/** Optional color name label (e.g. "red") */
	colorLabel?: string | null;
	/** Optional number for color-by-number activities */
	number?: number | null;
}

export interface ColoringData extends BaseActivityData {
	type: 'coloring';
	/** Regions the child can color */
	regions: ColoringRegion[];
}

// ---------------------------------------------------------------------------
// Spelling
// ---------------------------------------------------------------------------

/** A single spelling word entry */
export interface SpellingWord {
	word: string;
	hint?: string | null;
	assetId?: string | null;
}

export interface SpellingData extends BaseActivityData {
	type: 'spelling';
	/** Words the child must spell */
	words: SpellingWord[];
}

// ---------------------------------------------------------------------------
// Handwriting
// ---------------------------------------------------------------------------

/** A single line of handwriting practice */
export interface HandwritingLine {
	text: string;
	style: 'print' | 'cursive';
}

/** Guide line style for handwriting practice */
export type HandwritingGuideType = '4-line' | '3-line' | 'blank';

export interface HandwritingData extends BaseActivityData {
	type: 'handwriting';
	/** Lines of text to practice */
	lines: HandwritingLine[];
	/** Height of each writing line in mm */
	lineHeight: number;
	/** Type of guide lines shown */
	guideType: HandwritingGuideType;
}

// ---------------------------------------------------------------------------
// Connect-the-Dots
// ---------------------------------------------------------------------------

/** A single labelled dot */
export interface LabelledDot {
	point: Point;
	label: string | number;
}

export interface ConnectDotsData extends BaseActivityData {
	type: 'connect-dots';
	/** Dots the child must connect */
	dots: LabelledDot[];
	/** If true, dots must be connected in label order */
	sequential: boolean;
}

// ---------------------------------------------------------------------------
// Word Search
// ---------------------------------------------------------------------------

export interface WordSearchData extends BaseActivityData {
	type: 'word-search';
	/** 2-D character grid (each inner array is a row of single characters) */
	grid: string[][];
	/** Words hidden in the grid */
	words: string[];
	/** Grid dimensions */
	size: { rows: number; cols: number };
}

// ---------------------------------------------------------------------------
// Crossword
// ---------------------------------------------------------------------------

/** Cell state inside a crossword grid */
export interface CrosswordCell {
	/** Whether this cell is blacked out */
	isBlack: boolean;
	/** Letter that belongs in this cell (empty string for black cells) */
	letter: string;
	/** Optional clue number displayed in the cell */
	clueNumber?: number | null;
}

/** A single crossword clue */
export interface CrosswordClue {
	number: number;
	text: string;
	answer: string;
	row: number;
	col: number;
}

export interface CrosswordData extends BaseActivityData {
	type: 'crossword';
	/** 2-D grid of crossword cells */
	grid: CrosswordCell[][];
	/** Clues grouped by direction */
	clues: {
		across: CrosswordClue[];
		down: CrosswordClue[];
	};
}

// ---------------------------------------------------------------------------
// Odd One Out
// ---------------------------------------------------------------------------

/** A group of items where one doesn't belong */
export interface OddOneOutGroup {
	/** Asset IDs for the items shown */
	items: string[];
	/** Index of the item that is the odd one out */
	oddIndex: number;
}

export interface OddOneOutData extends BaseActivityData {
	type: 'odd-one-out';
	/** Groups of items to evaluate */
	groups: OddOneOutGroup[];
}

// ---------------------------------------------------------------------------
// Number Bonds
// ---------------------------------------------------------------------------

/** Which part of the bond is hidden */
export type MissingBondPart = 'whole' | 'part1' | 'part2';

/** A single number bond (whole = part1 + part2) */
export interface NumberBond {
	whole: number;
	part1: number;
	part2: number;
	/** Which value the child must find */
	missingPart: MissingBondPart;
}

export interface NumberBondsData extends BaseActivityData {
	type: 'number-bonds';
	/** Bond exercises */
	bonds: NumberBond[];
}

// ---------------------------------------------------------------------------
// Story Sequencing
// ---------------------------------------------------------------------------

/** A panel within a story sequencing activity */
export interface StoryPanel {
	/** Description of what the image should depict */
	imageDescription: string;
	/** Optional asset ID if a pre-made illustration is used */
	assetId?: string | null;
	/** Optional text caption shown beneath the panel */
	caption?: string | null;
	/** The correct position of this panel in the story (1-based) */
	correctOrder: number;
}

export interface StorySequencingData extends BaseActivityData {
	type: 'story-sequencing';
	/** Panels the child must arrange in order */
	panels: StoryPanel[];
}

// ---------------------------------------------------------------------------
// Cut and Paste
// ---------------------------------------------------------------------------

/** An item the child cuts out */
export interface CutItem {
	assetId: string;
	label?: string | null;
}

/** A target slot where cut items should be pasted */
export interface PasteSlot {
	label: string;
	position: Point;
}

export interface CutAndPasteData extends BaseActivityData {
	type: 'cut-and-paste';
	/** Items the child will cut out */
	items: CutItem[];
	/** Slots where items should be pasted */
	targetSlots: PasteSlot[];
}

// ---------------------------------------------------------------------------
// Discriminated union of all activity data types
// ---------------------------------------------------------------------------

export type ActivityData =
	| TracingData
	| CountingData
	| MatchingData
	| MathData
	| MazeData
	| PatternData
	| ColoringData
	| SpellingData
	| HandwritingData
	| ConnectDotsData
	| WordSearchData
	| CrosswordData
	| OddOneOutData
	| NumberBondsData
	| StorySequencingData
	| CutAndPasteData;
