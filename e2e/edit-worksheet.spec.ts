import { test, expect, type Page } from '@playwright/test';

/**
 * Mock activity data to inject directly into the generation state.
 * We bypass the API entirely since SvelteKit's internal fetch isn't
 * interceptable by Playwright's page.route().
 */
const MOCK_ACTIVITIES = [
	{
		id: 'act-1',
		type: 'math',
		title: 'Simple Addition',
		instructions: 'Solve these addition problems',
		difficulty: 1,
		problems: [
			{ operand1: 2, operator: '+', operand2: 3, answer: 5 },
			{ operand1: 4, operator: '+', operand2: 1, answer: 5 }
		],
		showVisualAids: false
	},
	{
		id: 'act-2',
		type: 'tracing',
		title: 'Letter Tracing',
		instructions: 'Trace the letters carefully',
		difficulty: 1,
		items: ['A', 'B', 'C'],
		tracingStyle: 'dotted',
		showArrows: true
	},
	{
		id: 'act-3',
		type: 'matching',
		title: 'Match the Pairs',
		instructions: 'Draw lines to connect matching items',
		difficulty: 1,
		pairs: [
			{ left: 'Cat', right: 'Meow' },
			{ left: 'Dog', right: 'Woof' }
		]
	}
];

/**
 * Navigate directly to the Edit step (step 6) by injecting state via
 * Vite's ES module system. This avoids the SvelteKit fetch interception issue.
 */
async function navigateToEditStep(page: Page, activities = MOCK_ACTIVITIES) {
	await page.goto('/create');
	await page.waitForLoadState('networkidle');

	// Inject state directly into the generation state singleton
	await page.evaluate(
		async ({ activities }) => {
			const mod = await import('/src/lib/state/generation.svelte.ts');
			const state = mod.generationState;

			state.setSubject('math');
			state.setAge(5);
			state.config.letAIDecide = true;
			state.streamedActivities = activities as any;
			state.status = 'complete' as any;
			state.progress = 100;
			state.goToStep(6);
		},
		{ activities }
	);

	// Wait for Svelte to re-render
	await page.waitForTimeout(300);
	await expect(page.getByRole('heading', { name: 'Edit Worksheet' })).toBeVisible();
}

