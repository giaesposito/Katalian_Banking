import { test, expect } from '@playwright/test';
import { injectAuth, getUserFixture } from '../helpers/auth';
import { activeCredentials } from '../helpers/csv-parser';

/**
 * KB-15 – Action 1: Report Stolen Asset (/security/report)
 * RS-001 to RS-007, RS1-001 to RS1-010, RS2-001 to RS2-006, RS3-001 to RS3-004
 * Acceptance Criteria: Scenario 1
 *
 * Data-driven: runs for each Active user in credentials.csv
 */

for (const cred of activeCredentials) {
  test.describe(`Report Stolen Asset [${cred.username}]`, () => {
    const user = getUserFixture(cred.username);

    test.describe('Step 1: Asset Compromise Report', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
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

      // RS1-003 / RS-001 / RS-002: dropdown with all accounts
      test('shows Affected Facility dropdown with all user accounts', async ({ page }) => {
        await expect(page.getByLabel('Affected Facility')).toBeVisible();
        for (const acc of user.accounts) {
          const lastFour = acc.accountNumber.slice(-4);
          await expect(page.getByRole('option', { name: new RegExp(`${acc.type}.*${lastFour}`) })).toBeVisible();
        }
      });

      // RS1-005: first account pre-selected
      test('pre-selects the first account in the dropdown', async ({ page }) => {
        const select = page.getByLabel('Affected Facility');
        expect(await select.inputValue()).toBe(user.accounts[0].id);
      });

      // RS-004 / RS1-010: disabled when empty
      test('"Authorize Asset Freeze" is disabled when incident description is empty', async ({ page }) => {
        await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeDisabled();
      });

      // RS-004: enabled once text is entered
      test('"Authorize Asset Freeze" is enabled when description is entered', async ({ page }) => {
        await page.getByPlaceholder(/briefly describe/i).fill('Lost physical card at airport');
        await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeEnabled();
      });

      // RS1-008: Cancel → /contact
      test('"Cancel" button navigates to /contact', async ({ page }) => {
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page).toHaveURL('/contact');
      });

      // RS1-009: advances to Step 2
      test('"Authorize Asset Freeze" advances to Step 2 when description is filled', async ({ page }) => {
        await page.getByPlaceholder(/briefly describe/i).fill('Suspicious web activity detected');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await expect(page.getByText('Confirm Asset Freeze')).toBeVisible();
      });
    });

    test.describe('Step 2: Confirm Asset Freeze', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
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

      // RS2-003: selected account type in message
      test('confirmation message includes the pre-selected account type', async ({ page }) => {
        await expect(page.getByText(new RegExp(`about to freeze ${user.accounts[0].type}`, 'i'))).toBeVisible();
      });

      // RS2-004
      test('displays block authorizations warning', async ({ page }) => {
        await expect(page.getByText(/block all incoming and outgoing electronic authorizations/i)).toBeVisible();
      });

      // RS2-006: back navigation
      test('"Back to Selection" returns to Step 1', async ({ page }) => {
        await page.getByRole('button', { name: /back to selection/i }).click();
        await expect(page.getByText('Asset Compromise Report')).toBeVisible();
      });

      // RS2-005: processing state
      test('"Execute Freeze Protocol" shows loading state', async ({ page }) => {
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();
        await expect(page.getByText('Provisioning Asset Block')).toBeVisible();
        await expect(page.getByText(/validating security signatures/i)).toBeVisible();
      });
    });

    test.describe('Step 3: Success', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
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

      // RS3-004
      test('"Back to Portfolio" navigates to /dashboard', async ({ page }) => {
        await page.getByRole('button', { name: /back to portfolio/i }).click();
        await expect(page).toHaveURL('/dashboard');
      });
    });

    // Acceptance Criteria Scenario 1: no state change after report
    test('Scenario 1: account status is unchanged after completing the report flow', async ({ page }) => {
      await injectAuth(page, user);
      await page.goto('/security/report');

      const select = page.getByLabel('Affected Facility');
      await select.selectOption({ index: user.accounts.findIndex(a => a.type.includes('Card')) });

      await page.getByPlaceholder(/briefly describe/i).fill('Suspicious web activity');
      await page.getByRole('button', { name: /authorize asset freeze/i }).click();
      await page.getByRole('button', { name: /execute freeze protocol/i }).click();
      await page.getByText('Asset Frozen').waitFor({ timeout: 5000 });
      await page.getByRole('button', { name: /back to portfolio/i }).click();
      await expect(page).toHaveURL('/dashboard');

      // No Frozen badge should appear — report is a simulation only
      await expect(page.getByText('Frozen').first()).not.toBeVisible();
    });
  });
}
