import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, streamText } from 'ai';
import { LLMProvider } from './provider';
import type { GenerateRequest, GenerateResponse } from './types';
import { worksheetSchema, buildSystemPrompt, buildUserPrompt } from './prompts';

// ---------------------------------------------------------------------------
// OpenAI (GPT) provider
// ---------------------------------------------------------------------------

export class OpenAIProvider extends LLMProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		super({
			name: 'openai',
			model: 'gpt-4o',
			maxOutputTokens: 4096,
			temperature: 0.7
		});
		this.apiKey = apiKey;
	}

	isAvailable(): boolean {
		return !!this.apiKey;
	}

	async generate(request: GenerateRequest): Promise<GenerateResponse> {
		const openai = createOpenAI({ apiKey: this.apiKey });

		const result = await generateObject({
			model: openai(this.config.model),
			schema: worksheetSchema,
			system: buildSystemPrompt(),
			prompt: buildUserPrompt(request),
			maxOutputTokens: this.config.maxOutputTokens,
			temperature: this.config.temperature
		});

		return result.object as GenerateResponse;
	}

	async *generateStream(request: GenerateRequest): AsyncGenerator<string> {
		const openai = createOpenAI({ apiKey: this.apiKey });

		const result = streamText({
			model: openai(this.config.model),
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
