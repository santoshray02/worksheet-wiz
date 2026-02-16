<script lang="ts">
	import type { TracingData } from '$lib/types/activity';

	interface Props {
		data: TracingData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const items = $derived(data.items ?? []);
	const itemCount = $derived(items.length || 1);
	const cellWidth = $derived((zone.width - 4) / Math.min(itemCount, 6));
	const contentHeight = $derived(zone.height - 12);

	/** Get stroke-dasharray based on tracing style */
	function getDashArray(style: string): string {
		switch (style) {
			case 'dotted':
				return '0.8,1.2';
			case 'dashed':
				return '2,1.5';
			case 'light':
				return 'none';
			default:
				return '0.8,1.2';
		}
	}

	/** Get stroke opacity based on tracing style */
	function getOpacity(style: string): number {
		switch (style) {
			case 'light':
				return 0.15;
			case 'dotted':
			case 'dashed':
				return 0.5;
			default:
				return 0.5;
		}
	}

	type ShapePathFn = (cx: number, cy: number, r: number) => string;

	const shapePaths: Record<string, ShapePathFn> = {
		circle: (cx, cy, r) => {
			return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
		},
		oval: (cx, cy, r) => {
			const rx = r;
			const ry = r * 0.65;
			return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`;
		},
		square: (cx, cy, r) => {
			const h = r * 0.85;
			return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
		},
		rectangle: (cx, cy, r) => {
			const w = r;
			const h = r * 0.65;
			return `M ${cx - w} ${cy - h} L ${cx + w} ${cy - h} L ${cx + w} ${cy + h} L ${cx - w} ${cy + h} Z`;
		},
		triangle: (cx, cy, r) => {
			const top = { x: cx, y: cy - r };
			const bl = { x: cx - r * 0.87, y: cy + r * 0.5 };
			const br = { x: cx + r * 0.87, y: cy + r * 0.5 };
			return `M ${top.x} ${top.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`;
		},
		diamond: (cx, cy, r) => {
			return `M ${cx} ${cy - r} L ${cx + r * 0.7} ${cy} L ${cx} ${cy + r} L ${cx - r * 0.7} ${cy} Z`;
		},
		star: (cx, cy, r) => {
			const points = 5;
			const inner = r * 0.4;
			let d = '';
			for (let i = 0; i < points * 2; i++) {
				const angle = (Math.PI / 2) * -1 + (Math.PI / points) * i;
				const rad = i % 2 === 0 ? r : inner;
				const x = cx + Math.cos(angle) * rad;
				const y = cy + Math.sin(angle) * rad;
				d += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
			}
			return d + 'Z';
		},
		heart: (cx, cy, r) => {
			return (
				`M ${cx} ${cy + r * 0.7} ` +
				`C ${cx - r * 1.2} ${cy - r * 0.1}, ${cx - r * 0.6} ${cy - r * 1.0}, ${cx} ${cy - r * 0.35} ` +
				`C ${cx + r * 0.6} ${cy - r * 1.0}, ${cx + r * 1.2} ${cy - r * 0.1}, ${cx} ${cy + r * 0.7} Z`
			);
		},
		hexagon: (cx, cy, r) => {
			let d = '';
			for (let i = 0; i < 6; i++) {
				const angle = (Math.PI / 3) * i - Math.PI / 6;
				const x = cx + Math.cos(angle) * r;
				const y = cy + Math.sin(angle) * r;
				d += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
			}
			return d + 'Z';
		},
		pentagon: (cx, cy, r) => {
			let d = '';
			for (let i = 0; i < 5; i++) {
				const angle = (Math.PI / 2) * -1 + (2 * Math.PI / 5) * i;
				const x = cx + Math.cos(angle) * r;
				const y = cy + Math.sin(angle) * r;
				d += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
			}
			return d + 'Z';
		}
	};

	function isShape(item: string): boolean {
		return item.trim().toLowerCase() in shapePaths;
	}

	function getShapePath(item: string, cx: number, cy: number, r: number): string {
		const fn = shapePaths[item.trim().toLowerCase()];
		return fn ? fn(cx, cy, r) : '';
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

	<!-- Tracing items -->
	{#each items as item, i}
		{@const cx = 2 + i * cellWidth + cellWidth / 2}
		{@const cy = 12 + contentHeight / 2}
		{@const fontSize = Math.min(cellWidth * 0.7, contentHeight * 0.65)}
		{@const shapeSize = Math.min(cellWidth * 0.55, contentHeight * 0.5)}

		<g>
			{#if isShape(item)}
				<!-- Shape guide (solid light gray) -->
				<path
					d={getShapePath(item, cx, cy - 1.5, shapeSize / 2)}
					fill="none"
					stroke="#e5e7eb"
					stroke-width="0.5"
				/>

				<!-- Shape trace overlay (dotted/dashed) -->
				<path
					d={getShapePath(item, cx, cy - 1.5, shapeSize / 2)}
					fill="none"
					stroke="#6366f1"
					stroke-width="0.4"
					stroke-dasharray={getDashArray(data.tracingStyle)}
					opacity={getOpacity(data.tracingStyle)}
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Shape name label -->
				<text
					x={cx}
					y={cy - 1.5 + shapeSize / 2 + 3}
					text-anchor="middle"
					font-family="Comic Neue, sans-serif"
					font-size="2.2"
					fill="#9ca3af"
				>{item}</text>

				<!-- Starting dot for shapes -->
				{#if data.showArrows}
					<circle
						cx={cx}
						cy={cy - 1.5 - shapeSize / 2}
						r="1"
						fill="#ef4444"
					/>
					<text
						x={cx}
						y={cy - 1.5 - shapeSize / 2}
						text-anchor="middle"
						dominant-baseline="central"
						font-family="Comic Neue, sans-serif"
						font-size="1.5"
						font-weight="700"
						fill="white"
					>{i + 1}</text>
				{/if}
			{:else}
				<!-- Light gray guide letter/number (background) -->
				<text
					x={cx}
					y={cy}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={fontSize}
					font-weight="700"
					fill="#e5e7eb"
				>{item}</text>

				<!-- Dotted/dashed trace overlay -->
				<text
					x={cx}
					y={cy}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Comic Neue, sans-serif"
					font-size={fontSize}
					font-weight="700"
					fill="none"
					stroke="#6366f1"
					stroke-width="0.4"
					stroke-dasharray={getDashArray(data.tracingStyle)}
					opacity={getOpacity(data.tracingStyle)}
				>{item}</text>

				<!-- Starting dot (numbered) -->
				{#if data.showArrows}
					<circle
						cx={cx - fontSize * 0.25}
						cy={cy - fontSize * 0.35}
						r="1"
						fill="#ef4444"
					/>
					<text
						x={cx - fontSize * 0.25}
						y={cy - fontSize * 0.35}
						text-anchor="middle"
						dominant-baseline="central"
						font-family="Comic Neue, sans-serif"
						font-size="1.5"
						font-weight="700"
						fill="white"
					>{i + 1}</text>

					<!-- Directional arrow -->
					<path
						d="M {cx - fontSize * 0.25} {cy - fontSize * 0.35 + 1.3} l 0 2 l -0.8 -0.8 m 0.8 0.8 l 0.8 -0.8"
						fill="none"
						stroke="#ef4444"
						stroke-width="0.3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/if}

				<!-- Baseline guide -->
				<line
					x1={cx - cellWidth * 0.35}
					y1={cy + fontSize * 0.35}
					x2={cx + cellWidth * 0.35}
					y2={cy + fontSize * 0.35}
					stroke="#d1d5db"
					stroke-width="0.2"
				/>
			{/if}
		</g>
	{/each}

	<!-- Practice guide lines at the bottom -->
	{#if contentHeight > 30}
		{@const lineY = 12 + contentHeight * 0.8}
		<line
			x1="4"
			y1={lineY}
			x2={zone.width - 4}
			y2={lineY}
			stroke="#e5e7eb"
			stroke-width="0.2"
		/>
		<line
			x1="4"
			y1={lineY + 6}
			x2={zone.width - 4}
			y2={lineY + 6}
			stroke="#e5e7eb"
			stroke-width="0.2"
		/>
	{/if}
</g>
