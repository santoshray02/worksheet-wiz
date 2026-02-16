<script lang="ts">
	import type { StorySequencingData } from '$lib/types/activity';

	interface Props {
		data: StorySequencingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const panels = $derived(data.panels ?? []);
	const panelCount = $derived(panels.length || 1);
	const cellWidth = $derived(Math.min((zone.width - 8) / panelCount, 45));
	const totalWidth = $derived(cellWidth * panelCount);
	const startX = $derived((zone.width - totalWidth) / 2);

	const titleSpace = 14;
	const captionSpace = 12;
	const numberSpace = 8;
	const panelHeight = $derived(zone.height - titleSpace - captionSpace - numberSpace - 4);

	// Pre-compute layout values
	const innerPad = 2;
	const imgWidth = $derived(cellWidth - innerPad * 2);
	const imgHeight = $derived(panelHeight - 2);
	const icx = $derived(cellWidth / 2);
	const icy = $derived(imgHeight / 2 - 2);
	const boxY = $derived(imgHeight + captionSpace - 2);
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
	>{data.instructions || 'Put the pictures in the correct order.'}</text>

	<!-- Panels -->
	{#each panels as panel, pi}
		{@const px = startX + pi * cellWidth}

		<g transform="translate({px}, {titleSpace})">
			<!-- Panel frame -->
			<rect
				x={innerPad}
				y="0"
				width={imgWidth}
				height={imgHeight}
				fill="#f9fafb"
				stroke="#d1d5db"
				stroke-width="0.3"
				rx="1.5"
			/>

			<!-- Placeholder illustration area -->
			<rect
				x={innerPad + 2}
				y="2"
				width={imgWidth - 4}
				height={imgHeight - 4}
				fill="#f3f4f6"
				rx="1"
			/>

			<!-- Image placeholder icon (mountains/sun) -->
			<path
				d="M {icx - 5} {icy + 4} L {icx - 2} {icy - 1} L {icx + 1} {icy + 2} L {icx + 3} {icy} L {icx + 5} {icy + 4} Z"
				fill="#d1d5db"
				opacity="0.6"
			/>
			<circle cx={icx + 3} cy={icy - 3} r="1.5" fill="#fbbf24" opacity="0.5" />

			<!-- Image description text (small) -->
			<text
				x={cellWidth / 2}
				y={imgHeight - 3}
				text-anchor="middle"
				font-family="Comic Neue, sans-serif"
				font-size="1.8"
				fill="#9ca3af"
			>{panel.imageDescription.slice(0, 25)}{panel.imageDescription.length > 25 ? '...' : ''}</text>

			<!-- Caption below panel -->
			{#if panel.caption}
				<text
					x={cellWidth / 2}
					y={imgHeight + 4}
					text-anchor="middle"
					font-family="Comic Neue, sans-serif"
					font-size="2.2"
					fill="#4b5563"
				>{panel.caption.slice(0, 30)}{(panel.caption?.length ?? 0) > 30 ? '...' : ''}</text>
			{/if}

			<!-- Order number box (empty for student to fill) -->
			<rect
				x={cellWidth / 2 - 4}
				y={boxY}
				width="8"
				height="6"
				fill="none"
				stroke="#6366f1"
				stroke-width="0.3"
				stroke-dasharray="1.2,0.8"
				rx="1"
			/>
			<text
				x={cellWidth / 2}
				y={boxY + 3.5}
				text-anchor="middle"
				dominant-baseline="middle"
				font-family="Comic Neue, sans-serif"
				font-size="1.8"
				fill="#c7d2fe"
			>Order</text>

			<!-- Arrow between panels -->
			{#if pi < panelCount - 1}
				<line
					x1={cellWidth - 1}
					y1={imgHeight / 2}
					x2={cellWidth + 1}
					y2={imgHeight / 2}
					stroke="#d1d5db"
					stroke-width="0.2"
				/>
			{/if}
		</g>
	{/each}
</g>
