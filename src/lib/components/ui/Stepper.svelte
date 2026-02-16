<script lang="ts">
	interface Props {
		steps: string[];
		currentStep: number;
		onStepClick?: (step: number) => void;
	}

	let { steps, currentStep, onStepClick }: Props = $props();

	function isCompleted(index: number): boolean {
		return index < currentStep;
	}

	function isCurrent(index: number): boolean {
		return index === currentStep;
	}

	function handleClick(index: number) {
		if (onStepClick && index <= currentStep) {
			onStepClick(index);
		}
	}
</script>

<nav class="w-full" aria-label="Progress steps">
	<ol class="flex items-center w-full">
		{#each steps as step, i}
			<li class="flex items-center {i < steps.length - 1 ? 'flex-1' : ''}">
				<!-- Step circle and label -->
				<button
					class="flex flex-col items-center gap-1.5 group relative"
					onclick={() => handleClick(i)}
					disabled={i > currentStep}
					aria-current={isCurrent(i) ? 'step' : undefined}
				>
					<div
						class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300 shrink-0
							{isCurrent(i)
							? 'bg-primary text-white shadow-md ring-4 ring-primary/20'
							: isCompleted(i)
								? 'bg-primary text-white'
								: 'bg-white border-2 border-gray-300 text-gray-400'}"
					>
						{#if isCompleted(i)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							{i + 1}
						{/if}
					</div>
					<span
						class="text-xs font-medium whitespace-nowrap transition-colors
							{isCurrent(i)
							? 'text-primary'
							: isCompleted(i)
								? 'text-gray-700'
								: 'text-gray-400'}"
					>
						{step}
					</span>
				</button>

				<!-- Connector line -->
				{#if i < steps.length - 1}
					<div class="flex-1 mx-2 mt-[-1.25rem]">
						<div
							class="h-0.5 w-full transition-colors duration-300
								{isCompleted(i) ? 'bg-primary' : 'bg-gray-200'}"
						></div>
					</div>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
