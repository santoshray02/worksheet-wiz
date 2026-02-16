<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	const subjects = [
		{
			name: 'Math',
			icon: '🔢',
			color: 'bg-indigo-50 border-indigo-200',
			description: 'Addition, subtraction, counting, patterns',
			href: '/create?subject=math'
		},
		{
			name: 'English',
			icon: '📖',
			color: 'bg-emerald-50 border-emerald-200',
			description: 'Letters, words, reading, writing',
			href: '/create?subject=english'
		},
		{
			name: 'Art',
			icon: '🎨',
			color: 'bg-amber-50 border-amber-200',
			description: 'Coloring, drawing, creativity',
			href: '/create?subject=art'
		},
		{
			name: 'Logic',
			icon: '🧩',
			color: 'bg-rose-50 border-rose-200',
			description: 'Puzzles, mazes, problem solving',
			href: '/create?subject=logic'
		}
	];

	const activityTypes = [
		{ name: 'Tracing', ages: '3-5', variant: 'info' as const },
		{ name: 'Matching', ages: '3-6', variant: 'success' as const },
		{ name: 'Coloring', ages: '3-7', variant: 'warning' as const },
		{ name: 'Counting', ages: '4-6', variant: 'info' as const },
		{ name: 'Word Search', ages: '6-10', variant: 'success' as const },
		{ name: 'Mazes', ages: '4-8', variant: 'warning' as const },
		{ name: 'Fill in the Blank', ages: '5-8', variant: 'info' as const },
		{ name: 'Connect the Dots', ages: '3-6', variant: 'success' as const },
		{ name: 'Pattern Recognition', ages: '4-7', variant: 'warning' as const },
		{ name: 'Handwriting', ages: '4-7', variant: 'info' as const },
		{ name: 'Addition', ages: '5-8', variant: 'success' as const },
		{ name: 'Story Sequencing', ages: '5-9', variant: 'warning' as const }
	];
</script>

<svelte:head>
	<title>WorksheetWiz - Create Beautiful Worksheets in Seconds</title>
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50">
	<div class="absolute inset-0 opacity-30">
		<div
			class="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
		></div>
		<div
			class="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
		></div>
	</div>

	<div class="relative max-w-5xl mx-auto px-6 py-20 text-center">
		<h1 class="text-5xl md:text-6xl font-bold font-display text-gray-900 mb-6 leading-tight">
			Create Beautiful Worksheets
			<span class="text-primary block mt-1">in Seconds</span>
		</h1>
		<p class="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
			Design engaging, print-ready worksheets for kids aged 3-10. Choose from dozens of activity
			types, add beautiful illustrations, and generate professional PDFs with one click.
		</p>
		<div class="flex items-center justify-center gap-4">
			<a href="/create">
				<Button variant="primary" size="lg">Get Started</Button>
			</a>
			<a href="/templates">
				<Button variant="outline" size="lg">Browse Templates</Button>
			</a>
		</div>
	</div>
</section>

<!-- Quick-start Subject Cards -->
<section class="max-w-5xl mx-auto px-6 py-16">
	<h2 class="text-2xl font-bold font-display text-gray-800 mb-2">Quick Start</h2>
	<p class="text-gray-500 mb-8">Pick a subject to get started with a pre-configured worksheet.</p>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		{#each subjects as subject}
			<a href={subject.href} class="block group">
				<Card hoverable padding="md">
					<div class="flex flex-col items-center text-center gap-3">
						<div
							class="w-16 h-16 rounded-2xl border-2 {subject.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200"
						>
							{subject.icon}
						</div>
						<div>
							<h3 class="font-semibold text-gray-800 font-display">{subject.name}</h3>
							<p class="text-sm text-gray-500 mt-1">{subject.description}</p>
						</div>
					</div>
				</Card>
			</a>
		{/each}
	</div>
</section>

<!-- Activity Types -->
<section class="bg-white border-t border-gray-100">
	<div class="max-w-5xl mx-auto px-6 py-16">
		<h2 class="text-2xl font-bold font-display text-gray-800 mb-2">Activity Types</h2>
		<p class="text-gray-500 mb-8">
			Explore the variety of activities you can add to your worksheets.
		</p>

		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each activityTypes as activity}
				<div
					class="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all duration-200"
				>
					<div class="flex flex-col">
						<span class="text-sm font-semibold text-gray-700">{activity.name}</span>
						<span class="mt-0.5">
							<Badge variant={activity.variant}>Ages {activity.ages}</Badge>
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

