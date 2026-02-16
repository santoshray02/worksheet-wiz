<script lang="ts">
	import type { CutAndPasteData } from '$lib/types/activity';
	import { assetLibrary } from '$lib/assets/library';

	interface Props {
		data: CutAndPasteData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const items = $derived(data.items ?? []);
	const targetSlots = $derived(data.targetSlots ?? []);
	const slotCount = $derived(targetSlots.length || 1);
	const itemCount = $derived(items.length || 1);

	// Layout: top section (60%) for target slots, bottom section (40%) for cut-out items
	const titleSpace = 14;
	const cutLineY = $derived(titleSpace + (zone.height - titleSpace) * 0.55);
	const topHeight = $derived(cutLineY - titleSpace - 4);
	const bottomHeight = $derived(zone.height - cutLineY - 6);

	// Target slot dimensions
	const slotCellWidth = $derived(Math.min((zone.width - 8) / slotCount, 35));
	const slotTotalWidth = $derived(slotCellWidth * slotCount);
	const slotStartX = $derived((zone.width - slotTotalWidth) / 2);
	const slotHeight = $derived(Math.min(topHeight - 4, 25));

	// Cut item dimensions
	const itemCellWidth = $derived(Math.min((zone.width - 8) / itemCount, 30));
	const itemTotalWidth = $derived(itemCellWidth * itemCount);
	const itemStartX = $derived((zone.width - itemTotalWidth) / 2);
	const itemHeight = $derived(Math.min(bottomHeight - 4, 20));

	function getAssetUrl(assetId: string): string | null {
		const entry = assetLibrary.resolve(assetId);
		if (entry) return `/assets/svg/${entry.path}`;
		return null;
	}

	function assetDisplay(assetId: string): { label: string; color: string } {
		const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3', '#ede9fe', '#ffedd5'];
		const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
		const entry = assetLibrary.resolve(assetId);
		return {
			label: entry ? entry.name : assetId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 10),
			color: colors[hash % colors.length]
		};
	}

	function assetBorder(assetId: string): string {
		const borderColors = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];
		const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
		return borderColors[hash % borderColors.length];
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
	>{data.instructions || 'Cut out the items and paste them in the correct spots.'}</text>

	<!-- Target area label -->
	<text
		x="4"
		y={titleSpace + 2}
		font-family="Comic Neue, sans-serif"
		font-size="2"
		fill="#9ca3af"
		font-weight="600"
	>Paste here:</text>

	<!-- Target slots -->
	{#each targetSlots as slot, si}
		{@const sx = slotStartX + si * slotCellWidth + slotCellWidth / 2}
		{@const sy = titleSpace + 6 + (topHeight - slotHeight) / 2}

		<g>
			<!-- Dashed outline slot -->
			<rect
				x={sx - slotCellWidth * 0.4}
				y={sy}
				width={slotCellWidth * 0.8}
				height={slotHeight}
				fill="none"
				stroke="#9ca3af"
				stroke-width="0.3"
				stroke-dasharray="2,1.5"
				rx="1.5"
			/>

			<!-- Slot label -->
			<text
				x={sx}
				y={sy + slotHeight + 3}
				text-anchor="middle"
				font-family="Comic Neue, sans-serif"
				font-size="2.2"
				fill="#6b7280"
			>{slot.label}</text>

			<!-- Center placeholder text -->
			<text
				x={sx}
				y={sy + slotHeight / 2}
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Comic Neue, sans-serif"
				font-size="2"
				fill="#e5e7eb"
			>Paste</text>
		</g>
	{/each}

	<!-- Scissors cut line -->
	<line
		x1="4"
		y1={cutLineY}
		x2={zone.width - 4}
		y2={cutLineY}
		stroke="#6b7280"
		stroke-width="0.3"
		stroke-dasharray="3,2,1,2"
	/>

	<!-- Scissors icon (left side of cut line) -->
	<g transform="translate(6, {cutLineY})">
		<!-- Scissors blades -->
		<ellipse cx="-0.5" cy="-1.8" rx="1.2" ry="1.8" fill="none" stroke="#6b7280" stroke-width="0.3" transform="rotate(-15, -0.5, -1.8)" />
		<ellipse cx="-0.5" cy="1.8" rx="1.2" ry="1.8" fill="none" stroke="#6b7280" stroke-width="0.3" transform="rotate(15, -0.5, 1.8)" />
		<!-- Handle dots -->
		<circle cx="-0.5" cy="-1.8" r="0.4" fill="#6b7280" />
		<circle cx="-0.5" cy="1.8" r="0.4" fill="#6b7280" />
		<!-- Center pivot -->
		<circle cx="0.8" cy="0" r="0.3" fill="#6b7280" />
	</g>

	<!-- "Cut along the line" text -->
	<text
		x={zone.width / 2}
		y={cutLineY - 1.5}
		text-anchor="middle"
		font-family="Comic Neue, sans-serif"
		font-size="1.8"
		fill="#9ca3af"
	>Cut along the line</text>

	<!-- Cut-out items -->
	{#each items as item, ii}
		{@const ix = itemStartX + ii * itemCellWidth + itemCellWidth / 2}
		{@const iy = cutLineY + 6}
		{@const display = assetDisplay(item.assetId)}
		{@const border = assetBorder(item.assetId)}
		{@const assetUrl = getAssetUrl(item.assetId)}

		<g>
			<!-- Item card with dashed cut border -->
			<rect
				x={ix - itemCellWidth * 0.4}
				y={iy}
				width={itemCellWidth * 0.8}
				height={itemHeight}
				fill={display.color}
				stroke={border}
				stroke-width="0.3"
				stroke-dasharray="1.5,1"
				rx="1.5"
			/>

			<!-- Item image or placeholder -->
			{#if assetUrl}
				<image
					href={assetUrl}
					x={ix - itemCellWidth * 0.25}
					y={iy + 2}
					width={itemCellWidth * 0.5}
					height={itemHeight - 7}
				/>
			{:else}
				<rect
					x={ix - itemCellWidth * 0.3}
					y={iy + 2}
					width={itemCellWidth * 0.6}
					height={itemHeight - 7}
					fill="white"
					opacity="0.5"
					rx="1"
				/>
			{/if}

			<!-- Item label -->
			<text
				x={ix}
				y={iy + itemHeight - 2}
				text-anchor="middle"
				font-family="Comic Neue, sans-serif"
				font-size="2"
				font-weight="600"
				fill="#374151"
			>{item.label || display.label}</text>
		</g>
	{/each}
</g>
