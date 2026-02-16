/**
 * AI-powered SVG asset generator.
 *
 * In the future this will call `/api/asset` to produce SVG artwork via an LLM.
 * For now it returns a simple placeholder SVG so the rest of the pipeline can
 * be developed and tested independently.
 */

export class AssetGenerator {
	/**
	 * Generate an SVG asset matching the given description.
	 *
	 * @param description - A short natural-language description of the desired
	 *   image (e.g. "happy sun with sunglasses").
	 * @returns Raw SVG markup string.
	 */
	async generate(description: string): Promise<string> {
		// TODO: call /api/asset to generate SVG via LLM
		return createPlaceholderSVG(description);
	}
}

/**
 * Create a minimal placeholder SVG that displays the requested label inside
 * a rounded rectangle.  Useful during development while real generation is
 * not yet wired up.
 */
function createPlaceholderSVG(label: string): string {
	// Escape basic XML entities in the label
	const escaped = label
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="90" height="90" rx="10" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
  <text x="50" y="55" text-anchor="middle" font-size="12" fill="#666">${escaped}</text>
</svg>`;
}

export const assetGenerator = new AssetGenerator();
