<script lang="ts">
	import { generationState } from '$lib/state/generation.svelte';
	import { getActivityMeta } from '$lib/activities/registry';

	type EditorTool = 'select' | 'move' | 'text' | 'asset';

	let activeTool = $state<EditorTool>('select');

	const tools: { id: EditorTool; label: string; icon: string }[] = [
		{
			id: 'select',
			label: 'Select',
			icon: 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59'
		},
		{
			id: 'move',
			label: 'Move',
			icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
		},
		{
			id: 'text',
			label: 'Text',
			icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z'
		},
		{
			id: 'asset',
			label: 'Asset',
			icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A2.25 2.25 0 0023.25 18V6a2.25 2.25 0 00-2.25-2.25H3A2.25 2.25 0 00.75 6v12A2.25 2.25 0 003 20.25z'
		}
	];
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 font-display">Edit Worksheet</h2>
		<p class="text-gray-500 mt-1">Fine-tune the layout and content of your worksheet</p>
	</div>

	<!-- Toolbar -->
	<div class="flex items-center gap-1 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
		{#each tools as tool}
			<button
				class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
					{activeTool === tool.id
					? 'bg-primary text-white shadow-sm'
					: 'text-gray-600 hover:bg-gray-100'}"
				onclick={() => (activeTool = tool.id)}
				aria-label={tool.label}
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d={tool.icon} />
				</svg>
				<span class="hidden sm:inline">{tool.label}</span>
			</button>
		{/each}

		<!-- Separator -->
		<div class="w-px h-6 bg-gray-200 mx-1"></div>

		<!-- Undo / Redo -->
		<button
			class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
			disabled
			aria-label="Undo"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
			</svg>
		</button>
		<button
			class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
			disabled
			aria-label="Redo"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
			</svg>
		</button>
	</div>

	<!-- 3-panel layout -->
	<div class="flex gap-4 min-h-[600px]">
		<!-- Left sidebar: Activity list / Asset picker -->
		<div class="w-56 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
			<div class="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</h3>
			</div>
			<div class="flex-1 overflow-y-auto p-2 space-y-1">
				{#each generationState.streamedActivities as activity, i}
					{@const meta = getActivityMeta(activity.type)}
					<button
						class="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
					>
						<div class="flex items-center gap-2">
							<span class="w-5 h-5 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
								{i + 1}
							</span>
							<div class="min-w-0 flex-1">
								<p class="text-xs font-medium text-gray-800 truncate">{activity.title}</p>
								<p class="text-[0.6rem] text-gray-400 truncate">{meta?.name ?? activity.type}</p>
							</div>
						</div>
					</button>
				{/each}

				{#if generationState.streamedActivities.length === 0}
					<div class="flex flex-col items-center justify-center py-8 text-gray-300">
						<p class="text-xs">No activities</p>
					</div>
				{/if}
			</div>

			<!-- Asset picker placeholder -->
			<div class="border-t border-gray-100">
				<div class="px-3 py-2.5 bg-gray-50">
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assets</h3>
				</div>
				<div class="p-3 text-center">
					<div class="w-10 h-10 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-2">
						<svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A2.25 2.25 0 0023.25 18V6a2.25 2.25 0 00-2.25-2.25H3A2.25 2.25 0 00.75 6v12A2.25 2.25 0 003 20.25z" />
						</svg>
					</div>
					<p class="text-[0.65rem] text-gray-400">Drag assets onto canvas</p>
				</div>
			</div>
		</div>

		<!-- Center: A4 canvas -->
		<div class="flex-1 bg-gray-100 rounded-xl overflow-auto flex justify-center p-6">
			<div class="a4-page rounded-sm shrink-0">
				<div class="p-8 h-full">
					<!-- Header area -->
					<div class="text-center border-b-2 border-gray-200 pb-4 mb-6">
						<h1 class="text-xl font-bold text-gray-800 font-display capitalize">
							{generationState.config.subject ?? 'Worksheet'}
						</h1>
						<p class="text-sm text-gray-500 mt-1">
							Age {generationState.config.age ?? ''} &middot; {generationState.streamedActivities.length} Activities
						</p>
						<div class="mt-3 flex items-center justify-between text-xs text-gray-400">
							<span>Name: _______________________</span>
							<span>Date: ____________</span>
						</div>
					</div>

					<!-- Editable activities -->
					{#each generationState.streamedActivities as activity, i}
						{@const meta = getActivityMeta(activity.type)}
						<div class="mb-5 group relative {i > 0 ? 'pt-4 border-t border-gray-100' : ''}">
							<!-- Hover outline for editing -->
							<div class="absolute -inset-2 rounded-lg border-2 border-transparent group-hover:border-primary/30 transition-colors pointer-events-none"></div>

							<div class="flex items-baseline gap-2 mb-1.5">
								<span class="text-sm font-bold text-gray-700">Q{i + 1}.</span>
								<span class="text-sm font-semibold text-gray-800">{activity.title}</span>
							</div>
							<p class="text-xs text-gray-600 ml-6">{activity.instructions}</p>
							<div class="mt-2 ml-6 h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
								<span class="text-xs text-gray-300 italic">Activity content area</span>
							</div>
						</div>
					{/each}

					{#if generationState.streamedActivities.length === 0}
						<div class="flex flex-col items-center justify-center h-80 text-gray-300">
							<svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
							</svg>
							<p class="text-xs">Empty canvas</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Right sidebar: Property panel -->
		<div class="w-56 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
			<div class="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Properties</h3>
			</div>
			<div class="flex-1 p-4 flex flex-col items-center justify-center text-gray-300">
				<svg class="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
				</svg>
				<p class="text-xs text-center">Select an element on the canvas to edit its properties</p>
			</div>
		</div>
	</div>
</div>
