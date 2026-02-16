<script lang="ts">
	import type { PatternData } from '$lib/types/activity';

	interface Props {
		data: PatternData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const sequence = $derived(data.sequence ?? []);
	const missingIndices = $derived(new Set(data.missingIndices ?? []));
	const options = $derived(data.options ?? []);
	const itemCount = $derived(sequence.length || 1);
	const cellWidth = $derived(Math.min((zone.width - 8) / itemCount, 18));
	const sequenceWidth = $derived(cellWidth * itemCount);
	const startX = $derived((zone.width - sequenceWidth) / 2);

	/** Map common shape names to SVG rendering */
	function isShapeName(val: string): boolean {
		return ['circle', 'square', 'triangle', 'star', 'diamond', 'heart'].includes(val.toLowerCase());
	}

	function shapeColor(val: string): string {
		const colors: Record<string, string> = {
			circle: '#ef4444',
			square: '#3b82f6',
			triangle: '#f59e0b',
			star: '#8b5cf6',
			diamond: '#06b6d4',
			heart: '#ec4899'
		};
		return colors[val.toLowerCase()] ?? '#6b7280';
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
	>{data.instructions || 'Complete the pattern.'}</text>

	<!-- Sequence row -->
	{#each sequence as item, i}
		{@const cx = startX + i * cellWidth + cellWidth / 2}
		{@const cy = 22}
		{@const isMissing = missingIndices.has(i)}
		{@const size = Math.min(cellWidth * 0.35, 6)}

		<g>
			{#if isMissing}
				<!-- Missing item: dashed box with "?" -->
				<rect
					x={cx - size}
					y={cy - size}
					width={size * 2}
					height={size * 2}
					fill="none"
					stroke="#9ca3af"
					stroke-width="0.3"
					stroke-dasharray="1.2,0.8"
					rx="0.8"
				/>
				<text
					x={cx}
					y={cy}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size="5"
					font-weight="700"
					fill="#d1d5db"
				>?</text>
			{:else if isShapeName(item)}
				<!-- Render as a shape -->
				{#if item.toLowerCase() === 'circle'}
					<circle cx={cx} cy={cy} r={size} fill={shapeColor(item)} opacity="0.85" />
				{:else if item.toLowerCase() === 'square'}
					<rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} rx="0.5" fill={shapeColor(item)} opacity="0.85" />
				{:else if item.toLowerCase() === 'triangle'}
					<polygon
						points="{cx},{cy - size} {cx - size},{cy + size} {cx + size},{cy + size}"
						fill={shapeColor(item)}
						opacity="0.85"
					/>
				{:else if item.toLowerCase() === 'star'}
					<path
						d="M {cx} {cy - size} l {size * 0.22} {size * 0.68} l {size * 0.72} {size * 0.1} l {-size * 0.53} {size * 0.45} l {size * 0.16} {size * 0.72} l {-size * 0.57} {-size * 0.4} l {-size * 0.57} {size * 0.4} l {size * 0.16} {-size * 0.72} l {-size * 0.53} {-size * 0.45} l {size * 0.72} {-size * 0.1} z"
						fill={shapeColor(item)}
						opacity="0.85"
					/>
				{:else if item.toLowerCase() === 'diamond'}
					<polygon
						points="{cx},{cy - size} {cx + size},{cy} {cx},{cy + size} {cx - size},{cy}"
						fill={shapeColor(item)}
						opacity="0.85"
					/>
				{:else if item.toLowerCase() === 'heart'}
					<path
						d="M {cx} {cy + size * 0.6} Q {cx - size * 1.2} {cy - size * 0.2} {cx} {cy - size * 0.6} Q {cx + size * 1.2} {cy - size * 0.2} {cx} {cy + size * 0.6} Z"
						fill={shapeColor(item)}
						opacity="0.85"
					/>
				{/if}
			{:else}
				<!-- Render as text (number, letter, etc.) -->
				<text
					x={cx}
					y={cy}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size="5"
					font-weight="700"
					fill="#374151"
				>{item}</text>
			{/if}

			<!-- Arrow between items (except last) -->
			{#if i < sequence.length - 1}
				<line
					x1={cx + cellWidth * 0.35}
					y1={cy}
					x2={cx + cellWidth * 0.65}
					y2={cy}
					stroke="#d1d5db"
					stroke-width="0.2"
				/>
				<path
					d="M {cx + cellWidth * 0.6} {cy - 0.8} l {cellWidth * 0.05} 0.8 l {-cellWidth * 0.05} 0.8"
					fill="none"
					stroke="#d1d5db"
					stroke-width="0.2"
				/>
			{/if}
		</g>
	{/each}

	<!-- Options section -->
	{#if options.length > 0}
		{@const optionY = 36}
		<text
			x={zone.width / 2}
			y={optionY}
			text-anchor="middle"
			font-family="Comic Neue, sans-serif"
			font-size="2.5"
			fill="#6b7280"
		>Choose from:</text>

		{@const optCellWidth = Math.min((zone.width - 16) / options.length, 16)}
		{@const optStartX = (zone.width - optCellWidth * options.length) / 2}

		{#each options as opt, oi}
			{@const ox = optStartX + oi * optCellWidth + optCellWidth / 2}
			{@const oy = optionY + 7}

			<rect
				x={ox - optCellWidth * 0.4}
				y={oy - 4}
				width={optCellWidth * 0.8}
				height="8"
				fill="#f3f4f6"
				stroke="#d1d5db"
				stroke-width="0.2"
				rx="1"
			/>

			{#if isShapeName(opt)}
				{#if opt.toLowerCase() === 'circle'}
					<circle cx={ox} cy={oy} r="2.5" fill={shapeColor(opt)} opacity="0.85" />
				{:else if opt.toLowerCase() === 'square'}
					<rect x={ox - 2.5} y={oy - 2.5} width="5" height="5" rx="0.3" fill={shapeColor(opt)} opacity="0.85" />
				{:else if opt.toLowerCase() === 'triangle'}
					<polygon points="{ox},{oy - 2.8} {ox - 2.5},{oy + 2} {ox + 2.5},{oy + 2}" fill={shapeColor(opt)} opacity="0.85" />
				{:else}
					<text x={ox} y={oy} text-anchor="middle" dominant-baseline="central" font-family="Comic Neue, sans-serif" font-size="3.5" fill="#374151">{opt}</text>
				{/if}
			{:else}
				<text
					x={ox}
					y={oy}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size="3.5"
					font-weight="600"
					fill="#374151"
				>{opt}</text>
			{/if}
		{/each}
	{/if}
</g>
