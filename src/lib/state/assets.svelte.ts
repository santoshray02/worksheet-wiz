import type { AssetEntry, AssetCategory } from '$lib/types/asset';

/**
 * Reactive state container for the SVG asset library.
 *
 * Loads the asset manifest from `/assets/manifest.json`, supports
 * filtering by category and free-text search, and exposes helpers
 * for looking up individual assets.
 */
export class AssetsState {
	// -----------------------------------------------------------------------
	// Reactive properties (Svelte 5 $state rune)
	// -----------------------------------------------------------------------

	assets = $state<AssetEntry[]>([]);
	searchQuery = $state('');
	selectedCategory = $state<AssetCategory | 'all'>('all');
	isLoading = $state(false);

	// -----------------------------------------------------------------------
	// Derived getters
	// -----------------------------------------------------------------------

	/**
	 * Assets filtered by the current category and search query.
	 * The search is case-insensitive and matches against the asset
	 * name, category, and tags.
	 */
	get filteredAssets(): AssetEntry[] {
		let result = this.assets;

		// Category filter
		if (this.selectedCategory !== 'all') {
			const cat = this.selectedCategory;
			result = result.filter((a) => a.category === cat);
		}

		// Free-text search
		const query = this.searchQuery.trim().toLowerCase();
		if (query) {
			result = result.filter((a) => {
				const nameMatch = a.name.toLowerCase().includes(query);
				const categoryMatch = a.category.toLowerCase().includes(query);
				const tagMatch = a.tags.some((t) => t.toLowerCase().includes(query));
				return nameMatch || categoryMatch || tagMatch;
			});
		}

		return result;
	}

	// -----------------------------------------------------------------------
	// Loading
	// -----------------------------------------------------------------------

	/**
	 * Fetch the asset manifest from the static directory and populate
	 * the `assets` array. Safe to call multiple times – subsequent
	 * calls are no-ops while a load is in progress.
	 */
	async loadManifest(): Promise<void> {
		if (this.isLoading) return;

		// Skip if already loaded
		if (this.assets.length > 0) return;

		this.isLoading = true;

		try {
			const response = await fetch('/assets/manifest.json');

			if (!response.ok) {
				throw new Error(`Failed to load asset manifest (${response.status})`);
			}

			const manifest = (await response.json()) as { version: string; assets: AssetEntry[] };
			this.assets = manifest.assets;
		} catch (err) {
			console.error('Failed to load asset manifest:', err);
		} finally {
			this.isLoading = false;
		}
	}

	// -----------------------------------------------------------------------
	// Search & filter actions
	// -----------------------------------------------------------------------

	/**
	 * Update the free-text search query. The `filteredAssets` getter
	 * reacts automatically.
	 */
	search(query: string): void {
		this.searchQuery = query;
	}

	/**
	 * Switch the active category filter.
	 */
	setCategory(category: AssetCategory | 'all'): void {
		this.selectedCategory = category;
	}

	// -----------------------------------------------------------------------
	// Lookup helpers
	// -----------------------------------------------------------------------

	/**
	 * Find a single asset by its unique ID.
	 */
	getAsset(id: string): AssetEntry | undefined {
		return this.assets.find((a) => a.id === id);
	}

	/**
	 * Return all assets belonging to a given category (unaffected by the
	 * current `selectedCategory` or `searchQuery` state).
	 */
	getAssetsByCategory(category: AssetCategory): AssetEntry[] {
		return this.assets.filter((a) => a.category === category);
	}

	/**
	 * Return all assets that have at least one of the given tags.
	 * Comparison is case-insensitive.
	 */
	getAssetsByTags(tags: string[]): AssetEntry[] {
		const tagSet = new Set(tags.map((t) => t.toLowerCase()));
		return this.assets.filter((a) => a.tags.some((t) => tagSet.has(t.toLowerCase())));
	}
}

export const assetsState = new AssetsState();
