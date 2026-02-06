import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginAs, loginWithUser, isAuthenticated } from './fixtures/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the login page
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check that the login page loads
    await expect(page).toHaveTitle(/StudioSync/i);
    
    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for sign up link
    await expect(page.locator('text=Sign up free')).toBeVisible();
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    const admin = TEST_USERS.admin;
    
    // Fill in credentials
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard\/?/, { timeout: 10000 });
    
    // Verify we're authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBeTruthy();
    
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should login successfully with valid teacher credentials', async ({ page }) => {
    const teacher = TEST_USERS.teacher;
    
    await loginAs(page, teacher.email, teacher.password);
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/Failed to sign in|Invalid credentials|error/i')).toBeVisible({ timeout: 5000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error with empty credentials', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    // Check that we're still on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click forgot password link
    await page.click('text=Forgot password?');
    
    // Should navigate to forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click sign up link
    await page.click('text=Sign up free');
    
    // Should navigate to signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should persist session after page reload', async ({ page }) => {
    // Login
    await loginWithUser(page, TEST_USERS.admin);
    
    // Reload the page
    await page.reload();
    
    // Should still be authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBeTruthy();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });
});
