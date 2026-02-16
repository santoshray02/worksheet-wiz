import { describe, it, expect } from 'vitest';
import {
	createStandardLayout,
	subdivideZone,
	stackVertically,
	stackHorizontally
} from '$lib/templates/zones';
import type { LayoutZone } from '$lib/templates/zones';
import { difficultyForAge } from '$lib/templates/difficulty';
import { templateRegistry } from '$lib/templates/registry';
import type { BaseTemplate } from '$lib/templates/base';
import type { WorksheetLayout } from '$lib/templates/zones';
import type { DifficultyConfig } from '$lib/templates/difficulty';

// Import templates so they register themselves
import '$lib/templates/activities/tracing';
import '$lib/templates/activities/counting';
import '$lib/templates/activities/matching';
import '$lib/templates/activities/math';
import '$lib/templates/activities/maze';
import '$lib/templates/activities/pattern';
import '$lib/templates/activities/coloring';
import '$lib/templates/activities/spelling';
import '$lib/templates/activities/handwriting';
import '$lib/templates/activities/connect-dots';
import '$lib/templates/activities/word-search';
import '$lib/templates/activities/crossword';
import '$lib/templates/activities/odd-one-out';
import '$lib/templates/activities/number-bonds';
import '$lib/templates/activities/story-sequencing';
import '$lib/templates/activities/cut-and-paste';

// ---------------------------------------------------------------------------
// Zone subdivision tests
// ---------------------------------------------------------------------------

describe('subdivideZone', () => {
	const parentZone: LayoutZone = {
		id: 'test',
		name: 'Test Zone',
		bounds: { x: 10, y: 10, width: 190, height: 200 }
	};

	it('should create correct number of sub-zones', () => {
		const zones = subdivideZone(parentZone, 2, 3);
		expect(zones).toHaveLength(6);
	});

	it('should produce sub-zones within the parent bounds', () => {
		const zones = subdivideZone(parentZone, 2, 2, 2);
		for (const z of zones) {
			expect(z.bounds.x).toBeGreaterThanOrEqual(parentZone.bounds.x);
			expect(z.bounds.y).toBeGreaterThanOrEqual(parentZone.bounds.y);
			expect(z.bounds.x + z.bounds.width).toBeLessThanOrEqual(
				parentZone.bounds.x + parentZone.bounds.width + 0.001
			);
			expect(z.bounds.y + z.bounds.height).toBeLessThanOrEqual(
				parentZone.bounds.y + parentZone.bounds.height + 0.001
			);
		}
	});

	it('should produce evenly sized sub-zones', () => {
		const zones = subdivideZone(parentZone, 2, 2, 2);
		const widths = zones.map((z) => z.bounds.width);
		const heights = zones.map((z) => z.bounds.height);

		// All widths should be equal
		for (const w of widths) {
			expect(w).toBeCloseTo(widths[0], 5);
		}
		// All heights should be equal
		for (const h of heights) {
			expect(h).toBeCloseTo(heights[0], 5);
		}
	});

	it('should name sub-zones with row and column indices', () => {
		const zones = subdivideZone(parentZone, 2, 2);
		expect(zones[0].id).toBe('test-0-0');
		expect(zones[1].id).toBe('test-0-1');
		expect(zones[2].id).toBe('test-1-0');
		expect(zones[3].id).toBe('test-1-1');
	});

	it('should account for gaps between sub-zones', () => {
		const gap = 5;
		const zones = subdivideZone(parentZone, 1, 2, gap);
		// Two columns: totalGapX = 5, each cell width = (190 - 5) / 2 = 92.5
		expect(zones[0].bounds.width).toBeCloseTo(92.5, 5);
		expect(zones[1].bounds.width).toBeCloseTo(92.5, 5);
		// Second column starts at: 10 + 92.5 + 5 = 107.5
		expect(zones[1].bounds.x).toBeCloseTo(107.5, 5);
	});
});

describe('stackVertically', () => {
	const zone: LayoutZone = {
		id: 'v',
		name: 'V',
		bounds: { x: 0, y: 0, width: 100, height: 100 }
	};

	it('should create correct number of vertical slots', () => {
		const slots = stackVertically(zone, 4);
		expect(slots).toHaveLength(4);
	});

	it('should have full-width slots', () => {
		const slots = stackVertically(zone, 3);
		for (const s of slots) {
			expect(s.bounds.width).toBe(100);
		}
	});

	it('should stack slots top to bottom', () => {
		const slots = stackVertically(zone, 3, 2);
		expect(slots[0].bounds.y).toBe(0);
		expect(slots[1].bounds.y).toBeGreaterThan(slots[0].bounds.y);
		expect(slots[2].bounds.y).toBeGreaterThan(slots[1].bounds.y);
	});
});

describe('stackHorizontally', () => {
	const zone: LayoutZone = {
		id: 'h',
		name: 'H',
		bounds: { x: 0, y: 0, width: 100, height: 50 }
	};

	it('should create correct number of horizontal slots', () => {
		const slots = stackHorizontally(zone, 4);
		expect(slots).toHaveLength(4);
	});

	it('should have full-height slots', () => {
		const slots = stackHorizontally(zone, 3);
		for (const s of slots) {
			expect(s.bounds.height).toBe(50);
		}
	});

	it('should stack slots left to right', () => {
		const slots = stackHorizontally(zone, 3, 2);
		expect(slots[0].bounds.x).toBe(0);
		expect(slots[1].bounds.x).toBeGreaterThan(slots[0].bounds.x);
		expect(slots[2].bounds.x).toBeGreaterThan(slots[1].bounds.x);
	});
});

