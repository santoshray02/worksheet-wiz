import type { Worksheet, WorksheetPage, WorksheetSettings } from '$lib/types/worksheet';
import type { ActivityData, Subject } from '$lib/types/activity';
import { defaultWorksheetSettings } from '$lib/types/worksheet';
import { nanoid } from 'nanoid';

const MAX_HISTORY = 50;

/**
 * Deep-clone a worksheet object. Used for history snapshots so that
 * mutations to the live worksheet never corrupt earlier history entries.
 */
function cloneWorksheet(ws: Worksheet): Worksheet {
	return JSON.parse(JSON.stringify(ws));
}

/**
 * Reactive state container for the active worksheet document.
 *
 * Provides full undo/redo support by snapshotting the worksheet into a
 * linear history stack before every mutating operation.
 */
export class WorksheetState {
	// -----------------------------------------------------------------------
	// Reactive properties (Svelte 5 $state rune)
	// -----------------------------------------------------------------------

	worksheet = $state<Worksheet | null>(null);
	history = $state<Worksheet[]>([]);
	historyIndex = $state(-1);
	isDirty = $state(false);

	// -----------------------------------------------------------------------
	// Derived getters
	// -----------------------------------------------------------------------

	get canUndo(): boolean {
		return this.historyIndex > 0;
	}

	get canRedo(): boolean {
		return this.historyIndex < this.history.length - 1;
	}

	get currentPage(): WorksheetPage | null {
		if (!this.worksheet) return null;
		// Expose the first page as the "current" page. The UI state module
		// tracks the active page index and consumers should use that to
		// subscript into `worksheet.pages` when multi-page editing is needed.
		return this.worksheet.pages[0] ?? null;
	}

	get pageCount(): number {
		return this.worksheet?.pages.length ?? 0;
	}

	// -----------------------------------------------------------------------
	// Worksheet lifecycle
	// -----------------------------------------------------------------------

	/**
	 * Create a brand-new, empty worksheet and reset the history stack.
	 */
	createNew(title: string, subject: Subject, ageRange: { min: number; max: number }): void {
		const now = new Date().toISOString();

		const ws: Worksheet = {
			meta: {
				id: nanoid(),
				title,
				subject,
				ageRange,
				createdAt: now,
				updatedAt: now,
				tags: []
			},
			pages: [
				{
					id: nanoid(),
					activities: [],
					layout: 'single'
				}
			],
			settings: defaultWorksheetSettings()
		};

		this.worksheet = ws;
		this.history = [cloneWorksheet(ws)];
		this.historyIndex = 0;
		this.isDirty = false;
	}

	// -----------------------------------------------------------------------
	// Activity mutations
	// -----------------------------------------------------------------------

	/**
	 * Append an activity to the given page.
	 */
	addActivity(pageIndex: number, activity: ActivityData): void {
		if (!this.worksheet) return;
		const page = this.worksheet.pages[pageIndex];
		if (!page) return;

		this.pushHistory();
		page.activities = [...page.activities, activity];
		this.touchUpdated();
	}

	/**
	 * Remove an activity by ID from the given page.
	 */
	removeActivity(pageIndex: number, activityId: string): void {
		if (!this.worksheet) return;
		const page = this.worksheet.pages[pageIndex];
		if (!page) return;

		this.pushHistory();
		page.activities = page.activities.filter((a) => a.id !== activityId);
		this.touchUpdated();
	}

	/**
	 * Partially update an activity's data. The `updates` object is spread
	 * over the existing activity preserving any fields not mentioned.
	 */
	updateActivity(pageIndex: number, activityId: string, updates: Partial<ActivityData>): void {
		if (!this.worksheet) return;
		const page = this.worksheet.pages[pageIndex];
		if (!page) return;

		const idx = page.activities.findIndex((a) => a.id === activityId);
		if (idx === -1) return;

		this.pushHistory();
		page.activities = page.activities.map((a, i) =>
			i === idx ? ({ ...a, ...updates } as ActivityData) : a
		);
		this.touchUpdated();
	}

	// -----------------------------------------------------------------------
	// Page mutations
	// -----------------------------------------------------------------------

	/**
	 * Append a new empty page to the worksheet.
	 */
	addPage(): void {
		if (!this.worksheet) return;

		this.pushHistory();
		this.worksheet.pages = [
			...this.worksheet.pages,
			{
				id: nanoid(),
				activities: [],
				layout: 'single'
			}
		];
		this.touchUpdated();
	}

	/**
	 * Remove a page by index. At least one page must remain.
	 */
	removePage(pageIndex: number): void {
		if (!this.worksheet) return;
		if (this.worksheet.pages.length <= 1) return;
		if (pageIndex < 0 || pageIndex >= this.worksheet.pages.length) return;

		this.pushHistory();
		this.worksheet.pages = this.worksheet.pages.filter((_, i) => i !== pageIndex);
		this.touchUpdated();
	}

	// -----------------------------------------------------------------------
	// Settings
	// -----------------------------------------------------------------------

	/**
	 * Merge partial settings into the current worksheet settings.
	 */
	updateSettings(settings: Partial<WorksheetSettings>): void {
		if (!this.worksheet) return;

		this.pushHistory();
		this.worksheet.settings = { ...this.worksheet.settings, ...settings };
		this.touchUpdated();
	}

	// -----------------------------------------------------------------------
	// History (undo / redo)
	// -----------------------------------------------------------------------

	/**
	 * Snapshot the current worksheet into the history stack. Called
	 * internally before every mutation so the user can revert.
	 */
	private pushHistory(): void {
		if (!this.worksheet) return;

		// Discard any "future" entries when a new change is made after an undo.
		const trimmed = this.history.slice(0, this.historyIndex + 1);
		trimmed.push(cloneWorksheet(this.worksheet));

		// Cap the history length to avoid unbounded memory growth.
		if (trimmed.length > MAX_HISTORY) {
			trimmed.shift();
		}

		this.history = trimmed;
		this.historyIndex = trimmed.length - 1;
		this.isDirty = true;
	}

	/**
	 * Revert the worksheet to the previous history snapshot.
	 */
	undo(): void {
		if (!this.canUndo) return;

		this.historyIndex -= 1;
		this.worksheet = cloneWorksheet(this.history[this.historyIndex]);
	}

	/**
	 * Advance the worksheet to the next history snapshot (after an undo).
	 */
	redo(): void {
		if (!this.canRedo) return;

		this.historyIndex += 1;
		this.worksheet = cloneWorksheet(this.history[this.historyIndex]);
	}

	// -----------------------------------------------------------------------
	// Serialization
	// -----------------------------------------------------------------------

	/**
	 * Serialize the worksheet to a JSON string for persistence.
	 */
	toJSON(): string {
		if (!this.worksheet) return '{}';
		return JSON.stringify(this.worksheet, null, 2);
	}

	/**
	 * Load a worksheet from a JSON string and reset the history stack.
	 */
	loadFromJSON(json: string): void {
		try {
			const parsed: Worksheet = JSON.parse(json);
			this.worksheet = parsed;
			this.history = [cloneWorksheet(parsed)];
			this.historyIndex = 0;
			this.isDirty = false;
		} catch (err) {
			console.error('Failed to load worksheet from JSON:', err);
		}
	}

	// -----------------------------------------------------------------------
	// Private helpers
	// -----------------------------------------------------------------------

	/**
	 * Bump the `updatedAt` timestamp on the worksheet metadata.
	 */
	private touchUpdated(): void {
		if (!this.worksheet) return;
		this.worksheet.meta.updatedAt = new Date().toISOString();
	}
}

export const worksheetState = new WorksheetState();
