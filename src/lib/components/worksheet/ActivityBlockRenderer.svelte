<script lang="ts">
	import type { ActivityData } from '$lib/types/activity';
	import TracingActivity from '$lib/components/activities/TracingActivity.svelte';
	import CountingActivity from '$lib/components/activities/CountingActivity.svelte';
	import MatchingActivity from '$lib/components/activities/MatchingActivity.svelte';
	import MathActivity from '$lib/components/activities/MathActivity.svelte';
	import MazeActivity from '$lib/components/activities/MazeActivity.svelte';
	import PatternActivity from '$lib/components/activities/PatternActivity.svelte';
	import HandwritingActivity from '$lib/components/activities/HandwritingActivity.svelte';
	import WordSearchActivity from '$lib/components/activities/WordSearchActivity.svelte';
	import CrosswordActivity from '$lib/components/activities/CrosswordActivity.svelte';
	import ConnectDotsActivity from '$lib/components/activities/ConnectDotsActivity.svelte';
	import OddOneOutActivity from '$lib/components/activities/OddOneOutActivity.svelte';
	import NumberBondsActivity from '$lib/components/activities/NumberBondsActivity.svelte';
	import StorySequencingActivity from '$lib/components/activities/StorySequencingActivity.svelte';
	import ColoringActivity from '$lib/components/activities/ColoringActivity.svelte';
	import SpellingActivity from '$lib/components/activities/SpellingActivity.svelte';
	import CutAndPasteActivity from '$lib/components/activities/CutAndPasteActivity.svelte';

	interface Props {
		activity: ActivityData;
		zone: { x: number; y: number; width: number; height: number };
	}

	let { activity, zone }: Props = $props();
</script>

{#if activity.type === 'tracing'}
	<TracingActivity data={activity} {zone} />
{:else if activity.type === 'counting'}
	<CountingActivity data={activity} {zone} />
{:else if activity.type === 'matching'}
	<MatchingActivity data={activity} {zone} />
{:else if activity.type === 'math'}
	<MathActivity data={activity} {zone} />
{:else if activity.type === 'maze'}
	<MazeActivity data={activity} {zone} />
{:else if activity.type === 'pattern'}
	<PatternActivity data={activity} {zone} />
{:else if activity.type === 'coloring'}
	<ColoringActivity data={activity} {zone} />
{:else if activity.type === 'spelling'}
	<SpellingActivity data={activity} {zone} />
{:else if activity.type === 'handwriting'}
	<HandwritingActivity data={activity} {zone} />
{:else if activity.type === 'word-search'}
	<WordSearchActivity data={activity} {zone} />
{:else if activity.type === 'crossword'}
	<CrosswordActivity data={activity} {zone} />
{:else if activity.type === 'connect-dots'}
	<ConnectDotsActivity data={activity} {zone} />
{:else if activity.type === 'odd-one-out'}
	<OddOneOutActivity data={activity} {zone} />
{:else if activity.type === 'number-bonds'}
	<NumberBondsActivity data={activity} {zone} />
{:else if activity.type === 'story-sequencing'}
	<StorySequencingActivity data={activity} {zone} />
{:else if activity.type === 'cut-and-paste'}
	<CutAndPasteActivity data={activity} {zone} />
{:else}
	<!-- Fallback for unknown activity type -->
	<g transform="translate({zone.x}, {zone.y})">
		<rect
			x="2"
			y="2"
			width={zone.width - 4}
			height={zone.height - 4}
			fill="#fef3c7"
			stroke="#f59e0b"
			stroke-width="0.3"
			stroke-dasharray="2,1"
			rx="1"
		/>
		<text
			x={zone.width / 2}
			y={zone.height / 2}
			text-anchor="middle"
			dominant-baseline="middle"
			font-family="Comic Neue, sans-serif"
			font-size="4"
			fill="#92400e"
		>Unsupported activity type</text>
	</g>
{/if}
