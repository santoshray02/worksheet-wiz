/**
 * Dual-pipeline PDF generator.
 *
 * Supports two generation strategies:
 *
 * 1. **Client-side (vector)** -- Uses jsPDF + svg2pdf.js to produce a vector
 *    PDF directly in the browser.  This yields the best quality output and
 *    does not require a round-trip to the server.
 *
 * 2. **Server-side (raster)** -- POSTs the SVG markup to `/api/pdf` which
 *    rasterises it at 300 DPI via resvg and embeds the image in a PDF using
 *    pdf-lib.  This is the fallback when DOM access is unavailable (e.g. SSR)
 *    or when the client-side pipeline fails.
 *
 * The public `generate()` method transparently tries client-side first and
 * falls back to server-side.
 */

import type { Worksheet } from '$lib/types/worksheet';

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface PDFOptions {
	/** Append an answer-key page at the end of the PDF. */
	includeAnswerKey: boolean;
	/** Render the entire worksheet in grayscale. */
	grayscale: boolean;
	/** Draw a decorative border around each page. */
	showBorder: boolean;
}

// -------------------------------------------------------------------------
// Generator
// -------------------------------------------------------------------------

export class PDFGenerator {
	/**
	 * Generate a vector PDF entirely in the browser using jsPDF + svg2pdf.js.
	 */
	async generateClientSide(svgElement: SVGSVGElement, _options: PDFOptions): Promise<Blob> {
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
	 * Generate a raster PDF on the server by POSTing the SVG string to the
	 * `/api/pdf` endpoint.
	 */
	async generateServerSide(svgString: string, options: PDFOptions): Promise<Uint8Array> {
		const response = await fetch('/api/pdf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ svg: svgString, options })
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(`Server-side PDF generation failed (${response.status}): ${text}`);
		}

		const buffer = await response.arrayBuffer();
		return new Uint8Array(buffer);
	}

	/**
	 * High-level generation entry point.
	 *
	 * Attempts client-side vector generation first (when an `SVGSVGElement`
	 * reference is available) and falls back to server-side raster generation
	 * on failure.
	 */
	async generate(
		_worksheet: Worksheet,
		svgElement: SVGSVGElement | null,
		svgString: string,
		options: PDFOptions
	): Promise<Blob> {
		if (svgElement) {
			try {
				return await this.generateClientSide(svgElement, options);
			} catch (error) {
				console.warn('Client-side PDF failed, trying server-side:', error);
			}
		}

		const bytes = await this.generateServerSide(svgString, options);
		return new Blob([bytes], { type: 'application/pdf' });
	}

	/**
	 * Trigger a browser download for the given PDF blob.
	 */
	downloadPDF(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}

export const pdfGenerator = new PDFGenerator();
