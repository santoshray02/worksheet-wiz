import type { ActivityData, ActivityType, Subject } from '$lib/types/activity';
import { settingsState } from './settings.svelte';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GenerationStatus = 'idle' | 'configuring' | 'generating' | 'streaming' | 'complete' | 'error';

export interface GenerationConfig {
	subject: Subject | null;
	age: number | null;
	selectedActivities: ActivityType[];
	letAIDecide: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Total number of wizard steps */
const TOTAL_STEPS = 7;

/**
 * Reactive state container for the worksheet generation wizard.
 *
 * Tracks the multi-step configuration form, streams generated activities
 * from the `/api/generate` endpoint, and exposes progress to the UI.
 */
export class GenerationState {
	// -----------------------------------------------------------------------
	// Reactive properties (Svelte 5 $state rune)
	// -----------------------------------------------------------------------

	status = $state<GenerationStatus>('idle');

	config = $state<GenerationConfig>({
		subject: null,
		age: null,
		selectedActivities: [],
		letAIDecide: false
	});

	streamedActivities = $state<ActivityData[]>([]);
	currentActivity = $state<string>('');
	progress = $state(0);
	error = $state<string | null>(null);

	/** Wizard step number (1-based, up to TOTAL_STEPS). */
	step = $state(1);

	// -----------------------------------------------------------------------
	// Abort controller – allows cancelling an in-flight generation
	// -----------------------------------------------------------------------

	private abortController: AbortController | null = null;

	// -----------------------------------------------------------------------
	// Derived getters
	// -----------------------------------------------------------------------

	get isGenerating(): boolean {
		return this.status === 'generating' || this.status === 'streaming';
	}

	get isComplete(): boolean {
		return this.status === 'complete';
	}

	/**
	 * Whether the user has filled in enough information to advance
	 * from the current wizard step.
	 */
	get canProceed(): boolean {
		switch (this.step) {
			case 1:
				// Step 1: subject must be selected
				return this.config.subject !== null;
			case 2:
				// Step 2: age must be chosen
				return this.config.age !== null;
			case 3:
				// Step 3: at least one activity selected OR letAIDecide
				return this.config.letAIDecide || this.config.selectedActivities.length > 0;
			case 4:
			case 5:
			case 6:
				// Steps 4-6: always allowed (optional refinement steps)
				return true;
			case 7:
				// Step 7: review step – always allowed
				return true;
			default:
				return false;
		}
	}

	// -----------------------------------------------------------------------
	// Config actions
	// -----------------------------------------------------------------------

	setSubject(subject: Subject): void {
		this.config.subject = subject;
	}

	setAge(age: number): void {
		this.config.age = age;
	}

	toggleActivity(type: ActivityType): void {
		const idx = this.config.selectedActivities.indexOf(type);
		if (idx === -1) {
			this.config.selectedActivities = [...this.config.selectedActivities, type];
		} else {
			this.config.selectedActivities = this.config.selectedActivities.filter((t) => t !== type);
		}
	}

	setLetAIDecide(value: boolean): void {
		this.config.letAIDecide = value;
	}

	// -----------------------------------------------------------------------
	// Wizard navigation
	// -----------------------------------------------------------------------

	nextStep(): void {
		if (this.step < TOTAL_STEPS && this.canProceed) {
			this.step += 1;
		}
	}

	prevStep(): void {
		if (this.step > 1) {
			this.step -= 1;
		}
	}

	goToStep(step: number): void {
		if (step >= 1 && step <= TOTAL_STEPS) {
			this.step = step;
		}
	}

	// -----------------------------------------------------------------------
	// Generation
	// -----------------------------------------------------------------------

	/**
	 * Kick off the generation flow by POSTing the current config to
	 * `/api/generate` and processing the NDJSON stream of activities.
	 *
	 * The stream is expected to emit one JSON object per line, each
	 * conforming to the `ActivityData` discriminated union.
	 */
	async startGeneration(): Promise<void> {
		// Guard against double-invocation
		if (this.isGenerating) return;

		// Reset transient state
		this.streamedActivities = [];
		this.currentActivity = '';
		this.progress = 0;
		this.error = null;
		this.status = 'generating';

		// Allow the caller (or a cancel button) to abort
		this.abortController = new AbortController();

		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (settingsState.anthropicApiKey) {
				headers['X-Anthropic-Key'] = settingsState.anthropicApiKey;
			}
			if (settingsState.openaiApiKey) {
				headers['X-OpenAI-Key'] = settingsState.openaiApiKey;
			}

			const response = await fetch('/api/generate', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					subject: this.config.subject,
					age: this.config.age,
					activities: this.config.letAIDecide ? [] : this.config.selectedActivities,
					letAIDecide: this.config.letAIDecide
				}),
				signal: this.abortController.signal
			});

			if (!response.ok) {
				const text = await response.text().catch(() => 'Unknown error');
				throw new Error(`Generation failed (${response.status}): ${text}`);
			}

			if (!response.body) {
				throw new Error('Response body is empty');
			}

			// ---------------------------------------------------------------
			// Stream processing – read NDJSON line by line
			// ---------------------------------------------------------------

			this.status = 'streaming';

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Split on newlines; the last element may be a partial line.
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					this.processStreamLine(line);
				}
			}

			// Process any remaining content in the buffer
			if (buffer.trim()) {
				this.processStreamLine(buffer);
			}

			this.progress = 100;
			this.status = 'complete';
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				// User cancelled – treat as a reset rather than an error
				this.status = 'idle';
				return;
			}

			this.error = err instanceof Error ? err.message : 'An unknown error occurred';
			this.status = 'error';
		} finally {
			this.abortController = null;
		}
	}

	/**
	 * Process a single NDJSON line from the generation stream.
	 * The API sends wrapped objects: { type: 'title'|'activity'|'progress'|'done', data: ... }
	 */
	private processStreamLine(raw: string): void {
		const trimmed = raw.trim();
		if (!trimmed) return;

		try {
			const envelope = JSON.parse(trimmed) as { type: string; data?: unknown };

			switch (envelope.type) {
				case 'title':
					this.currentActivity = String(envelope.data ?? '');
					break;
				case 'activity': {
					const activity = envelope.data as ActivityData;
					this.streamedActivities = [...this.streamedActivities, activity];
					this.currentActivity = activity.title;
					break;
				}
				case 'progress':
					this.progress = Math.min(100, Math.round(Number(envelope.data ?? 0)));
					break;
				case 'done':
					// Completion signal; handled by the outer loop
					break;
				default:
					console.warn('Unknown stream message type:', envelope.type);
			}
		} catch {
			console.warn('Skipping non-JSON line from generation stream:', trimmed);
		}
	}

	/**
	 * Cancel an in-flight generation request.
	 */
	cancelGeneration(): void {
		this.abortController?.abort();
	}

	/**
	 * Reset the entire generation state back to the initial idle state.
	 * Aborts any in-flight request.
	 */
	reset(): void {
		this.cancelGeneration();

		this.status = 'idle';
		this.config = {
			subject: null,
			age: null,
			selectedActivities: [],
			letAIDecide: false
		};
		this.streamedActivities = [];
		this.currentActivity = '';
		this.progress = 0;
		this.error = null;
		this.step = 1;
	}
}

export const generationState = new GenerationState();
