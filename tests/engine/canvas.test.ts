import { describe, it, expect } from 'vitest';
import { A4Canvas } from '$lib/engine/canvas';

describe('A4Canvas', () => {
	it('should have correct default dimensions', () => {
		const canvas = new A4Canvas();
		expect(canvas.width).toBe(210);
		expect(canvas.height).toBe(297);
	});

	it('should calculate content area with default margins', () => {
		const canvas = new A4Canvas();
		// Default margins are 10mm on all sides
		expect(canvas.contentArea.x).toBe(10);
		expect(canvas.contentArea.y).toBe(10);
		expect(canvas.contentArea.width).toBe(190); // 210 - 10 - 10
		expect(canvas.contentArea.height).toBe(277); // 297 - 10 - 10
	});

	it('should calculate content area with custom margins', () => {
		const canvas = new A4Canvas({ top: 20, right: 15, bottom: 25, left: 15 });
		expect(canvas.contentArea.x).toBe(15);
		expect(canvas.contentArea.y).toBe(20);
		expect(canvas.contentArea.width).toBe(180); // 210 - 15 - 15
		expect(canvas.contentArea.height).toBe(252); // 297 - 20 - 25
	});

	it('should support partial custom margins', () => {
		const canvas = new A4Canvas({ top: 20 });
		expect(canvas.contentArea.x).toBe(10); // default left
		expect(canvas.contentArea.y).toBe(20); // custom top
		expect(canvas.contentArea.width).toBe(190); // 210 - 10 - 10
		expect(canvas.contentArea.height).toBe(267); // 297 - 20 - 10
	});

	it('should check if point is in bounds', () => {
		const canvas = new A4Canvas();
		// Inside content area
		expect(canvas.isInBounds({ x: 100, y: 150 })).toBe(true);
		// On the edge
		expect(canvas.isInBounds({ x: 10, y: 10 })).toBe(true);
		expect(canvas.isInBounds({ x: 200, y: 287 })).toBe(true);
		// Outside (in the margin area)
		expect(canvas.isInBounds({ x: 5, y: 150 })).toBe(false);
		expect(canvas.isInBounds({ x: 205, y: 150 })).toBe(false);
		expect(canvas.isInBounds({ x: 100, y: 5 })).toBe(false);
		expect(canvas.isInBounds({ x: 100, y: 295 })).toBe(false);
	});

	it('should clamp bounding box to bounds', () => {
		const canvas = new A4Canvas();

		// Box that goes past the left edge
		const clamped1 = canvas.clampToBounds({ x: 5, y: 20, width: 50, height: 30 });
		expect(clamped1.x).toBe(10);
		expect(clamped1.y).toBe(20);
		expect(clamped1.width).toBe(50);
		expect(clamped1.height).toBe(30);

		// Box that goes past the right edge
		const clamped2 = canvas.clampToBounds({ x: 180, y: 20, width: 50, height: 30 });
		expect(clamped2.x).toBe(150); // 10 + 190 - 50
		expect(clamped2.width).toBe(50);

		// Box larger than the content area gets shrunk
		const clamped3 = canvas.clampToBounds({ x: 0, y: 0, width: 300, height: 400 });
		expect(clamped3.width).toBe(190);
		expect(clamped3.height).toBe(277);
		expect(clamped3.x).toBe(10);
		expect(clamped3.y).toBe(10);
	});

	it('should create SVG root string', () => {
		const canvas = new A4Canvas();
		const root = canvas.createSVGRoot();

		expect(root).toContain('xmlns="http://www.w3.org/2000/svg"');
		expect(root).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
		expect(root).toContain('width="210mm"');
		expect(root).toContain('height="297mm"');
		expect(root).toContain('viewBox="0 0 210 297"');
		expect(root).toMatch(/^<svg/);
		expect(root).toMatch(/>$/);
	});

	it('should have correct viewBox', () => {
		const canvas = new A4Canvas();
		expect(canvas.viewBox).toBe('0 0 210 297');
	});
});
