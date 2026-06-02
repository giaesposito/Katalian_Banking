import { test, expect } from '@playwright/test';
import { injectAuth } from '../helpers/auth';

/**
 * KB-15 – Common UI elements (CU-001 to CU-006)
 * Progress bar, header, subheader, and close button across all three flows.
 */

const SECURITY_ROUTES = [
  { action: 'report',    label: 'Report'     },
  { action: 'freeze-all', label: 'Freeze-All' },
  { action: 'lockdown',  label: 'Lockdown'   },
] as const;

for (const { action, label } of SECURITY_ROUTES) {
  test.describe(`Common UI – ${label} flow`, () => {
    test.beforeEach(async ({ page }) => {
      await injectAuth(page);
      await page.goto(`/security/${action}`);
    });

    // CU-005: Header
    test('displays "Security Protocol" header', async ({ page }) => {
      await expect(page.getByText('Security Protocol')).toBeVisible();
    });

    // CU-001/CU-002: Progress bar present and at step 1 (≈33%)
    test('shows progress bar at ~33% on step 1', async ({ page }) => {
      const bar = page.locator('[style*="width"]').first();
      const style = await bar.getAttribute('style');
      expect(style).toContain('33.3333');
    });

    // CU-003: Close (X) button is visible on step 1
    test('shows close button on step 1', async ({ page }) => {
      const closeBtn = page.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6"]') });
      await expect(closeBtn).toBeVisible();
    });

    // CU-003: Close button navigates to /contact
    test('close button navigates to /contact', async ({ page }) => {
      const closeBtn = page.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6"]') });
      await closeBtn.click();
      await expect(page).toHaveURL('/contact');
    });
  });
}

test.describe('Common UI – progress bar advances through steps', () => {
  test('report flow: progress bar at ~66% on step 2', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');

    await page.getByPlaceholder(/briefly describe/i).fill('Lost my card');
    await page.getByRole('button', { name: /authorize asset freeze/i }).click();

    const bar = page.locator('[style*="width"]').first();
    const style = await bar.getAttribute('style');
    expect(style).toContain('66.6667');
  });

  test('lockdown flow: progress bar at ~66% on step 2', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/lockdown');

    await page.getByRole('button', { name: /initiate global lockdown/i }).click();

    const bar = page.locator('[style*="width"]').first();
    const style = await bar.getAttribute('style');
    expect(style).toContain('66.6667');
  });
});

test.describe('Common UI – close button hidden during processing and success', () => {
  test('close button hidden during freeze-all processing', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');

    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();

    // During processing (loading=true), close button should be absent
    const closeBtn = page.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6"]') });
    await expect(closeBtn).not.toBeVisible();
  });

  test('close button hidden on success screen', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');

    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
    await page.getByText('Facilities Suspended', { exact: true }).waitFor({ timeout: 5000 });

    const closeBtn = page.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6"]') });
    await expect(closeBtn).not.toBeVisible();
  });
});

test.describe('Common UI – subheader text by action and state', () => {
  test('report flow shows "Incident Management" subheader on step 1', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');
    await expect(page.getByText('Incident Management')).toBeVisible();
  });

  test('freeze-all flow shows "Cryo-Freeze Protocol" subheader on step 1', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');
    await expect(page.getByText('Cryo-Freeze Protocol')).toBeVisible();
  });

  test('lockdown flow shows "Critical Action Needed" subheader on step 1', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/lockdown');
    await expect(page.getByText('Critical Action Needed')).toBeVisible();
  });

  test('shows "Operation Complete" subheader on success', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');

    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
    await page.getByText('Facilities Suspended').waitFor({ timeout: 5000 });

    await expect(page.getByText('Operation Complete')).toBeVisible();
  });
});
