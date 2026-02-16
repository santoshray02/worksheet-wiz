<script lang="ts">
	import type { MathData } from '$lib/types/activity';

	interface Props {
		data: MathData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const problems = $derived(data.problems ?? []);
	const cols = 2;
	const rows = $derived(Math.ceil(problems.length / cols));
	const colWidth = $derived((zone.width - 8) / cols);
	const rowHeight = $derived(Math.min((zone.height - 16) / Math.max(rows, 1), 16));

	/** Generate visual aid dots for a number */
	function dotPositions(count: number, startX: number, startY: number): Array<{ x: number; y: number }> {
		const dotsPerRow = Math.min(count, 5);
		const dotRows = Math.ceil(count / dotsPerRow);
		const result: Array<{ x: number; y: number }> = [];
		for (let idx = 0; idx < count; idx++) {
			const r = Math.floor(idx / dotsPerRow);
			const c = idx % dotsPerRow;
			result.push({
				x: startX + c * 2.2,
				y: startY + r * 2.2
			});
		}
		return result;
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

	<!-- Problems grid -->
	{#each problems as problem, pi}
		{@const col = pi % cols}
		{@const row = Math.floor(pi / cols)}
		{@const px = 4 + col * colWidth}
		{@const py = 14 + row * rowHeight}

		<g transform="translate({px}, {py})">
			<!-- Problem number -->
			<text
				x="0"
				y="4"
				font-family="Comic Neue, sans-serif"
				font-size="2.5"
				fill="#9ca3af"
			>{pi + 1}.</text>

			<!-- Equation -->
			<text
				x="6"
				y="4"
				font-family="Comic Neue, sans-serif"
				font-size="4.5"
				font-weight="600"
				fill="#1f2937"
			>{problem.operand1} {problem.operator} {problem.operand2} =</text>

			<!-- Answer blank -->
			<rect
				x={colWidth - 18}
				y="-1"
				width="10"
				height="7"
				fill="none"
				stroke="#9ca3af"
				stroke-width="0.3"
				stroke-dasharray="1.5,1"
				rx="0.8"
			/>

			<!-- Visual aids (dots) -->
			{#if data.showVisualAids && rowHeight > 10}
				{@const dotsLeft = dotPositions(problem.operand1, 6, 8)}
				{@const dotsRight = dotPositions(problem.operand2, 6 + problem.operand1 * 2.2 + 4, 8)}

				{#each dotsLeft as dot}
					<circle cx={dot.x} cy={dot.y} r="0.8" fill="#6366f1" opacity="0.6" />
				{/each}

				<!-- Operator between dot groups -->
				<text
					x={6 + problem.operand1 * 2.2 + 1.5}
					y="9"
					font-family="Comic Neue, sans-serif"
					font-size="2.5"
					fill="#9ca3af"
				>{problem.operator}</text>

				{#each dotsRight as dot}
					<circle cx={dot.x} cy={dot.y} r="0.8" fill="#ec4899" opacity="0.6" />
				{/each}
			{/if}
		</g>
	{/each}
</g>
