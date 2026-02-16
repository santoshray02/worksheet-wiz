import type { SVGElementNode } from '$lib/engine/types';
import type { ActivityData } from '$lib/types/activity';
import type { WorksheetLayout, LayoutZone } from './zones';
import type { DifficultyConfig } from './difficulty';
import { createText, createLine, createGroup, createRect } from '$lib/engine/elements';

// ---------------------------------------------------------------------------
// BaseTemplate - abstract base class for all worksheet templates
// ---------------------------------------------------------------------------

/**
 * Abstract base class that every worksheet activity template extends.
 *
 * It handles the shared chrome -- header, instructions, footer -- and
 * delegates activity-specific rendering to the concrete subclass via
 * the abstract `renderActivity` method.
 */
export abstract class BaseTemplate {
	protected layout: WorksheetLayout;
	protected difficulty: DifficultyConfig;

	constructor(layout: WorksheetLayout, difficulty: DifficultyConfig) {
		this.layout = layout;
		this.difficulty = difficulty;
	}

	// -----------------------------------------------------------------------
	// Header
	// -----------------------------------------------------------------------

	/**
	 * Render the worksheet header: centred title, and optional Name / Date
	 * fields on the left and right.
	 */
	renderHeader(
		title: string,
		options?: { showName?: boolean; showDate?: boolean }
	): SVGElementNode[] {
		const { showName = true, showDate = true } = options ?? {};
		const { x, y, width, height } = this.layout.header.bounds;

		const elements: SVGElementNode[] = [];

		// Title text, centred horizontally, positioned in the upper portion
		const titleFontSize = Math.min(this.difficulty.fontSize * 1.5, 8);
		elements.push(
			createText(x + width / 2, y + titleFontSize + 2, title, {
				'font-size': titleFontSize,
				'font-family': 'sans-serif',
				'font-weight': 'bold',
				'text-anchor': 'middle',
				fill: '#000000'
			})
		);

		// A thin separator line below the title
		const separatorY = y + titleFontSize + 5;
		elements.push(
			createLine(x, separatorY, x + width, separatorY, {
				stroke: '#cccccc',
				'stroke-width': 0.3
			})
		);

		// Name and Date fields
		const fieldFontSize = Math.min(this.difficulty.fontSize, 3.5);
		const fieldY = y + height - 3;
		const underlineLength = 45;

		if (showName) {
			elements.push(
				createText(x, fieldY, 'Name:', {
					'font-size': fieldFontSize,
					'font-family': 'sans-serif',
					fill: '#333333'
				})
			);
			// Dotted underline for writing the name
			elements.push(
				createLine(x + 14, fieldY + 0.5, x + 14 + underlineLength, fieldY + 0.5, {
					stroke: '#999999',
					'stroke-width': 0.2,
					'stroke-dasharray': '0.8 0.8'
				})
			);
		}

		if (showDate) {
			const dateX = x + width - 14 - underlineLength;
			elements.push(
				createText(x + width - 14 - underlineLength - 1, fieldY, 'Date:', {
					'font-size': fieldFontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'end',
					fill: '#333333'
				})
			);
			elements.push(
				createLine(dateX, fieldY + 0.5, dateX + underlineLength, fieldY + 0.5, {
					stroke: '#999999',
					'stroke-width': 0.2,
					'stroke-dasharray': '0.8 0.8'
				})
			);
		}

		return elements;
	}

	// -----------------------------------------------------------------------
	// Instructions
	// -----------------------------------------------------------------------

	/**
	 * Render the instruction text centred in the instructions zone.
	 */
	renderInstructions(text: string): SVGElementNode[] {
		const { x, y, width, height } = this.layout.instructions.bounds;
		const fontSize = Math.min(this.difficulty.fontSize, 4);

		const elements: SVGElementNode[] = [];

		// Light background band to visually distinguish the instructions area
		elements.push(
			createRect(x, y, width, height, {
				fill: '#f5f5f5',
				rx: 1,
				ry: 1
			})
		);

		// Instruction text, centred
		elements.push(
			createText(x + width / 2, y + height / 2 + fontSize * 0.35, text, {
				'font-size': fontSize,
				'font-family': 'sans-serif',
				'text-anchor': 'middle',
				'dominant-baseline': 'central',
				fill: '#333333'
			})
		);

		return elements;
	}

	// -----------------------------------------------------------------------
	// Activity (abstract)
	// -----------------------------------------------------------------------

	/**
	 * Each concrete template must implement this method to render the
	 * activity-specific content within the given zone.
	 */
	abstract renderActivity(data: ActivityData, zone: LayoutZone): SVGElementNode[];

	// -----------------------------------------------------------------------
	// Footer
	// -----------------------------------------------------------------------

	/**
	 * Render the page footer with an optional page number and a thin top rule.
	 */
	renderFooter(pageNumber?: number): SVGElementNode[] {
		const { x, y, width, height } = this.layout.footer.bounds;
		const elements: SVGElementNode[] = [];

		// Top rule
		elements.push(
			createLine(x, y, x + width, y, {
				stroke: '#cccccc',
				'stroke-width': 0.3
			})
		);

		// Page number, right-aligned
		if (pageNumber != null) {
			const fontSize = 2.5;
			elements.push(
				createText(x + width, y + height / 2 + fontSize * 0.35, `Page ${pageNumber}`, {
					'font-size': fontSize,
					'font-family': 'sans-serif',
					'text-anchor': 'end',
					fill: '#999999'
				})
			);
		}

		return elements;
	}

	// -----------------------------------------------------------------------
	// Full-page convenience renderer
	// -----------------------------------------------------------------------

	/**
	 * Render a complete worksheet page: header, instructions, activity, footer.
	 *
	 * Returns a flat array of SVG element nodes suitable for insertion into
	 * an A4Canvas-rooted SVG document.
	 */
	renderPage(data: ActivityData, title: string, instructions: string): SVGElementNode[] {
		const headerElements = this.renderHeader(title);
		const instructionElements = this.renderInstructions(instructions);
		const activityElements = this.renderActivity(data, this.layout.activity);
		const footerElements = this.renderFooter();

		return [
			createGroup(headerElements, { class: 'worksheet-header' }),
			createGroup(instructionElements, { class: 'worksheet-instructions' }),
			createGroup(activityElements, { class: 'worksheet-activity' }),
			createGroup(footerElements, { class: 'worksheet-footer' })
		];
	}
}
