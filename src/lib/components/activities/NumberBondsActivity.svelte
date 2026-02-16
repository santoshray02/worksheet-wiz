<script lang="ts">
	import type { NumberBondsData } from '$lib/types/activity';

	interface Props {
		data: NumberBondsData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const bonds = $derived(data.bonds ?? []);
	const bondCount = $derived(bonds.length || 1);
	const cols = $derived(Math.min(bondCount, 4));
	const rows = $derived(Math.ceil(bondCount / cols));
	const cellWidth = $derived((zone.width - 8) / cols);
	const cellHeight = $derived((zone.height - 16) / rows);

	// Bond diagram dimensions relative to cell
	const circleRadius = $derived(Math.min(cellWidth * 0.12, cellHeight * 0.12, 5));
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
	>{data.instructions || 'Complete the number bonds.'}</text>

	<!-- Number bond diagrams -->
	{#each bonds as bond, bi}
		{@const col = bi % cols}
		{@const row = Math.floor(bi / cols)}
		{@const bx = 4 + col * cellWidth + cellWidth / 2}
		{@const by = 16 + row * cellHeight}

		{@const wholeY = by + circleRadius + 2}
		{@const partY = by + cellHeight - circleRadius - 4}
		{@const part1X = bx - cellWidth * 0.22}
		{@const part2X = bx + cellWidth * 0.22}

		<g>
			<!-- Connecting lines (whole to parts) -->
			<line
				x1={bx}
				y1={wholeY + circleRadius}
				x2={part1X}
				y2={partY - circleRadius}
				stroke="#9ca3af"
				stroke-width="0.4"
			/>
			<line
				x1={bx}
				y1={wholeY + circleRadius}
				x2={part2X}
				y2={partY - circleRadius}
				stroke="#9ca3af"
				stroke-width="0.4"
			/>

			<!-- Whole circle (top) -->
			<circle
				cx={bx}
				cy={wholeY}
				r={circleRadius}
				fill={bond.missingPart === 'whole' ? 'none' : '#eef2ff'}
				stroke={bond.missingPart === 'whole' ? '#6366f1' : '#6366f1'}
				stroke-width={bond.missingPart === 'whole' ? 0.4 : 0.3}
				stroke-dasharray={bond.missingPart === 'whole' ? '1.2,0.8' : 'none'}
			/>
			{#if bond.missingPart === 'whole'}
				<text
					x={bx}
					y={wholeY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.8}
					fill="#d1d5db"
				>?</text>
			{:else}
				<text
					x={bx}
					y={wholeY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.9}
					font-weight="700"
					fill="#4338ca"
				>{bond.whole}</text>
			{/if}

			<!-- Part 1 circle (bottom left) -->
			<circle
				cx={part1X}
				cy={partY}
				r={circleRadius}
				fill={bond.missingPart === 'part1' ? 'none' : '#fef3c7'}
				stroke={bond.missingPart === 'part1' ? '#f59e0b' : '#f59e0b'}
				stroke-width={bond.missingPart === 'part1' ? 0.4 : 0.3}
				stroke-dasharray={bond.missingPart === 'part1' ? '1.2,0.8' : 'none'}
			/>
			{#if bond.missingPart === 'part1'}
				<text
					x={part1X}
					y={partY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.8}
					fill="#d1d5db"
				>?</text>
			{:else}
				<text
					x={part1X}
					y={partY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.9}
					font-weight="700"
					fill="#b45309"
				>{bond.part1}</text>
			{/if}

			<!-- Part 2 circle (bottom right) -->
			<circle
				cx={part2X}
				cy={partY}
				r={circleRadius}
				fill={bond.missingPart === 'part2' ? 'none' : '#dcfce7'}
				stroke={bond.missingPart === 'part2' ? '#22c55e' : '#22c55e'}
				stroke-width={bond.missingPart === 'part2' ? 0.4 : 0.3}
				stroke-dasharray={bond.missingPart === 'part2' ? '1.2,0.8' : 'none'}
			/>
			{#if bond.missingPart === 'part2'}
				<text
					x={part2X}
					y={partY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.8}
					fill="#d1d5db"
				>?</text>
			{:else}
				<text
					x={part2X}
					y={partY}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={circleRadius * 0.9}
					font-weight="700"
					fill="#15803d"
				>{bond.part2}</text>
			{/if}

			<!-- "+" label between parts -->
			<text
				x={bx}
				y={partY}
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Comic Neue, sans-serif"
				font-size={circleRadius * 0.6}
				fill="#9ca3af"
			>+</text>

			<!-- "=" label between whole and parts -->
			<text
				x={bx + circleRadius + 1.5}
				y={wholeY}
				font-family="Comic Neue, sans-serif"
				font-size={circleRadius * 0.6}
				fill="#9ca3af"
				dominant-baseline="central"
			>=</text>
		</g>
	{/each}
</g>
