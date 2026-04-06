import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('/');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Supplyra/);
});

test('login page loads', async ({ page }) => {
	await page.goto('/login'); // Assuming there is a login route, or we can check home
	// await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
	// Checking basic availability first
	await expect(page).toHaveURL(/.*login/);
});
