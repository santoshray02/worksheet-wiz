<script lang="ts">
	import type { ConnectDotsData } from '$lib/types/activity';

	interface Props {
		data: ConnectDotsData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const dots = $derived(data.dots ?? []);

	// Calculate bounds of all dots to scale them into the zone
	const bounds = $derived(() => {
		if (dots.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const dot of dots) {
			if (dot.point.x < minX) minX = dot.point.x;
			if (dot.point.y < minY) minY = dot.point.y;
			if (dot.point.x > maxX) maxX = dot.point.x;
			if (dot.point.y > maxY) maxY = dot.point.y;
		}
		// Add padding
		const padX = (maxX - minX) * 0.1 || 10;
		const padY = (maxY - minY) * 0.1 || 10;
		return { minX: minX - padX, minY: minY - padY, maxX: maxX + padX, maxY: maxY + padY };
	});

	const titleSpace = 14;
	const drawWidth = $derived(zone.width - 8);
	const drawHeight = $derived(zone.height - titleSpace - 4);

	/** Map a dot's coordinates into the drawing area */
	function mapX(x: number): number {
		const b = bounds();
		const range = b.maxX - b.minX || 1;
		return 4 + ((x - b.minX) / range) * drawWidth;
	}

	function mapY(y: number): number {
		const b = bounds();
		const range = b.maxY - b.minY || 1;
		return titleSpace + ((y - b.minY) / range) * drawHeight;
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
	>{data.instructions || 'Connect the dots in order.'}</text>

	<!-- Dots and labels -->
	{#each dots as dot, i}
		{@const dx = mapX(dot.point.x)}
		{@const dy = mapY(dot.point.y)}
		{@const isFirst = i === 0}
		{@const dotRadius = isFirst ? 1.5 : 1}

		<!-- Dot -->
		<circle
			cx={dx}
			cy={dy}
			r={dotRadius}
			fill={isFirst ? '#ef4444' : '#374151'}
			stroke={isFirst ? '#dc2626' : 'none'}
			stroke-width={isFirst ? 0.3 : 0}
		/>

		<!-- First dot highlight ring -->
		{#if isFirst}
			<circle
				cx={dx}
				cy={dy}
				r="2.5"
				fill="none"
				stroke="#ef4444"
				stroke-width="0.2"
				stroke-dasharray="0.8,0.5"
			/>
		{/if}

		<!-- Label (number or text) -->
		<text
			x={dx + 2}
			y={dy - 1.5}
			font-family="Comic Neue, sans-serif"
			font-size="2.5"
			font-weight={isFirst ? '700' : '600'}
			fill={isFirst ? '#ef4444' : '#6b7280'}
		>{dot.label}</text>

		<!-- Faint guide line to next dot (for sequential) -->
		{#if data.sequential && i < dots.length - 1}
			{@const nextDot = dots[i + 1]}
			{@const nx = mapX(nextDot.point.x)}
			{@const ny = mapY(nextDot.point.y)}
			<!-- Very faint dotted line as a hint -->
			<!-- Removed to keep it as a pure connect-the-dots activity -->
		{/if}
	{/each}

	<!-- "Start here" callout for the first dot -->
	{#if dots.length > 0}
		{@const firstX = mapX(dots[0].point.x)}
		{@const firstY = mapY(dots[0].point.y)}
		<text
			x={firstX}
			y={firstY + 5}
			text-anchor="middle"
			font-family="Comic Neue, sans-serif"
			font-size="1.8"
			fill="#ef4444"
			font-weight="600"
		>Start here!</text>
	{/if}
</g>
