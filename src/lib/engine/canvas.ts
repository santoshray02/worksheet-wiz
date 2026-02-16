import type { Point, BoundingBox, Margins } from './types.js';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from './units.js';

const DEFAULT_MARGINS: Margins = {
	top: 10,
	right: 10,
	bottom: 10,
	left: 10
};

/**
 * Represents an A4 canvas with a millimeter-based coordinate system.
 *
 * The viewBox uses mm units so every coordinate in the element tree is
 * specified in millimeters. The rendered SVG declares its width/height
 * in mm as well, which means it scales correctly regardless of the
 * consumer's DPI setting.
 */
export class A4Canvas {
	/** Page width in mm (always 210 for A4) */
	readonly width: number = A4_WIDTH_MM;

	/** Page height in mm (always 297 for A4) */
	readonly height: number = A4_HEIGHT_MM;

	/** Page margins in mm */
	readonly margins: Margins;

	/** The SVG viewBox string, e.g. "0 0 210 297" */
	readonly viewBox: string;

	/** The usable content area inside the margins */
	readonly contentArea: BoundingBox;

	constructor(margins: Partial<Margins> = {}) {
		this.margins = { ...DEFAULT_MARGINS, ...margins };

		this.viewBox = `0 0 ${this.width} ${this.height}`;

		this.contentArea = {
			x: this.margins.left,
			y: this.margins.top,
			width: this.width - this.margins.left - this.margins.right,
			height: this.height - this.margins.top - this.margins.bottom
		};
	}

	/**
	 * Returns the opening `<svg>` tag with correct namespaces, viewBox,
	 * and dimensions expressed in millimeters.
	 */
	createSVGRoot(): string {
		return [
			`<svg`,
			`  xmlns="http://www.w3.org/2000/svg"`,
			`  xmlns:xlink="http://www.w3.org/1999/xlink"`,
			`  width="${this.width}mm"`,
			`  height="${this.height}mm"`,
			`  viewBox="${this.viewBox}"`,
			`>`
		].join('\n');
	}

	/**
	 * Returns `true` when the given point falls within the content area
	 * (i.e. inside the margins).
	 */
	isInBounds(point: Point): boolean {
		const { x, y, width, height } = this.contentArea;
		return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
	}

	/**
	 * Clamps a bounding box so it fits entirely within the content area.
	 * The box is shifted first, then shrunk if it is still too large.
	 */
	clampToBounds(box: BoundingBox): BoundingBox {
		const area = this.contentArea;

		let { x, y, width, height } = box;

		// Clamp width / height to the content area dimensions
		width = Math.min(width, area.width);
		height = Math.min(height, area.height);

		// Shift x / y so the box stays inside the content area
		x = Math.max(area.x, Math.min(x, area.x + area.width - width));
		y = Math.max(area.y, Math.min(y, area.y + area.height - height));

		return { x, y, width, height };
	}
}
