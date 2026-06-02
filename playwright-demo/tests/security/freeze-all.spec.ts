import { test, expect } from '@playwright/test';
import { injectAuth } from '../helpers/auth';

/**
 * KB-15 – Action 2: Freeze All Cards / Cryo-Freeze (/security/freeze-all)
 * FA-001 to FA-008, FA1-001 to FA1-006, FAP-001 to FAP-004, FA3-001 to FA3-004
 * Acceptance Criteria: Scenarios 2, 3, 6
 */

test.describe('Freeze All Cards – Step 1: Cryo-Freeze Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');
  });

  // FA1-001
  test('displays snowflake icon and "Cryo-Freeze Cards" header', async ({ page }) => {
    await expect(page.getByText('❄️')).toBeVisible();
    await expect(page.getByText('Cryo-Freeze Cards')).toBeVisible();
  });

  // FA1-002
  test('displays explanation about suspended cards and functional ACH/Savings', async ({ page }) => {
    await expect(page.getByText(/temporarily suspend all active cards/i)).toBeVisible();
    await expect(page.getByText(/savings transfers will remain functional/i)).toBeVisible();
  });

  // FA1-003
  test('displays "Affected Facilities:" label', async ({ page }) => {
    await expect(page.getByText('Affected Facilities:')).toBeVisible();
  });

  // FA-001 / FA-002 / FA-003 / FA1-004: only Cards and Checking shown, not Savings
  test('shows Checking and Credit Card badges but NOT Savings', async ({ page }) => {
    await expect(page.getByText('Checking', { exact: true })).toBeVisible();
    await expect(page.getByText('Credit Card', { exact: true })).toBeVisible();
    await expect(page.getByText('Savings', { exact: true })).not.toBeVisible();
  });

  // FA1-005
  test('"Authorize Cryo-Freeze" button is visible and enabled', async ({ page }) => {
    await expect(page.getByRole('button', { name: /authorize cryo-freeze/i })).toBeEnabled();
  });

  // FA1-006 / Scenario 6: Cancel Protocol navigates to /dashboard with no state changes
  test('"Cancel Protocol" navigates to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /cancel protocol/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  // Scenario 6: no account status changed after cancel
  test('no account statuses change after cancelling', async ({ page }) => {
    await page.getByRole('button', { name: /cancel protocol/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // No Frozen badges should be visible
    await expect(page.getByText('Frozen').first()).not.toBeVisible();
  });
});

test.describe('Freeze All Cards – Processing State', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');
    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
  });

  // FAP-001: spinner
  test('shows loading spinner during processing', async ({ page }) => {
    // Spinner component renders while loading=true
    await expect(page.locator('.animate-spin').first()).toBeVisible();
  });

  // FAP-002
  test('shows "Deep-Freezing Card Facilities" processing header', async ({ page }) => {
    await expect(page.getByText('Deep-Freezing Card Facilities')).toBeVisible();
  });

  // FAP-003
  test('shows "Validating security signatures" subtext', async ({ page }) => {
    await expect(page.getByText(/validating security signatures and notifying central bank/i)).toBeVisible();
  });

  // FAP-004: 2500ms delay — success screen appears within 5s
  test('transitions to success screen after processing', async ({ page }) => {
    await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Freeze All Cards – Step 3: Success', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');
    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
    await page.getByText('Facilities Suspended').waitFor({ timeout: 5000 });
  });

  // FA3-001
  test('displays snowflake icon in success container', async ({ page }) => {
    await expect(page.getByText('❄️').last()).toBeVisible();
  });

  // FA3-002
  test('displays "Facilities Suspended" header', async ({ page }) => {
    await expect(page.getByText('Facilities Suspended')).toBeVisible();
  });

  // FA3-003
  test('displays deep-freeze status message', async ({ page }) => {
    await expect(page.getByText(/all identified cards have been moved to deep-freeze status/i)).toBeVisible();
  });

  // FA3-004: Back to Portfolio navigates to /dashboard
  test('"Back to Portfolio" navigates to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /back to portfolio/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});

/**
 * Acceptance Criteria – Scenario 2:
 * Checking and Credit Card statuses become "Frozen"; Savings remains unchanged.
 */
test.describe('Freeze All Cards – Acceptance Criteria Scenario 2', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/freeze-all');
    await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
    await page.getByText('Facilities Suspended').waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: /back to portfolio/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  // FA-004 / FA-007 / Scenario 2 & 3
  test('Checking and Credit Card accounts display a "Frozen" badge on the dashboard', async ({ page }) => {
    const frozenBadges = page.getByText('Frozen');
    await expect(frozenBadges).toHaveCount(2);
  });

  // FA-003: Savings is not frozen
  test('Savings account does NOT show a "Frozen" badge', async ({ page }) => {
    // Get all account cards and check Savings has no Frozen badge
    const savingsCard = page.getByText('Savings').locator('..').locator('..');
    await expect(savingsCard.getByText('Frozen')).not.toBeVisible();
  });

  // FA-008 / Scenario 3: Frozen accounts are not clickable
  test('frozen accounts are not clickable on the dashboard', async ({ page }) => {
    // Checking account card should not be a navigable link/button after freeze
    const checkingCard = page.getByText('Checking').locator('..').locator('..');
    // The card should not have a pointer cursor / navigate when clicked
    const initialUrl = page.url();
    await checkingCard.click({ force: true });
    await page.waitForTimeout(500);
    expect(page.url()).toBe(initialUrl);
  });
});
