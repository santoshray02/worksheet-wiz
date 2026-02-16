<script lang="ts">
	import Modal from './Modal.svelte';
	import { settingsState } from '$lib/state/settings.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let anthropicKey = $state(settingsState.anthropicApiKey);
	let openaiKey = $state(settingsState.openaiApiKey);

	// Sync local state when modal opens
	$effect(() => {
		if (open) {
			anthropicKey = settingsState.anthropicApiKey;
			openaiKey = settingsState.openaiApiKey;
		}
	});

	function handleSave() {
		settingsState.anthropicApiKey = anthropicKey.trim();
		settingsState.openaiApiKey = openaiKey.trim();
		settingsState.save();
		onclose();
	}

	function handleClear() {
		anthropicKey = '';
		openaiKey = '';
		settingsState.clear();
	}
</script>

<Modal {open} title="API Keys" {onclose}>
	<p class="text-sm text-gray-500 mb-4">
		Enter your own API keys to use for worksheet generation. Keys are stored locally in your
		browser and never sent to our servers.
	</p>

	<div class="space-y-4">
		<div>
			<label for="anthropic-key" class="block text-sm font-medium text-gray-700 mb-1">
				Anthropic API Key
			</label>
			<input
				id="anthropic-key"
				type="password"
				bind:value={anthropicKey}
				placeholder="sk-ant-..."
				class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
			/>
		</div>

		<div>
			<label for="openai-key" class="block text-sm font-medium text-gray-700 mb-1">
				OpenAI API Key
			</label>
			<input
				id="openai-key"
				type="password"
				bind:value={openaiKey}
				placeholder="sk-..."
				class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
			/>
		</div>
	</div>

	{#snippet actions()}
		<button
			class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
			onclick={handleClear}
		>
			Clear All
		</button>
		<button
			class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
			onclick={handleSave}
		>
			Save
		</button>
	{/snippet}
</Modal>
