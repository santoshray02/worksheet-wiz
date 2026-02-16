/**
 * Asset library — the central catalog of all SVG assets available for use in
 * worksheets.
 *
 * The library is populated from a hardcoded default manifest on first load.
 * In the future this will be augmented by fetching a server-side
 * `manifest.json` and by user-uploaded or AI-generated assets.
 */

import type { AssetEntry, AssetCategory, AssetStyle } from './types';

// -------------------------------------------------------------------------
// AssetLibrary class
// -------------------------------------------------------------------------

export class AssetLibrary {
	private assets: AssetEntry[] = [];
	private loaded = false;

	/**
	 * Initialise the library.  Safe to call multiple times — subsequent calls
	 * are no-ops.
	 */
	async load(): Promise<void> {
		if (this.loaded) return;

		// In the future we can try fetching /assets/svg/manifest.json first
		// and fall back to the built-in list on failure.
		this.assets = getDefaultAssets();
		this.loaded = true;
	}

	/** Return every asset in the catalog. */
	getAll(): AssetEntry[] {
		return this.assets;
	}

	/** Look up a single asset by its unique `id`. */
	getById(id: string): AssetEntry | undefined {
		return this.assets.find((a) => a.id === id);
	}

	/**
	 * Resolve an asset ID from various formats the LLM might produce.
	 * Handles: exact match, `{category}-{name}` (e.g. "animal-cat" → "cat"),
	 * and fuzzy name matching as a last resort.
	 *
	 * When `preferStyle` is set, returns a matching asset in that style if
	 * available, otherwise falls back to any style.
	 */
	resolve(id: string, preferStyle?: AssetStyle): AssetEntry | undefined {
		if (!id) return undefined;

		// 1. Exact match
		const exact = this.getById(id);
		if (exact) {
			if (preferStyle) {
				const styled = this.findStyledVariant(exact, preferStyle);
				if (styled) return styled;
			}
			return exact;
		}

		// 2. Strip common category prefixes: "animal-cat" → "cat"
		const stripped = id.replace(/^(animal|object|shape|fruit|vegetable|vehicle|instrument|sea-creature|icon|number|letter)s?-/, '');
		const byStripped = this.getById(stripped);
		if (byStripped) {
			if (preferStyle) {
				const styled = this.findStyledVariant(byStripped, preferStyle);
				if (styled) return styled;
			}
			return byStripped;
		}

		// 3. Match by name (case-insensitive)
		const lower = stripped.toLowerCase();
		const byName = this.assets.find((a) => a.name.toLowerCase() === lower);
		if (byName) {
			if (preferStyle) {
				const styled = this.findStyledVariant(byName, preferStyle);
				if (styled) return styled;
			}
			return byName;
		}

		return undefined;
	}

	/**
	 * Get all variants (poses/angles) for a base asset in a given style.
	 * E.g. getVariants('cat', 'sketched') returns cat-front, cat-side, cat-sitting.
	 */
	getVariants(baseId: string, style?: AssetStyle): AssetEntry[] {
		const prefix = baseId.replace(/-sketched$/, '').replace(/-(front|side|back|sitting|running|jumping|flying|walking|hopping|roaring|resting|swimming|diving|attacking|floating|tilted|whole|half|slice|peeled|bunch|single|chopped|floret|cob|pod|open|top|launching|plain|bouncing|summer|winter|bloom|bud|happy|setting|crescent|full|closed|writing|straight)$/, '');
		return this.assets.filter((a) => {
			const matchesBase = a.id.startsWith(prefix + '-') || a.id === prefix;
			const matchesStyle = !style || (a.style ?? 'clean') === style;
			return matchesBase && matchesStyle;
		});
	}

	/**
	 * Find a variant of an asset in the preferred style.
	 */
	private findStyledVariant(asset: AssetEntry, style: AssetStyle): AssetEntry | undefined {
		// Extract base name (without variant suffix)
		const baseId = asset.id.replace(/-(front|side|back|sitting|running|jumping|flying|walking|hopping|roaring|resting|swimming|diving|attacking|floating|tilted|whole|half|slice|peeled|bunch|single|chopped|floret|cob|pod|open|top|launching|plain|bouncing|summer|winter|bloom|bud|happy|setting|crescent|full|closed|writing|straight)$/, '');

		// Look for any matching asset with the preferred style
		return this.assets.find((a) =>
			(a.style ?? 'clean') === style &&
			(a.id.startsWith(baseId + '-') || a.id === baseId)
		);
	}

