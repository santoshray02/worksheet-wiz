<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'info';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: 'bg-gray-100 text-gray-700',
		success: 'bg-emerald-100 text-emerald-700',
		warning: 'bg-amber-100 text-amber-700',
		info: 'bg-sky-100 text-sky-700'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {variantClasses[variant]}"
>
	{@render children()}
</span>
