<script lang="ts">
	import type { CrosswordData } from '$lib/types/activity';

	interface Props {
		data: CrosswordData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const grid = $derived(data.grid ?? []);
	const clues = $derived(data.clues ?? { across: [], down: [] });
	const gridRows = $derived(grid.length || 5);
	const gridCols = $derived(grid[0]?.length || 5);

	// Layout: grid at top, clues below
	const titleSpace = 14;
	const clueSpace = $derived(Math.max(zone.height * 0.35, 30));
	const gridAreaHeight = $derived(zone.height - titleSpace - clueSpace - 4);
	const gridAreaWidth = $derived(zone.width - 4);

	const cellSize = $derived(Math.min(gridAreaWidth / gridCols, gridAreaHeight / gridRows, 8));
	const totalGridW = $derived(cellSize * gridCols);
	const totalGridH = $derived(cellSize * gridRows);
	const gridOffsetX = $derived((zone.width - totalGridW) / 2);
	const gridOffsetY = $derived(titleSpace);

	const clueY = $derived(gridOffsetY + totalGridH + 4);
	const downX = $derived(zone.width / 2 - 2);
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
	>{data.instructions || 'Fill in the crossword puzzle.'}</text>

	<!-- Crossword grid -->
	<g transform="translate({gridOffsetX}, {gridOffsetY})">
		<!-- Grid border -->
		<rect
			x="0"
			y="0"
			width={totalGridW}
			height={totalGridH}
			fill="none"
			stroke="#374151"
			stroke-width="0.4"
		/>

		{#each grid as row, ri}
			{#each row as cell, ci}
				{@const x = ci * cellSize}
				{@const y = ri * cellSize}

				{#if cell.isBlack}
					<!-- Black cell -->
					<rect
						{x}
						{y}
						width={cellSize}
						height={cellSize}
						fill="#1f2937"
					/>
				{:else}
					<!-- White cell -->
					<rect
						{x}
						{y}
						width={cellSize}
						height={cellSize}
						fill="white"
						stroke="#9ca3af"
						stroke-width="0.2"
					/>

					<!-- Clue number -->
					{#if cell.clueNumber}
						<text
							x={x + 0.5}
							y={y + cellSize * 0.28}
							font-family="Comic Neue, sans-serif"
							font-size={cellSize * 0.25}
							fill="#6b7280"
						>{cell.clueNumber}</text>
					{/if}
				{/if}
			{/each}
		{/each}
	</g>

	<!-- Clues -->
	<g transform="translate(4, {clueY})">
		<!-- Across clues -->
		<text
			x="0"
			y="0"
			font-family="Comic Neue, sans-serif"
			font-size="2.8"
			font-weight="700"
			fill="#4b5563"
		>Across</text>

		{#each clues.across as clue, ai}
			<text
				x="2"
				y={4 + ai * 3.5}
				font-family="Comic Neue, sans-serif"
				font-size="2.2"
				fill="#374151"
			>{clue.number}. {clue.text}</text>
		{/each}

		<!-- Down clues -->
		<text
			x={downX}
			y="0"
			font-family="Comic Neue, sans-serif"
			font-size="2.8"
			font-weight="700"
			fill="#4b5563"
		>Down</text>

		{#each clues.down as clue, di}
			<text
				x={downX + 2}
				y={4 + di * 3.5}
				font-family="Comic Neue, sans-serif"
				font-size="2.2"
				fill="#374151"
			>{clue.number}. {clue.text}</text>
		{/each}
	</g>
</g>
