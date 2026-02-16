import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLLMChain } from '$lib/llm';
import type { GenerateRequest } from '$lib/llm/types';
import { env } from '$env/dynamic/private';

// ---------------------------------------------------------------------------
// POST /api/generate — Streaming NDJSON worksheet generation
// ---------------------------------------------------------------------------

export const POST: RequestHandler = async ({ request }) => {
	let body: GenerateRequest;

	try {
		body = (await request.json()) as GenerateRequest;
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	// Basic validation
	if (!body.subject || typeof body.age !== 'number') {
		return json({ error: 'Missing required fields: subject, age' }, { status: 400 });
	}

	// Read API keys from request headers, fall back to env vars
	const anthropicApiKey = request.headers.get('X-Anthropic-Key') || env.ANTHROPIC_API_KEY || '';
	const openaiApiKey = request.headers.get('X-OpenAI-Key') || env.OPENAI_API_KEY || '';

	const chain = getLLMChain({ anthropicApiKey, openaiApiKey });

	if (chain.available.length === 0) {
		return json(
			{ error: 'No API keys configured. Add your keys in Settings (gear icon) or set ANTHROPIC_API_KEY / OPENAI_API_KEY environment variables.' },
			{ status: 503 }
		);
	}

	try {
		const result = await chain.generate(body);

		// Stream the result as NDJSON for progressive UI rendering
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				// Send title
				controller.enqueue(
					encoder.encode(JSON.stringify({ type: 'title', data: result.title }) + '\n')
				);

				// Send each activity with progress updates
				for (let i = 0; i < result.activities.length; i++) {
					controller.enqueue(
						encoder.encode(
							JSON.stringify({ type: 'activity', data: result.activities[i] }) + '\n'
						)
					);
					controller.enqueue(
						encoder.encode(
							JSON.stringify({
								type: 'progress',
								data: ((i + 1) / result.activities.length) * 100
							}) + '\n'
						)
					);
				}

				// Signal completion
				controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
				controller.close();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'application/x-ndjson',
				'Cache-Control': 'no-cache',
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (error) {
		console.error('Worksheet generation failed:', error);
		const message = error instanceof Error ? error.message : 'Generation failed';
		return json({ error: message }, { status: 500 });
	}
};
