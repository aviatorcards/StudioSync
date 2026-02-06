import { Page, expect } from '@playwright/test';

/**
 * Wait for a specific API endpoint to be called and return the response
 */
export async function waitForApiResponse(
  page: Page,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
) {
  const responsePromise = page.waitForResponse(
    (response) => {
      const url = response.url();
      return url.includes(endpoint) && response.request().method() === method;
    },
    { timeout: 10000 }
  );
  
  return await responsePromise;
}

/**
 * Get authentication token via API
 * Useful for setting up authenticated state without UI interaction
 */
export async function getApiToken(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  const baseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';
  
  const response = await page.request.post(`${baseUrl}/api/auth/login`, {
    data: {
      email,
      password,
    },
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.access;
}

/**
 * Create a test band via API
 */
export async function createTestBand(
  page: Page,
  token: string,
  bandData: {
    name: string;
    genre?: string;
    description?: string;
  }
) {
  const baseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';
  
  const response = await page.request.post(`${baseUrl}/api/bands/bands`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: bandData,
  });
  
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

/**
 * Create a test student via API
 */
export async function createTestStudent(
  page: Page,
  token: string,
  studentData: {
    first_name: string;
    last_name: string;
    email: string;
    instrument?: string;
    skill_level?: string;
  }
) {
  const baseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';
  
  const response = await page.request.post(`${baseUrl}/api/students/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: studentData,
  });
  
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

/**
 * Delete a resource via API (cleanup helper)
 */
export async function deleteResource(
  page: Page,
  token: string,
  endpoint: string
) {
  const baseUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';
  
  const response = await page.request.delete(`${baseUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  // 204 No Content or 200 OK are both acceptable for delete
  expect([200, 204]).toContain(response.status());
}
