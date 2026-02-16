<script lang="ts">
	import type { ActivityType } from '$lib/types/activity';
	import { generationState } from '$lib/state/generation.svelte';
	import { settingsState } from '$lib/state/settings.svelte';
	import { getAvailableActivities, type ActivityMeta } from '$lib/activities/registry';
	import { OFFLINE_SUPPORTED_TYPES } from '$lib/offline/generators';

	const isOffline = $derived(!settingsState.hasAnyKey);

	let availableActivities = $derived<ActivityMeta[]>(
		getAvailableActivities(
			generationState.config.subject ?? undefined,
			generationState.config.age ?? undefined
		)
	);

	function toggleActivity(type: ActivityType) {
		if (generationState.config.letAIDecide) return;
		generationState.toggleActivity(type);
	}

	function toggleLetAIDecide() {
		generationState.setLetAIDecide(!generationState.config.letAIDecide);
		if (generationState.config.letAIDecide) {
			// Clear manual selections when AI decides
			for (const act of [...generationState.config.selectedActivities]) {
				generationState.toggleActivity(act);
			}
		}
	}

	function isSelected(type: ActivityType): boolean {
		return generationState.config.selectedActivities.includes(type);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 font-display">Choose Activities</h2>
		<p class="text-gray-500 mt-1">
			Select the activity types to include in your worksheet
			{#if generationState.config.subject}
				<span class="text-gray-400 mx-1">&middot;</span>
				<span class="font-medium text-gray-700 capitalize">{generationState.config.subject}</span>
			{/if}
			{#if generationState.config.age}
				<span class="text-gray-400 mx-1">&middot;</span>
				<span class="font-medium text-gray-700">Age {generationState.config.age}</span>
			{/if}
		</p>
	</div>

	<!-- Let AI Decide toggle -->
	<div class="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-purple-50 rounded-xl border border-primary/10">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
				<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
				</svg>
			</div>
			<div>
				<p class="text-sm font-semibold text-gray-900">{isOffline ? 'Auto-Select' : 'Let AI Decide'}</p>
				<p class="text-xs text-gray-500">{isOffline ? 'Automatically pick a good mix of activities' : 'Automatically pick the best mix of activities'}</p>
			</div>
		</div>

		<!-- Toggle switch -->
		<button
			class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
				{generationState.config.letAIDecide ? 'bg-primary' : 'bg-gray-200'}"
			role="switch"
			aria-checked={generationState.config.letAIDecide}
			aria-label="Let AI Decide"
			onclick={toggleLetAIDecide}
		>
			<span
				class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out
					{generationState.config.letAIDecide ? 'translate-x-5' : 'translate-x-0'}"
			></span>
		</button>
	</div>

	<!-- Activity grid -->
	{#if availableActivities.length === 0}
		<div class="text-center py-12">
			<div class="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
				<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
				</svg>
			</div>
			<p class="text-gray-500">No activities available for this subject and age combination.</p>
			<p class="text-sm text-gray-400 mt-1">Try selecting a different subject or age group.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 {generationState.config.letAIDecide ? 'opacity-50 pointer-events-none' : ''}">
			{#each availableActivities as activity}
				{@const selected = isSelected(activity.type)}
				{@const unsupported = isOffline && !OFFLINE_SUPPORTED_TYPES.has(activity.type)}
				<button
					class="relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
						{selected
						? 'border-primary bg-primary/5 shadow-sm'
						: 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
						{unsupported ? 'opacity-60' : ''}"
					onclick={() => toggleActivity(activity.type)}
					disabled={generationState.config.letAIDecide}
				>
					<!-- Checkbox -->
					<div
						class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
							{selected
							? 'border-primary bg-primary'
							: 'border-gray-300'}"
					>
						{#if selected}
							<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{/if}
					</div>

					<!-- Content -->
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-sm font-semibold text-gray-900">{activity.name}</span>
							<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[0.6rem] font-medium bg-gray-100 text-gray-500">
								{activity.ageRange.min}-{activity.ageRange.max}y
							</span>
						</div>
						<p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{activity.description}</p>
						{#if unsupported}
							<p class="text-[0.6rem] text-amber-600 mt-1">(requires API key)</p>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Selection summary -->
	{#if !generationState.config.letAIDecide && generationState.config.selectedActivities.length > 0}
		<div class="text-center text-sm text-gray-500">
			<span class="font-semibold text-primary">{generationState.config.selectedActivities.length}</span>
			{generationState.config.selectedActivities.length === 1 ? 'activity' : 'activities'} selected
		</div>
	{/if}
</div>
