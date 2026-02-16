import { describe, it, expect } from 'vitest';
import {
	createRect,
	createCircle,
	createLine,
	createPath,
	createText,
	createImage,
	createGroup,
	createTracingGuide,
	createDottedLine,
	createAnswerBox,
	createNumberLine
} from '$lib/engine/elements';

describe('createRect', () => {
	it('should create a rect element with correct type and dimensions', () => {
		const rect = createRect(10, 20, 100, 50);
		expect(rect.type).toBe('rect');
		expect(rect.x).toBe(10);
		expect(rect.y).toBe(20);
		expect(rect.width).toBe(100);
		expect(rect.height).toBe(50);
	});

	it('should include attributes in the attributes map', () => {
		const rect = createRect(10, 20, 100, 50);
		expect(rect.attributes.x).toBe(10);
		expect(rect.attributes.y).toBe(20);
		expect(rect.attributes.width).toBe(100);
		expect(rect.attributes.height).toBe(50);
	});

	it('should merge additional attributes', () => {
		const rect = createRect(0, 0, 10, 10, { fill: 'red', stroke: 'blue' });
		expect(rect.attributes.fill).toBe('red');
		expect(rect.attributes.stroke).toBe('blue');
	});

	it('should set rx and ry when provided', () => {
		const rect = createRect(0, 0, 10, 10, { rx: 2, ry: 3 });
		expect(rect.rx).toBe(2);
		expect(rect.ry).toBe(3);
	});

	it('should leave rx and ry undefined when not provided', () => {
		const rect = createRect(0, 0, 10, 10);
		expect(rect.rx).toBeUndefined();
		expect(rect.ry).toBeUndefined();
	});
});

describe('createCircle', () => {
	it('should create a circle element with correct type and geometry', () => {
		const circle = createCircle(50, 60, 25);
		expect(circle.type).toBe('circle');
		expect(circle.cx).toBe(50);
		expect(circle.cy).toBe(60);
		expect(circle.r).toBe(25);
	});

	it('should include attributes in the attributes map', () => {
		const circle = createCircle(50, 60, 25);
		expect(circle.attributes.cx).toBe(50);
		expect(circle.attributes.cy).toBe(60);
		expect(circle.attributes.r).toBe(25);
	});

	it('should merge additional attributes', () => {
		const circle = createCircle(0, 0, 10, { fill: '#ff0000', 'stroke-width': 2 });
		expect(circle.attributes.fill).toBe('#ff0000');
		expect(circle.attributes['stroke-width']).toBe(2);
	});
});

describe('createLine', () => {
	it('should create a line element with correct coordinates', () => {
		const line = createLine(0, 0, 100, 100);
		expect(line.type).toBe('line');
		expect(line.x1).toBe(0);
		expect(line.y1).toBe(0);
		expect(line.x2).toBe(100);
		expect(line.y2).toBe(100);
	});

	it('should include coordinates in attributes', () => {
		const line = createLine(10, 20, 30, 40);
		expect(line.attributes.x1).toBe(10);
		expect(line.attributes.y1).toBe(20);
		expect(line.attributes.x2).toBe(30);
		expect(line.attributes.y2).toBe(40);
	});

	it('should merge additional attributes', () => {
		const line = createLine(0, 0, 10, 10, { stroke: 'black', 'stroke-width': 2 });
		expect(line.attributes.stroke).toBe('black');
		expect(line.attributes['stroke-width']).toBe(2);
	});
});

describe('createPath', () => {
	it('should create a path element with correct type and path data', () => {
		const path = createPath('M 0 0 L 10 10');
		expect(path.type).toBe('path');
		expect(path.d).toBe('M 0 0 L 10 10');
	});

	it('should include path data in attributes', () => {
		const path = createPath('M 0 0 L 10 10');
		expect(path.attributes.d).toBe('M 0 0 L 10 10');
	});

	it('should merge additional attributes', () => {
		const path = createPath('M 0 0 Z', { fill: 'none', stroke: 'red' });
		expect(path.attributes.fill).toBe('none');
		expect(path.attributes.stroke).toBe('red');
	});
});

describe('createText', () => {
	it('should create a text element with correct type, position, and content', () => {
		const text = createText(50, 100, 'Hello');
		expect(text.type).toBe('text');
		expect(text.x).toBe(50);
		expect(text.y).toBe(100);
		expect(text.content).toBe('Hello');
	});

	it('should set font attributes from SVG attribute names', () => {
		const text = createText(0, 0, 'Test', {
			'font-size': 12,
			'font-family': 'Arial',
			'font-weight': 'bold',
			'text-anchor': 'middle',
			'dominant-baseline': 'central',
			fill: '#333',
			'letter-spacing': 2
		});

		expect(text.fontSize).toBe(12);
		expect(text.fontFamily).toBe('Arial');
		expect(text.fontWeight).toBe('bold');
		expect(text.textAnchor).toBe('middle');
		expect(text.dominantBaseline).toBe('central');
		expect(text.fill).toBe('#333');
		expect(text.letterSpacing).toBe(2);
	});

	it('should leave font attributes undefined when not provided', () => {
		const text = createText(0, 0, 'Plain');
		expect(text.fontSize).toBeUndefined();
		expect(text.fontFamily).toBeUndefined();
		expect(text.fontWeight).toBeUndefined();
		expect(text.textAnchor).toBeUndefined();
		expect(text.fill).toBeUndefined();
	});
});

