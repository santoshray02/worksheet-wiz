<script lang="ts">
	type Tool = 'select' | 'move' | 'text' | 'asset';

	interface Props {
		activeTool: Tool;
		zoom: number;
		canUndo: boolean;
		canRedo: boolean;
		onToolChange: (tool: Tool) => void;
		onUndo: () => void;
		onRedo: () => void;
		onZoomChange: (zoom: number) => void;
	}

	let { activeTool, zoom, canUndo, canRedo, onToolChange, onUndo, onRedo, onZoomChange }: Props =
		$props();

	const tools: { id: Tool; label: string }[] = [
		{ id: 'select', label: 'Select' },
		{ id: 'move', label: 'Move' },
		{ id: 'text', label: 'Text' },
		{ id: 'asset', label: 'Asset' }
	];

	function zoomIn() {
		onZoomChange(Math.min(zoom + 10, 400));
	}

	function zoomOut() {
		onZoomChange(Math.max(zoom - 10, 25));
	}
</script>

<div
	class="flex items-center gap-1 px-3 py-1.5 bg-white border-b border-gray-200 shadow-sm select-none"
>
	<!-- Tool buttons -->
	{#each tools as tool}
		<button
			class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors {activeTool ===
			tool.id
				? 'bg-blue-100 text-blue-700'
				: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}"
			onclick={() => onToolChange(tool.id)}
			title={tool.label}
			aria-label={tool.label}
		>
			{#if tool.id === 'select'}
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
					<path d="M13 13l6 6" />
				</svg>
			{:else if tool.id === 'move'}
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="5 9 2 12 5 15" />
					<polyline points="9 5 12 2 15 5" />
					<polyline points="15 19 12 22 9 19" />
					<polyline points="19 9 22 12 19 15" />
					<line x1="2" y1="12" x2="22" y2="12" />
					<line x1="12" y1="2" x2="12" y2="22" />
				</svg>
			{:else if tool.id === 'text'}
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="4 7 4 4 20 4 20 7" />
					<line x1="9" y1="20" x2="15" y2="20" />
					<line x1="12" y1="4" x2="12" y2="20" />
				</svg>
			{:else if tool.id === 'asset'}
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
			{/if}
		</button>
	{/each}

	<!-- Separator -->
	<div class="w-px h-6 bg-gray-200 mx-1"></div>

	<!-- Undo / Redo -->
	<button
		class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors {canUndo
			? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
			: 'text-gray-300 cursor-not-allowed'}"
		onclick={onUndo}
		disabled={!canUndo}
		title="Undo"
		aria-label="Undo"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="1 4 1 10 7 10" />
			<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
		</svg>
	</button>

	<button
		class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors {canRedo
			? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
			: 'text-gray-300 cursor-not-allowed'}"
		onclick={onRedo}
		disabled={!canRedo}
		title="Redo"
		aria-label="Redo"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="23 4 23 10 17 10" />
			<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
		</svg>
	</button>

	<!-- Separator -->
	<div class="w-px h-6 bg-gray-200 mx-1"></div>

	<!-- Zoom controls -->
	<button
		class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
		onclick={zoomOut}
		title="Zoom out"
		aria-label="Zoom out"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>

	<span class="text-xs font-medium text-gray-600 w-10 text-center tabular-nums">{zoom}%</span>

	<button
		class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
		onclick={zoomIn}
		title="Zoom in"
		aria-label="Zoom in"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>
</div>
