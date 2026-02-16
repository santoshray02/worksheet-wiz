import { describe, it, expect, vi } from 'vitest';
import { FallbackChain } from '$lib/llm/chain';
import { LLMProvider } from '$lib/llm/provider';
import type { GenerateRequest, GenerateResponse, LLMProviderConfig } from '$lib/llm/types';

// ---------------------------------------------------------------------------
// Mock provider factories
// ---------------------------------------------------------------------------

class MockSuccessProvider extends LLMProvider {
	constructor(name: string, private response: GenerateResponse) {
		super({ name, model: 'mock' } as LLMProviderConfig);
	}

	isAvailable(): boolean {
		return true;
	}

	async generate(_request: GenerateRequest): Promise<GenerateResponse> {
		return this.response;
	}

	async *generateStream(_request: GenerateRequest): AsyncGenerator<string> {
		yield JSON.stringify(this.response);
	}
}

class MockFailProvider extends LLMProvider {
	constructor(name: string) {
		super({ name, model: 'mock-fail' } as LLMProviderConfig);
	}

	isAvailable(): boolean {
		return true;
	}

	async generate(_request: GenerateRequest): Promise<GenerateResponse> {
		throw new Error(`${this.name} failed`);
	}

	async *generateStream(_request: GenerateRequest): AsyncGenerator<string> {
		throw new Error(`${this.name} stream failed`);
	}
}

class MockUnavailableProvider extends LLMProvider {
	constructor(name: string) {
		super({ name, model: 'mock-unavailable' } as LLMProviderConfig);
	}

	isAvailable(): boolean {
		return false;
	}

	async generate(_request: GenerateRequest): Promise<GenerateResponse> {
		throw new Error('Should not be called');
	}

	async *generateStream(_request: GenerateRequest): AsyncGenerator<string> {
		throw new Error('Should not be called');
	}
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const testRequest: GenerateRequest = {
	subject: 'math',
	age: 5,
	activities: ['counting'],
	count: 1
};

const testResponse: GenerateResponse = {
	title: 'Test Worksheet',
	activities: [
		{
			id: 'test-1',
			type: 'counting',
			title: 'Count the Objects',
			instructions: 'Count each group and write the number.',
			difficulty: 1,
			groups: [{ assetId: 'circle', count: 3 }],
			answerFormat: 'write'
		}
	]
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FallbackChain', () => {
	it('should return result from first successful provider', async () => {
		const chain = new FallbackChain([
			new MockSuccessProvider('provider-a', testResponse)
		]);

		const result = await chain.generate(testRequest);
		expect(result.title).toBe('Test Worksheet');
		expect(result.activities).toHaveLength(1);
	});

	it('should try providers in order', async () => {
		const responseA: GenerateResponse = {
			title: 'From A',
			activities: []
		};
		const responseB: GenerateResponse = {
			title: 'From B',
			activities: []
		};

		const chain = new FallbackChain([
			new MockSuccessProvider('provider-a', responseA),
			new MockSuccessProvider('provider-b', responseB)
		]);

		const result = await chain.generate(testRequest);
		// Should use the first provider
		expect(result.title).toBe('From A');
	});

	it('should fall back to second provider when first fails', async () => {
		const responseB: GenerateResponse = {
			title: 'From B',
			activities: []
		};

		const chain = new FallbackChain([
			new MockFailProvider('provider-a'),
			new MockSuccessProvider('provider-b', responseB)
		]);

		const result = await chain.generate(testRequest);
		expect(result.title).toBe('From B');
	});

	it('should skip unavailable providers', async () => {
		const responseC: GenerateResponse = {
			title: 'From C',
			activities: []
		};

		const chain = new FallbackChain([
			new MockUnavailableProvider('provider-a'),
			new MockUnavailableProvider('provider-b'),
			new MockSuccessProvider('provider-c', responseC)
		]);

		expect(chain.available).toHaveLength(1);

		const result = await chain.generate(testRequest);
		expect(result.title).toBe('From C');
	});

	it('should throw when all providers fail', async () => {
		const chain = new FallbackChain([
			new MockFailProvider('provider-a'),
			new MockFailProvider('provider-b')
		]);

		await expect(chain.generate(testRequest)).rejects.toThrow('All LLM providers failed');
	});

	it('should throw when no providers are available', async () => {
		const chain = new FallbackChain([
			new MockUnavailableProvider('provider-a'),
			new MockUnavailableProvider('provider-b')
		]);

		expect(chain.available).toHaveLength(0);
		await expect(chain.generate(testRequest)).rejects.toThrow('No LLM providers available');
	});

	it('should throw when provider list is empty', async () => {
		const chain = new FallbackChain([]);

		await expect(chain.generate(testRequest)).rejects.toThrow('No LLM providers available');
	});

	it('should include provider names in the error message when all fail', async () => {
		const chain = new FallbackChain([
			new MockFailProvider('alpha'),
			new MockFailProvider('beta')
		]);

		try {
			await chain.generate(testRequest);
			expect.unreachable('Should have thrown');
		} catch (e) {
			const msg = (e as Error).message;
			expect(msg).toContain('alpha');
			expect(msg).toContain('beta');
		}
	});

	describe('generateStream', () => {
		it('should stream from first successful provider', async () => {
			const chain = new FallbackChain([
				new MockSuccessProvider('provider-a', testResponse)
			]);

			const chunks: string[] = [];
			for await (const chunk of chain.generateStream(testRequest)) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toContain('Test Worksheet');
		});

		it('should fall back when first provider stream fails', async () => {
			const responseB: GenerateResponse = {
				title: 'Stream B',
				activities: []
			};

			const chain = new FallbackChain([
				new MockFailProvider('provider-a'),
				new MockSuccessProvider('provider-b', responseB)
			]);

			const chunks: string[] = [];
			for await (const chunk of chain.generateStream(testRequest)) {
				chunks.push(chunk);
			}

			expect(chunks[0]).toContain('Stream B');
		});

		it('should throw when all providers fail to stream', async () => {
			const chain = new FallbackChain([
				new MockFailProvider('provider-a'),
				new MockFailProvider('provider-b')
			]);

			const collectStream = async () => {
				const chunks: string[] = [];
				for await (const chunk of chain.generateStream(testRequest)) {
					chunks.push(chunk);
				}
				return chunks;
			};

			await expect(collectStream()).rejects.toThrow('All LLM providers failed to stream');
		});

		it('should throw when no providers available for streaming', async () => {
			const chain = new FallbackChain([]);

			const collectStream = async () => {
				const chunks: string[] = [];
				for await (const chunk of chain.generateStream(testRequest)) {
					chunks.push(chunk);
				}
				return chunks;
			};

			await expect(collectStream()).rejects.toThrow('No LLM providers available');
		});
	});

	describe('available property', () => {
		it('should filter out unavailable providers', () => {
			const chain = new FallbackChain([
				new MockSuccessProvider('avail-1', testResponse),
				new MockUnavailableProvider('unavail-1'),
				new MockSuccessProvider('avail-2', testResponse),
				new MockUnavailableProvider('unavail-2')
			]);

			const available = chain.available;
			expect(available).toHaveLength(2);
			expect(available[0].name).toBe('avail-1');
			expect(available[1].name).toBe('avail-2');
		});
	});
});
