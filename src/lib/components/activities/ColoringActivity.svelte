<script lang="ts">
	import type { ColoringData } from '$lib/types/activity';

	interface Props {
		data: ColoringData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const regions = $derived(data.regions ?? []);
	const titleSpace = 14;

	// Center the coloring area
	const drawWidth = $derived(zone.width - 8);
	const drawHeight = $derived(zone.height - titleSpace - 4);
	const offsetX = 4;
	const offsetY = $derived(titleSpace);

	/** Fallback: generate placeholder regions if paths are empty */
	function hasValidPath(pathData: string): boolean {
		return pathData.length > 0 && pathData !== '';
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
	>{data.instructions || 'Color the picture.'}</text>

	<!-- Coloring regions -->
	<g transform="translate({offsetX}, {offsetY})">
		{#if regions.length === 0}
			<!-- Fallback: placeholder coloring shape -->
			<rect
				x={drawWidth * 0.1}
				y={drawHeight * 0.1}
				width={drawWidth * 0.8}
				height={drawHeight * 0.8}
				fill="none"
				stroke="#d1d5db"
				stroke-width="0.4"
				rx="3"
			/>
			<text
				x={drawWidth / 2}
				y={drawHeight / 2}
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Comic Neue, sans-serif"
				font-size="3"
				fill="#d1d5db"
			>Coloring area</text>
		{:else}
			<!-- Scale paths to fit the draw area -->
			{#each regions as region, ri}
				<g>
					{#if hasValidPath(region.pathData)}
						<path
							d={region.pathData}
							fill="none"
							stroke="#374151"
							stroke-width="0.4"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{:else}
						<!-- Placeholder region shape -->
						{@const cols = Math.min(regions.length, 4)}
						{@const row = Math.floor(ri / cols)}
						{@const col = ri % cols}
						{@const cellW = drawWidth / cols}
						{@const cellH = drawHeight / Math.ceil(regions.length / cols)}
						{@const cx = col * cellW + cellW / 2}
						{@const cy = row * cellH + cellH / 2}
						{@const r = Math.min(cellW, cellH) * 0.35}

						<circle
							cx={cx}
							cy={cy}
							{r}
							fill="none"
							stroke="#374151"
							stroke-width="0.4"
						/>
					{/if}

					<!-- Color label or number -->
					{#if region.colorLabel}
						{@const cols = Math.min(regions.length, 4)}
						{@const row = Math.floor(ri / cols)}
						{@const col = ri % cols}
						{@const cellW = drawWidth / cols}
						{@const cellH = drawHeight / Math.ceil(regions.length / cols)}
						{@const cx = col * cellW + cellW / 2}
						{@const cy = row * cellH + cellH / 2}

						<text
							x={cx}
							y={cy}
							text-anchor="middle"
							dominant-baseline="central"
							font-family="Comic Neue, sans-serif"
							font-size="2.5"
							fill="#6b7280"
						>{region.colorLabel}</text>
					{/if}

					{#if region.number !== undefined}
						{@const cols = Math.min(regions.length, 4)}
						{@const row = Math.floor(ri / cols)}
						{@const col = ri % cols}
						{@const cellW = drawWidth / cols}
						{@const cellH = drawHeight / Math.ceil(regions.length / cols)}
						{@const cx = col * cellW + cellW / 2}
						{@const cy = row * cellH + cellH / 2}

						<text
							x={cx}
							y={cy - 2}
							text-anchor="middle"
							dominant-baseline="central"
							font-family="Comic Neue, sans-serif"
							font-size="3"
							font-weight="700"
							fill="#9ca3af"
						>{region.number}</text>
					{/if}
				</g>
			{/each}
		{/if}

		<!-- Color key (if color-by-number) -->
		{#if regions.some((r) => r.number !== undefined)}
			{@const numberedRegions = regions.filter((r) => r.number !== undefined)}
			{@const keyY = drawHeight - 6}

			<line
				x1="0"
				y1={keyY - 2}
				x2={drawWidth}
				y2={keyY - 2}
				stroke="#e5e7eb"
				stroke-width="0.2"
			/>

			{#each numberedRegions as nr, ki}
				{@const kx = 4 + ki * 20}
				<text
					x={kx}
					y={keyY + 2}
					font-family="Comic Neue, sans-serif"
					font-size="2"
					fill="#6b7280"
				>{nr.number} = {nr.colorLabel ?? '?'}</text>
			{/each}
		{/if}
	</g>
</g>
