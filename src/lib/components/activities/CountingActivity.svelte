<script lang="ts">
	import type { CountingData } from '$lib/types/activity';
	import { assetLibrary } from '$lib/assets/library';

	interface Props {
		data: CountingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const groups = $derived(data.groups ?? []);
	const groupCount = $derived(groups.length || 1);
	const cols = $derived(Math.min(groupCount, 4));
	const rows = $derived(Math.ceil(groupCount / cols));
	const cellWidth = $derived((zone.width - 6) / cols);
	const cellHeight = $derived((zone.height - 16) / rows);

	/** Resolve an assetId to a URL, falling back to null */
	function getAssetUrl(assetId: string): string | null {
		const entry = assetLibrary.resolve(assetId);
		if (entry) return `/assets/svg/${entry.path}`;
		return null;
	}

	/** Fallback color when no SVG is available */
	function getFallbackColor(assetId: string): string {
		const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];
		const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
		return colors[hash % colors.length];
	}

	/** Calculate grid positions for N items within a cell */
	function itemPositions(count: number, cw: number, ch: number): Array<{ x: number; y: number }> {
		const itemCols = Math.min(count, Math.ceil(Math.sqrt(count)));
		const itemRows = Math.ceil(count / itemCols);
		const spacing = Math.min(cw / (itemCols + 1), (ch - 12) / (itemRows + 1), 6);
		const positions: Array<{ x: number; y: number }> = [];

		for (let idx = 0; idx < count; idx++) {
			const row = Math.floor(idx / itemCols);
			const col = idx % itemCols;
			const startX = (cw - (itemCols - 1) * spacing) / 2;
			const startY = 8 + ((ch - 20) - (itemRows - 1) * spacing) / 2;
			positions.push({
				x: startX + col * spacing,
				y: startY + row * spacing
			});
		}
		return positions;
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

	<!-- Groups -->
	{#each groups as group, gi}
		{@const col = gi % cols}
		{@const row = Math.floor(gi / cols)}
		{@const gx = 3 + col * cellWidth}
		{@const gy = 14 + row * cellHeight}
		{@const assetUrl = getAssetUrl(group.assetId)}
		{@const positions = itemPositions(group.count, cellWidth, cellHeight)}
		{@const itemSize = 4}

		<g transform="translate({gx}, {gy})">
			<!-- "How many?" label -->
			<text
				x={cellWidth / 2}
				y="3"
				text-anchor="middle"
				font-family="Comic Neue, sans-serif"
				font-size="2.2"
				fill="#6b7280"
			>How many?</text>

			<!-- Items -->
			{#each positions as pos}
				{#if assetUrl}
					<image
						href={assetUrl}
						x={pos.x - itemSize / 2}
						y={pos.y - itemSize / 2}
						width={itemSize}
						height={itemSize}
					/>
				{:else}
					<circle cx={pos.x} cy={pos.y} r="2" fill={getFallbackColor(group.assetId)} opacity="0.85" />
				{/if}
			{/each}

			<!-- Answer box -->
			<rect
				x={cellWidth / 2 - 5}
				y={cellHeight - 9}
				width="10"
				height="6"
				fill="none"
				stroke="#9ca3af"
				stroke-width="0.3"
				stroke-dasharray="1.5,1"
				rx="1"
			/>
			<text
				x={cellWidth / 2}
				y={cellHeight - 4.5}
				text-anchor="middle"
				dominant-baseline="middle"
				font-family="Comic Neue, sans-serif"
				font-size="2"
				fill="#d1d5db"
			>?</text>
		</g>
	{/each}
</g>
