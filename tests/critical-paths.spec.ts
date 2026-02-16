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

  // Verify visa landing page renders
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();

  // Click on a visa card (E-7 Professional Work Visa)
  const visaLink = page.locator('a[href*="/korea/visa/e-7"]').first();
  await expect(visaLink).toBeVisible();
  await visaLink.click();

  // Verify we landed on the visa detail page
  await expect(page).toHaveURL(/\/korea\/visa\/e-7/);

  // Verify page content renders (h1 exists)
  const detailHeading = page.locator('h1');
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

  // Verify the page renders with the simulator heading
  await expect(page.locator('h1')).toBeVisible();

  // Step 1: Select starting visa (E-7)
  // On desktop, click the card; on mobile, use the select dropdown
  const e7Card = page.locator('text=Professional Employment').first();
  const mobileSelect = page.locator('select, [role="combobox"]').first();

  if (await e7Card.isVisible()) {
    await e7Card.click();
  } else if (await mobileSelect.isVisible()) {
    await mobileSelect.click();
    await page.locator('[role="option"]').filter({ hasText: /e-7/i }).first().click();
  }

  // Step 2: Wait for destination selector to appear and select F-2
  const f2Option = page.locator('text=F-2').first();
  await expect(f2Option).toBeVisible({ timeout: 10000 });
  await f2Option.click();

  // Step 3: Verify path results are shown
  // Wait for the path view to render
  await expect(page).toHaveURL(/from=e-7/);
  await expect(page).toHaveURL(/to=f-2/);

  // Verify path content is rendered (transition path steps)
  const pathContent = page.locator('[class*="path"], [class*="card"], [class*="step"]').first();
  await expect(pathContent).toBeVisible({ timeout: 10000 });
});
