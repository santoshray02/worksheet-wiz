/**
 * Client-side vector PDF helpers.
 *
 * Thin wrappers around jsPDF + svg2pdf.js that convert an SVG (either a live
 * DOM element or a raw markup string) into an A4 PDF blob entirely in the
 * browser.
 */

/**
 * Convert a live `SVGSVGElement` to a PDF blob.
 */
export async function svgToPdfBlob(svgElement: SVGSVGElement): Promise<Blob> {
	const { default: jsPDF } = await import('jspdf');
	await import('svg2pdf.js');

	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	await (doc as any).svg(svgElement, {
		x: 0,
		y: 0,
		width: 210,
		height: 297
	});

	return doc.output('blob');
}

/**
 * Parse an SVG markup string and convert it to a PDF blob.
 *
 * This creates a temporary in-memory DOM element, feeds it to `svgToPdfBlob`,
 * and returns the result.
 */
export async function svgStringToPdfBlob(svgString: string): Promise<Blob> {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svgString, 'image/svg+xml');
	const svgElement = doc.documentElement as unknown as SVGSVGElement;
	return svgToPdfBlob(svgElement);
}
