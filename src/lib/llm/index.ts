import { FallbackChain } from './chain';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';

// ---------------------------------------------------------------------------
// LLM chain factory
// ---------------------------------------------------------------------------

export interface LLMKeys {
	anthropicApiKey?: string;
	openaiApiKey?: string;
}

/**
 * Creates a fallback chain with providers in priority order:
 * OpenAI -> Anthropic.
 *
 * Keys vary per request (BYOK from UI headers, with env fallback),
 * so a new chain is created each time.
 */
export function getLLMChain(keys: LLMKeys = {}): FallbackChain {
	return new FallbackChain([
		new OpenAIProvider(keys.openaiApiKey ?? ''),
		new AnthropicProvider(keys.anthropicApiKey ?? '')
	]);
}

export type { GenerateRequest, GenerateResponse } from './types';
