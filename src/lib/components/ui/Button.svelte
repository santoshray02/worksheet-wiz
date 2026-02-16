<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from './Spinner.svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		children: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		onclick,
		children,
		class: className = ''
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses: Record<string, string> = {
		primary:
			'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md',
		secondary:
			'bg-secondary text-white hover:bg-amber-600 focus:ring-secondary shadow-sm hover:shadow-md',
		outline:
			'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
		ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-5 py-2.5 text-base',
		lg: 'px-7 py-3.5 text-lg'
	};

	const spinnerSize: Record<string, 'sm' | 'md' | 'lg'> = {
		sm: 'sm',
		md: 'sm',
		lg: 'md'
	};
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
	disabled={disabled || loading}
	{onclick}
>
	{#if loading}
		<Spinner size={spinnerSize[size]} color="currentColor" />
	{/if}
	{@render children()}
</button>
