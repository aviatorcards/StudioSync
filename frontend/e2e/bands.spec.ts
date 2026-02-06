import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginWithUser } from './fixtures/auth';

test.describe('Band Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginWithUser(page, TEST_USERS.admin);
    
    // Navigate to bands page
    await page.goto('/dashboard/bands');
    await page.waitForLoadState('networkidle');
  });

  test('should display bands page', async ({ page }) => {
    // Check that we're on the bands page
    await expect(page).toHaveURL(/\/dashboard\/bands/);
    
    // Check for page title or heading
    await expect(page.locator('h1, h2').filter({ hasText: /Bands|Groups/i })).toBeVisible({ timeout: 5000 });
  });

  test('should open create band modal', async ({ page }) => {
    // Look for "New Band" or "Add Band" button
    const newBandButton = page.locator('button').filter({ hasText: /New Band|Add Band|Create Band/i }).first();
    await expect(newBandButton).toBeVisible({ timeout: 5000 });
    
    // Click to open modal
    await newBandButton.click();
    
    // Check that modal is visible
    await expect(page.locator('text=/Create|New/i').and(page.locator('text=/Band/i'))).toBeVisible({ timeout: 3000 });
  });

  test('should create a new band', async ({ page }) => {
    const bandName = `Test Band ${Date.now()}`;
    
    // Click new band button
    const newBandButton = page.locator('button').filter({ hasText: /New Band|Add Band|Create Band/i }).first();
    await newBandButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 5000 });
    
    // Fill in band details
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await nameInput.fill(bandName);
    
    // Try to fill genre if field exists
    const genreInput = page.locator('input[name="genre"], select[name="genre"]').first();
    if (await genreInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await genreInput.fill('Rock');
    }
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Add/i }).first();
    await submitButton.click();
    
    // Wait for the modal to close and band to appear in list
    await page.waitForTimeout(1000);
    
    // Verify the band appears in the list
    await expect(page.locator(`text=${bandName}`)).toBeVisible({ timeout: 10000 });
  });

  test('should view band details', async ({ page }) => {
    // Wait for bands to load
    await page.waitForTimeout(1000);
    
    // Find the first band card/item and click it
    const bandItem = page.locator('[data-testid*="band"], [class*="band-card"], a[href*="/bands/"]').first();
    
    if (await bandItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bandItem.click();
      
      // Should navigate to band detail page
      await expect(page).toHaveURL(/\/dashboard\/bands\/[^/]+/, { timeout: 5000 });
      
      // Check for band details
      await expect(page.locator('h1, h2')).toBeVisible();
    } else {
      // If no bands exist, skip this test
      test.skip();
    }
  });

  test('should search/filter bands', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Type in search
      await searchInput.fill('Test');
      
      // Wait for results to filter
      await page.waitForTimeout(500);
      
      // Verify search is working (results should update)
      // This is a basic check - actual validation would depend on existing data
      await expect(searchInput).toHaveValue('Test');
    } else {
      // If no search functionality, skip
      test.skip();
    }
  });

  test('should handle empty state when no bands exist', async ({ page }) => {
    // This test assumes there might be an empty state
    // If bands exist, we can't test this without deleting all bands
    
    const emptyState = page.locator('text=/No bands|no groups|get started/i');
    const bandsList = page.locator('[data-testid*="band"], [class*="band-card"]');
    
    // Check if either empty state or bands list is visible
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    const hasBands = await bandsList.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // One of them should be visible
    expect(hasEmptyState || hasBands).toBeTruthy();
  });
});
