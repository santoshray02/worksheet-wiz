<script lang="ts">
	interface Bounds {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

	interface Props {
		bounds: Bounds;
		onResize: (position: HandlePosition, dx: number, dy: number) => void;
	}

	let { bounds, onResize }: Props = $props();

	const handleSize = 6;
	const halfHandle = handleSize / 2;

	interface HandleDef {
		position: HandlePosition;
		cx: number;
		cy: number;
		cursor: string;
	}

	function getHandles(b: Bounds): HandleDef[] {
		const { x, y, width, height } = b;
		const mx = x + width / 2;
		const my = y + height / 2;
		const right = x + width;
		const bottom = y + height;

		return [
			{ position: 'nw', cx: x, cy: y, cursor: 'nwse-resize' },
			{ position: 'n', cx: mx, cy: y, cursor: 'ns-resize' },
			{ position: 'ne', cx: right, cy: y, cursor: 'nesw-resize' },
			{ position: 'e', cx: right, cy: my, cursor: 'ew-resize' },
			{ position: 'se', cx: right, cy: bottom, cursor: 'nwse-resize' },
			{ position: 's', cx: mx, cy: bottom, cursor: 'ns-resize' },
			{ position: 'sw', cx: x, cy: bottom, cursor: 'nesw-resize' },
			{ position: 'w', cx: x, cy: my, cursor: 'ew-resize' }
		];
	}

	let dragging: HandlePosition | null = $state(null);
	let startX = 0;
	let startY = 0;

	function handlePointerDown(position: HandlePosition, e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = position;
		startX = e.clientX;
		startY = e.clientY;

		const target = e.target as SVGElement;
		target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (dragging === null) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		onResize(dragging, dx, dy);
		startX = e.clientX;
		startY = e.clientY;
	}

	function handlePointerUp() {
		dragging = null;
	}
</script>

<svg
	class="absolute inset-0 pointer-events-none overflow-visible"
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
>
	<!-- Selection border -->
	<rect
		x={bounds.x}
		y={bounds.y}
		width={bounds.width}
		height={bounds.height}
		fill="none"
		stroke="#3b82f6"
		stroke-width="1"
		stroke-dasharray="4 2"
	/>

	<!-- Resize handles -->
	{#each getHandles(bounds) as handle}
		<rect
			x={handle.cx - halfHandle}
			y={handle.cy - halfHandle}
			width={handleSize}
			height={handleSize}
			fill="white"
			stroke="#3b82f6"
			stroke-width="1"
			class="pointer-events-auto"
			style="cursor: {handle.cursor}"
			onpointerdown={(e) => handlePointerDown(handle.position, e)}
			role="slider"
			aria-label="Resize {handle.position}"
			tabindex="-1"
			aria-valuenow={0}
		/>
	{/each}
</svg>