	/** Return all assets belonging to the given category. */
	getByCategory(category: AssetCategory): AssetEntry[] {
		return this.assets.filter((a) => a.category === category);
	}

	/**
	 * Free-text search across asset names and tags (case-insensitive).
	 */
	search(query: string): AssetEntry[] {
		const q = query.toLowerCase().trim();
		if (!q) return [];
		return this.assets.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				a.tags.some((t) => t.toLowerCase().includes(q))
		);
	}

	/**
	 * Return assets that match **any** of the provided tags.
	 */
	getByTags(tags: string[]): AssetEntry[] {
		const lower = tags.map((t) => t.toLowerCase());
		return this.assets.filter((a) =>
			a.tags.some((t) => lower.includes(t.toLowerCase()))
		);
	}

	/** Return the sorted list of distinct categories present in the catalog. */
	getCategories(): AssetCategory[] {
		const cats = new Set<AssetCategory>(this.assets.map((a) => a.category));
		return [...cats].sort();
	}

	/**
	 * Build the public URL for a given asset (relative to the site root).
	 */
	getAssetUrl(asset: AssetEntry): string {
		return `/assets/svg/${asset.path}`;
	}
}

// -------------------------------------------------------------------------
// Default built-in asset catalog (50+ entries)
// -------------------------------------------------------------------------

