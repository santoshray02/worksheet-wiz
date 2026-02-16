import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject, streamText } from 'ai';
import { LLMProvider } from './provider';
import type { GenerateRequest, GenerateResponse } from './types';
import { worksheetSchema, buildSystemPrompt, buildUserPrompt } from './prompts';

// ---------------------------------------------------------------------------
// Anthropic (Claude) provider
// ---------------------------------------------------------------------------

export class AnthropicProvider extends LLMProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		super({
			name: 'anthropic',
			model: 'claude-sonnet-4-5',
			maxOutputTokens: 4096,
			temperature: 0.7
		});
		this.apiKey = apiKey;
	}

	isAvailable(): boolean {
		return !!this.apiKey;
	}

	async generate(request: GenerateRequest): Promise<GenerateResponse> {
		const anthropic = createAnthropic({ apiKey: this.apiKey });

		const result = await generateObject({
			model: anthropic(this.config.model),
			schema: worksheetSchema,
			system: buildSystemPrompt(),
			prompt: buildUserPrompt(request),
			maxOutputTokens: this.config.maxOutputTokens,
			temperature: this.config.temperature
		});

		return result.object as GenerateResponse;
	}

	async *generateStream(request: GenerateRequest): AsyncGenerator<string> {
		const anthropic = createAnthropic({ apiKey: this.apiKey });

		const result = streamText({
			model: anthropic(this.config.model),
			system: buildSystemPrompt(),
			prompt: buildUserPrompt(request),
			maxOutputTokens: this.config.maxOutputTokens,
			temperature: this.config.temperature
		});

		for await (const chunk of result.textStream) {
			yield chunk;
		}
	}
}
