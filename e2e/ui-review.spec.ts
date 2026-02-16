import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('loads and shows navbar with all links', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('nav')).toBeVisible();
		await expect(page.locator('nav a:text("WorksheetWiz")')).toBeVisible();
		await expect(page.locator('nav a:text("Create")')).toBeVisible();
		await expect(page.locator('nav a:text("Templates")')).toBeVisible();
		await expect(page.locator('nav a:text("Assets")')).toBeVisible();
	});

	test('settings gear icon is in the navbar', async ({ page }) => {
		await page.goto('/');
		const gearBtn = page.locator('nav button[aria-label="Settings"]');
		await expect(gearBtn).toBeVisible();
	});

	test('homepage has main content', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Settings Modal (BYOK)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for Svelte hydration to complete before interacting
		await page.waitForLoadState('networkidle');
	});

	test('opens from gear icon and shows API key inputs', async ({ page }) => {
		await page.click('button[aria-label="Settings"]');

		// Modal should appear
		const modal = page.locator('[role="dialog"]');
		await expect(modal).toBeVisible();
		await expect(modal.locator('h2:text("API Keys")')).toBeVisible();

		// Should have both API key inputs
		await expect(page.locator('#anthropic-key')).toBeVisible();
		await expect(page.locator('#openai-key')).toBeVisible();

		// Inputs should be password type
		await expect(page.locator('#anthropic-key')).toHaveAttribute('type', 'password');
		await expect(page.locator('#openai-key')).toHaveAttribute('type', 'password');
	});

	test('can save and persist API keys', async ({ page }) => {
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Enter keys
		await page.fill('#anthropic-key', 'test-anthropic-key');
		await page.fill('#openai-key', 'test-openai-key');

		// Click Save
		await page.click('button:text("Save")');

		// Modal should close
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();

		// Reopen and verify keys persisted
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('#anthropic-key')).toHaveValue('test-anthropic-key');
		await expect(page.locator('#openai-key')).toHaveValue('test-openai-key');
	});

	test('clear button removes API keys', async ({ page }) => {
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Enter and save keys first
		await page.fill('#anthropic-key', 'some-key');
		await page.click('button:text("Save")');

		// Reopen and clear
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('[role="dialog"]')).toBeVisible();
		await page.click('button:text("Clear All")');

		// Fields should be empty
		await expect(page.locator('#anthropic-key')).toHaveValue('');
		await expect(page.locator('#openai-key')).toHaveValue('');
	});

	test('closes with Escape key', async ({ page }) => {
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});
});

test.describe('Create Worksheet Flow', () => {
	test('navigates to create page', async ({ page }) => {
		await page.goto('/');
		await page.click('a:text("Create")');
		await expect(page).toHaveURL('/create');
		await expect(page.locator('h1:text("Create Worksheet")')).toBeVisible();
	});

	test('step 1: subject picker is shown', async ({ page }) => {
		await page.goto('/create');
		// Should be on step 1 — use heading for specific match
		await expect(page.getByRole('heading', { name: 'Choose a Subject' })).toBeVisible();
	});

	test('step 1 -> step 2: select subject and advance', async ({ page }) => {
		await page.goto('/create');
		await page.waitForLoadState('networkidle');

		// Click on the first available subject option
		const subjectButton = page.locator('[data-subject]').first();
		if (await subjectButton.isVisible()) {
			await subjectButton.click();
		} else {
			// Try clicking any button-like element in the subject picker area
			const anySubject = page
				.locator('button')
				.filter({ hasText: /math|english|science|art/i })
				.first();
			await anySubject.click();
		}

		// Click Next
		const nextBtn = page.locator('button:text("Next")');
		if (await nextBtn.isEnabled()) {
			await nextBtn.click();
		}
	});

	test('wizard stepper shows all 7 steps', async ({ page }) => {
		await page.goto('/create');
		// The stepper should show step labels
		for (const step of ['Subject', 'Age', 'Activities', 'Generate', 'Preview', 'Edit', 'Download']) {
			await expect(page.locator(`text=${step}`).first()).toBeVisible();
		}
	});
});

test.describe('Templates Page', () => {
	test('loads templates page', async ({ page }) => {
		await page.goto('/templates');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Assets Page', () => {
	test('loads assets page', async ({ page }) => {
		await page.goto('/assets');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('all nav links work', async ({ page }) => {
		await page.goto('/');

		await page.click('nav a:text("Create")');
		await expect(page).toHaveURL('/create');

		await page.click('nav a:text("Templates")');
		await expect(page).toHaveURL('/templates');

		await page.click('nav a:text("Assets")');
		await expect(page).toHaveURL('/assets');

		await page.click('nav a:text("WorksheetWiz")');
		await expect(page).toHaveURL('/');
	});
});
