# E2E Testing with Playwright

This directory contains end-to-end tests for StudioSync using Playwright.

## Overview

The E2E tests verify critical user flows to catch regressions before they reach production. Tests run against the full Docker-containerized application, ensuring they match the production environment.

## Directory Structure

```
e2e/
├── fixtures/           # Reusable test data and authentication helpers
│   ├── test-users.ts  # Test user credentials
│   └── auth.ts        # Login/logout helpers
├── utils/             # Helper functions
│   └── api-helpers.ts # API testing utilities
├── auth.spec.ts       # Authentication flow tests
├── bands.spec.ts      # Band management tests
├── students.spec.ts   # Student management tests
└── navigation.spec.ts # Navigation and routing tests
```

## Running Tests

### Prerequisites

1. **Start Docker services:**

   ```bash
   docker compose up -d
   ```

2. **Seed test data:**

   ```bash
   docker compose exec backend python seed_data.py
   ```

3. **Install Playwright browsers** (first time only):
   ```bash
   cd frontend
   npx playwright install
   ```

### Run All Tests

```bash
cd frontend
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test auth.spec.ts
npx playwright test bands.spec.ts
npx playwright test students.spec.ts
```

### Run in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens the Playwright Test UI where you can:

- See all tests
- Run tests individually
- Watch tests execute in real-time
- Debug failures

### Debug Mode

```bash
npm run test:e2e:debug
```

This runs tests with the Playwright Inspector for step-by-step debugging.

### View Test Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

## Test Users

Tests use the following credentials (created by `seed_data.py`):

- **Admin:** `admin@test.com` / `admin123`
- **Teacher:** `teacher1@test.com` / `teacher123`
- **Student:** `student1@test.com` / `student123`

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { TEST_USERS } from "./fixtures/test-users";
import { loginWithUser } from "./fixtures/auth";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginWithUser(page, TEST_USERS.admin);

    // Navigate to the page
    await page.goto("/dashboard/feature");
  });

  test("should do something", async ({ page }) => {
    // Your test code here
    await expect(page.locator("h1")).toBeVisible();
  });
});
```

### Using Test Fixtures

```typescript
import { TEST_USERS, getTestUser } from "./fixtures/test-users";
import { loginAs, loginWithUser } from "./fixtures/auth";

// Login with specific user
await loginWithUser(page, TEST_USERS.admin);

// Or login with email/password
await loginAs(page, "admin@test.com", "admin123");

// Get user by role
const teacher = getTestUser("teacher");
```

### Using API Helpers

```typescript
import { getApiToken, createTestBand } from "./utils/api-helpers";

// Get auth token programmatically
const token = await getApiToken(page, "admin@test.com", "admin123");

// Create test data via API
const band = await createTestBand(page, token, {
  name: "Test Band",
  genre: "Rock",
});
```

## Best Practices

### 1. Use Data Test IDs

Add `data-testid` attributes to important elements:

```tsx
<button data-testid="create-band-button">Create Band</button>
```

Then in tests:

```typescript
await page.click('[data-testid="create-band-button"]');
```

### 2. Wait for Network Idle

When navigating or after actions that trigger API calls:

```typescript
await page.goto("/dashboard/bands");
await page.waitForLoadState("networkidle");
```

### 3. Use Unique Test Data

Generate unique data to avoid conflicts:

```typescript
const bandName = `Test Band ${Date.now()}`;
```

### 4. Clean Up After Tests

Use `test.afterEach` to clean up test data:

```typescript
test.afterEach(async ({ page }) => {
  // Delete test data via API
  await deleteResource(page, token, `/api/bands/${bandId}`);
});
```

### 5. Handle Flaky Tests

Use retries for flaky tests:

```typescript
test("flaky test", async ({ page }) => {
  test.setTimeout(60000); // Increase timeout
  // Test code
});
```

## Debugging Failed Tests

### 1. Check Screenshots

Failed tests automatically capture screenshots in `test-results/`:

```bash
ls frontend/test-results/
```

### 2. Watch Videos

Videos are captured for failed tests:

```bash
open frontend/test-results/*/video.webm
```

### 3. View Traces

Traces are captured on retry:

```bash
npx playwright show-trace test-results/*/trace.zip
```

### 4. Run with Headed Browser

See the browser while tests run:

```bash
npx playwright test --headed
```

### 5. Slow Down Execution

Add delays to see what's happening:

```bash
npx playwright test --slow-mo=1000
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:

- Push to `main` or `develop`
- Pull requests

See `.github/workflows/ci.yml` for configuration.

## Common Issues

### Port Already in Use

If port 3000 or 8000 is in use:

```bash
docker compose down
docker compose up -d
```

### Tests Timing Out

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 60000, // 60 seconds
```

### Browser Not Installed

Install browsers:

```bash
npx playwright install
```

### Database Not Seeded

Seed test data:

```bash
docker compose exec backend python seed_data.py
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
