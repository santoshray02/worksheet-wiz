import type { ActivityData, ActivityType, Subject } from '$lib/types/activity';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export interface LLMProviderConfig {
	name: string;
	model: string;
	apiKey?: string;
	baseUrl?: string;
	maxOutputTokens?: number;
	temperature?: number;
}

// ---------------------------------------------------------------------------
// Generation request / response
// ---------------------------------------------------------------------------

export interface GenerateRequest {
	subject: Subject;
	age: number;
	activities: ActivityType[]; // empty = let AI decide
	count?: number; // number of activities, default based on age
	theme?: string; // optional theme like "animals", "space"
	letAIDecide?: boolean; // let the AI choose activities
	systemPrompt?: string; // override the default system prompt
	userPrompt?: string; // override the default user prompt
}

export interface GenerateResponse {
	title: string;
	activities: ActivityData[];
}

// ---------------------------------------------------------------------------
// Streaming chunks
// ---------------------------------------------------------------------------

export interface StreamChunk {
	type: 'activity' | 'title' | 'progress' | 'error' | 'done';
	data: unknown;
}
