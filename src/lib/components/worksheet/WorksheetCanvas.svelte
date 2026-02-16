<script lang="ts">
	import type { Worksheet } from '$lib/types/worksheet';
	import ActivityBlockRenderer from './ActivityBlockRenderer.svelte';
	import WorksheetHeader from './WorksheetHeader.svelte';

	interface Props {
		worksheet: Worksheet | null;
		pageIndex?: number;
		zoom?: number;
	}

	let { worksheet, pageIndex = 0, zoom = 1 }: Props = $props();

	const page = $derived(worksheet?.pages[pageIndex]);

	// Activity area runs from y=55 to y=277 (222mm total), x=10 to x=200 (190mm wide)
	const ACTIVITY_AREA_X = 10;
	const ACTIVITY_AREA_Y = 55;
	const ACTIVITY_AREA_WIDTH = 190;
	const ACTIVITY_AREA_HEIGHT = 222;
	const ACTIVITY_GAP = 3;

	/**
	 * Calculate zone positions by vertically stacking activities within
	 * the activity area (y=55 to y=277). Each activity gets an equal share
	 * of the available height minus gaps.
	 */
	function getZoneForActivity(
		index: number,
		total: number
	): { x: number; y: number; width: number; height: number } {
		if (total <= 0) {
			return { x: ACTIVITY_AREA_X, y: ACTIVITY_AREA_Y, width: ACTIVITY_AREA_WIDTH, height: ACTIVITY_AREA_HEIGHT };
		}

		const totalGap = ACTIVITY_GAP * (total - 1);
		const slotHeight = (ACTIVITY_AREA_HEIGHT - totalGap) / total;

		return {
			x: ACTIVITY_AREA_X,
			y: ACTIVITY_AREA_Y + index * (slotHeight + ACTIVITY_GAP),
			width: ACTIVITY_AREA_WIDTH,
			height: slotHeight
		};
	}
</script>

<div
	class="a4-page bg-white shadow-xl mx-auto"
	style="transform: scale({zoom}); transform-origin: top center;"
>
	<svg
		viewBox="0 0 210 297"
		width="210mm"
		height="297mm"
		xmlns="http://www.w3.org/2000/svg"
		class="block"
	>
		{#if worksheet}
			<!-- Page border -->
			{#if worksheet.settings.showBorder}
				<rect
					x="5"
					y="5"
					width="200"
					height="287"
					fill="none"
					stroke="#d1d5db"
					stroke-width="0.4"
					rx="2"
				/>
			{/if}

			<!-- Worksheet header -->
			{#if worksheet.settings.showHeader}
				<WorksheetHeader title={worksheet.meta.title} settings={worksheet.settings} />
			{/if}

			<!-- Activities -->
			{#each page?.activities ?? [] as activity, i}
				<ActivityBlockRenderer
					{activity}
					zone={getZoneForActivity(i, page?.activities.length ?? 0)}
				/>
			{/each}

			<!-- Footer with page number -->
			<text
				x="105"
				y="291"
				text-anchor="middle"
				font-family={worksheet.settings.fontFamily || 'Comic Neue, sans-serif'}
				font-size="3"
				fill="#9ca3af"
			>Page {pageIndex + 1} of {worksheet.pages.length}</text>
		{:else}
			<!-- Empty state -->
			<rect x="0" y="0" width="210" height="297" fill="#f9fafb" />
			<text
				x="105"
				y="148.5"
				text-anchor="middle"
				dominant-baseline="middle"
				font-family="Comic Neue, sans-serif"
				font-size="6"
				fill="#9ca3af"
			>No worksheet loaded</text>
		{/if}
	</svg>
</div>
