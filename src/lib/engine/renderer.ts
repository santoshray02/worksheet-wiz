import type { SVGAttributes, SVGElementNode } from './types.js';
import type { A4Canvas } from './canvas.js';

// ---------------------------------------------------------------------------
// XML-safe text escaping
// ---------------------------------------------------------------------------

/** Escape a string for safe inclusion in XML text content or attribute values */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
// Attribute serialisation
// ---------------------------------------------------------------------------

/** Convert an SVGAttributes record to a string of XML attributes */
export function attributesToString(attrs: SVGAttributes): string {
	const parts: string[] = [];

	for (const [key, value] of Object.entries(attrs)) {
		if (value == null) continue;
		parts.push(`${key}="${escapeXml(String(value))}"`);
	}

	return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

// ---------------------------------------------------------------------------
// Self-closing element types
// ---------------------------------------------------------------------------

const SELF_CLOSING_TAGS = new Set([
	'rect',
	'circle',
	'ellipse',
	'line',
	'polyline',
	'polygon',
	'path',
	'image',
	'use'
]);

// ---------------------------------------------------------------------------
// Single element renderer
// ---------------------------------------------------------------------------

/** Recursively render a single SVGElementNode to an SVG/XML string */
export function renderElement(element: SVGElementNode): string {
	const tag = element.type;

	// Build the merged attribute map.
	// Typed properties on individual element types are already mirrored
	// into `attributes` by the factory functions in elements.ts, so we
	// only need to handle a few special cases below.
	const attrs: SVGAttributes = { ...element.attributes };

	// ---- type-specific attribute injection --------------------------------

	switch (element.type) {
		case 'polyline':
		case 'polygon': {
			const pts = element.points.map((p) => `${p.x},${p.y}`).join(' ');
			attrs.points = pts;
			break;
		}
		case 'clipPath': {
			attrs.id = element.id;
			break;
		}
		// text & tspan handle content separately below
		default:
			break;
	}

	// ---- self-closing tags ------------------------------------------------

	if (SELF_CLOSING_TAGS.has(tag)) {
		return `<${tag}${attributesToString(attrs)}/>`;
	}

	// ---- container / content tags -----------------------------------------

	const inner: string[] = [];

	// Text content (text / tspan)
	if (element.type === 'text') {
		// Populate font attributes that live on the typed node
		if (element.fontSize != null) attrs['font-size'] = element.fontSize;
		if (element.fontFamily != null) attrs['font-family'] = element.fontFamily;
		if (element.fontWeight != null) attrs['font-weight'] = element.fontWeight;
		if (element.textAnchor != null) attrs['text-anchor'] = element.textAnchor;
		if (element.dominantBaseline != null) attrs['dominant-baseline'] = element.dominantBaseline;
		if (element.fill != null) attrs.fill = element.fill;
		if (element.letterSpacing != null) attrs['letter-spacing'] = element.letterSpacing;

		// Render child tspan elements first, then remaining content
		if (element.children && element.children.length > 0) {
			for (const child of element.children) {
				inner.push(renderElement(child));
			}
		}

		if (element.content) {
			inner.push(escapeXml(element.content));
		}
	} else if (element.type === 'tspan') {
		if (element.x != null) attrs.x = element.x;
		if (element.y != null) attrs.y = element.y;
		if (element.dx != null) attrs.dx = element.dx;
		if (element.dy != null) attrs.dy = element.dy;
		if (element.fontSize != null) attrs['font-size'] = element.fontSize;
		if (element.fontFamily != null) attrs['font-family'] = element.fontFamily;
		if (element.fontWeight != null) attrs['font-weight'] = element.fontWeight;
		if (element.fill != null) attrs.fill = element.fill;

		if (element.content) {
			inner.push(escapeXml(element.content));
		}
	} else if ('children' in element && element.children) {
		// g, defs, clipPath, etc.
		for (const child of element.children) {
			inner.push(renderElement(child));
		}
	}

	return `<${tag}${attributesToString(attrs)}>${inner.join('')}</${tag}>`;
}

// ---------------------------------------------------------------------------
// Full document renderer
// ---------------------------------------------------------------------------

/**
 * Render an array of SVGElementNode objects to a complete SVG document
 * string wrapped in the root `<svg>` element provided by the canvas.
 */
export function renderToSVG(elements: SVGElementNode[], canvas: A4Canvas): string {
	const lines: string[] = [];

	lines.push('<?xml version="1.0" encoding="UTF-8"?>');
	lines.push(canvas.createSVGRoot());

	for (const element of elements) {
		lines.push(renderElement(element));
	}

	lines.push('</svg>');

	return lines.join('\n');
}
