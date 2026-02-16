/** Point in millimeter coordinate space */
export interface Point {
	x: number;
	y: number;
}

/** Size in millimeters */
export interface Size {
	width: number;
	height: number;
}

/** Bounding box in millimeters */
export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Margins in millimeters */
export interface Margins {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Generic SVG attribute map */
export type SVGAttributes = Record<string, string | number>;

/** Base interface for all SVG element nodes */
interface BaseSVGElement {
	type: string;
	attributes: SVGAttributes;
	children?: SVGElementNode[];
}

export interface RectElement extends BaseSVGElement {
	type: 'rect';
	x: number;
	y: number;
	width: number;
	height: number;
	rx?: number;
	ry?: number;
}

export interface CircleElement extends BaseSVGElement {
	type: 'circle';
	cx: number;
	cy: number;
	r: number;
}

export interface EllipseElement extends BaseSVGElement {
	type: 'ellipse';
	cx: number;
	cy: number;
	rx: number;
	ry: number;
}

export interface LineElement extends BaseSVGElement {
	type: 'line';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export interface PolylineElement extends BaseSVGElement {
	type: 'polyline';
	points: Point[];
}

export interface PolygonElement extends BaseSVGElement {
	type: 'polygon';
	points: Point[];
}

export interface PathElement extends BaseSVGElement {
	type: 'path';
	d: string;
}

export interface TextElement extends BaseSVGElement {
	type: 'text';
	x: number;
	y: number;
	content: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string | number;
	textAnchor?: 'start' | 'middle' | 'end';
	dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central' | 'text-top' | 'text-bottom';
	fill?: string;
	letterSpacing?: number;
}

export interface TspanElement extends BaseSVGElement {
	type: 'tspan';
	content: string;
	x?: number;
	y?: number;
	dx?: number;
	dy?: number;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string | number;
	fill?: string;
}

export interface ImageElement extends BaseSVGElement {
	type: 'image';
	x: number;
	y: number;
	width: number;
	height: number;
	href: string;
}

export interface GroupElement extends BaseSVGElement {
	type: 'g';
	children: SVGElementNode[];
}

export interface UseElement extends BaseSVGElement {
	type: 'use';
	href: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
}

export interface DefsElement extends BaseSVGElement {
	type: 'defs';
	children: SVGElementNode[];
}

export interface ClipPathElement extends BaseSVGElement {
	type: 'clipPath';
	id: string;
	children: SVGElementNode[];
}

/** Discriminated union of all SVG element node types */
export type SVGElementNode =
	| RectElement
	| CircleElement
	| EllipseElement
	| LineElement
	| PolylineElement
	| PolygonElement
	| PathElement
	| TextElement
	| TspanElement
	| ImageElement
	| GroupElement
	| UseElement
	| DefsElement
	| ClipPathElement;

/** Tracing guide style options */
export type TracingStyle = 'dotted' | 'dashed' | 'light';

/** Tracing guide for letter/number tracing exercises */
export interface TracingGuide {
	path: string;
	style: TracingStyle;
	arrowPositions?: Point[];
}
