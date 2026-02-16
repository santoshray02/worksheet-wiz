<script lang="ts">
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import SubjectPicker from '$lib/components/creator/SubjectPicker.svelte';
	import AgePicker from '$lib/components/creator/AgePicker.svelte';
	import ActivityTypePicker from '$lib/components/creator/ActivityTypePicker.svelte';
	import GenerationStream from '$lib/components/creator/GenerationStream.svelte';
	import PreviewStep from '$lib/components/creator/PreviewStep.svelte';
	import EditStep from '$lib/components/creator/EditStep.svelte';
	import DownloadStep from '$lib/components/creator/DownloadStep.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { generationState } from '$lib/state/generation.svelte';

	const steps = ['Subject', 'Age', 'Activities', 'Generate', 'Preview', 'Edit', 'Download'];

	function handleNext() {
		if (generationState.step === 3) {
			// Step 3 -> 4: trigger generation, then advance
			generationState.nextStep();
			generationState.startGeneration();
		} else {
			generationState.nextStep();
		}
	}

	function handleBack() {
		generationState.prevStep();
	}

	function handleStepClick(stepIndex: number) {
		// stepIndex is 0-based from Stepper, goToStep is 1-based
		// Only allow going back to completed steps
		const targetStep = stepIndex + 1;
		if (targetStep < generationState.step) {
			generationState.goToStep(targetStep);
		}
	}
</script>

<svelte:head>
	<title>Create Worksheet</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 font-display">Create Worksheet</h1>
		<p class="text-gray-500 mt-1">Design the perfect worksheet in just a few steps</p>
	</div>

	<!-- Stepper -->
	<div class="mb-10 no-print">
		<Stepper {steps} currentStep={generationState.step - 1} onStepClick={handleStepClick} />
	</div>

	<!-- Step content -->
	<div class="min-h-[400px]">
		{#if generationState.step === 1}
			<SubjectPicker />
		{:else if generationState.step === 2}
			<AgePicker />
		{:else if generationState.step === 3}
			<ActivityTypePicker />
		{:else if generationState.step === 4}
			<GenerationStream />
		{:else if generationState.step === 5}
			<PreviewStep />
		{:else if generationState.step === 6}
			<EditStep />
		{:else if generationState.step === 7}
			<DownloadStep />
		{/if}
	</div>

	<!-- Navigation buttons -->
	<div class="flex justify-between items-center mt-10 pt-6 border-t border-gray-200 no-print">
		<div>
			{#if generationState.step > 1 && !generationState.isGenerating}
				<Button variant="outline" onclick={handleBack}>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
					</svg>
					Back
				</Button>
			{:else}
				<!-- Empty div for flex spacing -->
				<div></div>
			{/if}
		</div>

		<div>
			{#if generationState.step < 7 && generationState.step !== 4}
				<Button
					onclick={handleNext}
					disabled={!generationState.canProceed}
				>
					{generationState.step === 3 ? 'Generate' : 'Next'}
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</Button>
			{/if}
		</div>
	</div>
</div>
