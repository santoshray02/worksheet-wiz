<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';

	let search = $state('');
	let activeCategory = $state('All');

	const categories = ['All', 'Animals', 'Numbers', 'Letters', 'Shapes', 'Objects', 'Borders', 'Icons'];

	const assets = [
		{
			id: 'cat',
			name: 'Cat',
			category: 'Animals',
			tags: ['pet', 'animal', 'cute'],
			color: 'bg-amber-100'
		},
		{
			id: 'dog',
			name: 'Dog',
			category: 'Animals',
			tags: ['pet', 'animal', 'puppy'],
			color: 'bg-orange-100'
		},
		{
			id: 'elephant',
			name: 'Elephant',
			category: 'Animals',
			tags: ['wild', 'animal', 'big'],
			color: 'bg-gray-100'
		},
		{
			id: 'butterfly',
			name: 'Butterfly',
			category: 'Animals',
			tags: ['insect', 'garden', 'colorful'],
			color: 'bg-pink-100'
		},
		{
			id: 'number-1',
			name: 'Number 1',
			category: 'Numbers',
			tags: ['digit', 'counting', 'math'],
			color: 'bg-indigo-100'
		},
		{
			id: 'number-2',
			name: 'Number 2',
			category: 'Numbers',
			tags: ['digit', 'counting', 'math'],
			color: 'bg-indigo-100'
		},
		{
			id: 'number-3',
			name: 'Number 3',
			category: 'Numbers',
			tags: ['digit', 'counting', 'math'],
			color: 'bg-indigo-100'
		},
		{
			id: 'letter-a',
			name: 'Letter A',
			category: 'Letters',
			tags: ['alphabet', 'uppercase', 'english'],
			color: 'bg-emerald-100'
		},
		{
			id: 'letter-b',
			name: 'Letter B',
			category: 'Letters',
			tags: ['alphabet', 'uppercase', 'english'],
			color: 'bg-emerald-100'
		},
		{
			id: 'letter-c',
			name: 'Letter C',
			category: 'Letters',
			tags: ['alphabet', 'uppercase', 'english'],
			color: 'bg-emerald-100'
		},
		{
			id: 'circle',
			name: 'Circle',
			category: 'Shapes',
			tags: ['geometry', 'basic', 'round'],
			color: 'bg-sky-100'
		},
		{
			id: 'triangle',
			name: 'Triangle',
			category: 'Shapes',
			tags: ['geometry', 'basic', 'polygon'],
			color: 'bg-sky-100'
		},
		{
			id: 'square',
			name: 'Square',
			category: 'Shapes',
			tags: ['geometry', 'basic', 'polygon'],
			color: 'bg-sky-100'
		},
		{
			id: 'star',
			name: 'Star',
			category: 'Shapes',
			tags: ['geometry', 'decoration', 'pointed'],
			color: 'bg-yellow-100'
		},
		{
			id: 'pencil',
			name: 'Pencil',
			category: 'Objects',
			tags: ['school', 'writing', 'stationery'],
			color: 'bg-rose-100'
		},
		{
			id: 'apple',
			name: 'Apple',
			category: 'Objects',
			tags: ['fruit', 'food', 'healthy'],
			color: 'bg-red-100'
		},
		{
			id: 'book',
			name: 'Book',
			category: 'Objects',
			tags: ['school', 'reading', 'education'],
			color: 'bg-violet-100'
		},
		{
			id: 'dotted-border',
			name: 'Dotted Border',
			category: 'Borders',
			tags: ['frame', 'decoration', 'dotted'],
			color: 'bg-gray-100'
		},
		{
			id: 'wavy-border',
			name: 'Wavy Border',
			category: 'Borders',
			tags: ['frame', 'decoration', 'wavy'],
			color: 'bg-gray-100'
		},
		{
			id: 'star-icon',
			name: 'Star Icon',
			category: 'Icons',
			tags: ['reward', 'rating', 'achievement'],
			color: 'bg-yellow-100'
		},
		{
			id: 'check-icon',
			name: 'Checkmark Icon',
			category: 'Icons',
			tags: ['correct', 'done', 'success'],
			color: 'bg-emerald-100'
		},
		{
			id: 'smile-icon',
			name: 'Smiley Face',
			category: 'Icons',
			tags: ['happy', 'emoji', 'reward'],
			color: 'bg-amber-100'
		}
	];

	const categoryVariant: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
		Animals: 'warning',
		Numbers: 'info',
		Letters: 'success',
		Shapes: 'info',
		Objects: 'default',
		Borders: 'default',
		Icons: 'success'
	};

	let filtered = $derived(
		assets.filter((asset) => {
			const matchesCategory = activeCategory === 'All' || asset.category === activeCategory;
			const matchesSearch =
				!search.trim() ||
				asset.name.toLowerCase().includes(search.toLowerCase()) ||
				asset.category.toLowerCase().includes(search.toLowerCase()) ||
				asset.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
			return matchesCategory && matchesSearch;
		})
	);
</script>

<svelte:head>
	<title>Assets - WorksheetWiz</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-10">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold font-display text-gray-800">Asset Browser</h1>
		<p class="text-gray-500 mt-1">
			Browse SVG illustrations, icons, and decorations for your worksheets.
		</p>
	</div>

	<!-- Search + Filters -->
	<div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
		<SearchInput value={search} placeholder="Search assets..." onchange={(v) => (search = v)} />
	</div>

	<!-- Category tabs -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each categories as category}
			<button
				class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
					{activeCategory === category
					? 'bg-primary text-white shadow-sm'
					: 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'}"
				onclick={() => (activeCategory = category)}
			>
				{category}
			</button>
		{/each}
	</div>

	<!-- Results count -->
	<p class="text-sm text-gray-400 mb-4">
		{filtered.length}
		{filtered.length === 1 ? 'asset' : 'assets'} found
	</p>

	<!-- Asset Grid -->
	{#if filtered.length === 0}
		<div class="text-center py-20">
			<p class="text-gray-400 text-lg">No assets match your criteria.</p>
			<button
				class="text-primary hover:underline mt-2 text-sm font-medium"
				onclick={() => {
					search = '';
					activeCategory = 'All';
				}}
			>
				Clear filters
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
			{#each filtered as asset (asset.id)}
				<Card padding="none" hoverable>
					<!-- SVG preview placeholder -->
					<div
						class="{asset.color} h-28 rounded-t-xl flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-gray-400/60"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>

					<!-- Info -->
					<div class="p-3">
						<h4 class="text-sm font-semibold text-gray-700 truncate">{asset.name}</h4>
						<div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
							<Badge variant={categoryVariant[asset.category] ?? 'default'}>
								{asset.category}
							</Badge>
						</div>
						<div class="mt-2 flex flex-wrap gap-1">
							{#each asset.tags as tag}
								<span class="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
									{tag}
								</span>
							{/each}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