test.describe('Edit Worksheet (Step 6)', () => {
	test('can navigate to the Edit step with injected state', async ({ page }) => {
		await navigateToEditStep(page);

		await expect(page.getByRole('heading', { name: 'Edit Worksheet' })).toBeVisible();
		await expect(
			page.getByText('Fine-tune the layout and content of your worksheet')
		).toBeVisible();
	});

	test('displays the 3-panel layout', async ({ page }) => {
		await navigateToEditStep(page);

		// Left sidebar: Activities panel header
		await expect(page.getByRole('heading', { name: 'Activities' })).toBeVisible();

		// Right sidebar: Properties panel header
		await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();

		// Center canvas: A4 page
		await expect(page.locator('.a4-page').first()).toBeVisible();
	});

	test('shows all generated activities in the sidebar', async ({ page }) => {
		await navigateToEditStep(page);

		const sidebar = page.locator('.w-56').first();

		// All 3 activities should appear
		await expect(sidebar.getByText('Simple Addition')).toBeVisible();
		await expect(sidebar.getByText('Letter Tracing')).toBeVisible();
		await expect(sidebar.getByText('Match the Pairs')).toBeVisible();

		// 3 activity buttons in the sidebar
		const activityButtons = sidebar.locator('button');
		await expect(activityButtons).toHaveCount(3);
	});

	test('shows activities on the canvas with titles and instructions', async ({ page }) => {
		await navigateToEditStep(page);

		const canvas = page.locator('.a4-page');

		// Question labels
		await expect(canvas.getByText('Q1.')).toBeVisible();
		await expect(canvas.getByText('Q2.')).toBeVisible();
		await expect(canvas.getByText('Q3.')).toBeVisible();

		// Activity titles on canvas
		await expect(canvas.getByText('Simple Addition')).toBeVisible();
		await expect(canvas.getByText('Letter Tracing')).toBeVisible();
		await expect(canvas.getByText('Match the Pairs')).toBeVisible();

		// Instructions
		await expect(canvas.getByText('Solve these addition problems')).toBeVisible();
		await expect(canvas.getByText('Trace the letters carefully')).toBeVisible();
		await expect(canvas.getByText('Draw lines to connect matching items')).toBeVisible();
	});

	test('displays worksheet header with subject and age', async ({ page }) => {
		await navigateToEditStep(page);

		const canvas = page.locator('.a4-page');

		// Subject
		await expect(canvas.locator('h1')).toContainText('math');

		// Age and activity count
		await expect(canvas.getByText('Age 5')).toBeVisible();
		await expect(canvas.getByText('3 Activities')).toBeVisible();

		// Name and Date fields
		await expect(canvas.getByText('Name:')).toBeVisible();
		await expect(canvas.getByText('Date:')).toBeVisible();
	});

	test('toolbar shows all 4 tools with Select active by default', async ({ page }) => {
		await navigateToEditStep(page);

		await expect(page.locator('button[aria-label="Select"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Move"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Text"]')).toBeVisible();
		await expect(page.locator('button[aria-label="Asset"]')).toBeVisible();

		// Select should be active
		const selectBtn = page.locator('button[aria-label="Select"]');
		await expect(selectBtn).toHaveClass(/bg-primary/);
	});

	test('toolbar tool switching works', async ({ page }) => {
		await navigateToEditStep(page);

		// Click Move tool
		const moveBtn = page.locator('button[aria-label="Move"]');
		await moveBtn.click();
		await expect(moveBtn).toHaveClass(/bg-primary/);

		// Select should no longer be active
		const selectBtn = page.locator('button[aria-label="Select"]');
		await expect(selectBtn).not.toHaveClass(/bg-primary/);

		// Click Text tool
		const textBtn = page.locator('button[aria-label="Text"]');
		await textBtn.click();
		await expect(textBtn).toHaveClass(/bg-primary/);
		await expect(moveBtn).not.toHaveClass(/bg-primary/);

		// Click Asset tool
		const assetBtn = page.locator('button[aria-label="Asset"]');
		await assetBtn.click();
		await expect(assetBtn).toHaveClass(/bg-primary/);
		await expect(textBtn).not.toHaveClass(/bg-primary/);

		// Click Select tool again
		await selectBtn.click();
		await expect(selectBtn).toHaveClass(/bg-primary/);
		await expect(assetBtn).not.toHaveClass(/bg-primary/);
	});

	test('undo and redo buttons are disabled', async ({ page }) => {
		await navigateToEditStep(page);

		await expect(page.locator('button[aria-label="Undo"]')).toBeDisabled();
		await expect(page.locator('button[aria-label="Redo"]')).toBeDisabled();
	});

	test('assets section is visible in the left sidebar', async ({ page }) => {
		await navigateToEditStep(page);

		await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
		await expect(page.getByText('Drag assets onto canvas')).toBeVisible();
	});

	test('properties panel shows placeholder when nothing selected', async ({ page }) => {
		await navigateToEditStep(page);

		await expect(
			page.getByText('Select an element on the canvas to edit its properties')
		).toBeVisible();
	});

	test('canvas shows activity content area placeholders', async ({ page }) => {
		await navigateToEditStep(page);

		const canvas = page.locator('.a4-page');
		// Each activity has a dashed placeholder area
		const placeholders = canvas.getByText('Activity content area');
		await expect(placeholders).toHaveCount(3);
	});

	test('Back button navigates to Preview step', async ({ page }) => {
		await navigateToEditStep(page);

		await page.locator('button:text("Back")').click();
		await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
	});

	test('Next button navigates to Download step', async ({ page }) => {
		await navigateToEditStep(page);

		await page.locator('button:text("Next")').click();
		await expect(
			page.getByRole('heading', { name: 'Download Your Worksheet' })
		).toBeVisible();
	});

	test('empty state shows when no activities', async ({ page }) => {
		await navigateToEditStep(page, []);

		// Canvas should show empty state
		await expect(page.getByText('Empty canvas')).toBeVisible();

		// Sidebar should show "No activities"
		await expect(page.getByText('No activities')).toBeVisible();
	});

	test('stepper highlights Edit step as current', async ({ page }) => {
		await navigateToEditStep(page);

		// Step 6 (Edit) should be marked as current
		const editStepBtn = page.locator('button[aria-current="step"]');
		await expect(editStepBtn).toBeVisible();
		await expect(editStepBtn).toContainText('Edit');
	});

	test('full wizard flow: navigate through all steps to Edit', async ({ page }) => {
		test.setTimeout(60000); // Real API calls may take longer
		await page.goto('/create');
		await page.waitForLoadState('networkidle');

		// Step 1: Select Math - wait for selection ring to appear
		const mathBtn = page.locator('button').filter({ hasText: 'Math' }).first();
		await mathBtn.click();
		// Wait for the selection to register (ring-4 class appears when selected)
		await expect(mathBtn).toHaveClass(/ring-4/, { timeout: 3000 });
		await page.locator('button:text("Next")').click();

		// Step 2: Select age 5
		await expect(page.getByRole('heading', { name: 'Select Age Group' })).toBeVisible();
		await page.locator('button.rounded-2xl').filter({ hasText: '5' }).first().click();
		await page.locator('button:text("Next")').click();

		// Step 3: Let AI decide
		await expect(page.getByRole('heading', { name: 'Choose Activities' })).toBeVisible();
		await page.locator('button[role="switch"][aria-label="Let AI Decide"]').click();
		await page.locator('button:text("Generate")').click();

		// Step 4: Wait for generation (uses real API if keys are set)
		await expect(page.getByRole('heading', { name: 'Worksheet Ready!' })).toBeVisible({
			timeout: 30000
		});
		await page.locator('button:text("Continue to Preview")').click();

		// Step 5: Preview
		await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
		await page.waitForTimeout(500);
		await page.locator('button:text("Next")').click();

		// Step 6: Edit - verify we reach it and it shows activities
		await expect(page.getByRole('heading', { name: 'Edit Worksheet' })).toBeVisible();

		// Should show at least one activity (API generates some)
		const sidebar = page.locator('.w-56').first();
		const activityButtons = sidebar.locator('button');
		const count = await activityButtons.count();
		expect(count).toBeGreaterThan(0);

		// Canvas should have activities
		const canvas = page.locator('.a4-page');
		await expect(canvas.getByText('Q1.')).toBeVisible();
	});
});
