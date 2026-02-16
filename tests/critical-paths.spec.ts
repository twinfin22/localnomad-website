import { test, expect } from '@playwright/test';

// =============================================================================
// Test 1: Navigation — Home → Korea → Visa Detail
// =============================================================================

test('navigation: home → korea visa → visa detail renders correctly', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Go to the Korea visa landing page
  await page.goto('/korea/visa');
  await expect(page).toHaveURL(/\/korea\/visa/);

  // Verify visa landing page renders (use first h1 to avoid strict mode)
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  // Click on a visa card (E-7 Professional Work Visa)
  const visaLink = page.locator('a[href*="/korea/visa/e-7"]').first();
  await expect(visaLink).toBeVisible({ timeout: 10000 });
  await visaLink.click();

  // Verify we landed on the visa detail page
  await expect(page).toHaveURL(/\/korea\/visa\/e-7/);

  // Verify page content renders (h1 exists with visa name)
  const detailHeading = page.locator('h1').first();
  await expect(detailHeading).toBeVisible();
  await expect(detailHeading).not.toBeEmpty();

  // Verify no hydration errors in console
  const hydrationErrors = consoleErrors.filter(
    (err) =>
      err.includes('Hydration') ||
      err.includes('hydration') ||
      err.includes('did not match')
  );
  expect(hydrationErrors).toHaveLength(0);
});

// =============================================================================
// Test 2: Auth — Dashboard redirects to login when unauthenticated
// =============================================================================

test('auth: dashboard redirects to login when unauthenticated', async ({ page }) => {
  // Navigate to the dashboard (protected route)
  await page.goto('/korea/visa/dashboard');

  // Should redirect to /auth/login with next param
  await expect(page).toHaveURL(/\/auth\/login/);

  // Verify login page renders
  const loginPage = page.locator('main, [role="main"], body');
  await expect(loginPage).toBeVisible();

  // Look for sign-in related content
  const pageContent = await page.textContent('body');
  expect(pageContent).toBeTruthy();
});

// =============================================================================
// Test 3: Path Simulator — Select from/to visas and verify results
// =============================================================================

test('path simulator: select from/to visas and verify path results', async ({ page }) => {
  // Go to the path simulator page
  await page.goto('/korea/visa/path');
  await expect(page).toHaveURL(/\/korea\/visa\/path/);

  // Verify the page renders with a heading (use first to avoid strict mode)
  await expect(page.locator('h1').first()).toBeVisible();

  // Step 1: Select starting visa (E-7)
  // Cards use data-slot="card" (shadcn Card component), not a CSS class "card"
  // Desktop (1280px): cards visible in sm:grid; Mobile: hidden behind Select dropdown
  const e7Card = page.locator('[data-slot="card"]').filter({ hasText: /E-7/i }).first();
  const mobileSelect = page.locator('[role="combobox"]').first();

  if (await e7Card.isVisible({ timeout: 5000 }).catch(() => false)) {
    await e7Card.click();
  } else if (await mobileSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await mobileSelect.click();
    await page.locator('[role="option"]').filter({ hasText: /e-7/i }).first().click();
  }

  // Step 2: Wait for destination selector and select F-2
  // After selecting E-7, the component transitions to "select-destination" step
  // From E-7, the only destination is F-2 (Long-term Residence)
  const f2Option = page.locator('[data-slot="card"]').filter({ hasText: /F-2/i }).first();
  await expect(f2Option).toBeVisible({ timeout: 10000 });
  await f2Option.click();

  // Step 3: Verify path results are shown
  // Wait for URL params to update
  await expect(page).toHaveURL(/from=e-7/, { timeout: 10000 });
  await expect(page).toHaveURL(/to=f-2/);

  // Verify path content is rendered (h2 heading or step content)
  const pathContent = page.locator('h2').first();
  await expect(pathContent).toBeVisible({ timeout: 10000 });
});
