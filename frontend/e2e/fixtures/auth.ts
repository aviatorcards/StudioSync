import { Page } from '@playwright/test';
import { TestUser } from './test-users';

/**
 * Login helper function
 * Navigates to login page and submits credentials
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Fill in the login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard (successful login)
  await page.waitForURL(/\/dashboard\/?/, { timeout: 10000 });
}

/**
 * Login with a test user object
 */
export async function loginWithUser(page: Page, user: TestUser) {
  await loginAs(page, user.email, user.password);
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Click the user menu
  await page.click('[data-testid="user-menu"]', { timeout: 5000 }).catch(() => {
    // Fallback: try to find logout button directly
  });
  
  // Click logout
  await page.click('text=Logout', { timeout: 5000 }).catch(() => {
    // Alternative: try sign out
    return page.click('text=Sign out', { timeout: 5000 });
  });
  
  // Wait for redirect to login page
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * Check if user is authenticated by checking for dashboard elements
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if we're on the dashboard or if auth token exists in localStorage
    const url = page.url();
    if (url.includes('/dashboard')) {
      return true;
    }
    
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    return !!token;
  } catch {
    return false;
  }
}

/**
 * Get auth token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('accessToken'));
}

/**
 * Set auth token in localStorage (for API testing)
 */
export async function setAuthToken(page: Page, token: string) {
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t);
  }, token);
}
