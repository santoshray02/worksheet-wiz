<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { assetLibrary } from '$lib/assets/library';
	import SettingsModal from '$lib/components/ui/SettingsModal.svelte';

	let { children }: { children: Snippet } = $props();
	let settingsOpen = $state(false);

	assetLibrary.load();
</script>

<div class="min-h-screen bg-surface">
	<!-- Top nav bar -->
	<nav
		class="no-print bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40"
	>
		<a href="/" class="text-xl font-bold text-primary font-display tracking-tight">
			WorksheetWiz
		</a>
		<div class="flex items-center gap-6">
			<a
				href="/create"
				class="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
			>
				Create
			</a>
			<a
				href="/templates"
				class="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
			>
				Templates
			</a>
			<a
				href="/assets"
				class="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
			>
				Assets
			</a>
			<button
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
				onclick={() => (settingsOpen = true)}
				aria-label="Settings"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>

<SettingsModal open={settingsOpen} onclose={() => (settingsOpen = false)} />
