import { test, expect } from '@playwright/test';
import { injectAuth, injectUsersOnly, LOCKED_USER, TEST_USER } from '../helpers/auth';

/**
 * KB-15 – Action 3: Nuclear Lockdown (/security/lockdown)
 * NL-001 to NL-006, NL1-001 to NL1-006, NL2-001 to NL2-005,
 * NLP-001 to NLP-004, NL3-001 to NL3-006
 * Acceptance Criteria: Scenarios 4, 5, 7
 */

test.describe('Nuclear Lockdown – Step 1: Initial Warning', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
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

  // NL-006 / NL1-004: irreversibility warning
  test('displays irreversibility warning in red', async ({ page }) => {
    await expect(page.getByText('THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE.')).toBeVisible();
  });

  // NL1-005: advancing to step 2
  test('"Initiate Global Lockdown" advances to Step 2', async ({ page }) => {
    await page.getByRole('button', { name: /initiate global lockdown/i }).click();
    await expect(page.getByText('Final Warning')).toBeVisible();
  });

  // NL1-006: Abort Procedure navigates to /contact
  test('"Abort Procedure" navigates to /contact', async ({ page }) => {
    await page.getByRole('button', { name: /abort procedure/i }).click();
    await expect(page).toHaveURL('/contact');
  });
});

test.describe('Nuclear Lockdown – Step 2: Final Warning', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/lockdown');
    await page.getByRole('button', { name: /initiate global lockdown/i }).click();
    await expect(page.getByText('Final Warning')).toBeVisible();
  });

  // NL2-001
  test('displays spinning border animation with warning icon', async ({ page }) => {
    await expect(page.getByText('⚠️')).toBeVisible();
    await expect(page.locator('.animate-spin').first()).toBeVisible();
  });

  // NL2-002
  test('displays "Final Warning" header', async ({ page }) => {
    await expect(page.getByText('Final Warning')).toBeVisible();
  });

  // NL2-003
  test('displays "Global ledger freeze will commence upon confirmation" subtext', async ({ page }) => {
    await expect(page.getByText(/global ledger freeze will commence upon confirmation/i)).toBeVisible();
  });

  // NL2-004: CONFIRM GLOBAL FREEZE triggers processing
  test('"CONFIRM GLOBAL FREEZE" triggers processing state', async ({ page }) => {
    await page.getByRole('button', { name: /confirm global freeze/i }).click();
    await expect(page.getByText('Terminating All Sessions')).toBeVisible();
  });

  // NL2-005 / Scenario 7: Back to Safety returns to Step 1
  test('"Back to Safety" returns to Step 1 without initiating lockdown', async ({ page }) => {
    await page.getByRole('button', { name: /back to safety/i }).click();
    await expect(page.getByText('Nuclear Lockdown')).toBeVisible();
    await expect(page.getByText('Final Warning')).not.toBeVisible();
  });
});

test.describe('Nuclear Lockdown – Processing State', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
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

  // NLP-004: 2500ms delay — success screen appears within 5s
  test('transitions to "System Locked" after processing', async ({ page }) => {
    await expect(page.getByText('System Locked')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Nuclear Lockdown – Step 3: System Locked', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
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
  test('displays logout countdown message', async ({ page }) => {
    await expect(page.getByText(/you will be logged out in 3 seconds/i)).toBeVisible();
  });

  // NL3-004: progress bar countdown animation element is present
  test('displays animated progress bar countdown', async ({ page }) => {
    await expect(page.locator('.animate-\\[progress_3s_linear_forwards\\]')).toBeVisible();
  });
});

/**
 * Acceptance Criteria – Scenario 4:
 * user.locked becomes true, user is logged out and redirected to /login after 3 seconds.
 */
test.describe('Nuclear Lockdown – Acceptance Criteria Scenario 4', () => {
  test('user is redirected to /login after lockdown completes', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/lockdown');
    await page.getByRole('button', { name: /initiate global lockdown/i }).click();
    await page.getByRole('button', { name: /confirm global freeze/i }).click();
    await page.getByText('System Locked').waitFor({ timeout: 5000 });

    // Auto-logout fires after 3s; allow up to 7s total
    await expect(page).toHaveURL('/login', { timeout: 7000 });
  });

  test('locked user cannot log in with their regular password after lockdown', async ({ page }) => {
    // Simulate a user already locked (as would be the case post-lockdown)
    await injectUsersOnly(page, [LOCKED_USER]);
    await page.goto('/login');

    await page.getByLabel('Secure ID').fill(TEST_USER.username);
    await page.getByLabel('Access Code').fill(TEST_USER.passwordHash);
    await page.getByRole('button', { name: /enter vault access/i }).click();

    await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
  });
});

/**
 * Acceptance Criteria – Scenario 5:
 * Locked user sees error message when attempting normal login.
 */
test.describe('Nuclear Lockdown – Acceptance Criteria Scenario 5', () => {
  test('displays "Account locked for security reasons." for a locked account', async ({ page }) => {
    await injectUsersOnly(page, [LOCKED_USER]);
    await page.goto('/login');

    await page.getByLabel('Secure ID').fill(TEST_USER.username);
    await page.getByLabel('Access Code').fill(TEST_USER.passwordHash);
    await page.getByRole('button', { name: /enter vault access/i }).click();

    await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
  });

  test('locked user remains on /login and is not redirected to dashboard', async ({ page }) => {
    await injectUsersOnly(page, [LOCKED_USER]);
    await page.goto('/login');

    await page.getByLabel('Secure ID').fill(TEST_USER.username);
    await page.getByLabel('Access Code').fill(TEST_USER.passwordHash);
    await page.getByRole('button', { name: /enter vault access/i }).click();

    await page.waitForTimeout(1500);
    await expect(page).toHaveURL('/login');
  });
});

/**
 * Acceptance Criteria – Scenario 7:
 * "Back to Safety" on Step 2 returns to Step 1 without initiating lockdown.
 */
test.describe('Nuclear Lockdown – Acceptance Criteria Scenario 7', () => {
  test('back navigation from Step 2 does not lock the account', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/security/lockdown');

    await page.getByRole('button', { name: /initiate global lockdown/i }).click();
    await expect(page.getByText('Final Warning')).toBeVisible();

    await page.getByRole('button', { name: /back to safety/i }).click();
    await expect(page.getByText('Nuclear Lockdown')).toBeVisible();

    // Verify user is still authenticated (can navigate to dashboard)
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});
