/**
 * Server-side SVG-to-PDF rasteriser (stub).
 *
 * Previously used @resvg/resvg-js (native Node module) for 300 DPI
 * rasterization. This is not available on Cloudflare Workers.
 * Use the client-side PDF pipeline (jsPDF + svg2pdf.js) instead.
 */

export async function rasterizeSVGToPDF(_svgString: string): Promise<Uint8Array> {
	throw new Error(
		'Server-side SVG rasterization is not available. Use client-side PDF generation instead.'
	);
}
