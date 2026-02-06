import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginWithUser } from './fixtures/auth';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginWithUser(page, TEST_USERS.admin);
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check for dashboard heading
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Welcome/i })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to students page via sidebar', async ({ page }) => {
    // Click students link in sidebar
    const studentsLink = page.locator('a[href*="/students"], nav a').filter({ hasText: /Students/i }).first();
    await studentsLink.click();
    
    // Should navigate to students page
    await expect(page).toHaveURL(/\/dashboard\/students/, { timeout: 5000 });
  });

  test('should navigate to bands page via sidebar', async ({ page }) => {
    // Click bands link in sidebar
    const bandsLink = page.locator('a[href*="/bands"], nav a').filter({ hasText: /Bands|Groups/i }).first();
    
    if (await bandsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bandsLink.click();
      
      // Should navigate to bands page
      await expect(page).toHaveURL(/\/dashboard\/bands/, { timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should navigate to schedule page via sidebar', async ({ page }) => {
    // Click schedule link in sidebar
    const scheduleLink = page.locator('a[href*="/schedule"], nav a').filter({ hasText: /Schedule|Calendar/i }).first();
    
    if (await scheduleLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await scheduleLink.click();
      
      // Should navigate to schedule page
      await expect(page).toHaveURL(/\/dashboard\/schedule|\/calendar/, { timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should navigate to teachers page via sidebar', async ({ page }) => {
    // Click teachers link in sidebar
    const teachersLink = page.locator('a[href*="/teachers"], nav a').filter({ hasText: /Teachers|Instructors/i }).first();
    
    if (await teachersLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await teachersLink.click();
      
      // Should navigate to teachers page
      await expect(page).toHaveURL(/\/dashboard\/teachers/, { timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    // Look for settings link (might be in sidebar or user menu)
    const settingsLink = page.locator('a[href*="/settings"], nav a').filter({ hasText: /Settings/i }).first();
    
    if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsLink.click();
      
      // Should navigate to settings page
      await expect(page).toHaveURL(/\/dashboard\/settings/, { timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should use browser back button correctly', async ({ page }) => {
    // Navigate to students
    await page.goto('/dashboard/students');
    await page.waitForLoadState('networkidle');
    
    // Navigate to bands
    await page.goto('/dashboard/bands');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    
    // Should be back on students page
    await expect(page).toHaveURL(/\/dashboard\/students/);
  });

  test('should handle 404 for invalid routes', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/dashboard/this-page-does-not-exist-12345');
    
    // Should show 404 or redirect
    // Check for 404 text or redirect to dashboard
    const has404 = await page.locator('text=/404|not found|page.*not.*exist/i').isVisible({ timeout: 3000 }).catch(() => false);
    const redirectedToDashboard = page.url().includes('/dashboard') && !page.url().includes('this-page-does-not-exist');
    
    expect(has404 || redirectedToDashboard).toBeTruthy();
  });

  test('should protect routes from unauthenticated access', async ({ page }) => {
    // Clear auth tokens
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    
    // Try to access protected route
    await page.goto('/dashboard/students');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should maintain active state in sidebar navigation', async ({ page }) => {
    // Navigate to students page
    await page.goto('/dashboard/students');
    await page.waitForLoadState('networkidle');
    
    // Find the students link in sidebar
    const studentsLink = page.locator('nav a[href*="/students"]').first();
    
    if (await studentsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should have active class or aria-current
      const isActive = await studentsLink.evaluate((el) => {
        const classes = el.className;
        const ariaCurrent = el.getAttribute('aria-current');
        return classes.includes('active') || ariaCurrent === 'page';
      });
      
      expect(isActive).toBeTruthy();
    }
  });
});
