<script lang="ts">
	import type { MazeData } from '$lib/types/activity';

	interface Props {
		data: MazeData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { data, zone }: Props = $props();

	const mazeWidth = $derived(data.width || 8);
	const mazeHeight = $derived(data.height || 8);
	const walls = $derived(data.walls ?? []);

	// Calculate the maze drawing area
	const padding = 8;
	const titleSpace = 14;
	const availWidth = $derived(zone.width - padding * 2);
	const availHeight = $derived(zone.height - titleSpace - padding);
	const cellSize = $derived(Math.min(availWidth / mazeWidth, availHeight / mazeHeight));
	const mazeW = $derived(cellSize * mazeWidth);
	const mazeH = $derived(cellSize * mazeHeight);
	const offsetX = $derived((zone.width - mazeW) / 2);
	const offsetY = $derived(titleSpace + (availHeight - mazeH) / 2);

	/** Generate a simple default maze if no walls are provided */
	function generateDefaultWalls(w: number, h: number): Array<{ row: number; col: number; side: string }> {
		const defaultWalls: Array<{ row: number; col: number; side: string }> = [];
		for (let c = 0; c < w; c++) {
			defaultWalls.push({ row: 0, col: c, side: 'top' });
			defaultWalls.push({ row: h - 1, col: c, side: 'bottom' });
		}
		for (let r = 0; r < h; r++) {
			defaultWalls.push({ row: r, col: 0, side: 'left' });
			defaultWalls.push({ row: r, col: w - 1, side: 'right' });
		}
		for (let r = 0; r < h; r++) {
			for (let c = 0; c < w; c++) {
				if (r % 2 === 0 && c < w - 1 && c !== r % w) {
					defaultWalls.push({ row: r, col: c, side: 'right' });
				}
				if (r % 2 === 1 && c > 0 && c !== (h - r) % w) {
					defaultWalls.push({ row: r, col: c, side: 'left' });
				}
			}
		}
		return defaultWalls;
	}

	const effectiveWalls = $derived(walls.length > 0 ? walls : generateDefaultWalls(mazeWidth, mazeHeight));

	/** Convert wall to line coordinates */
	function wallToLine(wall: { row: number; col: number; side: string }): { x1: number; y1: number; x2: number; y2: number } {
		const x = wall.col * cellSize;
		const y = wall.row * cellSize;

		switch (wall.side) {
			case 'top':
				return { x1: x, y1: y, x2: x + cellSize, y2: y };
			case 'bottom':
				return { x1: x, y1: y + cellSize, x2: x + cellSize, y2: y + cellSize };
			case 'left':
				return { x1: x, y1: y, x2: x, y2: y + cellSize };
			case 'right':
				return { x1: x + cellSize, y1: y, x2: x + cellSize, y2: y + cellSize };
			default:
				return { x1: 0, y1: 0, x2: 0, y2: 0 };
		}
	}

	const startPoint = $derived(data.start ?? { x: 0, y: 0 });
	const endPoint = $derived(data.end ?? { x: mazeWidth - 1, y: mazeHeight - 1 });

	// Pre-compute marker positions
	const startCx = $derived(startPoint.x * cellSize + cellSize / 2);
	const startCy = $derived(startPoint.y * cellSize + cellSize / 2);
	const endCx = $derived(endPoint.x * cellSize + cellSize / 2);
	const endCy = $derived(endPoint.y * cellSize + cellSize / 2);
	const sr = $derived(cellSize * 0.3);
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
	>{data.instructions || 'Find your way through the maze!'}</text>

	<!-- Maze grid -->
	<g transform="translate({offsetX}, {offsetY})">
		<!-- Grid background -->
		<rect
			x="0"
			y="0"
			width={mazeW}
			height={mazeH}
			fill="#fafafa"
			stroke="#d1d5db"
			stroke-width="0.3"
		/>

		<!-- Walls -->
		{#each effectiveWalls as wall}
			{@const line = wallToLine(wall)}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="#374151"
				stroke-width="0.6"
				stroke-linecap="round"
			/>
		{/each}

		<!-- Start marker -->
		<circle
			cx={startCx}
			cy={startCy}
			r={cellSize * 0.25}
			fill="#22c55e"
			opacity="0.8"
		/>
		<text
			x={startCx}
			y={startCy - cellSize * 0.4}
			text-anchor="middle"
			font-family="Comic Neue, sans-serif"
			font-size="2"
			font-weight="700"
			fill="#16a34a"
		>Start</text>

		<!-- End marker (star) -->
		<path
			d="M {endCx} {endCy - sr}
			   l {sr * 0.22} {sr * 0.65}
			   l {sr * 0.7} {sr * 0.1}
			   l {-sr * 0.52} {sr * 0.45}
			   l {sr * 0.15} {sr * 0.7}
			   l {-sr * 0.55} {-sr * 0.4}
			   l {-sr * 0.55} {sr * 0.4}
			   l {sr * 0.15} {-sr * 0.7}
			   l {-sr * 0.52} {-sr * 0.45}
			   l {sr * 0.7} {-sr * 0.1}
			   z"
			fill="#f59e0b"
			stroke="#d97706"
			stroke-width="0.2"
		/>
		<text
			x={endCx}
			y={endCy + cellSize * 0.55}
			text-anchor="middle"
			font-family="Comic Neue, sans-serif"
			font-size="2"
			font-weight="700"
			fill="#d97706"
		>Finish</text>
	</g>
</g>
