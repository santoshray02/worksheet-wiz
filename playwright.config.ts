import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:4173',
		screenshot: 'on',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	],
	webServer: {
		command: 'npx vite dev --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: false,
		timeout: 30000
	}
});
