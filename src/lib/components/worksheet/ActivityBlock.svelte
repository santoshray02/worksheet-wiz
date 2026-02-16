<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		zone: { x: number; y: number; width: number; height: number };
		editMode?: boolean;
		children: Snippet;
	}

	let { title, zone, editMode = false, children }: Props = $props();
</script>

<g transform="translate({zone.x}, {zone.y})">
	<!-- Edit mode dashed border -->
	{#if editMode}
		<rect
			x="0"
			y="0"
			width={zone.width}
			height={zone.height}
			fill="none"
			stroke="#93c5fd"
			stroke-width="0.3"
			stroke-dasharray="2,1.5"
			rx="1"
		/>
	{/if}

	<!-- Activity title -->
	<text
		x={zone.width / 2}
		y="5"
		text-anchor="middle"
		font-family="Comic Neue, sans-serif"
		font-size="4"
		font-weight="700"
		fill="#374151"
	>{title}</text>

	<!-- Activity content rendered via children -->
	<g transform="translate(0, 7)">
		{@render children()}
	</g>
</g>
