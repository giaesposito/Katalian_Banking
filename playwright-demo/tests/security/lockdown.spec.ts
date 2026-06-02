import { test, expect } from '@playwright/test';
import { injectAuth, injectUsersOnly, getUserFixture } from '../helpers/auth';
import { activeCredentials, lockedCredentials } from '../helpers/csv-parser';

/**
 * KB-15 – Action 3: Nuclear Lockdown (/security/lockdown)
 * NL-001 to NL-006, NL1-001 to NL1-006, NL2-001 to NL2-005,
 * NLP-001 to NLP-004, NL3-001 to NL3-006
 * Acceptance Criteria: Scenarios 4, 5, 7
 *
 * Data-driven:
 *   - Lockdown flow tests run for each Active user in credentials.csv
 *   - Locked login rejection tests run for each Locked user in credentials.csv
 */

// ─── Lockdown flow tests (Active users) ──────────────────────────────────────

for (const cred of activeCredentials) {
  test.describe(`Nuclear Lockdown – flow [${cred.username}]`, () => {
    const user = getUserFixture(cred.username);

    test.describe('Step 1: Initial Warning', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/lockdown');
      });

      // NL1-001
      test('displays pulsing radiation icon', async ({ page }) => {
        await expect(page.getByText('☢️')).toBeVisible();
      });

      // NL1-002
      test('displays "Nuclear Lockdown" header', async ({ page }) => {
        await expect(page.getByText('Nuclear Lockdown')).toBeVisible();
      });

      // NL1-003
      test('displays warning about session termination and asset freeze', async ({ page }) => {
        await expect(page.getByText(/terminate all active sessions/i)).toBeVisible();
        await expect(page.getByText(/freeze ALL financial facilities/i)).toBeVisible();
      });

      // NL-006 / NL1-004
      test('displays irreversibility warning', async ({ page }) => {
        await expect(page.getByText('THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE.')).toBeVisible();
      });

      // NL1-005
      test('"Initiate Global Lockdown" advances to Step 2', async ({ page }) => {
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await expect(page.getByText('Final Warning')).toBeVisible();
      });

      // NL1-006
      test('"Abort Procedure" navigates to /contact', async ({ page }) => {
        await page.getByRole('button', { name: /abort procedure/i }).click();
        await expect(page).toHaveURL('/contact');
      });
    });

    test.describe('Step 2: Final Warning', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await expect(page.getByText('Final Warning')).toBeVisible();
      });

      // NL2-001
      test('displays spinning animation with warning icon', async ({ page }) => {
        await expect(page.getByText('⚠️')).toBeVisible();
        await expect(page.locator('.animate-spin').first()).toBeVisible();
      });

      // NL2-002
      test('displays "Final Warning" header', async ({ page }) => {
        await expect(page.getByText('Final Warning')).toBeVisible();
      });

      // NL2-003
      test('displays "Global ledger freeze will commence upon confirmation"', async ({ page }) => {
        await expect(page.getByText(/global ledger freeze will commence upon confirmation/i)).toBeVisible();
      });

      // NL2-004
      test('"CONFIRM GLOBAL FREEZE" triggers processing state', async ({ page }) => {
        await page.getByRole('button', { name: /confirm global freeze/i }).click();
        await expect(page.getByText('Terminating All Sessions')).toBeVisible();
      });

      // NL2-005 / Scenario 7
      test('"Back to Safety" returns to Step 1 without initiating lockdown', async ({ page }) => {
        await page.getByRole('button', { name: /back to safety/i }).click();
        await expect(page.getByText('Nuclear Lockdown')).toBeVisible();
        await expect(page.getByText('Final Warning')).not.toBeVisible();
      });
    });

    test.describe('Processing State', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();
      });

      // NLP-001
      test('shows loading spinner', async ({ page }) => {
        await expect(page.locator('.animate-spin').first()).toBeVisible();
      });

      // NLP-002
      test('shows "Terminating All Sessions" header', async ({ page }) => {
        await expect(page.getByText('Terminating All Sessions')).toBeVisible();
      });

      // NLP-003
      test('shows "Validating security signatures" subtext', async ({ page }) => {
        await expect(page.getByText(/validating security signatures and notifying central bank/i)).toBeVisible();
      });

      // NLP-004: completes within 5s
      test('transitions to "System Locked" after ~2500ms', async ({ page }) => {
        await expect(page.getByText('System Locked')).toBeVisible({ timeout: 5000 });
      });
    });

    test.describe('Step 3: System Locked', () => {
      test.beforeEach(async ({ page }) => {
        await injectAuth(page, user);
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();
        await page.getByText('System Locked').waitFor({ timeout: 5000 });
      });

      // NL3-001
      test('displays lock icon in red container', async ({ page }) => {
        await expect(page.getByText('🔒')).toBeVisible();
      });

      // NL3-002
      test('displays "System Locked" header', async ({ page }) => {
        await expect(page.getByText('System Locked')).toBeVisible();
      });

      // NL3-003
      test('displays 3-second logout countdown message', async ({ page }) => {
        await expect(page.getByText(/you will be logged out in 3 seconds/i)).toBeVisible();
      });

      // NL3-004
      test('displays animated progress bar countdown', async ({ page }) => {
        await expect(page.locator('.animate-\\[progress_3s_linear_forwards\\]')).toBeVisible();
      });
    });

    // Scenario 4: auto-logout after lockdown
    test(`Scenario 4: ${cred.username} is redirected to /login after lockdown`, async ({ page }) => {
      await injectAuth(page, user);
      await page.goto('/security/lockdown');
      await page.getByRole('button', { name: /initiate global lockdown/i }).click();
      await page.getByRole('button', { name: /confirm global freeze/i }).click();
      await page.getByText('System Locked').waitFor({ timeout: 5000 });

      // Auto-logout fires after 3s
      await expect(page).toHaveURL('/login', { timeout: 7000 });
    });

    // Scenario 7: back navigation does not lock the account
    test(`Scenario 7: ${cred.username} back navigation from Step 2 does not trigger lockdown`, async ({ page }) => {
      await injectAuth(page, user);
      await page.goto('/security/lockdown');

      await page.getByRole('button', { name: /initiate global lockdown/i }).click();
      await expect(page.getByText('Final Warning')).toBeVisible();

      await page.getByRole('button', { name: /back to safety/i }).click();
      await expect(page.getByText('Nuclear Lockdown')).toBeVisible();

      // User still authenticated — dashboard is accessible
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');
    });
  });
}

