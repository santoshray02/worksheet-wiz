<script lang="ts">
	import type { ActivityData } from '$lib/types/activity';

	interface Props {
		selectedActivity: ActivityData | null;
		onUpdate: (updates: Partial<ActivityData>) => void;
		onDelete: () => void;
	}

	let { selectedActivity, onUpdate, onDelete }: Props = $props();

	const fontSizes = [3, 3.5, 4, 5, 6, 7, 8, 10, 12];

	function handleTitleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		onUpdate({ title: target.value } as Partial<ActivityData>);
	}

	function handleNumberChange(field: string, e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseFloat(target.value);
		if (!isNaN(value)) {
			onUpdate({ [field]: value } as unknown as Partial<ActivityData>);
		}
	}

	function handleFontSizeChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const value = parseFloat(target.value);
		if (!isNaN(value)) {
			onUpdate({ fontSize: value } as unknown as Partial<ActivityData>);
		}
	}
</script>

<div class="flex flex-col h-full bg-white border-l border-gray-200 w-64">
	<div class="px-3 py-2 border-b border-gray-100">
		<h3 class="text-sm font-semibold text-gray-700">Properties</h3>
	</div>

	<div class="flex-1 overflow-y-auto p-3">
		{#if selectedActivity === null}
			<p class="text-sm text-gray-400 text-center py-8">Select an element to edit</p>
		{:else}
			<div class="flex flex-col gap-4">
				<!-- Title -->
				<div class="flex flex-col gap-1">
					<label for="prop-title" class="text-xs font-medium text-gray-500">Title</label>
					<input
						id="prop-title"
						type="text"
						value={selectedActivity.title}
						oninput={handleTitleChange}
						class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
					/>
				</div>

				<!-- Position -->
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500">Position (mm)</span>
					<div class="grid grid-cols-2 gap-2">
						<div class="flex flex-col gap-0.5">
							<label for="prop-x" class="text-[10px] text-gray-400">X</label>
							<input
								id="prop-x"
								type="number"
								value={0}
								oninput={(e) => handleNumberChange('x', e)}
								step="0.5"
								class="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all tabular-nums"
							/>
						</div>
						<div class="flex flex-col gap-0.5">
							<label for="prop-y" class="text-[10px] text-gray-400">Y</label>
							<input
								id="prop-y"
								type="number"
								value={0}
								oninput={(e) => handleNumberChange('y', e)}
								step="0.5"
								class="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all tabular-nums"
							/>
						</div>
					</div>
				</div>

				<!-- Size -->
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500">Size (mm)</span>
					<div class="grid grid-cols-2 gap-2">
						<div class="flex flex-col gap-0.5">
							<label for="prop-width" class="text-[10px] text-gray-400">Width</label>
							<input
								id="prop-width"
								type="number"
								value={0}
								oninput={(e) => handleNumberChange('width', e)}
								step="0.5"
								min="1"
								class="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all tabular-nums"
							/>
						</div>
						<div class="flex flex-col gap-0.5">
							<label for="prop-height" class="text-[10px] text-gray-400">Height</label>
							<input
								id="prop-height"
								type="number"
								value={0}
								oninput={(e) => handleNumberChange('height', e)}
								step="0.5"
								min="1"
								class="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all tabular-nums"
							/>
						</div>
					</div>
				</div>

				<!-- Font size -->
				<div class="flex flex-col gap-1">
					<label for="prop-fontsize" class="text-xs font-medium text-gray-500">Font Size (mm)</label>
					<select
						id="prop-fontsize"
						onchange={handleFontSizeChange}
						class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
					>
						{#each fontSizes as size}
							<option value={size}>{size} mm</option>
						{/each}
					</select>
				</div>

				<!-- Delete button -->
				<div class="pt-2 border-t border-gray-100">
					<button
						class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
						onclick={onDelete}
					>
						Delete Activity
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
