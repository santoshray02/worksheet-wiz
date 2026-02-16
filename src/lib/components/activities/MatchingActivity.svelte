<script lang="ts">
	import type { MatchingData } from '$lib/types/activity';

	interface Props {
		data: MatchingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const pairs = $derived(data.pairs ?? []);
	const pairCount = $derived(pairs.length || 1);
	const rowHeight = $derived(Math.min((zone.height - 16) / pairCount, 14));

	// Shuffle the right column deterministically using a simple approach
	const shuffledRight = $derived.by(() => {
		if (pairs.length <= 1) return pairs.map((_, i) => i);
		const offset = Math.floor(pairs.length / 2);
		return pairs.map((_, i) => (i + offset) % pairs.length);
	});

	const leftX = 6;
	const rightX = $derived(zone.width - 6);
	const leftDotX = $derived(zone.width * 0.35);
	const rightDotX = $derived(zone.width * 0.65);
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
	>{data.instructions || 'Draw a line to match each pair.'}</text>

	<!-- Column headers -->
	<line
		x1={zone.width / 2}
		y1="13"
		x2={zone.width / 2}
		y2={14 + pairCount * rowHeight}
		stroke="#e5e7eb"
		stroke-width="0.15"
		stroke-dasharray="1,2"
	/>

	<!-- Pairs -->
	{#each pairs as pair, i}
		{@const y = 16 + i * rowHeight + rowHeight / 2}
		{@const rightIndex = shuffledRight[i]}
		{@const rightPair = pairs[rightIndex]}

		<!-- Left item -->
		<text
			x={leftX}
			y={y}
			dominant-baseline="middle"
			font-family="Comic Neue, sans-serif"
			font-size="3.5"
			fill="#1f2937"
		>{pair.left}</text>

		<!-- Left connection dot -->
		<circle
			cx={leftDotX}
			cy={y}
			r="0.8"
			fill="#6366f1"
		/>

		<!-- Right connection dot -->
		<circle
			cx={rightDotX}
			cy={y}
			r="0.8"
			fill="#ec4899"
		/>

		<!-- Right item (shuffled) -->
		<text
			x={rightX}
			y={y}
			text-anchor="end"
			dominant-baseline="middle"
			font-family="Comic Neue, sans-serif"
			font-size="3.5"
			fill="#1f2937"
		>{rightPair.right}</text>
	{/each}
</g>
