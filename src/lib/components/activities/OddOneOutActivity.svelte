<script lang="ts">
	import type { OddOneOutData } from '$lib/types/activity';
	import { assetLibrary } from '$lib/assets/library';

	interface Props {
		data: OddOneOutData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const groups = $derived(data.groups ?? []);
	const groupCount = $derived(groups.length || 1);
	const rowHeight = $derived(Math.min((zone.height - 16) / groupCount, 30));

	function getAssetUrl(assetId: string): string | null {
		const entry = assetLibrary.resolve(assetId);
		if (entry) return `/assets/svg/${entry.path}`;
		return null;
	}

	function getLabel(assetId: string): string {
		const entry = assetLibrary.resolve(assetId);
		if (entry) return entry.name;
		return assetId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 8);
	}

	function getFallbackColor(assetId: string): string {
		const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
		const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
		return colors[hash % colors.length];
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
	>{data.instructions || 'Circle the odd one out in each row.'}</text>

	<!-- Groups -->
	{#each groups as group, gi}
		{@const gy = 16 + gi * rowHeight}
		{@const itemCount = group.items.length || 1}
		{@const cellWidth = Math.min((zone.width - 12) / itemCount, 25)}
		{@const startX = (zone.width - cellWidth * itemCount) / 2}

		<!-- Group label -->
		<text
			x="4"
			y={gy + 2}
			font-family="Comic Neue, sans-serif"
			font-size="2.2"
			fill="#9ca3af"
		>{gi + 1}.</text>

		{#each group.items as item, ii}
			{@const assetUrl = getAssetUrl(item)}
			{@const label = getLabel(item)}
			{@const cx = startX + ii * cellWidth + cellWidth / 2}
			{@const cy = gy + rowHeight * 0.45}
			{@const size = Math.min(cellWidth * 0.3, rowHeight * 0.25, 5)}

			<g>
				<!-- Item image or fallback -->
				{#if assetUrl}
					<image
						href={assetUrl}
						x={cx - size}
						y={cy - size}
						width={size * 2}
						height={size * 2}
					/>
				{:else}
					<circle cx={cx} cy={cy} r={size} fill={getFallbackColor(item)} opacity="0.85" />
				{/if}

				<!-- Label below -->
				<text
					x={cx}
					y={cy + size + 3}
					text-anchor="middle"
					font-family="Comic Neue, sans-serif"
					font-size="2"
					fill="#6b7280"
				>{label}</text>
			</g>
		{/each}

		<!-- Separator line between groups -->
		{#if gi < groupCount - 1}
			<line
				x1="6"
				y1={gy + rowHeight - 1}
				x2={zone.width - 6}
				y2={gy + rowHeight - 1}
				stroke="#f3f4f6"
				stroke-width="0.2"
			/>
		{/if}
	{/each}
</g>
