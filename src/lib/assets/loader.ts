/**
 * SVG file loader utilities.
 *
 * Provides helpers for fetching raw SVG content from the static asset
 * directory, extracting intrinsic dimensions, and wrapping SVG fragments
 * for embedding inside a parent SVG document.
 */

/**
 * Fetch raw SVG markup from the static assets directory.
 *
 * @param path - Relative path under `/assets/svg/` (e.g. `animals/cat.svg`).
 * @returns The SVG source string.
 */
export async function loadSVGFromPath(path: string): Promise<string> {
	const response = await fetch(`/assets/svg/${path}`);
	if (!response.ok) {
		throw new Error(`Failed to load SVG: ${path} (${response.status})`);
	}
	return await response.text();
}

/**
 * Extract width / height from an SVG string by inspecting the `viewBox`
 * attribute first, then falling back to explicit `width` / `height`
 * attributes, and finally returning a sensible 24x24 default.
 */
export function extractSVGDimensions(svgContent: string): { width: number; height: number } {
	// Try viewBox first
	const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
	if (viewBoxMatch) {
		const parts = viewBoxMatch[1].split(/[\s,]+/).map(Number);
		if (parts.length === 4) {
			return { width: parts[2], height: parts[3] };
		}
	}

	// Fall back to explicit width/height attributes
	const widthMatch = svgContent.match(/\bwidth="(\d+(?:\.\d+)?)"/);
	const heightMatch = svgContent.match(/\bheight="(\d+(?:\.\d+)?)"/);
	if (widthMatch && heightMatch) {
		return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
	}

	// Default
	return { width: 24, height: 24 };
}

/**
 * Wrap raw SVG content inside a positioned `<svg>` element so it can be
 * embedded at a specific location within a parent SVG document.
 *
 * All coordinate values are in millimetres (matching the worksheet coordinate
 * system).
 */
export function wrapSVGForEmbed(
	svgContent: string,
	x: number,
	y: number,
	width: number,
	height: number
): string {
	// Strip the outer <svg ...> wrapper from the content so we can re-wrap it
	const innerContent = svgContent
		.replace(/<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '');

	return `<svg x="${x}" y="${y}" width="${width}" height="${height}" overflow="visible">${innerContent}</svg>`;
}
