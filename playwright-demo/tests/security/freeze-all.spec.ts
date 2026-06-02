import { test, expect } from '@playwright/test';
import { injectAuth, getUserFixture } from '../helpers/auth';
import { activeCredentials } from '../helpers/csv-parser';

/**
 * KB-15 – Action 2: Freeze All Cards / Cryo-Freeze (/security/freeze-all)
 * FA-001 to FA-008, FA1-001 to FA1-006, FAP-001 to FAP-004, FA3-001 to FA3-004
 * Acceptance Criteria: Scenarios 2, 3, 6
 *
 * Data-driven: runs for each Active user in credentials.csv
 */

for (const cred of activeCredentials) {
  test.describe(`Freeze All Cards [${cred.username}]`, () => {
    const user = getUserFixture(cred.username);
    const affectedTypes = user.accounts
      .filter(a => a.type.includes('Card') || a.type === 'Checking')
      .map(a => a.type);

    test.describe('Step 1: Cryo-Freeze Confirmation', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/freeze-all');
      });

      // FA1-001
      test('displays snowflake icon and "Cryo-Freeze Cards" header', async ({ page }) => {
        await expect(page.getByText('❄️')).toBeVisible();
        await expect(page.getByText('Cryo-Freeze Cards')).toBeVisible();
      });

      // FA1-002
      test('displays explanation about suspended cards and functional Savings', async ({ page }) => {
        await expect(page.getByText(/temporarily suspend all active cards/i)).toBeVisible();
        await expect(page.getByText(/savings transfers will remain functional/i)).toBeVisible();
      });

      // FA1-003
      test('displays "Affected Facilities:" label', async ({ page }) => {
        await expect(page.getByText('Affected Facilities:')).toBeVisible();
      });

      // FA-001 / FA-002 / FA-003 / FA1-004
      test('shows only Cards and Checking in affected facilities — not Savings', async ({ page }) => {
        for (const type of affectedTypes) {
          await expect(page.getByText(type, { exact: true })).toBeVisible();
        }
        await expect(page.getByText('Savings', { exact: true })).not.toBeVisible();
      });

      // FA1-005
      test('"Authorize Cryo-Freeze" button is enabled', async ({ page }) => {
        await expect(page.getByRole('button', { name: /authorize cryo-freeze/i })).toBeEnabled();
      });

      // FA1-006 / Scenario 6
      test('"Cancel Protocol" navigates to /dashboard without freezing accounts', async ({ page }) => {
        await page.getByRole('button', { name: /cancel protocol/i }).click();
        await expect(page).toHaveURL('/dashboard');
        await expect(page.getByText('Frozen').first()).not.toBeVisible();
      });
    });

    test.describe('Processing State', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
      });

      // FAP-001
      test('shows loading spinner', async ({ page }) => {
        await expect(page.locator('.animate-spin').first()).toBeVisible();
      });

      // FAP-002
      test('shows "Deep-Freezing Card Facilities" header', async ({ page }) => {
        await expect(page.getByText('Deep-Freezing Card Facilities')).toBeVisible();
      });

      // FAP-003
      test('shows "Validating security signatures" subtext', async ({ page }) => {
        await expect(page.getByText(/validating security signatures and notifying central bank/i)).toBeVisible();
      });

      // FAP-004: completes within 5s
      test('transitions to success screen after ~2500ms processing', async ({ page }) => {
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
      });
    });

    test.describe('Step 3: Success', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
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

      // FA3-004
      test('"Back to Portfolio" navigates to /dashboard', async ({ page }) => {
        await page.getByRole('button', { name: /back to portfolio/i }).click();
        await expect(page).toHaveURL('/dashboard');
      });
    });

    // Acceptance Criteria Scenario 2 & 3
    test.describe('Acceptance Criteria: Dashboard state after freeze', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await page.getByText('Facilities Suspended').waitFor({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();
        await expect(page).toHaveURL('/dashboard');
      });

      // FA-004 / FA-007 / Scenarios 2 & 3
      test(`Scenario 2 & 3: ${affectedTypes.join(', ')} show "Frozen" badge`, async ({ page }) => {
        const frozenBadges = page.getByText('Frozen');
        await expect(frozenBadges).toHaveCount(affectedTypes.length);
      });

      // FA-003: Savings untouched
      test('Scenario 2: Savings account is NOT frozen', async ({ page }) => {
        const savingsCard = page.getByText('Savings').locator('..').locator('..');
        await expect(savingsCard.getByText('Frozen')).not.toBeVisible();
      });

      // FA-008 / Scenario 3: frozen accounts are not clickable
      test('Scenario 3: frozen account cards do not navigate on click', async ({ page }) => {
        const initialUrl = page.url();
        const checkingCard = page.getByText('Checking').locator('..').locator('..');
        await checkingCard.click({ force: true });
        await page.waitForTimeout(500);
        expect(page.url()).toBe(initialUrl);
      });
    });
  });
}
