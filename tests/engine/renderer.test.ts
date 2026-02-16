import { describe, it, expect } from 'vitest';
import { renderElement, renderToSVG, attributesToString } from '$lib/engine/renderer';
import { createRect, createCircle, createText, createGroup, createLine, createPath } from '$lib/engine/elements';
import { A4Canvas } from '$lib/engine/canvas';

describe('attributesToString', () => {
	it('should convert attributes record to XML attribute string', () => {
		const result = attributesToString({ x: 10, y: 20, fill: 'red' });
		expect(result).toContain('x="10"');
		expect(result).toContain('y="20"');
		expect(result).toContain('fill="red"');
	});

	it('should return empty string for empty attributes', () => {
		const result = attributesToString({});
		expect(result).toBe('');
	});

	it('should skip null and undefined values', () => {
		const result = attributesToString({ x: 10, y: null as unknown as string });
		expect(result).toContain('x="10"');
		expect(result).not.toContain('y=');
	});
});

describe('renderElement', () => {
	it('should render a rect element as self-closing SVG', () => {
		const rect = createRect(10, 20, 100, 50, { fill: 'blue' });
		const svg = renderElement(rect);

		expect(svg).toMatch(/^<rect /);
		expect(svg).toMatch(/\/>$/);
		expect(svg).toContain('x="10"');
		expect(svg).toContain('y="20"');
		expect(svg).toContain('width="100"');
		expect(svg).toContain('height="50"');
		expect(svg).toContain('fill="blue"');
	});

	it('should render a circle element as self-closing SVG', () => {
		const circle = createCircle(50, 60, 25);
		const svg = renderElement(circle);

		expect(svg).toMatch(/^<circle /);
		expect(svg).toMatch(/\/>$/);
		expect(svg).toContain('cx="50"');
		expect(svg).toContain('cy="60"');
		expect(svg).toContain('r="25"');
	});

	it('should render a line element as self-closing SVG', () => {
		const line = createLine(0, 0, 100, 100, { stroke: '#000' });
		const svg = renderElement(line);

		expect(svg).toMatch(/^<line /);
		expect(svg).toMatch(/\/>$/);
		expect(svg).toContain('x1="0"');
		expect(svg).toContain('x2="100"');
	});

	it('should render a path element as self-closing SVG', () => {
		const path = createPath('M 0 0 L 10 10 Z', { fill: 'none', stroke: 'red' });
		const svg = renderElement(path);

		expect(svg).toMatch(/^<path /);
		expect(svg).toMatch(/\/>$/);
		expect(svg).toContain('d="M 0 0 L 10 10 Z"');
	});

	it('should render a text element with content', () => {
		const text = createText(50, 100, 'Hello World', {
			'font-size': 12,
			'font-family': 'Arial'
		});
		const svg = renderElement(text);

		expect(svg).toMatch(/^<text /);
		expect(svg).toMatch(/<\/text>$/);
		expect(svg).toContain('Hello World');
		expect(svg).toContain('font-size="12"');
		expect(svg).toContain('font-family="Arial"');
	});

	it('should render text with special characters escaped', () => {
		const text = createText(0, 0, 'A < B & "C" > D');
		const svg = renderElement(text);

		expect(svg).toContain('A &lt; B &amp; &quot;C&quot; &gt; D');
		expect(svg).not.toContain('A < B');
	});

	it('should render a nested group with proper nesting', () => {
		const rect = createRect(0, 0, 10, 10);
		const circle = createCircle(5, 5, 3);
		const innerGroup = createGroup([circle], { class: 'inner' });
		const outerGroup = createGroup([rect, innerGroup], { class: 'outer' });

		const svg = renderElement(outerGroup);

		expect(svg).toMatch(/^<g /);
		expect(svg).toMatch(/<\/g>$/);
		expect(svg).toContain('class="outer"');
		expect(svg).toContain('<rect ');
		expect(svg).toContain('<g class="inner">');
		expect(svg).toContain('<circle ');
	});

	it('should render deeply nested groups correctly', () => {
		const leaf = createRect(1, 1, 2, 2);
		const level2 = createGroup([leaf], { id: 'level2' });
		const level1 = createGroup([level2], { id: 'level1' });
		const root = createGroup([level1], { id: 'root' });

		const svg = renderElement(root);

		// Check proper nesting by looking for opening and closing tags
		const rootOpen = svg.indexOf('<g id="root">');
		const level1Open = svg.indexOf('<g id="level1">');
		const level2Open = svg.indexOf('<g id="level2">');
		const rectTag = svg.indexOf('<rect ');

		expect(rootOpen).toBeLessThan(level1Open);
		expect(level1Open).toBeLessThan(level2Open);
		expect(level2Open).toBeLessThan(rectTag);
	});

	it('should handle an empty group', () => {
		const group = createGroup([]);
		const svg = renderElement(group);
		expect(svg).toBe('<g></g>');
	});
});

describe('renderToSVG', () => {
	it('should render a full page with XML declaration and SVG root', () => {
		const canvas = new A4Canvas();
		const rect = createRect(10, 10, 50, 50);
		const svg = renderToSVG([rect], canvas);

		expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(svg).toContain('<svg');
		expect(svg).toContain('</svg>');
		expect(svg).toContain('viewBox="0 0 210 297"');
	});

	it('should render multiple elements', () => {
		const canvas = new A4Canvas();
		const rect = createRect(0, 0, 10, 10);
		const circle = createCircle(50, 50, 20);
		const text = createText(100, 100, 'Test');

		const svg = renderToSVG([rect, circle, text], canvas);

		expect(svg).toContain('<rect ');
		expect(svg).toContain('<circle ');
		expect(svg).toContain('<text ');
		expect(svg).toContain('Test');
	});

	it('should render an empty page with no elements', () => {
		const canvas = new A4Canvas();
		const svg = renderToSVG([], canvas);

		expect(svg).toContain('<?xml');
		expect(svg).toContain('<svg');
		expect(svg).toContain('</svg>');
	});

	it('should include correct mm dimensions', () => {
		const canvas = new A4Canvas();
		const svg = renderToSVG([], canvas);

		expect(svg).toContain('width="210mm"');
		expect(svg).toContain('height="297mm"');
	});
});
