<script lang="ts">
	import type { HandwritingData } from '$lib/types/activity';

	interface Props {
		data: HandwritingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const lines = $derived(data.lines ?? []);
	const lineHeight = $derived(data.lineHeight || 10);
	const guideType = $derived(data.guideType || '4-line');

	// Scale line height to fit within zone
	const maxLines = $derived(Math.floor((zone.height - 14) / lineHeight));
	const visibleLines = $derived(lines.slice(0, maxLines));
	const paddingX = 4;
	const lineStartX = $derived(paddingX);
	const lineEndX = $derived(zone.width - paddingX);
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
	>{data.instructions || 'Practice your handwriting.'}</text>

	<!-- Handwriting lines -->
	{#each visibleLines as line, i}
		{@const baseY = 14 + i * lineHeight}

		<g>
			{#if guideType === '4-line'}
				<!-- Top line (ascender) -->
				<line
					x1={lineStartX}
					y1={baseY}
					x2={lineEndX}
					y2={baseY}
					stroke="#93c5fd"
					stroke-width="0.15"
				/>
				<!-- Dashed middle line (x-height) -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight * 0.33}
					x2={lineEndX}
					y2={baseY + lineHeight * 0.33}
					stroke="#93c5fd"
					stroke-width="0.15"
					stroke-dasharray="1,1"
				/>
				<!-- Baseline -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight * 0.66}
					x2={lineEndX}
					y2={baseY + lineHeight * 0.66}
					stroke="#3b82f6"
					stroke-width="0.25"
				/>
				<!-- Bottom line (descender) -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight}
					x2={lineEndX}
					y2={baseY + lineHeight}
					stroke="#93c5fd"
					stroke-width="0.15"
				/>
			{:else if guideType === '3-line'}
				<!-- Top line -->
				<line
					x1={lineStartX}
					y1={baseY}
					x2={lineEndX}
					y2={baseY}
					stroke="#93c5fd"
					stroke-width="0.15"
				/>
				<!-- Middle dashed line -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight * 0.5}
					x2={lineEndX}
					y2={baseY + lineHeight * 0.5}
					stroke="#93c5fd"
					stroke-width="0.15"
					stroke-dasharray="1,1"
				/>
				<!-- Baseline -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight}
					x2={lineEndX}
					y2={baseY + lineHeight}
					stroke="#3b82f6"
					stroke-width="0.25"
				/>
			{:else}
				<!-- Blank: just a baseline -->
				<line
					x1={lineStartX}
					y1={baseY + lineHeight}
					x2={lineEndX}
					y2={baseY + lineHeight}
					stroke="#d1d5db"
					stroke-width="0.2"
				/>
			{/if}

			<!-- Sample text (light gray guide) -->
			<text
				x={lineStartX + 2}
				y={baseY + lineHeight * 0.6}
				font-family={line.style === 'cursive' ? 'Dancing Script, cursive' : 'Comic Neue, sans-serif'}
				font-size={lineHeight * 0.5}
				fill="#d1d5db"
				font-weight="500"
			>{line.text}</text>

			<!-- Left margin line -->
			<line
				x1={lineStartX}
				y1={baseY}
				x2={lineStartX}
				y2={baseY + lineHeight}
				stroke="#fca5a5"
				stroke-width="0.2"
			/>
		</g>
	{/each}

	<!-- If there's extra space, add empty practice lines -->
	{#if visibleLines.length < maxLines}
		{#each Array(Math.min(maxLines - visibleLines.length, 3)) as _, ei}
			{@const baseY = 14 + (visibleLines.length + ei) * lineHeight}
			{#if guideType === '4-line'}
				<line x1={lineStartX} y1={baseY} x2={lineEndX} y2={baseY} stroke="#e5e7eb" stroke-width="0.15" />
				<line x1={lineStartX} y1={baseY + lineHeight * 0.33} x2={lineEndX} y2={baseY + lineHeight * 0.33} stroke="#e5e7eb" stroke-width="0.15" stroke-dasharray="1,1" />
				<line x1={lineStartX} y1={baseY + lineHeight * 0.66} x2={lineEndX} y2={baseY + lineHeight * 0.66} stroke="#d1d5db" stroke-width="0.2" />
				<line x1={lineStartX} y1={baseY + lineHeight} x2={lineEndX} y2={baseY + lineHeight} stroke="#e5e7eb" stroke-width="0.15" />
			{:else if guideType === '3-line'}
				<line x1={lineStartX} y1={baseY} x2={lineEndX} y2={baseY} stroke="#e5e7eb" stroke-width="0.15" />
				<line x1={lineStartX} y1={baseY + lineHeight * 0.5} x2={lineEndX} y2={baseY + lineHeight * 0.5} stroke="#e5e7eb" stroke-width="0.15" stroke-dasharray="1,1" />
				<line x1={lineStartX} y1={baseY + lineHeight} x2={lineEndX} y2={baseY + lineHeight} stroke="#d1d5db" stroke-width="0.2" />
			{:else}
				<line x1={lineStartX} y1={baseY + lineHeight} x2={lineEndX} y2={baseY + lineHeight} stroke="#e5e7eb" stroke-width="0.2" />
			{/if}
			<line x1={lineStartX} y1={baseY} x2={lineStartX} y2={baseY + lineHeight} stroke="#fecaca" stroke-width="0.15" />
		{/each}
	{/if}
</g>
