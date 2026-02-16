<script lang="ts">
	import { generationState } from '$lib/state/generation.svelte';
	import { AGE_TO_GRADE } from '$lib/activities/age-map';

	const ages = [3, 4, 5, 6, 7, 8, 9, 10] as const;

	function selectAge(age: number) {
		generationState.setAge(age);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 font-display">Select Age Group</h2>
		<p class="text-gray-500 mt-1">Choose the target age for your worksheet</p>
	</div>

	<div class="flex flex-wrap justify-center gap-3 sm:gap-4">
		{#each ages as age}
			{@const isSelected = generationState.config.age === age}
			{@const gradeLabel = AGE_TO_GRADE.get(age) ?? ''}
			<button
				class="flex flex-col items-center gap-2 w-20 sm:w-24 py-4 px-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer
					{isSelected
					? 'border-primary bg-primary text-white shadow-lg scale-105'
					: 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'}"
				onclick={() => selectAge(age)}
			>
				<!-- Age number -->
				<span class="text-3xl font-bold font-display">{age}</span>

				<!-- Grade label -->
				<span
					class="text-[0.65rem] sm:text-xs font-medium leading-tight text-center
					{isSelected ? 'text-white/90' : 'text-gray-400'}"
				>
					{gradeLabel}
				</span>
			</button>
		{/each}
	</div>

	<!-- Selected summary -->
	{#if generationState.config.age !== null}
		{@const selectedGrade = AGE_TO_GRADE.get(generationState.config.age) ?? ''}
		<div class="text-center mt-4">
			<p class="text-sm text-gray-500">
				Selected: <span class="font-semibold text-gray-900">{generationState.config.age} years old</span>
				<span class="text-gray-400 mx-1">&middot;</span>
				<span class="font-semibold text-primary">{selectedGrade}</span>
			</p>
		</div>
	{/if}
</div>
