import { test, expect } from '@playwright/test';
import { injectAuth, TEST_USER } from '../helpers/auth';

/**
 * KB-15 – Action 1: Report Stolen Asset (/security/report)
 * RS-001 to RS-007, RS1-001 to RS1-010, RS2-001 to RS2-006, RS3-001 to RS3-004
 * Acceptance Criteria: Scenario 1
 */

test.describe('Report Stolen Asset – Step 1: Asset Compromise Report', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');
  });

  // RS1-001
  test('displays "Asset Compromise Report" header', async ({ page }) => {
    await expect(page.getByText('Asset Compromise Report')).toBeVisible();
  });

  // RS1-002
  test('displays correct subtext', async ({ page }) => {
    await expect(page.getByText('Identify the specific facility that has been compromised.')).toBeVisible();
  });

  // RS1-003 / RS-001 / RS-002
  test('shows Affected Facility dropdown with all accounts', async ({ page }) => {
    await expect(page.getByLabel('Affected Facility')).toBeVisible();

    for (const acc of TEST_USER.accounts) {
      const lastFour = acc.accountNumber.slice(-4);
      await expect(page.getByRole('option', { name: new RegExp(`${acc.type}.*${lastFour}`) })).toBeVisible();
    }
  });

  // RS1-005: first account pre-selected by default
  test('pre-selects the first account in the dropdown', async ({ page }) => {
    const select = page.getByLabel('Affected Facility');
    const selectedText = await select.inputValue();
    // Value is the account id; verify the displayed text contains first account type
    const firstOption = await select.locator('option').first().textContent();
    expect(firstOption).toContain(TEST_USER.accounts[0].type);
    expect(selectedText).toBe(TEST_USER.accounts[0].id);
  });

  // RS1-006
  test('shows "Incident Narrative" textarea label', async ({ page }) => {
    await expect(page.getByText('Incident Narrative')).toBeVisible();
  });

  // RS1-007
  test('textarea has correct placeholder text', async ({ page }) => {
    await expect(page.getByPlaceholder(/briefly describe the nature/i)).toBeVisible();
  });

  // RS-004 / RS1-010: button disabled when description is empty
  test('"Authorize Asset Freeze" is disabled when incident description is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeDisabled();
  });

  // RS-004: button enabled once description is entered
  test('"Authorize Asset Freeze" is enabled when description is entered', async ({ page }) => {
    await page.getByPlaceholder(/briefly describe/i).fill('Lost physical card at airport');
    await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeEnabled();
  });

  // RS1-008: Cancel navigates to /contact
  test('"Cancel" button navigates to /contact', async ({ page }) => {
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page).toHaveURL('/contact');
  });

  // RS-003 / RS1-009: advancing to step 2
  test('"Authorize Asset Freeze" advances to Step 2 when description is filled', async ({ page }) => {
    await page.getByPlaceholder(/briefly describe/i).fill('Suspicious web activity detected');
    await page.getByRole('button', { name: /authorize asset freeze/i }).click();
    await expect(page.getByText('Confirm Asset Freeze')).toBeVisible();
  });
});

test.describe('Report Stolen Asset – Step 2: Confirm Asset Freeze', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');
    await page.getByPlaceholder(/briefly describe/i).fill('Suspicious web activity');
    await page.getByRole('button', { name: /authorize asset freeze/i }).click();
    await expect(page.getByText('Confirm Asset Freeze')).toBeVisible();
  });

  // RS2-001
  test('displays lock icon', async ({ page }) => {
    await expect(page.getByText('🔒')).toBeVisible();
  });

  // RS2-002
  test('displays "Confirm Asset Freeze" header', async ({ page }) => {
    await expect(page.getByText('Confirm Asset Freeze')).toBeVisible();
  });

  // RS2-003: message includes selected account type
  test('confirmation message includes the selected account type', async ({ page }) => {
    const selectedType = TEST_USER.accounts[0].type; // first account, pre-selected
    await expect(page.getByText(new RegExp(`about to freeze ${selectedType}`, 'i'))).toBeVisible();
  });

  // RS2-004
  test('displays block authorizations message', async ({ page }) => {
    await expect(page.getByText(/block all incoming and outgoing electronic authorizations/i)).toBeVisible();
  });

  // RS2-006: Back to Selection returns to Step 1
  test('"Back to Selection" returns to Step 1', async ({ page }) => {
    await page.getByRole('button', { name: /back to selection/i }).click();
    await expect(page.getByText('Asset Compromise Report')).toBeVisible();
  });

  // RS-005 / RS2-005: Execute Freeze Protocol triggers processing
  test('"Execute Freeze Protocol" shows loading state', async ({ page }) => {
    await page.getByRole('button', { name: /execute freeze protocol/i }).click();
    await expect(page.getByText('Provisioning Asset Block')).toBeVisible();
    await expect(page.getByText(/validating security signatures/i)).toBeVisible();
  });
});

test.describe('Report Stolen Asset – Step 3: Success', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');
    await page.getByPlaceholder(/briefly describe/i).fill('Lost physical card');
    await page.getByRole('button', { name: /authorize asset freeze/i }).click();
    await page.getByRole('button', { name: /execute freeze protocol/i }).click();
    await page.getByText('Asset Frozen').waitFor({ timeout: 5000 });
  });

  // RS3-002
  test('displays "Asset Frozen" header', async ({ page }) => {
    await expect(page.getByText('Asset Frozen')).toBeVisible();
  });

  // RS3-003
  test('displays fraud prevention contact message', async ({ page }) => {
    await expect(page.getByText(/fraud prevention squad will contact you within 15 minutes/i)).toBeVisible();
  });

  // RS3-004: Back to Portfolio navigates to /dashboard
  test('"Back to Portfolio" navigates to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /back to portfolio/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});

/**
 * Acceptance Criteria – Scenario 1:
 * Report flow is a UI simulation only — account status must NOT change.
 */
test.describe('Report Stolen Asset – Acceptance Criteria Scenario 1', () => {
  test('account status is unchanged after completing the report flow', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/report');

    // Select Credit Card account
    const select = page.getByLabel('Affected Facility');
    await select.selectOption({ label: /Credit Card/i });

    await page.getByPlaceholder(/briefly describe/i).fill('Suspicious web activity');
    await page.getByRole('button', { name: /authorize asset freeze/i }).click();
    await page.getByRole('button', { name: /execute freeze protocol/i }).click();
    await page.getByText('Asset Frozen').waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: /back to portfolio/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // Verify Credit Card is NOT shown with a "Frozen" badge
    await expect(page.getByText('Frozen').first()).not.toBeVisible();
  });
});
