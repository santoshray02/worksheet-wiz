import type {
	SVGAttributes,
	SVGElementNode,
	RectElement,
	CircleElement,
	LineElement,
	PathElement,
	TextElement,
	TspanElement,
	ImageElement,
	GroupElement,
	TracingStyle,
	Point
} from './types.js';

// ---------------------------------------------------------------------------
// Primitive element factories
// ---------------------------------------------------------------------------

/** Create a `<rect>` element node */
export function createRect(
	x: number,
	y: number,
	width: number,
	height: number,
	attrs: SVGAttributes = {}
): RectElement {
	return {
		type: 'rect',
		x,
		y,
		width,
		height,
		rx: attrs.rx != null ? Number(attrs.rx) : undefined,
		ry: attrs.ry != null ? Number(attrs.ry) : undefined,
		attributes: { ...attrs, x, y, width, height }
	};
}

/** Create a `<circle>` element node */
export function createCircle(
	cx: number,
	cy: number,
	r: number,
	attrs: SVGAttributes = {}
): CircleElement {
	return {
		type: 'circle',
		cx,
		cy,
		r,
		attributes: { ...attrs, cx, cy, r }
	};
}

/** Create a `<line>` element node */
export function createLine(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	attrs: SVGAttributes = {}
): LineElement {
	return {
		type: 'line',
		x1,
		y1,
		x2,
		y2,
		attributes: { ...attrs, x1, y1, x2, y2 }
	};
}

/** Create a `<path>` element node */
export function createPath(d: string, attrs: SVGAttributes = {}): PathElement {
	return {
		type: 'path',
		d,
		attributes: { ...attrs, d }
	};
}

/** Create a `<text>` element node */
export function createText(
	x: number,
	y: number,
	content: string,
	attrs: SVGAttributes = {}
): TextElement {
	return {
		type: 'text',
		x,
		y,
		content,
		fontSize: attrs['font-size'] != null ? Number(attrs['font-size']) : undefined,
		fontFamily: attrs['font-family'] != null ? String(attrs['font-family']) : undefined,
		fontWeight: attrs['font-weight'] != null ? attrs['font-weight'] : undefined,
		textAnchor: attrs['text-anchor'] as TextElement['textAnchor'],
		dominantBaseline: attrs['dominant-baseline'] as TextElement['dominantBaseline'],
		fill: attrs.fill != null ? String(attrs.fill) : undefined,
		letterSpacing: attrs['letter-spacing'] != null ? Number(attrs['letter-spacing']) : undefined,
		attributes: { ...attrs, x, y }
	};
}

/** Create a `<tspan>` element node */
export function createTspan(content: string, attrs: SVGAttributes = {}): TspanElement {
	return {
		type: 'tspan',
		content,
		x: attrs.x != null ? Number(attrs.x) : undefined,
		y: attrs.y != null ? Number(attrs.y) : undefined,
		dx: attrs.dx != null ? Number(attrs.dx) : undefined,
		dy: attrs.dy != null ? Number(attrs.dy) : undefined,
		fontSize: attrs['font-size'] != null ? Number(attrs['font-size']) : undefined,
		fontFamily: attrs['font-family'] != null ? String(attrs['font-family']) : undefined,
		fontWeight: attrs['font-weight'] != null ? attrs['font-weight'] : undefined,
		fill: attrs.fill != null ? String(attrs.fill) : undefined,
		attributes: { ...attrs }
	};
}

/** Create an `<image>` element node */
export function createImage(
	x: number,
	y: number,
	width: number,
	height: number,
	href: string,
	attrs: SVGAttributes = {}
): ImageElement {
	return {
		type: 'image',
		x,
		y,
		width,
		height,
		href,
		attributes: { ...attrs, x, y, width, height, href }
	};
}

/** Create a `<g>` (group) element node */
export function createGroup(
	children: SVGElementNode[],
	attrs: SVGAttributes = {}
): GroupElement {
	return {
		type: 'g',
		children,
		attributes: { ...attrs }
	};
}

// ---------------------------------------------------------------------------
// Composite / convenience factories
// ---------------------------------------------------------------------------

