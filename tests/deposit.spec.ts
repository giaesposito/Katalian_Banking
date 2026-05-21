/**
 * KB-34 – Deposit Facility: Multi-Method Fund Provisioning
 * Covers all 14 acceptance criteria plus data-driven login scenarios.
 *
 * App uses HashRouter: routes are /#/login, /#/dashboard, /#/deposit, etc.
 * Session is persisted in localStorage (katalian_session_v1).
 */

import { test, expect, Page } from '@playwright/test';
import { ACTIVE_USER, LOCKED_USER, TEST_USERS } from './data/users';

// Minimal 1×1 PNG used for check image upload tests (avoids binary fixture files)
const SAMPLE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
const CHECK_FRONT_FILE = { name: 'check-front.png', mimeType: 'image/png', buffer: SAMPLE_PNG };
const CHECK_BACK_FILE  = { name: 'check-back.png',  mimeType: 'image/png', buffer: SAMPLE_PNG };

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Reset persisted state so every test starts from a clean slate. */
async function clearAppState(page: Page) {
  await page.goto('/#/login');
  await page.evaluate(() => {
    localStorage.removeItem('katalian_users_v1');
    localStorage.removeItem('katalian_session_v1');
  });
}

/** Log in via the UI and wait for the dashboard to load. */
async function login(page: Page, username: string, password: string) {
  await page.goto('/#/login');
  await page.getByLabel('Secure ID').fill(username);
  await page.getByLabel('Access Code').fill(password);
  await page.getByRole('button', { name: 'Enter Vault Access' }).click();
  await page.waitForURL(/\/#\/dashboard/);
}

/**
 * Navigate to /#/deposit, optionally switch to Check method,
 * and fill in the amount – leaves the user on Step 1 with Continue ready.
 */
async function fillStep1(page: Page, amount: string, method: 'ACH' | 'Check' = 'ACH') {
  await page.goto('/#/deposit');
  await expect(page.getByText('Deposit Configuration')).toBeVisible();
  if (method === 'Check') {
    await page.getByText('Check Deposit').click();
  }
  await page.getByLabel('Provision Amount ($)').fill(amount);
}

/** Upload front and back check images on Step 2 (Check method). */
async function uploadBothCheckImages(page: Page) {
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(0).setInputFiles(CHECK_FRONT_FILE);
  await fileInputs.nth(1).setInputFiles(CHECK_BACK_FILE);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('KB-34 – Deposit Facility', () => {

  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  // ── AC-14: Authentication Guard ───────────────────────────────────────────

  test('AC-14: unauthenticated access to /deposit redirects to /login', async ({ page }) => {
    await page.goto('/#/deposit');
    await expect(page).toHaveURL(/\/#\/login/);
  });

  // ── Data-driven login scenarios (from katalian_logins.csv) ────────────────

  test.describe('Login – data-driven', () => {
    for (const user of TEST_USERS) {
      if (user.status === 'Active') {
        test(`active user "${user.username}" can log in successfully`, async ({ page }) => {
          await page.goto('/#/login');
          await page.getByLabel('Secure ID').fill(user.username);
          await page.getByLabel('Access Code').fill(user.password);
          await page.getByRole('button', { name: 'Enter Vault Access' }).click();
          await expect(page).toHaveURL(/\/#\/dashboard/);
        });
      }

      if (user.status === 'Locked') {
        test(`locked user "${user.username}" sees account locked error`, async ({ page }) => {
          await page.goto('/#/login');
          await page.getByLabel('Secure ID').fill(user.username);
          await page.getByLabel('Access Code').fill(user.password);
          await page.getByRole('button', { name: 'Enter Vault Access' }).click();
          await expect(page.getByText('Account locked for security reasons.')).toBeVisible();
          await expect(page).toHaveURL(/\/#\/login/);
        });

        test(`locked user "${user.username}" cannot access /deposit`, async ({ page }) => {
          // Attempt direct navigation without a session
          await page.goto('/#/deposit');
          await expect(page).toHaveURL(/\/#\/login/);
        });
      }
    }

    test('unknown credentials show authentication failed error', async ({ page }) => {
      await page.goto('/#/login');
      await page.getByLabel('Secure ID').fill('nonexistentuser');
      await page.getByLabel('Access Code').fill('wrongpassword');
      await page.getByRole('button', { name: 'Enter Vault Access' }).click();
      await expect(page.getByText('Authentication failed. Check Secure ID and Code.')).toBeVisible();
    });
  });

  // ── AC-1: Method Selection ────────────────────────────────────────────────

  test('AC-1: both deposit methods are displayed on Step 1', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await expect(page.getByText('Electronic Transfer')).toBeVisible();
    await expect(page.getByText('Check Deposit')).toBeVisible();
  });

  test('AC-1: ACH defaults as selected with emerald highlight', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    // The ACH button's parent button should carry the emerald border class
    const achButton = page.getByText('Electronic Transfer').locator('..');
    await expect(achButton).toHaveClass(/border-emerald-500/);
  });

  test('AC-1: selecting Check Deposit highlights it with emerald border', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await page.getByText('Check Deposit').click();
    const checkButton = page.getByText('Check Deposit').locator('..');
    await expect(checkButton).toHaveClass(/border-emerald-500/);
    // ACH should lose its highlight
    const achButton = page.getByText('Electronic Transfer').locator('..');
    await expect(achButton).not.toHaveClass(/border-emerald-500\/40/);
  });

  // ── AC-2: Account Selection ───────────────────────────────────────────────

  test('AC-2: destination dropdown lists all accounts with type, number, and balance', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    const dropdown = page.locator('select');
    await expect(dropdown).toBeVisible();
    const options = await dropdown.locator('option').allTextContents();
    // bankinguser123 has Checking ...7890 ($5,345.54) and Savings ...1234 ($104,456.67)
    expect(options.some(o => o.includes('Checking'))).toBe(true);
    expect(options.some(o => o.includes('Savings'))).toBe(true);
    expect(options.some(o => o.includes('7890'))).toBe(true);
    expect(options.some(o => o.includes('1234'))).toBe(true);
    expect(options.some(o => o.includes('$'))).toBe(true);
  });

  // ── AC-3: Amount Entry Validation ─────────────────────────────────────────

  test('AC-3: Continue is disabled when no amount is entered', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('AC-3: Continue is disabled when amount is 0', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await page.getByLabel('Provision Amount ($)').fill('0');
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('AC-3: Continue is enabled with a valid positive amount', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await page.getByLabel('Provision Amount ($)').fill('500');
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  // ── AC-12: Progress Bar ───────────────────────────────────────────────────

  test('AC-12: progress bar is ~33% on Step 1', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await page.goto('/#/deposit');
    await expect(page.getByText('Step 1 of 3')).toBeVisible();
    const bar = page.locator('div[style*="width"]');
    await expect(bar).toHaveAttribute('style', /33\.3/);
  });

  test('AC-12: progress bar is ~67% on Step 2', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    const bar = page.locator('div[style*="width"]');
    await expect(bar).toHaveAttribute('style', /66\.6/);
  });

  test('AC-12: progress bar is 100% on Step 3', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Step 3 of 3')).toBeVisible();
    const bar = page.locator('div[style*="width"]');
    await expect(bar).toHaveAttribute('style', /100%/);
  });

  // ── AC-13: Cancel / Close ─────────────────────────────────────────────────

  test('AC-13: X button on Step 1 returns to dashboard without depositing', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '999');
    const closeBtn = page.locator('button').filter({ has: page.locator('[d*="M6 18L18"]') });
    await closeBtn.click();
    await expect(page).toHaveURL(/\/#\/dashboard/);
  });

  test('AC-13: X button on Step 2 (ACH) returns to dashboard', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Funding Source')).toBeVisible();
    const closeBtn = page.locator('button').filter({ has: page.locator('[d*="M6 18L18"]') });
    await closeBtn.click();
    await expect(page).toHaveURL(/\/#\/dashboard/);
  });

  test('AC-13: X button on Step 2 (Check) returns to dashboard', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100', 'Check');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Mobile Check Capture')).toBeVisible();
    const closeBtn = page.locator('button').filter({ has: page.locator('[d*="M6 18L18"]') });
    await closeBtn.click();
    await expect(page).toHaveURL(/\/#\/dashboard/);
  });

  test('AC-13: X button on Step 3 returns to dashboard', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Final Authorization')).toBeVisible();
    const closeBtn = page.locator('button').filter({ has: page.locator('[d*="M6 18L18"]') });
    await closeBtn.click();
    await expect(page).toHaveURL(/\/#\/dashboard/);
  });

  test('AC-13: X button is not shown on Step 4 (confirmation)', async ({ page }) => {
    await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    await fillStep1(page, '100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Authorize Deposit' }).click();
    await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
    const closeBtn = page.locator('button').filter({ has: page.locator('[d*="M6 18L18"]') });
    await expect(closeBtn).toHaveCount(0);
  });

  // ─── ACH (Electronic Transfer) flow ──────────────────────────────────────

  test.describe('ACH – Electronic Transfer', () => {

    // AC-4: Read-only summary
    test('AC-4: Step 2 shows read-only external account summary', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '250');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Funding Source')).toBeVisible();
      await expect(page.getByText('EXTERNAL PARTNER BANK')).toBeVisible();
      await expect(page.getByText('********5542')).toBeVisible();
      await expect(page.getByText('Immediate Provisioning')).toBeVisible();
    });

    test('AC-4: Step 2 (ACH) contains no editable input fields', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '250');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Funding Source')).toBeVisible();
      // No text/number inputs should appear in the ACH confirmation step
      await expect(page.locator('input[type="text"], input[type="number"], textarea')).toHaveCount(0);
    });

    // AC-7: Step 3 review summary
    test('AC-7: Step 3 shows correct amount, account, and "Priority ACH" method', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Final Authorization')).toBeVisible();
      await expect(page.getByText('$500.00')).toBeVisible();
      await expect(page.getByText('Priority ACH')).toBeVisible();
      // Target account: Checking with last 4 digits 7890
      await expect(page.getByText(/Checking/)).toBeVisible();
      await expect(page.getByText(/7890/)).toBeVisible();
    });

    test('AC-7: Step 3 amount is formatted to 2 decimal places', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '1234.56');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('$1,234.56')).toBeVisible();
    });

    // AC-9: Confirmation message
    test('AC-9: confirmation shows account type and immediate provisioning message', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/provisioned/i)).toBeVisible();
      await expect(page.getByText(/Checking/i)).toBeVisible();
    });

    test('AC-9: ACH confirmation does not reference check clearing', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/queued for clearing/i)).toHaveCount(0);
    });

    // AC-8 + AC-11: Balance update and return to dashboard
    test('AC-8 + AC-11: ACH deposit updates balance and Return to Portfolio navigates to dashboard', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);

      // Record initial Checking balance visible on dashboard
      await expect(page.getByText('$5,345.54')).toBeVisible();

      await fillStep1(page, '100');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });

      await page.getByRole('button', { name: 'Return to Portfolio' }).click();
      await expect(page).toHaveURL(/\/#\/dashboard/);
      // Checking balance should now be $5,345.54 + $100.00 = $5,445.54
      await expect(page.getByText('$5,445.54')).toBeVisible();
    });

    // Dashboard navigation
    test('Deposit button on dashboard navigates to /deposit', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await page.getByRole('button', { name: 'Deposit' }).click();
      await expect(page).toHaveURL(/\/#\/deposit/);
      await expect(page.getByText('Deposit Configuration')).toBeVisible();
    });
  });

  // ─── Check (Remote Image Capture) flow ───────────────────────────────────

  test.describe('Check – Remote Image Capture', () => {

    // AC-5: Image upload required
    test('AC-5: Continue disabled on Check Step 2 with no images', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '1234.56', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Mobile Check Capture')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    test('AC-5: Continue disabled after uploading front image only', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '1234.56', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('input[type="file"]').nth(0).setInputFiles(CHECK_FRONT_FILE);
      await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    test('AC-5: Continue disabled after uploading back image only', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '1234.56', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('input[type="file"]').nth(1).setInputFiles(CHECK_BACK_FILE);
      await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    test('AC-5: Continue enabled after uploading both front and back images', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '1234.56', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
    });

    // AC-6: Image preview
    test('AC-6: uploading front check shows image preview', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('input[type="file"]').nth(0).setInputFiles(CHECK_FRONT_FILE);
      await expect(page.locator('img[alt="Front"]')).toBeVisible();
    });

    test('AC-6: uploading back check shows image preview', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await expect(page.locator('img[alt="Back"]')).toBeVisible();
    });

    test('AC-6: hovering front upload zone shows Replace Image overlay', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('input[type="file"]').nth(0).setInputFiles(CHECK_FRONT_FILE);
      const frontZone = page.locator('img[alt="Front"]').locator('..');
      await frontZone.hover();
      await expect(page.getByText('Replace Image').first()).toBeVisible();
    });

    // AC-7: Step 3 review summary (Check)
    test('AC-7: Step 3 shows "Remote Image Capture" and image verification for Check', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Final Authorization')).toBeVisible();
      await expect(page.getByText('$500.00')).toBeVisible();
      await expect(page.getByText('Remote Image Capture')).toBeVisible();
      await expect(page.getByText(/Passed.*Simulated/i)).toBeVisible();
    });

    // AC-10: Check confirmation message
    test('AC-10: confirmation shows check clearing and verification protocol message', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/queued for clearing/i)).toBeVisible();
      await expect(page.getByText(/verification protocols/i)).toBeVisible();
    });

    test('AC-10: Check confirmation does not reference immediate provisioning', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '500', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
      // ACH-specific message should NOT appear on check confirmation
      await expect(page.getByText(/successfully provisioned/i)).toHaveCount(0);
    });

    // AC-8 + AC-11: Balance update and return to dashboard
    test('AC-8 + AC-11: Check deposit updates balance and Return to Portfolio navigates to dashboard', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '100', 'Check');
      await page.getByRole('button', { name: 'Continue' }).click();
      await uploadBothCheckImages(page);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Authorize Deposit' }).click();
      await expect(page.getByText('Deposit Confirmed')).toBeVisible({ timeout: 10_000 });
      await page.getByRole('button', { name: 'Return to Portfolio' }).click();
      await expect(page).toHaveURL(/\/#\/dashboard/);
      // Checking balance: $5,345.54 + $100.00 = $5,445.54
      await expect(page.getByText('$5,445.54')).toBeVisible();
    });
  });

  // ─── Back navigation ──────────────────────────────────────────────────────

  test.describe('Back navigation', () => {
    test('Back button on Step 2 (ACH) returns to Step 1', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '100');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Funding Source')).toBeVisible();
      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('Deposit Configuration')).toBeVisible();
      await expect(page.getByText('Step 1 of 3')).toBeVisible();
    });

    test('Back button on Step 3 (ACH) returns to Step 2', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await fillStep1(page, '100');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Final Authorization')).toBeVisible();
      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('Funding Source')).toBeVisible();
      await expect(page.getByText('Step 2 of 3')).toBeVisible();
    });

    test('Back button is not shown on Step 1', async ({ page }) => {
      await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
      await page.goto('/#/deposit');
      await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);
    });
  });

});
