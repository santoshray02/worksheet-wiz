<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		hoverable?: boolean;
		onclick?: () => void;
		children: Snippet;
		class?: string;
	}

	let {
		title,
		padding = 'md',
		hoverable = false,
		onclick,
		children,
		class: className = ''
	}: Props = $props();

	const paddingClasses: Record<string, string> = {
		none: 'p-0',
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-7'
	};

	const hoverClasses = $derived(
		hoverable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
	);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="bg-white rounded-xl shadow-sm transition-all duration-200 {paddingClasses[padding]} {hoverClasses} {className}"
	onclick={onclick}
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
>
	{#if title}
		<h3 class="text-lg font-semibold text-gray-800 mb-3 font-display">{title}</h3>
	{/if}
	{@render children()}
</div>
