export type AssetCategory = 'animals' | 'numbers' | 'letters' | 'shapes' | 'objects' | 'borders' | 'icons' | 'fruits' | 'vegetables' | 'vehicles' | 'instruments' | 'sea-creatures';

export type AssetStyle = 'clean' | 'sketched';

export interface AssetEntry {
	id: string;
	name: string;
	category: AssetCategory;
	tags: string[];
	path: string;
	width: number;
	height: number;
	style?: AssetStyle;
	variant?: string;
}

export interface AssetManifest {
	version: string;
	assets: AssetEntry[];
}
