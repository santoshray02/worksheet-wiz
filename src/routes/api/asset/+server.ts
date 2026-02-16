import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLLMChain } from '$lib/llm';

// ---------------------------------------------------------------------------
// POST /api/asset — AI-powered SVG asset generation
// ---------------------------------------------------------------------------

interface AssetRequestBody {
	description: string;
	style?: 'line-art' | 'simple-color' | 'outline';
	maxSize?: number;
}

const SVG_GENERATION_PROMPT = `You are an SVG illustration generator for children's educational worksheets.
Generate ONLY a valid SVG element. No explanation, no markdown, just the SVG code.

Rules:
- Use a viewBox of "0 0 100 100"
- Use simple, clean shapes (circles, rects, paths)
- Use bold, child-friendly colors
- Keep the design simple and recognizable
- No text elements (labels are added separately)
- No embedded images or external references
- No script tags or event handlers
- Maximum 20 shape elements
- Use stroke-width between 2-4 for clear outlines`;

export const POST: RequestHandler = async ({ request }) => {
	let body: AssetRequestBody;

	try {
		body = (await request.json()) as AssetRequestBody;
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (!body.description || typeof body.description !== 'string') {
		return json({ error: 'Missing required field: description (string)' }, { status: 400 });
	}

	const chain = getLLMChain();

	if (chain.available.length === 0) {
		// Return a placeholder SVG when no LLM is configured
		const placeholder = createPlaceholderSVG(body.description);
		return new Response(placeholder, {
			headers: { 'Content-Type': 'image/svg+xml' }
		});
	}

	try {
		const styleHint = body.style === 'outline'
			? 'Use only outlines (no fill), suitable for coloring activities.'
			: body.style === 'line-art'
				? 'Use simple line art with minimal fills.'
				: 'Use simple, bold colors appropriate for young children.';

		const result = await chain.generate({
			subject: 'art',
			age: 5,
			activities: [],
			systemPrompt: SVG_GENERATION_PROMPT,
			userPrompt: `Generate an SVG illustration of: ${body.description}\n\n${styleHint}\n\nReturn ONLY the SVG code starting with <svg and ending with </svg>.`
		});

		// The LLM returns structured output, but we asked for raw SVG
		// Extract SVG from the response if it's wrapped
		let svg = typeof result === 'string' ? result : JSON.stringify(result);

		// Try to extract SVG tag if it's embedded in other content
		const svgMatch = svg.match(/<svg[\s\S]*?<\/svg>/i);
		if (svgMatch) {
			svg = svgMatch[0];
		} else {
			// Fallback to placeholder
			svg = createPlaceholderSVG(body.description);
		}

		// Basic sanitization: remove script tags and event handlers
		svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
		svg = svg.replace(/\bon\w+\s*=/gi, 'data-removed=');

		return new Response(svg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch (error) {
		console.error('Asset generation failed:', error);
		// Return placeholder on failure
		const placeholder = createPlaceholderSVG(body.description);
		return new Response(placeholder, {
			headers: { 'Content-Type': 'image/svg+xml' }
		});
	}
};

function createPlaceholderSVG(label: string): string {
	const escaped = label
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="90" height="90" rx="10" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
  <text x="50" y="55" text-anchor="middle" font-size="10" fill="#666">${escaped}</text>
</svg>`;
}
