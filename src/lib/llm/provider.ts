import type { GenerateRequest, GenerateResponse, LLMProviderConfig } from './types';

// ---------------------------------------------------------------------------
// Abstract LLM provider
// ---------------------------------------------------------------------------

/**
 * Base class for all LLM providers. Each concrete provider wraps a Vercel AI
 * SDK model implementation and exposes a uniform generate / stream interface.
 */
export abstract class LLMProvider {
	protected config: LLMProviderConfig;

	constructor(config: LLMProviderConfig) {
		this.config = config;
	}

	/** Human-readable provider name used in logging and error messages. */
	get name(): string {
		return this.config.name;
	}

	/** Returns true when the required credentials / endpoints are configured. */
	abstract isAvailable(): boolean;

	/** Generate a complete worksheet in one shot (structured output). */
	abstract generate(request: GenerateRequest): Promise<GenerateResponse>;

	/** Stream raw text chunks for progressive display. */
	abstract generateStream(request: GenerateRequest): AsyncGenerator<string>;
}