/**
 * Create a tracing guide: a path rendered as dotted, dashed, or light
 * strokes with optional directional arrows at the given positions.
 */
export function createTracingGuide(
	pathData: string,
	style: TracingStyle,
	arrowPositions?: Point[]
): GroupElement {
	const strokeDasharray = style === 'dotted' ? '0.5 1.5' : style === 'dashed' ? '2 2' : 'none';
	const strokeOpacity = style === 'light' ? 0.3 : 0.6;

	const guidePath = createPath(pathData, {
		fill: 'none',
		stroke: '#888888',
		'stroke-width': 0.4,
		'stroke-dasharray': strokeDasharray,
		'stroke-opacity': strokeOpacity,
		'stroke-linecap': 'round'
	});

	const children: SVGElementNode[] = [guidePath];

	if (arrowPositions && arrowPositions.length > 0) {
		for (const pos of arrowPositions) {
			const arrow = createCircle(pos.x, pos.y, 0.6, {
				fill: '#cc0000',
				'fill-opacity': 0.7
			});
			children.push(arrow);
		}
	}

	return createGroup(children, { class: 'tracing-guide' });
}

/**
 * Create a dotted line suitable for tracing exercises.
 * Convenience wrapper around `createLine` with a dotted stroke.
 */
export function createDottedLine(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	attrs: SVGAttributes = {}
): LineElement {
	return createLine(x1, y1, x2, y2, {
		stroke: '#aaaaaa',
		'stroke-width': 0.3,
		'stroke-dasharray': '0.5 1',
		'stroke-linecap': 'round',
		...attrs
	});
}

/**
 * Create a square answer box where students can write their answer.
 *
 * @param x      Left edge in mm
 * @param y      Top edge in mm
 * @param size   Side length in mm (default 10)
 * @param attrs  Additional SVG attributes
 */
export function createAnswerBox(
	x: number,
	y: number,
	size: number = 10,
	attrs: SVGAttributes = {}
): RectElement {
	return createRect(x, y, size, size, {
		fill: 'none',
		stroke: '#000000',
		'stroke-width': 0.3,
		rx: 0.5,
		ry: 0.5,
		...attrs
	});
}

/**
 * Create a horizontal number line from `min` to `max`.
 *
 * @param x      Left edge in mm
 * @param y      Vertical centre in mm
 * @param width  Total width in mm
 * @param min    Smallest labelled value
 * @param max    Largest labelled value
 */
export function createNumberLine(
	x: number,
	y: number,
	width: number,
	min: number,
	max: number
): GroupElement {
	const range = max - min;
	if (range <= 0) {
		throw new Error(`createNumberLine: max (${max}) must be greater than min (${min})`);
	}

	const children: SVGElementNode[] = [];

	// Main horizontal axis
	children.push(
		createLine(x, y, x + width, y, {
			stroke: '#000000',
			'stroke-width': 0.3
		})
	);

	// Tick marks and labels
	const tickCount = range;
	for (let i = 0; i <= tickCount; i++) {
		const tickX = x + (i / tickCount) * width;
		const value = min + i;

		// Tick mark
		children.push(
			createLine(tickX, y - 1.5, tickX, y + 1.5, {
				stroke: '#000000',
				'stroke-width': 0.25
			})
		);

		// Label
		children.push(
			createText(tickX, y + 4, String(value), {
				'font-size': 2.5,
				'font-family': 'sans-serif',
				'text-anchor': 'middle',
				fill: '#000000'
			})
		);
	}

	// Arrow heads at both ends
	const arrowSize = 1.2;
	children.push(
		createPath(
			`M ${x} ${y} L ${x - arrowSize} ${y - arrowSize * 0.6} L ${x - arrowSize} ${y + arrowSize * 0.6} Z`,
			{ fill: '#000000' }
		)
	);
	children.push(
		createPath(
			`M ${x + width} ${y} L ${x + width + arrowSize} ${y - arrowSize * 0.6} L ${x + width + arrowSize} ${y + arrowSize * 0.6} Z`,
			{ fill: '#000000' }
		)
	);

	return createGroup(children, { class: 'number-line' });
}
