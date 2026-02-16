<script lang="ts">
	import type { TracingData } from '$lib/types/activity';

	interface Props {
		data: TracingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const items = $derived(data.items ?? []);
	const itemCount = $derived(items.length || 1);
	const cellWidth = $derived((zone.width - 4) / Math.min(itemCount, 6));
	const contentHeight = $derived(zone.height - 12);

	/** Get stroke-dasharray based on tracing style */
	function getDashArray(style: string): string {
		switch (style) {
			case 'dotted':
				return '0.8,1.2';
			case 'dashed':
				return '2,1.5';
			case 'light':
				return 'none';
			default:
				return '0.8,1.2';
		}
	}

	/** Get stroke opacity based on tracing style */
	function getOpacity(style: string): number {
		switch (style) {
			case 'light':
				return 0.15;
			case 'dotted':
			case 'dashed':
				return 0.5;
			default:
				return 0.5;
		}
	}
</script>

<g transform="translate({zone.x}, {zone.y})">
	<!-- Title -->
	<text
		x={zone.width / 2}
		y="5"
		text-anchor="middle"
		font-family="Comic Neue, sans-serif"
		font-size="3.5"
		font-weight="700"
		fill="#374151"
	>{data.title}</text>

	<!-- Instructions -->
	<text
		x={zone.width / 2}
		y="10"
		text-anchor="middle"
		font-family="Comic Neue, sans-serif"
		font-size="2.5"
		fill="#6b7280"
	>{data.instructions}</text>

	<!-- Tracing items -->
	{#each items as item, i}
		{@const cx = 2 + i * cellWidth + cellWidth / 2}
		{@const cy = 12 + contentHeight / 2}
		{@const fontSize = Math.min(cellWidth * 0.7, contentHeight * 0.65)}

		<g>
			<!-- Light gray guide letter/number (background) -->
			<text
				x={cx}
				y={cy}
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Comic Neue, sans-serif"
				font-size={fontSize}
				font-weight="700"
				fill="#e5e7eb"
			>{item}</text>

			<!-- Dotted/dashed trace overlay -->
			<text
				x={cx}
				y={cy}
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Comic Neue, sans-serif"
				font-size={fontSize}
				font-weight="700"
				fill="none"
				stroke="#6366f1"
				stroke-width="0.4"
				stroke-dasharray={getDashArray(data.tracingStyle)}
				opacity={getOpacity(data.tracingStyle)}
			>{item}</text>

			<!-- Starting dot (numbered) -->
			{#if data.showArrows}
				<!-- Starting dot at the top-left of each character -->
				<circle
					cx={cx - fontSize * 0.25}
					cy={cy - fontSize * 0.35}
					r="1"
					fill="#ef4444"
				/>
				<text
					x={cx - fontSize * 0.25}
					y={cy - fontSize * 0.35}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size="1.5"
					font-weight="700"
					fill="white"
				>{i + 1}</text>

				<!-- Directional arrow -->
				<path
					d="M {cx - fontSize * 0.25} {cy - fontSize * 0.35 + 1.3} l 0 2 l -0.8 -0.8 m 0.8 0.8 l 0.8 -0.8"
					fill="none"
					stroke="#ef4444"
					stroke-width="0.3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/if}

			<!-- Baseline guide -->
			<line
				x1={cx - cellWidth * 0.35}
				y1={cy + fontSize * 0.35}
				x2={cx + cellWidth * 0.35}
				y2={cy + fontSize * 0.35}
				stroke="#d1d5db"
				stroke-width="0.2"
			/>
		</g>
	{/each}

	<!-- Practice guide lines at the bottom -->
	{#if contentHeight > 30}
		{@const lineY = 12 + contentHeight * 0.8}
		<line
			x1="4"
			y1={lineY}
			x2={zone.width - 4}
			y2={lineY}
			stroke="#e5e7eb"
			stroke-width="0.2"
		/>
		<line
			x1="4"
			y1={lineY + 6}
			x2={zone.width - 4}
			y2={lineY + 6}
			stroke="#e5e7eb"
			stroke-width="0.2"
		/>
	{/if}
</g>
