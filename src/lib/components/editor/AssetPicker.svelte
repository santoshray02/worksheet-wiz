<script lang="ts">
	import SearchInput from '$lib/components/ui/SearchInput.svelte';
	import { assetsState } from '$lib/state/assets.svelte';
	import { ASSET_CATEGORIES, type AssetCategory } from '$lib/types/asset';
	import { onMount } from 'svelte';

	interface Props {
		onSelect: (assetId: string) => void;
	}

	let { onSelect }: Props = $props();

	onMount(() => {
		assetsState.loadManifest();
	});

	function handleSearch(value: string) {
		assetsState.search(value);
	}

	function handleCategoryChange(category: AssetCategory | 'all') {
		assetsState.setCategory(category);
	}

	const allCategories: (AssetCategory | 'all')[] = ['all', ...ASSET_CATEGORIES];

	function categoryLabel(cat: AssetCategory | 'all'): string {
		if (cat === 'all') return 'All';
		return cat.charAt(0).toUpperCase() + cat.slice(1);
	}
</script>

<div class="flex flex-col h-full bg-white border-l border-gray-200">
	<!-- Header -->
	<div class="px-3 py-2 border-b border-gray-100">
		<h3 class="text-sm font-semibold text-gray-700 mb-2">Assets</h3>
		<SearchInput
			value={assetsState.searchQuery}
			placeholder="Search assets..."
			onchange={handleSearch}
		/>
	</div>

	<!-- Category tabs -->
	<div class="flex gap-1 px-3 py-2 overflow-x-auto border-b border-gray-100">
		{#each allCategories as cat}
			<button
				class="px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors {assetsState.selectedCategory ===
				cat
					? 'bg-blue-100 text-blue-700 font-medium'
					: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}"
				onclick={() => handleCategoryChange(cat)}
			>
				{categoryLabel(cat)}
			</button>
		{/each}
	</div>

	<!-- Asset grid -->
	<div class="flex-1 overflow-y-auto p-3">
		{#if assetsState.isLoading}
			<div class="flex items-center justify-center py-8">
				<div class="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
			</div>
		{:else if assetsState.filteredAssets.length === 0}
			<p class="text-sm text-gray-400 text-center py-8">No assets found</p>
		{:else}
			<div class="grid grid-cols-4 gap-2">
				{#each assetsState.filteredAssets as asset}
					<button
						class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
						onclick={() => onSelect(asset.id)}
						title={asset.name}
					>
						<div class="w-10 h-10 flex items-center justify-center">
							<img
								src="/assets/svg/{asset.path}"
								alt={asset.name}
								class="max-w-full max-h-full object-contain"
							/>
						</div>
						<span
							class="text-[10px] text-gray-500 group-hover:text-blue-600 truncate w-full text-center"
						>
							{asset.name}
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
