<script lang="ts">
	import type { WorksheetSettings } from '$lib/types/worksheet';

	interface Props {
		title: string;
		settings: WorksheetSettings;
	}

	let { title, settings }: Props = $props();

	const headerY = 10;
	const contentX = 10;
	const contentWidth = 190;
	const centerX = contentX + contentWidth / 2;
</script>

<!-- Title -->
<text
	x={centerX}
	y={headerY + 10}
	text-anchor="middle"
	font-family={settings.fontFamily || 'Comic Neue, sans-serif'}
	font-size="8"
	font-weight="700"
	fill="#1a1a2e"
>{title}</text>

<!-- Name and Date fields -->
{#if settings.showNameField || settings.showDateField}
	<g>
		{#if settings.showNameField}
			<text
				x={contentX + 2}
				y={headerY + 20}
				font-family={settings.fontFamily || 'Comic Neue, sans-serif'}
				font-size="4"
				fill="#4a4a6a"
			>Name:</text>
			<line
				x1={contentX + 18}
				y1={headerY + 20}
				x2={contentX + 75}
				y2={headerY + 20}
				stroke="#9ca3af"
				stroke-width="0.3"
			/>
		{/if}

		{#if settings.showDateField}
			<text
				x={contentX + contentWidth - 60}
				y={headerY + 20}
				font-family={settings.fontFamily || 'Comic Neue, sans-serif'}
				font-size="4"
				fill="#4a4a6a"
			>Date:</text>
			<line
				x1={contentX + contentWidth - 46}
				y1={headerY + 20}
				x2={contentX + contentWidth - 2}
				y2={headerY + 20}
				stroke="#9ca3af"
				stroke-width="0.3"
			/>
		{/if}
	</g>
{/if}

<!-- Decorative line below header -->
{#if settings.showHeader}
	<line
		x1={contentX}
		y1={headerY + 24}
		x2={contentX + contentWidth}
		y2={headerY + 24}
		stroke="#e5e7eb"
		stroke-width="0.5"
		stroke-dasharray="2,1"
	/>
{/if}