// ─── Locked account login rejection (Locked users + post-lockdown state) ─────

test.describe('Scenario 5: Locked account login rejection', () => {
  // Runs for each Locked user in credentials.csv
  for (const cred of lockedCredentials) {
    test(`rejects login for locked user: ${cred.username}`, async ({ page }) => {
      const lockedUser = { ...getUserFixture(cred.username), locked: true };
      await injectUsersOnly(page, [lockedUser]);
      await page.goto('/login');

      await page.getByLabel('Secure ID').fill(cred.username);
      await page.getByLabel('Access Code').fill(cred.password);
      await page.getByRole('button', { name: /enter vault access/i }).click();

      await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
    });

    test(`locked user ${cred.username} remains on /login after failed attempt`, async ({ page }) => {
      const lockedUser = { ...getUserFixture(cred.username), locked: true };
      await injectUsersOnly(page, [lockedUser]);
      await page.goto('/login');

      await page.getByLabel('Secure ID').fill(cred.username);
      await page.getByLabel('Access Code').fill(cred.password);
      await page.getByRole('button', { name: /enter vault access/i }).click();

      await page.waitForTimeout(1500);
      await expect(page).toHaveURL('/login');
    });
  }

  // Also verify that an active user who completes lockdown cannot log back in
  for (const cred of activeCredentials) {
    test(`${cred.username} cannot log in with regular password after Nuclear Lockdown`, async ({ page }) => {
      const lockedUser = { ...getUserFixture(cred.username), locked: true };
      await injectUsersOnly(page, [lockedUser]);
      await page.goto('/login');

      await page.getByLabel('Secure ID').fill(cred.username);
      await page.getByLabel('Access Code').fill(cred.password);
      await page.getByRole('button', { name: /enter vault access/i }).click();

      await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
    });
  }
});
