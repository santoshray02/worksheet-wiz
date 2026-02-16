const STORAGE_KEY = 'worksheet-wiz-settings';

interface PersistedSettings {
	anthropicApiKey: string;
	openaiApiKey: string;
}

/**
 * Reactive state container for user-provided API keys (BYOK).
 * Keys are stored in localStorage so they persist across sessions.
 */
export class SettingsState {
	anthropicApiKey = $state('');
	openaiApiKey = $state('');

	constructor() {
		this.load();
	}

	get hasAnyKey(): boolean {
		return !!this.anthropicApiKey || !!this.openaiApiKey;
	}

	save(): void {
		const data: PersistedSettings = {
			anthropicApiKey: this.anthropicApiKey,
			openaiApiKey: this.openaiApiKey
		};
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// localStorage may be unavailable (SSR, private browsing quota)
		}
	}

	clear(): void {
		this.anthropicApiKey = '';
		this.openaiApiKey = '';
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}

	private load(): void {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const data = JSON.parse(raw) as PersistedSettings;
				this.anthropicApiKey = data.anthropicApiKey ?? '';
				this.openaiApiKey = data.openaiApiKey ?? '';
			}
		} catch {
			// SSR or corrupt data — start empty
		}
	}
}

export const settingsState = new SettingsState();
