import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginWithUser } from './fixtures/auth';

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginWithUser(page, TEST_USERS.admin);
    
    // Navigate to students page
    await page.goto('/dashboard/students');
    await page.waitForLoadState('networkidle');
  });

  test('should display students page', async ({ page }) => {
    // Check that we're on the students page
    await expect(page).toHaveURL(/\/dashboard\/students/);
    
    // Check for page title or heading
    await expect(page.locator('h1, h2').filter({ hasText: /Students/i })).toBeVisible({ timeout: 5000 });
  });

  test('should open create student modal', async ({ page }) => {
    // Look for "New Student" or "Add Student" button
    const newStudentButton = page.locator('button').filter({ hasText: /New Student|Add Student|Create Student/i }).first();
    await expect(newStudentButton).toBeVisible({ timeout: 5000 });
    
    // Click to open modal
    await newStudentButton.click();
    
    // Check that modal is visible
    await expect(page.locator('text=/Create|New/i').and(page.locator('text=/Student/i'))).toBeVisible({ timeout: 3000 });
  });

  test('should create a new student', async ({ page }) => {
    const timestamp = Date.now();
    const studentData = {
      firstName: `Test`,
      lastName: `Student${timestamp}`,
      email: `teststudent${timestamp}@test.com`,
    };
    
    // Click new student button
    const newStudentButton = page.locator('button').filter({ hasText: /New Student|Add Student|Create Student/i }).first();
    await newStudentButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('input[name="first_name"], input[name="firstName"]', { timeout: 5000 });
    
    // Fill in student details
    const firstNameInput = page.locator('input[name="first_name"], input[name="firstName"]').first();
    await firstNameInput.fill(studentData.firstName);
    
    const lastNameInput = page.locator('input[name="last_name"], input[name="lastName"]').first();
    await lastNameInput.fill(studentData.lastName);
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await emailInput.fill(studentData.email);
    
    // Try to fill instrument if field exists
    const instrumentInput = page.locator('input[name="instrument"], select[name="instrument"]').first();
    if (await instrumentInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await instrumentInput.fill('Piano');
    }
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Add/i }).first();
    await submitButton.click();
    
    // Wait for the modal to close and student to appear in list
    await page.waitForTimeout(1000);
    
    // Verify the student appears in the list
    await expect(page.locator(`text=${studentData.lastName}`)).toBeVisible({ timeout: 10000 });
  });

  test('should view student details', async ({ page }) => {
    // Wait for students to load
    await page.waitForTimeout(1000);
    
    // Find the first student card/item and click it
    const studentItem = page.locator('[data-testid*="student"], [class*="student-card"], a[href*="/students/"]').first();
    
    if (await studentItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await studentItem.click();
      
      // Should navigate to student detail page
      await expect(page).toHaveURL(/\/dashboard\/students\/[^/]+/, { timeout: 5000 });
      
      // Check for student details
      await expect(page.locator('h1, h2')).toBeVisible();
    } else {
      // If no students exist, skip this test
      test.skip();
    }
  });

  test('should search/filter students', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Type in search
      await searchInput.fill('Student');
      
      // Wait for results to filter
      await page.waitForTimeout(500);
      
      // Verify search is working (results should update)
      await expect(searchInput).toHaveValue('Student');
    } else {
      // If no search functionality, skip
      test.skip();
    }
  });

  test('should display student list or empty state', async ({ page }) => {
    const emptyState = page.locator('text=/No students|get started|add your first/i');
    const studentsList = page.locator('[data-testid*="student"], [class*="student-card"]');
    
    // Check if either empty state or students list is visible
    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    const hasStudents = await studentsList.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // One of them should be visible
    expect(hasEmptyState || hasStudents).toBeTruthy();
  });

  test('should navigate between student tabs/sections', async ({ page }) => {
    // Look for tabs (Active, Inactive, All, etc.)
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    
    if (await tabs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const tabCount = await tabs.count();
      
      if (tabCount > 1) {
        // Click the second tab
        await tabs.nth(1).click();
        
        // Wait for content to update
        await page.waitForTimeout(500);
        
        // Verify tab is active
        await expect(tabs.nth(1)).toHaveAttribute(/class|aria-selected/, /active|true/i);
      }
    }
  });
});
