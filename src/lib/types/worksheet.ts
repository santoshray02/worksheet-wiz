import type { ActivityData, Subject } from './activity';

// ---------------------------------------------------------------------------
// Worksheet metadata
// ---------------------------------------------------------------------------

export interface WorksheetMeta {
	/** Unique identifier for this worksheet */
	id: string;
	/** Display title */
	title: string;
	/** Primary subject area */
	subject: Subject;
	/** Target age range in years */
	ageRange: { min: number; max: number };
	/** ISO 8601 creation timestamp */
	createdAt: string;
	/** ISO 8601 last-modified timestamp */
	updatedAt: string;
	/** Searchable tags */
	tags: string[];
}

// ---------------------------------------------------------------------------
// Page layout
// ---------------------------------------------------------------------------

/** How activities are arranged on a single page */
export type PageLayout = 'single' | 'split-horizontal' | 'split-vertical' | 'grid-2x2';

export interface WorksheetPage {
	/** Unique identifier for this page */
	id: string;
	/** Activities rendered on this page */
	activities: ActivityData[];
	/** Spatial layout of the activities */
	layout: PageLayout;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface WorksheetSettings {
	/** Show a header band at the top of every page */
	showHeader: boolean;
	/** Show a "Name: ___" field */
	showNameField: boolean;
	/** Show a "Date: ___" field */
	showDateField: boolean;
	/** Generate an answer key page at the end */
	showAnswerKey: boolean;
	/** Show a decorative border around each page */
	showBorder: boolean;
	/** Render entirely in grayscale (printer-friendly) */
	grayscale: boolean;
	/** Primary font family used for body text */
	fontFamily: string;
}

// ---------------------------------------------------------------------------
// Top-level worksheet document
// ---------------------------------------------------------------------------

export interface Worksheet {
	/** Metadata about this worksheet */
	meta: WorksheetMeta;
	/** Ordered list of pages */
	pages: WorksheetPage[];
	/** Global rendering settings */
	settings: WorksheetSettings;
}

// ---------------------------------------------------------------------------
// Default settings factory
// ---------------------------------------------------------------------------

/** Returns a fresh WorksheetSettings object with sensible defaults */
export function defaultWorksheetSettings(): WorksheetSettings {
	return {
		showHeader: true,
		showNameField: true,
		showDateField: true,
		showAnswerKey: false,
		showBorder: true,
		grayscale: false,
		fontFamily: 'Comic Neue'
	};
}
