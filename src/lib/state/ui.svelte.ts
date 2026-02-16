// ---------------------------------------------------------------------------
// Tool and panel types
// ---------------------------------------------------------------------------

export type Tool = 'select' | 'move' | 'text' | 'asset';
export type SidebarPanel = 'activities' | 'assets' | 'properties' | 'none';

// ---------------------------------------------------------------------------
// Zoom constraints
// ---------------------------------------------------------------------------

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * Reactive state container for editor UI concerns such as zoom level,
 * pan position, selected elements, active tool, and sidebar state.
 */
export class UIState {
	// -----------------------------------------------------------------------
	// Reactive properties (Svelte 5 $state rune)
	// -----------------------------------------------------------------------

	zoom = $state(1);
	panX = $state(0);
	panY = $state(0);
	selectedActivityId = $state<string | null>(null);
	activeTool = $state<Tool>('select');
	sidebarPanel = $state<SidebarPanel>('none');
	currentPageIndex = $state(0);
	showPrintPreview = $state(false);

	// -----------------------------------------------------------------------
	// Zoom actions
	// -----------------------------------------------------------------------

	/**
	 * Set zoom to an arbitrary value, clamped to [MIN_ZOOM, MAX_ZOOM].
	 */
	setZoom(zoom: number): void {
		this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
	}

	/**
	 * Increase zoom by one step.
	 */
	zoomIn(): void {
		this.setZoom(this.zoom + ZOOM_STEP);
	}

	/**
	 * Decrease zoom by one step.
	 */
	zoomOut(): void {
		this.setZoom(this.zoom - ZOOM_STEP);
	}

	/**
	 * Reset zoom to 100 % and center the pan origin.
	 */
	resetZoom(): void {
		this.zoom = 1;
		this.panX = 0;
		this.panY = 0;
	}

	// -----------------------------------------------------------------------
	// Selection
	// -----------------------------------------------------------------------

	/**
	 * Select an activity by ID, or pass `null` to clear the selection.
	 */
	selectActivity(id: string | null): void {
		this.selectedActivityId = id;
	}

	// -----------------------------------------------------------------------
	// Tool
	// -----------------------------------------------------------------------

	/**
	 * Switch the active editing tool.
	 */
	setTool(tool: Tool): void {
		this.activeTool = tool;
	}

	// -----------------------------------------------------------------------
	// Sidebar
	// -----------------------------------------------------------------------

	/**
	 * Open or switch the sidebar to a specific panel, or close it with 'none'.
	 */
	setSidebarPanel(panel: SidebarPanel): void {
		this.sidebarPanel = panel;
	}

	// -----------------------------------------------------------------------
	// Page navigation
	// -----------------------------------------------------------------------

	/**
	 * Navigate to a specific page by index.
	 */
	setPage(index: number): void {
		if (index < 0) return;
		this.currentPageIndex = index;
	}

	// -----------------------------------------------------------------------
	// Print preview
	// -----------------------------------------------------------------------

	/**
	 * Toggle the print-preview overlay on or off.
	 */
	togglePrintPreview(): void {
		this.showPrintPreview = !this.showPrintPreview;
	}
}

export const uiState = new UIState();