describe('createImage', () => {
	it('should create an image element with correct type and dimensions', () => {
		const img = createImage(10, 20, 100, 80, 'https://example.com/img.png');
		expect(img.type).toBe('image');
		expect(img.x).toBe(10);
		expect(img.y).toBe(20);
		expect(img.width).toBe(100);
		expect(img.height).toBe(80);
		expect(img.href).toBe('https://example.com/img.png');
	});

	it('should include all properties in attributes', () => {
		const img = createImage(5, 10, 50, 40, 'test.svg');
		expect(img.attributes.x).toBe(5);
		expect(img.attributes.y).toBe(10);
		expect(img.attributes.width).toBe(50);
		expect(img.attributes.height).toBe(40);
		expect(img.attributes.href).toBe('test.svg');
	});
});

describe('createGroup', () => {
	it('should create a group element with correct type and children', () => {
		const child1 = createRect(0, 0, 10, 10);
		const child2 = createCircle(5, 5, 5);
		const group = createGroup([child1, child2]);

		expect(group.type).toBe('g');
		expect(group.children).toHaveLength(2);
		expect(group.children[0].type).toBe('rect');
		expect(group.children[1].type).toBe('circle');
	});

	it('should support empty children array', () => {
		const group = createGroup([]);
		expect(group.type).toBe('g');
		expect(group.children).toHaveLength(0);
	});

	it('should merge additional attributes', () => {
		const group = createGroup([], { class: 'my-group', id: 'g1' });
		expect(group.attributes.class).toBe('my-group');
		expect(group.attributes.id).toBe('g1');
	});
});

describe('createTracingGuide', () => {
	it('should create a group element with a path child', () => {
		const guide = createTracingGuide('M 0 0 L 100 0', 'dotted');
		expect(guide.type).toBe('g');
		expect(guide.attributes.class).toBe('tracing-guide');
		expect(guide.children.length).toBeGreaterThanOrEqual(1);

		const pathChild = guide.children[0];
		expect(pathChild.type).toBe('path');
	});

	it('should use dotted stroke-dasharray for dotted style', () => {
		const guide = createTracingGuide('M 0 0 L 100 0', 'dotted');
		const pathChild = guide.children[0];
		expect(pathChild.attributes['stroke-dasharray']).toBe('0.5 1.5');
	});

	it('should use dashed stroke-dasharray for dashed style', () => {
		const guide = createTracingGuide('M 0 0 L 100 0', 'dashed');
		const pathChild = guide.children[0];
		expect(pathChild.attributes['stroke-dasharray']).toBe('2 2');
	});

	it('should add arrow markers at given positions', () => {
		const guide = createTracingGuide('M 0 0 L 100 0', 'dotted', [
			{ x: 10, y: 0 },
			{ x: 50, y: 0 }
		]);
		// path + 2 arrow circles = 3 children
		expect(guide.children).toHaveLength(3);
		expect(guide.children[1].type).toBe('circle');
		expect(guide.children[2].type).toBe('circle');
	});

	it('should not add arrows when arrowPositions is undefined', () => {
		const guide = createTracingGuide('M 0 0 L 100 0', 'light');
		expect(guide.children).toHaveLength(1);
	});
});

describe('createDottedLine', () => {
	it('should create a line element with dotted stroke', () => {
		const line = createDottedLine(0, 0, 100, 0);
		expect(line.type).toBe('line');
		expect(line.attributes.stroke).toBe('#aaaaaa');
		expect(line.attributes['stroke-dasharray']).toBe('0.5 1');
		expect(line.attributes['stroke-linecap']).toBe('round');
	});

	it('should allow overriding default stroke attributes', () => {
		const line = createDottedLine(0, 0, 100, 0, { stroke: 'blue' });
		expect(line.attributes.stroke).toBe('blue');
	});
});

describe('createAnswerBox', () => {
	it('should create a square rect with default size', () => {
		const box = createAnswerBox(10, 20);
		expect(box.type).toBe('rect');
		expect(box.x).toBe(10);
		expect(box.y).toBe(20);
		expect(box.width).toBe(10);
		expect(box.height).toBe(10);
	});

	it('should accept a custom size', () => {
		const box = createAnswerBox(10, 20, 15);
		expect(box.width).toBe(15);
		expect(box.height).toBe(15);
	});

	it('should have a border and no fill by default', () => {
		const box = createAnswerBox(0, 0);
		expect(box.attributes.fill).toBe('none');
		expect(box.attributes.stroke).toBe('#000000');
	});
});

describe('createNumberLine', () => {
	it('should create a group element', () => {
		const nl = createNumberLine(10, 50, 100, 0, 5);
		expect(nl.type).toBe('g');
		expect(nl.attributes.class).toBe('number-line');
	});

	it('should include tick marks for each number', () => {
		const nl = createNumberLine(10, 50, 100, 0, 5);
		// 6 ticks (0 through 5), 6 labels, 1 main line, 2 arrow heads = 15
		// Main line + ticks + labels + arrows
		const lines = nl.children.filter((c) => c.type === 'line');
		const texts = nl.children.filter((c) => c.type === 'text');
		// 1 main line + 6 tick lines = 7
		expect(lines).toHaveLength(7);
		// 6 labels (0, 1, 2, 3, 4, 5)
		expect(texts).toHaveLength(6);
	});

	it('should throw when max <= min', () => {
		expect(() => createNumberLine(0, 0, 100, 5, 5)).toThrow();
		expect(() => createNumberLine(0, 0, 100, 10, 3)).toThrow();
	});

	it('should include arrow heads at both ends', () => {
		const nl = createNumberLine(10, 50, 100, 1, 3);
		const paths = nl.children.filter((c) => c.type === 'path');
		expect(paths).toHaveLength(2);
	});
});
