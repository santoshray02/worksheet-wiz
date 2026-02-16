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
		{ id: 'icon-arrow-right', name: 'Arrow Right', category: 'icons', tags: ['icon', 'arrow', 'direction', 'next'], path: 'icons/arrow-right.svg', width: 16, height: 16 },

		// =================================================================
		// HAND-SKETCHED VARIANTS (124 assets)
		// =================================================================

		// ── Sketched Animals (30) ────────────────────────────────────
		{ id: 'cat-front-sketched', name: 'Cat (front)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'front'], path: 'sketched/animals/cat-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'cat-side-sketched', name: 'Cat (side)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'side'], path: 'sketched/animals/cat-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'cat-sitting-sketched', name: 'Cat (sitting)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'sitting'], path: 'sketched/animals/cat-sitting.svg', width: 100, height: 100, style: 'sketched', variant: 'sitting' },
		{ id: 'dog-front-sketched', name: 'Dog (front)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'front'], path: 'sketched/animals/dog-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'dog-side-sketched', name: 'Dog (side)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'side'], path: 'sketched/animals/dog-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'dog-running-sketched', name: 'Dog (running)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'running'], path: 'sketched/animals/dog-running.svg', width: 100, height: 100, style: 'sketched', variant: 'running' },
		{ id: 'fish-side-sketched', name: 'Fish (side)', category: 'animals', tags: ['water', 'animal', 'sketched', 'side'], path: 'sketched/animals/fish-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'fish-swimming-sketched', name: 'Fish (swimming)', category: 'animals', tags: ['water', 'animal', 'sketched', 'swimming'], path: 'sketched/animals/fish-swimming.svg', width: 100, height: 100, style: 'sketched', variant: 'swimming' },
		{ id: 'fish-jumping-sketched', name: 'Fish (jumping)', category: 'animals', tags: ['water', 'animal', 'sketched', 'jumping'], path: 'sketched/animals/fish-jumping.svg', width: 100, height: 100, style: 'sketched', variant: 'jumping' },
		{ id: 'bird-front-sketched', name: 'Bird (front)', category: 'animals', tags: ['flying', 'animal', 'sketched', 'front'], path: 'sketched/animals/bird-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'bird-side-sketched', name: 'Bird (side)', category: 'animals', tags: ['flying', 'animal', 'sketched', 'side'], path: 'sketched/animals/bird-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'bird-flying-sketched', name: 'Bird (flying)', category: 'animals', tags: ['flying', 'animal', 'sketched', 'flying'], path: 'sketched/animals/bird-flying.svg', width: 100, height: 100, style: 'sketched', variant: 'flying' },
		{ id: 'elephant-front-sketched', name: 'Elephant (front)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'front'], path: 'sketched/animals/elephant-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'elephant-side-sketched', name: 'Elephant (side)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'side'], path: 'sketched/animals/elephant-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'elephant-walking-sketched', name: 'Elephant (walking)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'walking'], path: 'sketched/animals/elephant-walking.svg', width: 100, height: 100, style: 'sketched', variant: 'walking' },
		{ id: 'lion-front-sketched', name: 'Lion (front)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'front'], path: 'sketched/animals/lion-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'lion-side-sketched', name: 'Lion (side)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'side'], path: 'sketched/animals/lion-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'lion-roaring-sketched', name: 'Lion (roaring)', category: 'animals', tags: ['big', 'animal', 'zoo', 'sketched', 'roaring'], path: 'sketched/animals/lion-roaring.svg', width: 100, height: 100, style: 'sketched', variant: 'roaring' },
		{ id: 'rabbit-front-sketched', name: 'Rabbit (front)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'front'], path: 'sketched/animals/rabbit-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'rabbit-side-sketched', name: 'Rabbit (side)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'side'], path: 'sketched/animals/rabbit-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'rabbit-hopping-sketched', name: 'Rabbit (hopping)', category: 'animals', tags: ['pet', 'animal', 'sketched', 'hopping'], path: 'sketched/animals/rabbit-hopping.svg', width: 100, height: 100, style: 'sketched', variant: 'hopping' },
		{ id: 'butterfly-front-sketched', name: 'Butterfly (front)', category: 'animals', tags: ['insect', 'flying', 'sketched', 'front'], path: 'sketched/animals/butterfly-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'butterfly-side-sketched', name: 'Butterfly (side)', category: 'animals', tags: ['insect', 'flying', 'sketched', 'side'], path: 'sketched/animals/butterfly-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'butterfly-resting-sketched', name: 'Butterfly (resting)', category: 'animals', tags: ['insect', 'flying', 'sketched', 'resting'], path: 'sketched/animals/butterfly-resting.svg', width: 100, height: 100, style: 'sketched', variant: 'resting' },
		{ id: 'frog-front-sketched', name: 'Frog (front)', category: 'animals', tags: ['animal', 'pond', 'sketched', 'front'], path: 'sketched/animals/frog-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'frog-side-sketched', name: 'Frog (side)', category: 'animals', tags: ['animal', 'pond', 'sketched', 'side'], path: 'sketched/animals/frog-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'frog-jumping-sketched', name: 'Frog (jumping)', category: 'animals', tags: ['animal', 'pond', 'sketched', 'jumping'], path: 'sketched/animals/frog-jumping.svg', width: 100, height: 100, style: 'sketched', variant: 'jumping' },
		{ id: 'turtle-front-sketched', name: 'Turtle (front)', category: 'animals', tags: ['animal', 'slow', 'sketched', 'front'], path: 'sketched/animals/turtle-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'turtle-side-sketched', name: 'Turtle (side)', category: 'animals', tags: ['animal', 'slow', 'sketched', 'side'], path: 'sketched/animals/turtle-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'turtle-walking-sketched', name: 'Turtle (walking)', category: 'animals', tags: ['animal', 'slow', 'sketched', 'walking'], path: 'sketched/animals/turtle-walking.svg', width: 100, height: 100, style: 'sketched', variant: 'walking' },

		// ── Sketched Sea Creatures (16) ──────────────────────────────
		{ id: 'whale-side-sketched', name: 'Whale (side)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'side'], path: 'sketched/sea-creatures/whale-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'whale-diving-sketched', name: 'Whale (diving)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'diving'], path: 'sketched/sea-creatures/whale-diving.svg', width: 100, height: 100, style: 'sketched', variant: 'diving' },
		{ id: 'dolphin-side-sketched', name: 'Dolphin (side)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'side'], path: 'sketched/sea-creatures/dolphin-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'dolphin-jumping-sketched', name: 'Dolphin (jumping)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'jumping'], path: 'sketched/sea-creatures/dolphin-jumping.svg', width: 100, height: 100, style: 'sketched', variant: 'jumping' },
		{ id: 'octopus-front-sketched', name: 'Octopus (front)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'front'], path: 'sketched/sea-creatures/octopus-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'octopus-swimming-sketched', name: 'Octopus (swimming)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'swimming'], path: 'sketched/sea-creatures/octopus-swimming.svg', width: 100, height: 100, style: 'sketched', variant: 'swimming' },
		{ id: 'crab-front-sketched', name: 'Crab (front)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'beach', 'sketched', 'front'], path: 'sketched/sea-creatures/crab-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'crab-side-sketched', name: 'Crab (side)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'beach', 'sketched', 'side'], path: 'sketched/sea-creatures/crab-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'seahorse-front-sketched', name: 'Seahorse (front)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'front'], path: 'sketched/sea-creatures/seahorse-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'seahorse-side-sketched', name: 'Seahorse (side)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'side'], path: 'sketched/sea-creatures/seahorse-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'starfish-front-sketched', name: 'Starfish (front)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'beach', 'sketched', 'front'], path: 'sketched/sea-creatures/starfish-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'starfish-tilted-sketched', name: 'Starfish (tilted)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'beach', 'sketched', 'tilted'], path: 'sketched/sea-creatures/starfish-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'jellyfish-front-sketched', name: 'Jellyfish (front)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'front'], path: 'sketched/sea-creatures/jellyfish-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'jellyfish-floating-sketched', name: 'Jellyfish (floating)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'floating'], path: 'sketched/sea-creatures/jellyfish-floating.svg', width: 100, height: 100, style: 'sketched', variant: 'floating' },
		{ id: 'shark-side-sketched', name: 'Shark (side)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'side'], path: 'sketched/sea-creatures/shark-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'shark-attacking-sketched', name: 'Shark (attacking)', category: 'sea-creatures', tags: ['sea', 'animal', 'water', 'sketched', 'attacking'], path: 'sketched/sea-creatures/shark-attacking.svg', width: 100, height: 100, style: 'sketched', variant: 'attacking' },

		// ── Sketched Fruits (12) ─────────────────────────────────────
		{ id: 'apple-whole-sketched', name: 'Apple (whole)', category: 'fruits', tags: ['fruit', 'food', 'red', 'sketched', 'whole'], path: 'sketched/fruits/apple-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'apple-half-sketched', name: 'Apple (half)', category: 'fruits', tags: ['fruit', 'food', 'red', 'sketched', 'half'], path: 'sketched/fruits/apple-half.svg', width: 100, height: 100, style: 'sketched', variant: 'half' },
		{ id: 'banana-whole-sketched', name: 'Banana (whole)', category: 'fruits', tags: ['fruit', 'food', 'yellow', 'sketched', 'whole'], path: 'sketched/fruits/banana-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'banana-peeled-sketched', name: 'Banana (peeled)', category: 'fruits', tags: ['fruit', 'food', 'yellow', 'sketched', 'peeled'], path: 'sketched/fruits/banana-peeled.svg', width: 100, height: 100, style: 'sketched', variant: 'peeled' },
		{ id: 'orange-whole-sketched', name: 'Orange (whole)', category: 'fruits', tags: ['fruit', 'food', 'citrus', 'sketched', 'whole'], path: 'sketched/fruits/orange-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'orange-slice-sketched', name: 'Orange (slice)', category: 'fruits', tags: ['fruit', 'food', 'citrus', 'sketched', 'slice'], path: 'sketched/fruits/orange-slice.svg', width: 100, height: 100, style: 'sketched', variant: 'slice' },
		{ id: 'grapes-bunch-sketched', name: 'Grapes (bunch)', category: 'fruits', tags: ['fruit', 'food', 'purple', 'sketched', 'bunch'], path: 'sketched/fruits/grapes-bunch.svg', width: 100, height: 100, style: 'sketched', variant: 'bunch' },
		{ id: 'grapes-single-sketched', name: 'Grapes (single)', category: 'fruits', tags: ['fruit', 'food', 'purple', 'sketched', 'single'], path: 'sketched/fruits/grapes-single.svg', width: 100, height: 100, style: 'sketched', variant: 'single' },
		{ id: 'strawberry-whole-sketched', name: 'Strawberry (whole)', category: 'fruits', tags: ['fruit', 'food', 'red', 'berry', 'sketched', 'whole'], path: 'sketched/fruits/strawberry-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'strawberry-half-sketched', name: 'Strawberry (half)', category: 'fruits', tags: ['fruit', 'food', 'red', 'berry', 'sketched', 'half'], path: 'sketched/fruits/strawberry-half.svg', width: 100, height: 100, style: 'sketched', variant: 'half' },
		{ id: 'watermelon-whole-sketched', name: 'Watermelon (whole)', category: 'fruits', tags: ['fruit', 'food', 'green', 'red', 'sketched', 'whole'], path: 'sketched/fruits/watermelon-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'watermelon-slice-sketched', name: 'Watermelon (slice)', category: 'fruits', tags: ['fruit', 'food', 'green', 'red', 'sketched', 'slice'], path: 'sketched/fruits/watermelon-slice.svg', width: 100, height: 100, style: 'sketched', variant: 'slice' },

		// ── Sketched Vegetables (16) ─────────────────────────────────
		{ id: 'carrot-whole-sketched', name: 'Carrot (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'orange', 'sketched', 'whole'], path: 'sketched/vegetables/carrot-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'carrot-chopped-sketched', name: 'Carrot (chopped)', category: 'vegetables', tags: ['vegetable', 'food', 'orange', 'sketched', 'chopped'], path: 'sketched/vegetables/carrot-chopped.svg', width: 100, height: 100, style: 'sketched', variant: 'chopped' },
		{ id: 'broccoli-whole-sketched', name: 'Broccoli (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'green', 'sketched', 'whole'], path: 'sketched/vegetables/broccoli-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'broccoli-floret-sketched', name: 'Broccoli (floret)', category: 'vegetables', tags: ['vegetable', 'food', 'green', 'sketched', 'floret'], path: 'sketched/vegetables/broccoli-floret.svg', width: 100, height: 100, style: 'sketched', variant: 'floret' },
		{ id: 'tomato-whole-sketched', name: 'Tomato (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'red', 'sketched', 'whole'], path: 'sketched/vegetables/tomato-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'tomato-slice-sketched', name: 'Tomato (slice)', category: 'vegetables', tags: ['vegetable', 'food', 'red', 'sketched', 'slice'], path: 'sketched/vegetables/tomato-slice.svg', width: 100, height: 100, style: 'sketched', variant: 'slice' },
		{ id: 'corn-whole-sketched', name: 'Corn (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'yellow', 'sketched', 'whole'], path: 'sketched/vegetables/corn-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'corn-cob-sketched', name: 'Corn (cob)', category: 'vegetables', tags: ['vegetable', 'food', 'yellow', 'sketched', 'cob'], path: 'sketched/vegetables/corn-cob.svg', width: 100, height: 100, style: 'sketched', variant: 'cob' },
		{ id: 'peas-pod-sketched', name: 'Peas (pod)', category: 'vegetables', tags: ['vegetable', 'food', 'green', 'sketched', 'pod'], path: 'sketched/vegetables/peas-pod.svg', width: 100, height: 100, style: 'sketched', variant: 'pod' },
		{ id: 'peas-open-sketched', name: 'Peas (open)', category: 'vegetables', tags: ['vegetable', 'food', 'green', 'sketched', 'open'], path: 'sketched/vegetables/peas-open.svg', width: 100, height: 100, style: 'sketched', variant: 'open' },
		{ id: 'potato-whole-sketched', name: 'Potato (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'brown', 'sketched', 'whole'], path: 'sketched/vegetables/potato-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'potato-half-sketched', name: 'Potato (half)', category: 'vegetables', tags: ['vegetable', 'food', 'brown', 'sketched', 'half'], path: 'sketched/vegetables/potato-half.svg', width: 100, height: 100, style: 'sketched', variant: 'half' },
		{ id: 'onion-whole-sketched', name: 'Onion (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'purple', 'sketched', 'whole'], path: 'sketched/vegetables/onion-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'onion-slice-sketched', name: 'Onion (slice)', category: 'vegetables', tags: ['vegetable', 'food', 'purple', 'sketched', 'slice'], path: 'sketched/vegetables/onion-slice.svg', width: 100, height: 100, style: 'sketched', variant: 'slice' },
		{ id: 'mushroom-whole-sketched', name: 'Mushroom (whole)', category: 'vegetables', tags: ['vegetable', 'food', 'sketched', 'whole'], path: 'sketched/vegetables/mushroom-whole.svg', width: 100, height: 100, style: 'sketched', variant: 'whole' },
		{ id: 'mushroom-side-sketched', name: 'Mushroom (side)', category: 'vegetables', tags: ['vegetable', 'food', 'sketched', 'side'], path: 'sketched/vegetables/mushroom-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },

		// ── Sketched Vehicles (18) ───────────────────────────────────
		{ id: 'car-side-sketched', name: 'Car (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'side'], path: 'sketched/vehicles/car-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'car-front-sketched', name: 'Car (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'front'], path: 'sketched/vehicles/car-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'bus-side-sketched', name: 'Bus (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'side'], path: 'sketched/vehicles/bus-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'bus-front-sketched', name: 'Bus (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'front'], path: 'sketched/vehicles/bus-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'truck-side-sketched', name: 'Truck (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'side'], path: 'sketched/vehicles/truck-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'truck-front-sketched', name: 'Truck (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'sketched', 'front'], path: 'sketched/vehicles/truck-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'airplane-side-sketched', name: 'Airplane (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'flying', 'sketched', 'side'], path: 'sketched/vehicles/airplane-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'airplane-top-sketched', name: 'Airplane (top)', category: 'vehicles', tags: ['vehicle', 'transport', 'flying', 'sketched', 'top'], path: 'sketched/vehicles/airplane-top.svg', width: 100, height: 100, style: 'sketched', variant: 'top' },
		{ id: 'boat-side-sketched', name: 'Boat (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'water', 'sketched', 'side'], path: 'sketched/vehicles/boat-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'boat-front-sketched', name: 'Boat (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'water', 'sketched', 'front'], path: 'sketched/vehicles/boat-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'bicycle-side-sketched', name: 'Bicycle (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'sport', 'sketched', 'side'], path: 'sketched/vehicles/bicycle-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'bicycle-front-sketched', name: 'Bicycle (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'sport', 'sketched', 'front'], path: 'sketched/vehicles/bicycle-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'helicopter-side-sketched', name: 'Helicopter (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'flying', 'sketched', 'side'], path: 'sketched/vehicles/helicopter-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'helicopter-front-sketched', name: 'Helicopter (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'flying', 'sketched', 'front'], path: 'sketched/vehicles/helicopter-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'train-side-sketched', name: 'Train (side)', category: 'vehicles', tags: ['vehicle', 'transport', 'rail', 'sketched', 'side'], path: 'sketched/vehicles/train-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'train-front-sketched', name: 'Train (front)', category: 'vehicles', tags: ['vehicle', 'transport', 'rail', 'sketched', 'front'], path: 'sketched/vehicles/train-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'rocket-side-sketched', name: 'Rocket (side)', category: 'vehicles', tags: ['vehicle', 'space', 'flying', 'sketched', 'side'], path: 'sketched/vehicles/rocket-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'rocket-launching-sketched', name: 'Rocket (launching)', category: 'vehicles', tags: ['vehicle', 'space', 'flying', 'sketched', 'launching'], path: 'sketched/vehicles/rocket-launching.svg', width: 100, height: 100, style: 'sketched', variant: 'launching' },

		// ── Sketched Instruments (16) ────────────────────────────────
		{ id: 'guitar-front-sketched', name: 'Guitar (front)', category: 'instruments', tags: ['music', 'instrument', 'string', 'sketched', 'front'], path: 'sketched/instruments/guitar-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'guitar-tilted-sketched', name: 'Guitar (tilted)', category: 'instruments', tags: ['music', 'instrument', 'string', 'sketched', 'tilted'], path: 'sketched/instruments/guitar-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'piano-front-sketched', name: 'Piano (front)', category: 'instruments', tags: ['music', 'instrument', 'keys', 'sketched', 'front'], path: 'sketched/instruments/piano-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'piano-side-sketched', name: 'Piano (side)', category: 'instruments', tags: ['music', 'instrument', 'keys', 'sketched', 'side'], path: 'sketched/instruments/piano-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'drum-front-sketched', name: 'Drum (front)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'front'], path: 'sketched/instruments/drum-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'drum-side-sketched', name: 'Drum (side)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'side'], path: 'sketched/instruments/drum-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'trumpet-side-sketched', name: 'Trumpet (side)', category: 'instruments', tags: ['music', 'instrument', 'brass', 'sketched', 'side'], path: 'sketched/instruments/trumpet-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'trumpet-tilted-sketched', name: 'Trumpet (tilted)', category: 'instruments', tags: ['music', 'instrument', 'brass', 'sketched', 'tilted'], path: 'sketched/instruments/trumpet-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'violin-front-sketched', name: 'Violin (front)', category: 'instruments', tags: ['music', 'instrument', 'string', 'sketched', 'front'], path: 'sketched/instruments/violin-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'violin-tilted-sketched', name: 'Violin (tilted)', category: 'instruments', tags: ['music', 'instrument', 'string', 'sketched', 'tilted'], path: 'sketched/instruments/violin-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'flute-side-sketched', name: 'Flute (side)', category: 'instruments', tags: ['music', 'instrument', 'wind', 'sketched', 'side'], path: 'sketched/instruments/flute-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'flute-tilted-sketched', name: 'Flute (tilted)', category: 'instruments', tags: ['music', 'instrument', 'wind', 'sketched', 'tilted'], path: 'sketched/instruments/flute-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'tambourine-front-sketched', name: 'Tambourine (front)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'front'], path: 'sketched/instruments/tambourine-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'tambourine-tilted-sketched', name: 'Tambourine (tilted)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'tilted'], path: 'sketched/instruments/tambourine-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },
		{ id: 'xylophone-front-sketched', name: 'Xylophone (front)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'front'], path: 'sketched/instruments/xylophone-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'xylophone-tilted-sketched', name: 'Xylophone (tilted)', category: 'instruments', tags: ['music', 'instrument', 'percussion', 'sketched', 'tilted'], path: 'sketched/instruments/xylophone-tilted.svg', width: 100, height: 100, style: 'sketched', variant: 'tilted' },

		// ── Sketched Objects (16) ────────────────────────────────────
		{ id: 'ball-plain-sketched', name: 'Ball (plain)', category: 'objects', tags: ['toy', 'round', 'sport', 'sketched', 'plain'], path: 'sketched/objects/ball-plain.svg', width: 100, height: 100, style: 'sketched', variant: 'plain' },
		{ id: 'ball-bouncing-sketched', name: 'Ball (bouncing)', category: 'objects', tags: ['toy', 'round', 'sport', 'sketched', 'bouncing'], path: 'sketched/objects/ball-bouncing.svg', width: 100, height: 100, style: 'sketched', variant: 'bouncing' },
		{ id: 'house-front-sketched', name: 'House (front)', category: 'objects', tags: ['building', 'home', 'sketched', 'front'], path: 'sketched/objects/house-front.svg', width: 100, height: 100, style: 'sketched', variant: 'front' },
		{ id: 'house-side-sketched', name: 'House (side)', category: 'objects', tags: ['building', 'home', 'sketched', 'side'], path: 'sketched/objects/house-side.svg', width: 100, height: 100, style: 'sketched', variant: 'side' },
		{ id: 'tree-summer-sketched', name: 'Tree (summer)', category: 'objects', tags: ['plant', 'nature', 'green', 'sketched', 'summer'], path: 'sketched/objects/tree-summer.svg', width: 100, height: 100, style: 'sketched', variant: 'summer' },
		{ id: 'tree-winter-sketched', name: 'Tree (winter)', category: 'objects', tags: ['plant', 'nature', 'sketched', 'winter'], path: 'sketched/objects/tree-winter.svg', width: 100, height: 100, style: 'sketched', variant: 'winter' },
		{ id: 'flower-bloom-sketched', name: 'Flower (bloom)', category: 'objects', tags: ['plant', 'nature', 'garden', 'sketched', 'bloom'], path: 'sketched/objects/flower-bloom.svg', width: 100, height: 100, style: 'sketched', variant: 'bloom' },
		{ id: 'flower-bud-sketched', name: 'Flower (bud)', category: 'objects', tags: ['plant', 'nature', 'garden', 'sketched', 'bud'], path: 'sketched/objects/flower-bud.svg', width: 100, height: 100, style: 'sketched', variant: 'bud' },
		{ id: 'sun-happy-sketched', name: 'Sun (happy)', category: 'objects', tags: ['sky', 'weather', 'bright', 'sketched', 'happy'], path: 'sketched/objects/sun-happy.svg', width: 100, height: 100, style: 'sketched', variant: 'happy' },
		{ id: 'sun-setting-sketched', name: 'Sun (setting)', category: 'objects', tags: ['sky', 'weather', 'bright', 'sketched', 'setting'], path: 'sketched/objects/sun-setting.svg', width: 100, height: 100, style: 'sketched', variant: 'setting' },
		{ id: 'moon-crescent-sketched', name: 'Moon (crescent)', category: 'objects', tags: ['sky', 'night', 'space', 'sketched', 'crescent'], path: 'sketched/objects/moon-crescent.svg', width: 100, height: 100, style: 'sketched', variant: 'crescent' },
		{ id: 'moon-full-sketched', name: 'Moon (full)', category: 'objects', tags: ['sky', 'night', 'space', 'sketched', 'full'], path: 'sketched/objects/moon-full.svg', width: 100, height: 100, style: 'sketched', variant: 'full' },
		{ id: 'book-closed-sketched', name: 'Book (closed)', category: 'objects', tags: ['reading', 'school', 'education', 'sketched', 'closed'], path: 'sketched/objects/book-closed.svg', width: 100, height: 100, style: 'sketched', variant: 'closed' },
		{ id: 'book-open-sketched', name: 'Book (open)', category: 'objects', tags: ['reading', 'school', 'education', 'sketched', 'open'], path: 'sketched/objects/book-open.svg', width: 100, height: 100, style: 'sketched', variant: 'open' },
		{ id: 'pencil-straight-sketched', name: 'Pencil (straight)', category: 'objects', tags: ['writing', 'school', 'education', 'sketched', 'straight'], path: 'sketched/objects/pencil-straight.svg', width: 100, height: 100, style: 'sketched', variant: 'straight' },
		{ id: 'pencil-writing-sketched', name: 'Pencil (writing)', category: 'objects', tags: ['writing', 'school', 'education', 'sketched', 'writing'], path: 'sketched/objects/pencil-writing.svg', width: 100, height: 100, style: 'sketched', variant: 'writing' }
	];
}

// -------------------------------------------------------------------------
// Singleton
// -------------------------------------------------------------------------

export const assetLibrary = new AssetLibrary();
