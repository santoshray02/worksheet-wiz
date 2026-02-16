<script lang="ts">
	import type { SpellingData } from '$lib/types/activity';

	interface Props {
		data: SpellingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const words = $derived(data.words ?? []);
	const wordCount = $derived(words.length || 1);
	const cols = $derived(wordCount > 6 ? 2 : 1);
	const rows = $derived(Math.ceil(wordCount / cols));
	const colWidth = $derived((zone.width - 8) / cols);
	const rowHeight = $derived(Math.min((zone.height - 16) / Math.max(rows, 1), 14));
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
	>{data.instructions || 'Spell each word correctly.'}</text>

	<!-- Words -->
	{#each words as word, wi}
		{@const col = wi % cols}
		{@const row = Math.floor(wi / cols)}
		{@const wx = 4 + col * colWidth}
		{@const wy = 16 + row * rowHeight}
		{@const letters = word.word.split('')}
		{@const boxSize = Math.min(5, (colWidth - 20) / Math.max(letters.length, 1))}

		<g transform="translate({wx}, {wy})">
			<!-- Word number -->
			<text
				x="0"
				y="4"
				font-family="Comic Neue, sans-serif"
				font-size="2.5"
				fill="#9ca3af"
			>{wi + 1}.</text>

			<!-- Hint (if provided) -->
			{#if word.hint}
				<text
					x="6"
					y="4"
					font-family="Comic Neue, sans-serif"
					font-size="2.5"
					fill="#6b7280"
					font-style="italic"
				>{word.hint}</text>
			{/if}

			<!-- Letter boxes -->
			{#each letters as _letter, li}
				{@const lx = 6 + (word.hint ? 30 : 0) + li * (boxSize + 1)}
				<rect
					x={lx}
					y="0"
					width={boxSize}
					height={boxSize + 1}
					fill="none"
					stroke="#9ca3af"
					stroke-width="0.25"
					rx="0.5"
				/>
				<!-- Baseline inside each box -->
				<line
					x1={lx + 0.5}
					y1={boxSize}
					x2={lx + boxSize - 0.5}
					y2={boxSize}
					stroke="#d1d5db"
					stroke-width="0.15"
				/>
			{/each}
		</g>
	{/each}
</g>
