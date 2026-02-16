<script lang="ts">
	import type { WordSearchData } from '$lib/types/activity';

	interface Props {
		data: WordSearchData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const grid = $derived(data.grid ?? []);
	const words = $derived(data.words ?? []);
	const gridRows = $derived(data.size?.rows ?? grid.length ?? 8);
	const gridCols = $derived(data.size?.cols ?? (grid[0]?.length ?? 8));

	// Layout: grid on the left, word list on the right
	const titleSpace = 14;
	const wordListWidth = 40;
	const gridAreaWidth = $derived(zone.width - wordListWidth - 6);
	const gridAreaHeight = $derived(zone.height - titleSpace - 2);

	const cellSize = $derived(Math.min(gridAreaWidth / gridCols, gridAreaHeight / gridRows, 7));
	const totalGridW = $derived(cellSize * gridCols);
	const totalGridH = $derived(cellSize * gridRows);
	const gridOffsetX = $derived((gridAreaWidth - totalGridW) / 2 + 2);
	const gridOffsetY = $derived(titleSpace + (gridAreaHeight - totalGridH) / 2);

	const wordListX = $derived(gridOffsetX + totalGridW + 6);
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
	>{data.instructions || 'Find the hidden words!'}</text>

	<!-- Grid -->
	<g transform="translate({gridOffsetX}, {gridOffsetY})">
		<!-- Grid background -->
		<rect
			x="0"
			y="0"
			width={totalGridW}
			height={totalGridH}
			fill="#fafafa"
			stroke="#d1d5db"
			stroke-width="0.3"
		/>

		<!-- Grid lines: vertical -->
		{#each Array(gridCols - 1) as _, c}
			<line
				x1={(c + 1) * cellSize}
				y1="0"
				x2={(c + 1) * cellSize}
				y2={totalGridH}
				stroke="#e5e7eb"
				stroke-width="0.2"
			/>
		{/each}

		<!-- Grid lines: horizontal -->
		{#each Array(gridRows - 1) as _, r}
			<line
				x1="0"
				y1={(r + 1) * cellSize}
				x2={totalGridW}
				y2={(r + 1) * cellSize}
				stroke="#e5e7eb"
				stroke-width="0.2"
			/>
		{/each}

		<!-- Letters -->
		{#each grid as row, ri}
			{#each row as letter, ci}
				<text
					x={ci * cellSize + cellSize / 2}
					y={ri * cellSize + cellSize / 2}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={cellSize * 0.55}
					font-weight="600"
					fill="#374151"
				>{letter.toUpperCase()}</text>
			{/each}
		{/each}
	</g>

	<!-- Word list -->
	<g transform="translate({wordListX}, {gridOffsetY})">
		<text
			x="0"
			y="0"
			font-family="Comic Neue, sans-serif"
			font-size="2.8"
			font-weight="700"
			fill="#4b5563"
		>Words to find:</text>

		{#each words as word, wi}
			<g transform="translate(0, {4 + wi * 5})">
				<!-- Checkbox -->
				<rect
					x="0"
					y="-1.5"
					width="3"
					height="3"
					fill="none"
					stroke="#9ca3af"
					stroke-width="0.2"
					rx="0.4"
				/>
				<!-- Word text -->
				<text
					x="4.5"
					y="1"
					font-family="Comic Neue, sans-serif"
					font-size="2.8"
					fill="#374151"
				>{word.toUpperCase()}</text>
			</g>
		{/each}
	</g>
</g>
