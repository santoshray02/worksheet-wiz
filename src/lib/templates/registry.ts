import type { ActivityType } from '$lib/types/activity';
import type { BaseTemplate } from './base';
import type { WorksheetLayout } from './zones';
import type { DifficultyConfig } from './difficulty';

// ---------------------------------------------------------------------------
// Template factory type
// ---------------------------------------------------------------------------

/** A factory function that creates a concrete template instance */
export type TemplateFactory = (layout: WorksheetLayout, difficulty: DifficultyConfig) => BaseTemplate;

// ---------------------------------------------------------------------------
// TemplateRegistry
// ---------------------------------------------------------------------------

/**
 * Singleton registry that maps activity types to their template factories.
 *
 * Activity modules call `templateRegistry.register(...)` at import time
 * so that the rest of the application can look up and instantiate the
 * appropriate template for any supported activity type.
 */
class TemplateRegistry {
	private factories = new Map<ActivityType, TemplateFactory>();

	/**
	 * Register a template factory for a given activity type.
	 * Overwrites any previously registered factory for the same type.
	 */
	register(type: ActivityType, factory: TemplateFactory): void {
		this.factories.set(type, factory);
	}

	/**
	 * Retrieve the factory for a given activity type, or `undefined`
	 * if no template has been registered for that type.
	 */
	get(type: ActivityType): TemplateFactory | undefined {
		return this.factories.get(type);
	}

	/**
	 * Returns `true` if a template factory has been registered for
	 * the given activity type.
	 */
	has(type: ActivityType): boolean {
		return this.factories.has(type);
	}

	/**
	 * Returns a list of all activity types that currently have a
	 * registered template factory.
	 */
	getAll(): ActivityType[] {
		return Array.from(this.factories.keys());
	}

	/**
	 * Convenience method: look up the factory for `type` and
	 * immediately instantiate a template with the provided layout
	 * and difficulty configuration.
	 *
	 * Throws if no factory is registered for the given type.
	 */
	create(type: ActivityType, layout: WorksheetLayout, difficulty: DifficultyConfig): BaseTemplate {
		const factory = this.factories.get(type);
		if (!factory) {
			throw new Error(
				`No template registered for activity type "${type}". ` +
				`Registered types: ${this.getAll().join(', ') || '(none)'}`
			);
		}
		return factory(layout, difficulty);
	}
}

/** Singleton template registry instance */
export const templateRegistry = new TemplateRegistry();
