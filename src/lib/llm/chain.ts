import type { GenerateRequest, GenerateResponse } from './types';
import type { LLMProvider } from './provider';

// ---------------------------------------------------------------------------
// Fallback chain
// ---------------------------------------------------------------------------

/**
 * Tries each provider in order until one succeeds. Providers that report
 * themselves as unavailable (missing API key / endpoint) are skipped
 * immediately. If a provider throws at runtime the chain moves on to the
 * next available provider.
 */
export class FallbackChain {
	private providers: LLMProvider[];

	constructor(providers: LLMProvider[]) {
		this.providers = providers;
	}

	/** Returns only the providers whose credentials are currently configured. */
	get available(): LLMProvider[] {
		return this.providers.filter((p) => p.isAvailable());
	}

	/**
	 * Generate a complete worksheet using structured output.
	 * Tries each available provider in priority order.
	 */
	async generate(request: GenerateRequest): Promise<GenerateResponse> {
		const available = this.available;

		if (available.length === 0) {
			throw new Error(
				'No LLM providers available. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.'
			);
		}

		const errors: Array<{ provider: string; error: unknown }> = [];

		for (const provider of available) {
			try {
				return await provider.generate(request);
			} catch (error) {
				console.warn(`Provider ${provider.name} failed:`, error);
				errors.push({ provider: provider.name, error });
				continue;
			}
		}

		throw new Error(
			`All LLM providers failed:\n${errors.map((e) => `  - ${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join('\n')}`
		);
	}

	/**
	 * Stream raw text chunks from the first available provider that
	 * successfully starts streaming.
	 */
	async *generateStream(request: GenerateRequest): AsyncGenerator<string> {
		const available = this.available;

		if (available.length === 0) {
			throw new Error(
				'No LLM providers available. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.'
			);
		}

		const errors: Array<{ provider: string; error: unknown }> = [];

		for (const provider of available) {
			try {
				yield* provider.generateStream(request);
				return;
			} catch (error) {
				console.warn(`Provider ${provider.name} stream failed:`, error);
				errors.push({ provider: provider.name, error });
				continue;
			}
		}

		throw new Error(
			`All LLM providers failed to stream:\n${errors.map((e) => `  - ${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join('\n')}`
		);
	}
}