// ---------------------------------------------------------------------------
// Standard layout tests
// ---------------------------------------------------------------------------

describe('createStandardLayout', () => {
	it('should create all four zones', () => {
		const layout = createStandardLayout();
		expect(layout.header).toBeDefined();
		expect(layout.instructions).toBeDefined();
		expect(layout.activity).toBeDefined();
		expect(layout.footer).toBeDefined();
	});

	it('should have non-overlapping zones from top to bottom', () => {
		const layout = createStandardLayout();
		const headerBottom = layout.header.bounds.y + layout.header.bounds.height;
		const instructionsBottom = layout.instructions.bounds.y + layout.instructions.bounds.height;
		const activityBottom = layout.activity.bounds.y + layout.activity.bounds.height;

		expect(layout.instructions.bounds.y).toBeGreaterThanOrEqual(headerBottom);
		expect(layout.activity.bounds.y).toBeGreaterThanOrEqual(instructionsBottom);
		expect(layout.footer.bounds.y).toBeGreaterThanOrEqual(activityBottom);
	});

	it('should fill the width of the content area', () => {
		const layout = createStandardLayout();
		const contentWidth = 210 - 10 - 10; // A4 width minus default margins
		expect(layout.header.bounds.width).toBe(contentWidth);
		expect(layout.activity.bounds.width).toBe(contentWidth);
	});
});

// ---------------------------------------------------------------------------
// Difficulty configuration tests
// ---------------------------------------------------------------------------

describe('difficultyForAge', () => {
	it('should return level 1 for ages 3-4', () => {
		expect(difficultyForAge(3).level).toBe(1);
		expect(difficultyForAge(4).level).toBe(1);
	});

	it('should return level 2 for ages 5-6', () => {
		expect(difficultyForAge(5).level).toBe(2);
		expect(difficultyForAge(6).level).toBe(2);
	});

	it('should return level 3 for ages 7-8', () => {
		expect(difficultyForAge(7).level).toBe(3);
		expect(difficultyForAge(8).level).toBe(3);
	});

	it('should return level 4 for ages 9-10', () => {
		expect(difficultyForAge(9).level).toBe(4);
		expect(difficultyForAge(10).level).toBe(4);
	});

	it('should clamp ages below 3 to level 1', () => {
		expect(difficultyForAge(1).level).toBe(1);
		expect(difficultyForAge(2).level).toBe(1);
	});

	it('should clamp ages above 10 to level 4', () => {
		expect(difficultyForAge(11).level).toBe(4);
		expect(difficultyForAge(15).level).toBe(4);
	});

	it('should have showHints true for younger ages', () => {
		expect(difficultyForAge(3).showHints).toBe(true);
		expect(difficultyForAge(6).showHints).toBe(true);
	});

	it('should have showHints false for older ages', () => {
		expect(difficultyForAge(7).showHints).toBe(false);
		expect(difficultyForAge(10).showHints).toBe(false);
	});

	it('should have fontSizePt derived from fontSize', () => {
		const config = difficultyForAge(5);
		// fontSize is in mm, fontSizePt = fontSize * MM_TO_PT
		expect(config.fontSizePt).toBeGreaterThan(0);
		expect(config.fontSizePt).toBeGreaterThan(config.fontSize);
	});
});

// ---------------------------------------------------------------------------
// Template registry tests
// ---------------------------------------------------------------------------

describe('templateRegistry', () => {
	it('should have all 16 activity templates registered', () => {
		const types = templateRegistry.getAll();
		expect(types).toContain('tracing');
		expect(types).toContain('counting');
		expect(types).toContain('matching');
		expect(types).toContain('math');
		expect(types).toContain('maze');
		expect(types).toContain('pattern');
		expect(types).toContain('coloring');
		expect(types).toContain('spelling');
		expect(types).toContain('handwriting');
		expect(types).toContain('connect-dots');
		expect(types).toContain('word-search');
		expect(types).toContain('crossword');
		expect(types).toContain('odd-one-out');
		expect(types).toContain('number-bonds');
		expect(types).toContain('story-sequencing');
		expect(types).toContain('cut-and-paste');
	});

	it('should return true for has() on registered types', () => {
		expect(templateRegistry.has('tracing')).toBe(true);
		expect(templateRegistry.has('maze')).toBe(true);
	});

	it('should create template instances via create()', () => {
		const layout = createStandardLayout();
		const difficulty = difficultyForAge(5);

		const template = templateRegistry.create('tracing', layout, difficulty);
		expect(template).toBeDefined();
		expect(typeof template.renderActivity).toBe('function');
		expect(typeof template.renderHeader).toBe('function');
		expect(typeof template.renderPage).toBe('function');
	});

	it('should throw for unregistered activity types', () => {
		const layout = createStandardLayout();
		const difficulty = difficultyForAge(5);

		expect(() => {
			templateRegistry.create('nonexistent' as any, layout, difficulty);
		}).toThrow('No template registered');
	});

	it('should be able to create all registered templates', () => {
		const layout = createStandardLayout();
		const difficulty = difficultyForAge(6);
		const types = templateRegistry.getAll();

		for (const type of types) {
			const template = templateRegistry.create(type, layout, difficulty);
			expect(template).toBeDefined();
		}
	});
});
