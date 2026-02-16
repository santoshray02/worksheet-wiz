<script lang="ts">
	interface Props {
		zoom: number;
		onZoomChange: (zoom: number) => void;
	}

	let { zoom, onZoomChange }: Props = $props();

	function zoomIn() {
		onZoomChange(Math.min(zoom + 10, 400));
	}

	function zoomOut() {
		onZoomChange(Math.max(zoom - 10, 25));
	}

	function fitToPage() {
		onZoomChange(100);
	}
</script>

<div
	class="fixed bottom-4 right-4 flex items-center gap-1 px-2 py-1.5 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
>
	<button
		class="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
		onclick={zoomOut}
		title="Zoom out"
		aria-label="Zoom out"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>

	<span class="text-xs font-medium text-gray-600 w-10 text-center tabular-nums">{zoom}%</span>

	<button
		class="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
		onclick={zoomIn}
		title="Zoom in"
		aria-label="Zoom in"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>

	<div class="w-px h-5 bg-gray-200 mx-0.5"></div>

	<button
		class="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
		onclick={fitToPage}
		title="Fit to page"
		aria-label="Fit to page"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M8 3H5a2 2 0 0 0-2 2v3" />
			<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
			<path d="M3 16v3a2 2 0 0 0 2 2h3" />
			<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
		</svg>
	</button>
</div>
