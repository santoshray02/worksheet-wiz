// ---------------------------------------------------------------------------
// Asset categories
// ---------------------------------------------------------------------------

/** SVG asset categories mirroring the /static/assets/svg/ directory structure */
export type AssetCategory = 'animals' | 'numbers' | 'letters' | 'shapes' | 'objects' | 'borders' | 'icons';

// ---------------------------------------------------------------------------
// Individual asset entry
// ---------------------------------------------------------------------------

export interface AssetEntry {
	/** Unique identifier for this asset (e.g. "animal-cat") */
	id: string;
	/** Human-readable name (e.g. "Cat") */
	name: string;
	/** Category this asset belongs to */
	category: AssetCategory;
	/** Searchable tags (e.g. ["pet", "feline"]) */
	tags: string[];
	/** File path relative to /static/assets/svg/ (e.g. "animals/cat.svg") */
	path: string;
	/** Intrinsic width in millimeters */
	width: number;
	/** Intrinsic height in millimeters */
	height: number;
}

// ---------------------------------------------------------------------------
// Asset manifest
// ---------------------------------------------------------------------------

/** Root structure of the asset manifest JSON file */
export interface AssetManifest {
	/** Manifest schema version (semver) */
	version: string;
	/** All registered assets */
	assets: AssetEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All valid asset categories as a readonly array (useful for iteration / validation) */
export const ASSET_CATEGORIES: readonly AssetCategory[] = [
	'animals',
	'numbers',
	'letters',
	'shapes',
	'objects',
	'borders',
	'icons'
] as const;

/** Look up an asset by ID within a manifest */
export function findAsset(manifest: AssetManifest, id: string): AssetEntry | undefined {
	return manifest.assets.find((a) => a.id === id);
}

/** Filter assets by category */
export function filterAssetsByCategory(
	manifest: AssetManifest,
	category: AssetCategory
): AssetEntry[] {
	return manifest.assets.filter((a) => a.category === category);
}

/** Filter assets by tag (matches if any tag in the list is present) */
export function filterAssetsByTag(manifest: AssetManifest, tags: string[]): AssetEntry[] {
	const tagSet = new Set(tags.map((t) => t.toLowerCase()));
	return manifest.assets.filter((a) => a.tags.some((t) => tagSet.has(t.toLowerCase())));
}
