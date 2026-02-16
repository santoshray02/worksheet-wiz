<script lang="ts">
	import { generationState } from '$lib/state/generation.svelte';
	import { settingsState } from '$lib/state/settings.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getActivityMeta } from '$lib/activities/registry';

	const isOffline = $derived(!settingsState.hasAnyKey);

	/** Badge colour mapped to activity type for visual variety */
	const typeBadgeColors: Record<string, string> = {
		tracing: 'bg-blue-100 text-blue-700',
		counting: 'bg-emerald-100 text-emerald-700',
		matching: 'bg-purple-100 text-purple-700',
		math: 'bg-indigo-100 text-indigo-700',
		maze: 'bg-teal-100 text-teal-700',
		pattern: 'bg-amber-100 text-amber-700',
		coloring: 'bg-pink-100 text-pink-700',
		spelling: 'bg-green-100 text-green-700',
		handwriting: 'bg-cyan-100 text-cyan-700',
		'connect-dots': 'bg-violet-100 text-violet-700',
		'word-search': 'bg-lime-100 text-lime-700',
		crossword: 'bg-fuchsia-100 text-fuchsia-700',
		'odd-one-out': 'bg-orange-100 text-orange-700',
		'number-bonds': 'bg-sky-100 text-sky-700',
		'story-sequencing': 'bg-rose-100 text-rose-700',
		'cut-and-paste': 'bg-yellow-100 text-yellow-700'
	};

	function getBadgeColor(type: string): string {
		return typeBadgeColors[type] ?? 'bg-gray-100 text-gray-700';
	}

	function handleRetry() {
		generationState.startGeneration();
	}

	function handleContinue() {
		generationState.nextStep();
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 font-display">
			{#if generationState.status === 'complete'}
				Worksheet Ready!
			{:else if generationState.status === 'error'}
				Generation Failed
			{:else}
				Generating Your Worksheet...
			{/if}
		</h2>
		{#if generationState.isGenerating}
			<p class="text-gray-500 mt-1">
				{isOffline ? 'Creating with built-in templates...' : 'Hang tight while we create your activities'}
			</p>
		{/if}
	</div>

	<!-- Offline mode banner -->
	{#if isOffline && generationState.isGenerating}
		<div class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
			<svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
			</svg>
			<p class="text-amber-800">
				<span class="font-semibold">Offline Mode</span> — Generating with built-in templates. Add API keys in Settings for AI-powered worksheets.
			</p>
		</div>
	{/if}

	<!-- Progress bar -->
	<div class="space-y-2">
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-500 font-medium">
				{#if generationState.isGenerating}
					<span class="inline-flex items-center gap-2">
						<Spinner size="sm" />
						{generationState.currentActivity || 'Starting...'}
					</span>
				{:else if generationState.status === 'complete'}
					<span class="text-emerald-600 font-semibold">All activities generated</span>
				{:else if generationState.status === 'error'}
					<span class="text-red-600 font-semibold">Error occurred</span>
				{:else}
					Waiting to start...
				{/if}
			</span>
			<span class="text-gray-400 tabular-nums">{generationState.progress}%</span>
		</div>

		<div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-500 ease-out
					{generationState.status === 'error'
					? 'bg-red-500'
					: generationState.status === 'complete'
						? 'bg-emerald-500'
						: 'bg-primary'}"
				style="width: {generationState.progress}%"
			>
				{#if generationState.isGenerating}
					<div class="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse"></div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Error state -->
	{#if generationState.status === 'error'}
		<div class="bg-red-50 border border-red-200 rounded-xl p-4">
			<div class="flex items-start gap-3">
				<div class="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
					<svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-red-800">Something went wrong</p>
					<p class="text-sm text-red-600 mt-1">{generationState.error}</p>
				</div>
			</div>
			<div class="mt-4 flex justify-end">
				<Button variant="primary" size="sm" onclick={handleRetry}>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
					</svg>
					Retry
				</Button>
			</div>
		</div>
	{/if}

	<!-- Streamed activity cards -->
	{#if generationState.streamedActivities.length > 0}
		<div class="space-y-3">
			{#each generationState.streamedActivities as activity, i}
				{@const meta = getActivityMeta(activity.type)}
				<div
					class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-[fadeSlideIn_0.4s_ease-out]"
					style="animation-delay: {i * 100}ms"
				>
					<!-- Index number -->
					<div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
						{i + 1}
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-sm font-semibold text-gray-900">{activity.title}</span>
							<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold {getBadgeColor(activity.type)}">
								{meta?.name ?? activity.type}
							</span>
						</div>
						<p class="text-xs text-gray-500 mt-0.5 truncate">{activity.instructions}</p>
					</div>

					<!-- Checkmark -->
					<div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Complete / Continue -->
	{#if generationState.status === 'complete'}
		<div class="flex justify-center pt-2">
			<Button onclick={handleContinue} size="lg">
				Continue to Preview
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</Button>
		</div>
	{/if}

	<!-- Cancel button while generating -->
	{#if generationState.isGenerating}
		<div class="flex justify-center">
			<Button variant="ghost" size="sm" onclick={() => generationState.cancelGeneration()}>
				Cancel Generation
			</Button>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
