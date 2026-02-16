<script lang="ts">
	import type { Worksheet } from '$lib/types/worksheet';
	import WorksheetCanvas from './WorksheetCanvas.svelte';

	interface Props {
		open: boolean;
		worksheet: Worksheet | null;
		onclose: () => void;
	}

	let { open, worksheet, onclose }: Props = $props();

	let currentPage = $state(0);

	const totalPages = $derived(worksheet?.pages.length ?? 0);

	function handlePrint() {
		window.print();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		} else if (e.key === 'ArrowLeft' && currentPage > 0) {
			currentPage--;
		} else if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
			currentPage++;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center"
		onclick={handleBackdropClick}
	>
		<!-- Dark overlay -->
		<div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

		<!-- Controls bar -->
		<div class="relative z-10 flex items-center gap-4 mb-4">
			<!-- Page navigation -->
			{#if totalPages > 1}
				<button
					class="px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-30"
					disabled={currentPage === 0}
					onclick={() => currentPage--}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
				</button>
				<span class="text-white text-sm font-medium">
					Page {currentPage + 1} of {totalPages}
				</span>
				<button
					class="px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-30"
					disabled={currentPage >= totalPages - 1}
					onclick={() => currentPage++}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
					</svg>
				</button>
			{/if}

			<!-- Print button -->
			<button
				class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
				onclick={handlePrint}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
				</svg>
				Print
			</button>

			<!-- Close button -->
			<button
				class="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
				onclick={onclose}
				aria-label="Close preview"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>

		<!-- A4 page at actual size -->
		<div class="relative z-10 overflow-auto max-h-[85vh] print-area">
			<WorksheetCanvas {worksheet} pageIndex={currentPage} zoom={1} />
		</div>
	</div>
{/if}

<style>
	@media print {
		:global(body > *:not(.print-area)) {
			display: none !important;
		}
	}
</style>
