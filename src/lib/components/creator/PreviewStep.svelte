<script lang="ts">
	import { generationState } from '$lib/state/generation.svelte';
	import ActivityBlockRenderer from '$lib/components/worksheet/ActivityBlockRenderer.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let zoom = $state(100);
	let svgElement = $state<SVGSVGElement | null>(null);

	const ZOOM_MIN = 50;
	const ZOOM_MAX = 150;
	const ZOOM_STEP = 10;

	/** A4 dimensions in mm */
	const A4_W = 210;
	const A4_H = 297;
	const MARGIN = 15;
	const HEADER_H = 25;
	const INSTR_GAP = 4;

	function zoomIn() {
		zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
	}

	function zoomOut() {
		zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
	}

	function zoomFit() {
		zoom = 100;
	}

	function goToEdit() {
		generationState.nextStep();
	}

	function goToDownload() {
		generationState.goToStep(7);
	}

	/**
	 * Calculate zone layout for each activity.
	 * Divides the available vertical space evenly.
	 */
	function activityZones() {
		const activities = generationState.streamedActivities;
		if (activities.length === 0) return [];

		const contentX = MARGIN;
		const contentW = A4_W - 2 * MARGIN;
		const contentTop = MARGIN + HEADER_H + INSTR_GAP;
		const contentBottom = A4_H - MARGIN;
		const totalH = contentBottom - contentTop;
		const gapBetween = 3;
		const perActivity = (totalH - gapBetween * (activities.length - 1)) / activities.length;

		return activities.map((_, i) => ({
			x: contentX,
			y: contentTop + i * (perActivity + gapBetween),
			width: contentW,
			height: Math.max(perActivity, 20)
		}));
	}

	const zones = $derived(activityZones());
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 font-display">Preview</h2>
			<p class="text-gray-500 mt-1">Review your worksheet before downloading</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={goToEdit}>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
				</svg>
				Edit
			</Button>
			<Button size="sm" onclick={goToDownload}>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
				</svg>
				Download
			</Button>
		</div>
	</div>

	<!-- Zoom controls -->
	<div class="flex items-center justify-center gap-2 py-2">
		<button
			class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			onclick={zoomOut}
			disabled={zoom <= ZOOM_MIN}
			aria-label="Zoom out"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
			</svg>
		</button>

		<span class="text-sm text-gray-500 font-medium tabular-nums w-12 text-center">{zoom}%</span>

		<button
			class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			onclick={zoomIn}
			disabled={zoom >= ZOOM_MAX}
			aria-label="Zoom in"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
		</button>

		<button
			class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
			onclick={zoomFit}
			aria-label="Fit to view"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
			</svg>
		</button>
	</div>

	<!-- A4 canvas area -->
	<div class="flex justify-center overflow-auto bg-gray-100 rounded-xl p-8 min-h-[600px]">
		<div
			class="bg-white shadow-lg transition-transform duration-200 origin-top"
			style="width: 210mm; height: 297mm; transform: scale({zoom / 100})"
		>
			<svg
				bind:this={svgElement}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 {A4_W} {A4_H}"
				width="210mm"
				height="297mm"
				style="font-family: 'Comic Neue', sans-serif"
			>
				<!-- White background -->
				<rect width={A4_W} height={A4_H} fill="white" />

				<!-- Decorative border -->
				<rect x="5" y="5" width={A4_W - 10} height={A4_H - 10} fill="none" stroke="#e5e7eb" stroke-width="0.3" rx="2" />

				<!-- Header area -->
				<g transform="translate({MARGIN}, {MARGIN})">
					<!-- Title -->
					<text
						x={(A4_W - 2 * MARGIN) / 2}
						y="8"
						text-anchor="middle"
						font-size="7"
						font-weight="700"
						fill="#1f2937"
						style="text-transform: capitalize"
					>{generationState.config.subject ?? 'Worksheet'}</text>

					<!-- Subtitle -->
					<text
						x={(A4_W - 2 * MARGIN) / 2}
						y="14"
						text-anchor="middle"
						font-size="3"
						fill="#9ca3af"
					>Age {generationState.config.age ?? ''} &middot; {generationState.streamedActivities.length} Activities</text>

					<!-- Name & date lines -->
					<text x="0" y="22" font-size="2.5" fill="#9ca3af">Name: ________________________</text>
					<text x={A4_W - 2 * MARGIN} y="22" text-anchor="end" font-size="2.5" fill="#9ca3af">Date: ____________</text>

					<!-- Header underline -->
					<line x1="0" y1={HEADER_H} x2={A4_W - 2 * MARGIN} y2={HEADER_H} stroke="#e5e7eb" stroke-width="0.3" />
				</g>

				<!-- Activities rendered with proper SVG components -->
				{#each generationState.streamedActivities as activity, i}
					{#if zones[i]}
						<ActivityBlockRenderer {activity} zone={zones[i]} />
					{/if}
				{/each}

				<!-- Empty state -->
				{#if generationState.streamedActivities.length === 0}
					<text
						x={A4_W / 2}
						y={A4_H / 2}
						text-anchor="middle"
						dominant-baseline="middle"
						font-size="5"
						fill="#d1d5db"
					>No activities generated yet</text>
				{/if}

				<!-- Footer -->
				<text
					x={A4_W / 2}
					y={A4_H - 8}
					text-anchor="middle"
					font-size="2"
					fill="#d1d5db"
				>Generated by WorksheetWiz</text>
			</svg>
		</div>
	</div>
</div>
