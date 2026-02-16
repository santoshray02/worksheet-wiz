<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';

	let search = $state('');

	const templates = [
		{
			id: 'abc-tracing',
			title: 'ABC Letter Tracing',
			subject: 'English',
			ageRange: '3-5',
			description: 'Uppercase and lowercase letter tracing with guided lines.',
			color: 'bg-emerald-100',
			subjectVariant: 'success' as const
		},
		{
			id: 'counting-1-20',
			title: 'Counting 1 to 20',
			subject: 'Math',
			ageRange: '4-6',
			description: 'Count objects, write numbers, and match quantities.',
			color: 'bg-indigo-100',
			subjectVariant: 'info' as const
		},
		{
			id: 'color-shapes',
			title: 'Color the Shapes',
			subject: 'Art',
			ageRange: '3-5',
			description: 'Identify and color basic geometric shapes.',
			color: 'bg-amber-100',
			subjectVariant: 'warning' as const
		},
		{
			id: 'sight-words',
			title: 'Sight Words Practice',
			subject: 'English',
			ageRange: '5-7',
			description: 'Read, trace, and write common sight words.',
			color: 'bg-emerald-100',
			subjectVariant: 'success' as const
		},
		{
			id: 'addition-basics',
			title: 'Addition Basics',
			subject: 'Math',
			ageRange: '5-7',
			description: 'Simple addition problems with visual aids and number lines.',
			color: 'bg-indigo-100',
			subjectVariant: 'info' as const
		},
		{
			id: 'maze-adventure',
			title: 'Maze Adventure',
			subject: 'Logic',
			ageRange: '4-8',
			description: 'Fun maze puzzles with increasing difficulty levels.',
			color: 'bg-rose-100',
			subjectVariant: 'default' as const
		},
		{
			id: 'animal-matching',
			title: 'Animal Matching',
			subject: 'Logic',
			ageRange: '3-5',
			description: 'Match animals to their homes, sounds, and silhouettes.',
			color: 'bg-rose-100',
			subjectVariant: 'default' as const
		},
		{
			id: 'pattern-fun',
			title: 'Pattern Fun',
			subject: 'Math',
			ageRange: '4-6',
			description: 'Identify and continue shape, color, and number patterns.',
			color: 'bg-indigo-100',
			subjectVariant: 'info' as const
		}
	];

	let filtered = $derived(
		search.trim()
			? templates.filter(
					(t) =>
						t.title.toLowerCase().includes(search.toLowerCase()) ||
						t.subject.toLowerCase().includes(search.toLowerCase()) ||
						t.description.toLowerCase().includes(search.toLowerCase())
				)
			: templates
	);
</script>

<svelte:head>
	<title>Templates - WorksheetWiz</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold font-display text-gray-800">Template Gallery</h1>
			<p class="text-gray-500 mt-1">
				Start from a pre-made template and customize it to your needs.
			</p>
		</div>
		<SearchInput value={search} placeholder="Search templates..." onchange={(v) => (search = v)} />
	</div>

	<!-- Template Grid -->
	{#if filtered.length === 0}
		<div class="text-center py-20">
			<p class="text-gray-400 text-lg">No templates match your search.</p>
			<button
				class="text-primary hover:underline mt-2 text-sm font-medium"
				onclick={() => (search = '')}
			>
				Clear search
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filtered as template (template.id)}
				<Card padding="none" hoverable>
					<!-- Thumbnail placeholder -->
					<div
						class="{template.color} h-40 rounded-t-xl flex items-center justify-center"
					>
						<div class="text-center px-4">
							<div class="w-12 h-12 bg-white/60 rounded-xl mx-auto mb-2 flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6 text-gray-500"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-gray-600">Preview</span>
						</div>
					</div>

					<!-- Card body -->
					<div class="p-5">
						<div class="flex items-start justify-between mb-2">
							<h3 class="font-semibold text-gray-800 font-display leading-tight">
								{template.title}
							</h3>
						</div>

						<div class="flex items-center gap-2 mb-3">
							<Badge variant={template.subjectVariant}>{template.subject}</Badge>
							<Badge variant="default">Ages {template.ageRange}</Badge>
						</div>

						<p class="text-sm text-gray-500 mb-4 leading-relaxed">{template.description}</p>

						<a href="/create?template={template.id}">
							<Button variant="outline" size="sm" class="w-full">Use Template</Button>
						</a>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