function getDefaultAssets(): AssetEntry[] {
	return [
		// ── Animals (10) ───────────────────────────────────────────────
		{ id: 'cat', name: 'Cat', category: 'animals', tags: ['pet', 'animal'], path: 'animals/cat.svg', width: 20, height: 20 },
		{ id: 'dog', name: 'Dog', category: 'animals', tags: ['pet', 'animal'], path: 'animals/dog.svg', width: 20, height: 20 },
		{ id: 'fish', name: 'Fish', category: 'animals', tags: ['water', 'animal'], path: 'animals/fish.svg', width: 20, height: 15 },
		{ id: 'bird', name: 'Bird', category: 'animals', tags: ['flying', 'animal'], path: 'animals/bird.svg', width: 18, height: 15 },
		{ id: 'elephant', name: 'Elephant', category: 'animals', tags: ['big', 'animal', 'zoo'], path: 'animals/elephant.svg', width: 25, height: 20 },
		{ id: 'lion', name: 'Lion', category: 'animals', tags: ['big', 'animal', 'zoo'], path: 'animals/lion.svg', width: 22, height: 20 },
		{ id: 'rabbit', name: 'Rabbit', category: 'animals', tags: ['pet', 'animal'], path: 'animals/rabbit.svg', width: 15, height: 18 },
		{ id: 'butterfly', name: 'Butterfly', category: 'animals', tags: ['insect', 'flying'], path: 'animals/butterfly.svg', width: 20, height: 15 },
		{ id: 'frog', name: 'Frog', category: 'animals', tags: ['animal', 'pond'], path: 'animals/frog.svg', width: 18, height: 15 },
		{ id: 'turtle', name: 'Turtle', category: 'animals', tags: ['animal', 'slow'], path: 'animals/turtle.svg', width: 20, height: 15 },

		// ── Numbers 0-9 (10) ───────────────────────────────────────────
		{ id: 'num-0', name: '0', category: 'numbers', tags: ['number', 'zero', 'digit'], path: 'numbers/0.svg', width: 15, height: 20 },
		{ id: 'num-1', name: '1', category: 'numbers', tags: ['number', 'one', 'digit'], path: 'numbers/1.svg', width: 15, height: 20 },
		{ id: 'num-2', name: '2', category: 'numbers', tags: ['number', 'two', 'digit'], path: 'numbers/2.svg', width: 15, height: 20 },
		{ id: 'num-3', name: '3', category: 'numbers', tags: ['number', 'three', 'digit'], path: 'numbers/3.svg', width: 15, height: 20 },
		{ id: 'num-4', name: '4', category: 'numbers', tags: ['number', 'four', 'digit'], path: 'numbers/4.svg', width: 15, height: 20 },
		{ id: 'num-5', name: '5', category: 'numbers', tags: ['number', 'five', 'digit'], path: 'numbers/5.svg', width: 15, height: 20 },
		{ id: 'num-6', name: '6', category: 'numbers', tags: ['number', 'six', 'digit'], path: 'numbers/6.svg', width: 15, height: 20 },
		{ id: 'num-7', name: '7', category: 'numbers', tags: ['number', 'seven', 'digit'], path: 'numbers/7.svg', width: 15, height: 20 },
		{ id: 'num-8', name: '8', category: 'numbers', tags: ['number', 'eight', 'digit'], path: 'numbers/8.svg', width: 15, height: 20 },
		{ id: 'num-9', name: '9', category: 'numbers', tags: ['number', 'nine', 'digit'], path: 'numbers/9.svg', width: 15, height: 20 },

		// ── Letters (8 representative) ─────────────────────────────────
		{ id: 'letter-a', name: 'A', category: 'letters', tags: ['letter', 'vowel', 'alphabet'], path: 'letters/a.svg', width: 15, height: 20 },
		{ id: 'letter-b', name: 'B', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/b.svg', width: 15, height: 20 },
		{ id: 'letter-c', name: 'C', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/c.svg', width: 15, height: 20 },
		{ id: 'letter-d', name: 'D', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/d.svg', width: 15, height: 20 },
		{ id: 'letter-e', name: 'E', category: 'letters', tags: ['letter', 'vowel', 'alphabet'], path: 'letters/e.svg', width: 15, height: 20 },
		{ id: 'letter-m', name: 'M', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/m.svg', width: 15, height: 20 },
		{ id: 'letter-s', name: 'S', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/s.svg', width: 15, height: 20 },
		{ id: 'letter-z', name: 'Z', category: 'letters', tags: ['letter', 'consonant', 'alphabet'], path: 'letters/z.svg', width: 15, height: 20 },

		// ── Shapes (6) ─────────────────────────────────────────────────
		{ id: 'circle', name: 'Circle', category: 'shapes', tags: ['shape', 'round'], path: 'shapes/circle.svg', width: 20, height: 20 },
		{ id: 'triangle', name: 'Triangle', category: 'shapes', tags: ['shape', 'polygon'], path: 'shapes/triangle.svg', width: 20, height: 18 },
		{ id: 'square', name: 'Square', category: 'shapes', tags: ['shape', 'polygon', 'rectangle'], path: 'shapes/square.svg', width: 20, height: 20 },
		{ id: 'star', name: 'Star', category: 'shapes', tags: ['shape', 'pointy'], path: 'shapes/star.svg', width: 20, height: 20 },
		{ id: 'heart', name: 'Heart', category: 'shapes', tags: ['shape', 'love'], path: 'shapes/heart.svg', width: 20, height: 18 },
		{ id: 'diamond', name: 'Diamond', category: 'shapes', tags: ['shape', 'polygon', 'rhombus'], path: 'shapes/diamond.svg', width: 18, height: 20 },

		// ── Objects (10) ───────────────────────────────────────────────
		{ id: 'apple', name: 'Apple', category: 'objects', tags: ['fruit', 'food', 'red'], path: 'objects/apple.svg', width: 18, height: 20 },
		{ id: 'ball', name: 'Ball', category: 'objects', tags: ['toy', 'round', 'sport'], path: 'objects/ball.svg', width: 20, height: 20 },
		{ id: 'house', name: 'House', category: 'objects', tags: ['building', 'home'], path: 'objects/house.svg', width: 22, height: 20 },
		{ id: 'tree', name: 'Tree', category: 'objects', tags: ['plant', 'nature', 'green'], path: 'objects/tree.svg', width: 18, height: 22 },
		{ id: 'flower', name: 'Flower', category: 'objects', tags: ['plant', 'nature', 'garden'], path: 'objects/flower.svg', width: 18, height: 20 },
		{ id: 'sun', name: 'Sun', category: 'objects', tags: ['sky', 'weather', 'bright'], path: 'objects/sun.svg', width: 20, height: 20 },
		{ id: 'moon', name: 'Moon', category: 'objects', tags: ['sky', 'night', 'space'], path: 'objects/moon.svg', width: 18, height: 20 },
		{ id: 'car', name: 'Car', category: 'objects', tags: ['vehicle', 'transport'], path: 'objects/car.svg', width: 24, height: 15 },
		{ id: 'book', name: 'Book', category: 'objects', tags: ['reading', 'school', 'education'], path: 'objects/book.svg', width: 18, height: 20 },
		{ id: 'pencil-obj', name: 'Pencil', category: 'objects', tags: ['writing', 'school', 'education'], path: 'objects/pencil.svg', width: 8, height: 22 },

		// ── Fruits (5) ────────────────────────────────────────────────
		{ id: 'banana', name: 'Banana', category: 'objects', tags: ['fruit', 'food', 'yellow'], path: 'objects/banana.svg', width: 20, height: 18 },
		{ id: 'orange', name: 'Orange', category: 'objects', tags: ['fruit', 'food', 'citrus'], path: 'objects/orange.svg', width: 20, height: 20 },
		{ id: 'grapes', name: 'Grapes', category: 'objects', tags: ['fruit', 'food', 'purple'], path: 'objects/grapes.svg', width: 18, height: 20 },
		{ id: 'strawberry', name: 'Strawberry', category: 'objects', tags: ['fruit', 'food', 'red', 'berry'], path: 'objects/strawberry.svg', width: 16, height: 20 },
		{ id: 'watermelon', name: 'Watermelon', category: 'objects', tags: ['fruit', 'food', 'green', 'red'], path: 'objects/watermelon.svg', width: 22, height: 18 },

		// ── Vegetables (8) ────────────────────────────────────────────
		{ id: 'carrot', name: 'Carrot', category: 'objects', tags: ['vegetable', 'food', 'orange'], path: 'objects/carrot.svg', width: 16, height: 22 },
		{ id: 'broccoli', name: 'Broccoli', category: 'objects', tags: ['vegetable', 'food', 'green'], path: 'objects/broccoli.svg', width: 18, height: 20 },
		{ id: 'tomato', name: 'Tomato', category: 'objects', tags: ['vegetable', 'food', 'red'], path: 'objects/tomato.svg', width: 20, height: 20 },
		{ id: 'corn', name: 'Corn', category: 'objects', tags: ['vegetable', 'food', 'yellow'], path: 'objects/corn.svg', width: 14, height: 22 },
		{ id: 'peas', name: 'Peas', category: 'objects', tags: ['vegetable', 'food', 'green'], path: 'objects/peas.svg', width: 22, height: 14 },
		{ id: 'potato', name: 'Potato', category: 'objects', tags: ['vegetable', 'food', 'brown'], path: 'objects/potato.svg', width: 20, height: 16 },
		{ id: 'onion', name: 'Onion', category: 'objects', tags: ['vegetable', 'food', 'purple'], path: 'objects/onion.svg', width: 18, height: 20 },
		{ id: 'mushroom', name: 'Mushroom', category: 'objects', tags: ['vegetable', 'food', 'red'], path: 'objects/mushroom.svg', width: 18, height: 20 },

		// ── Vehicles (8) ──────────────────────────────────────────────
		{ id: 'bus', name: 'Bus', category: 'objects', tags: ['vehicle', 'transport', 'yellow'], path: 'objects/bus.svg', width: 24, height: 16 },
		{ id: 'truck', name: 'Truck', category: 'objects', tags: ['vehicle', 'transport', 'blue'], path: 'objects/truck.svg', width: 24, height: 16 },
		{ id: 'airplane', name: 'Airplane', category: 'objects', tags: ['vehicle', 'transport', 'flying'], path: 'objects/airplane.svg', width: 22, height: 18 },
		{ id: 'boat', name: 'Boat', category: 'objects', tags: ['vehicle', 'transport', 'water'], path: 'objects/boat.svg', width: 22, height: 18 },
		{ id: 'bicycle', name: 'Bicycle', category: 'objects', tags: ['vehicle', 'transport', 'sport'], path: 'objects/bicycle.svg', width: 22, height: 18 },
		{ id: 'helicopter', name: 'Helicopter', category: 'objects', tags: ['vehicle', 'transport', 'flying'], path: 'objects/helicopter.svg', width: 24, height: 16 },
		{ id: 'train', name: 'Train', category: 'objects', tags: ['vehicle', 'transport', 'rail'], path: 'objects/train.svg', width: 24, height: 16 },
		{ id: 'rocket', name: 'Rocket', category: 'objects', tags: ['vehicle', 'space', 'flying'], path: 'objects/rocket.svg', width: 14, height: 24 },

		// ── Sea Creatures (8) ─────────────────────────────────────────
		{ id: 'whale', name: 'Whale', category: 'animals', tags: ['sea', 'animal', 'water', 'big'], path: 'animals/whale.svg', width: 24, height: 16 },
		{ id: 'dolphin', name: 'Dolphin', category: 'animals', tags: ['sea', 'animal', 'water'], path: 'animals/dolphin.svg', width: 22, height: 16 },
		{ id: 'octopus', name: 'Octopus', category: 'animals', tags: ['sea', 'animal', 'water'], path: 'animals/octopus.svg', width: 20, height: 20 },
		{ id: 'crab', name: 'Crab', category: 'animals', tags: ['sea', 'animal', 'water', 'beach'], path: 'animals/crab.svg', width: 22, height: 16 },
		{ id: 'seahorse', name: 'Seahorse', category: 'animals', tags: ['sea', 'animal', 'water'], path: 'animals/seahorse.svg', width: 14, height: 22 },
		{ id: 'starfish', name: 'Starfish', category: 'animals', tags: ['sea', 'animal', 'water', 'beach'], path: 'animals/starfish.svg', width: 20, height: 20 },
		{ id: 'jellyfish', name: 'Jellyfish', category: 'animals', tags: ['sea', 'animal', 'water'], path: 'animals/jellyfish.svg', width: 16, height: 22 },
		{ id: 'shark', name: 'Shark', category: 'animals', tags: ['sea', 'animal', 'water', 'big'], path: 'animals/shark.svg', width: 24, height: 16 },

		// ── Musical Instruments (8) ───────────────────────────────────
		{ id: 'guitar', name: 'Guitar', category: 'objects', tags: ['music', 'instrument', 'string'], path: 'objects/guitar.svg', width: 14, height: 24 },
		{ id: 'piano', name: 'Piano', category: 'objects', tags: ['music', 'instrument', 'keys'], path: 'objects/piano.svg', width: 22, height: 16 },
		{ id: 'drum', name: 'Drum', category: 'objects', tags: ['music', 'instrument', 'percussion'], path: 'objects/drum.svg', width: 20, height: 18 },
		{ id: 'trumpet', name: 'Trumpet', category: 'objects', tags: ['music', 'instrument', 'brass'], path: 'objects/trumpet.svg', width: 22, height: 16 },
		{ id: 'violin', name: 'Violin', category: 'objects', tags: ['music', 'instrument', 'string'], path: 'objects/violin.svg', width: 14, height: 22 },
		{ id: 'flute', name: 'Flute', category: 'objects', tags: ['music', 'instrument', 'wind'], path: 'objects/flute.svg', width: 22, height: 8 },
		{ id: 'tambourine', name: 'Tambourine', category: 'objects', tags: ['music', 'instrument', 'percussion'], path: 'objects/tambourine.svg', width: 20, height: 20 },
		{ id: 'xylophone', name: 'Xylophone', category: 'objects', tags: ['music', 'instrument', 'percussion'], path: 'objects/xylophone.svg', width: 22, height: 16 },

		// ── Borders (3) ────────────────────────────────────────────────
		{ id: 'border-simple', name: 'Simple Border', category: 'borders', tags: ['border', 'frame', 'line'], path: 'borders/simple.svg', width: 210, height: 297 },
		{ id: 'border-wavy', name: 'Wavy Border', category: 'borders', tags: ['border', 'frame', 'wavy'], path: 'borders/wavy.svg', width: 210, height: 297 },
		{ id: 'border-dotted', name: 'Dotted Border', category: 'borders', tags: ['border', 'frame', 'dotted'], path: 'borders/dotted.svg', width: 210, height: 297 },

		// ── Icons (5) ──────────────────────────────────────────────────
		{ id: 'icon-checkmark', name: 'Checkmark', category: 'icons', tags: ['icon', 'check', 'correct', 'yes'], path: 'icons/checkmark.svg', width: 16, height: 16 },
		{ id: 'icon-pencil', name: 'Pencil Icon', category: 'icons', tags: ['icon', 'write', 'edit'], path: 'icons/pencil.svg', width: 16, height: 16 },
		{ id: 'icon-scissors', name: 'Scissors', category: 'icons', tags: ['icon', 'cut', 'craft'], path: 'icons/scissors.svg', width: 16, height: 16 },
		{ id: 'icon-star-outline', name: 'Star Outline', category: 'icons', tags: ['icon', 'star', 'favorite'], path: 'icons/star-outline.svg', width: 16, height: 16 },
		{ id: 'icon-arrow-right', name: 'Arrow Right', category: 'icons', tags: ['icon', 'arrow', 'direction', 'next'], path: 'icons/arrow-right.svg', width: 16, height: 16 }
	];
}

// -------------------------------------------------------------------------
// Singleton
// -------------------------------------------------------------------------

export const assetLibrary = new AssetLibrary();
