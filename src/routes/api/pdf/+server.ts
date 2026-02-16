import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ---------------------------------------------------------------------------
// POST /api/pdf — Server-side PDF generation (Cloudflare-compatible)
//
// On Cloudflare Pages, native Node modules like @resvg/resvg-js are not
// available. Use the client-side PDF pipeline (jsPDF + svg2pdf.js) instead.
// This endpoint is kept as a stub to avoid 404s from existing client code.
// ---------------------------------------------------------------------------

export const POST: RequestHandler = async () => {
	return json(
		{ error: 'Server-side PDF generation is not available. Use client-side PDF generation instead.' },
		{ status: 501 }
	);
};
