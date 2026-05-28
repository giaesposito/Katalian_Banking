/**
 * Playwright E2E Tests — REQ-005: Security Actions: Card Freeze & Account Protection
 *
 * Covers: Report Stolen Asset (RS), Freeze All Cards (FA), Nuclear Lockdown (NL),
 * Common UI (CU), Navigation Entry Points, and all 7 Acceptance Criteria (AC).
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test Fixture — mirrors constants.ts user1 (no random transactions)
// ---------------------------------------------------------------------------

const TEST_USER = {
  id: 'user1',
  username: 'bankinguser123',
  passwordHash: 'notapassword@123',
  locked: false,
  canApplyForPlatinum: true,
  loans: [],
  accounts: [
    {
      id: 'acc1-1',
      type: 'Checking',
      accountNumber: '...7890',
      balance: 5345.54,
      transactions: [],
    },
    {
      id: 'acc1-2',
      type: 'Savings',
      accountNumber: '...1234',
      balance: 104456.67,
      transactions: [],
    },
    {
      id: 'acc1-3',
      type: 'Credit Card',
      accountNumber: '...9921',
      balance: 1250.0,
      transactions: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Seeds localStorage with a logged-in session so the next page.goto() picks it
 * up without going through the login UI. Must be followed by page.goto(route).
 */
async function setupSession(page: Page, user = TEST_USER) {
  await page.goto('/login');
  await page.evaluate((u) => {
    localStorage.setItem('katalian_users_v1', JSON.stringify([u]));
    localStorage.setItem('katalian_session_v1', JSON.stringify(u));
  }, user);
}


// ---------------------------------------------------------------------------
// Report Stolen Asset
// ---------------------------------------------------------------------------

test.describe('Report Stolen Asset', () => {
  test.beforeEach(async ({ page }) => {
    await setupSession(page);
    await page.goto('/security/report');
  });

  // --- Page header / subheader ---

  test('[CU-005/006] shows "Security Protocol" header and "Incident Management" subheader', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Security.*Protocol/i })).toBeVisible();
    await expect(page.getByText('Incident Management')).toBeVisible();
  });

  // --- Step 1: Asset Compromise Report ---

  test('[RS1-001/RS1-002] shows "Asset Compromise Report" heading and identifying subtext', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Asset Compromise Report' })).toBeVisible();
    await expect(page.getByText('Identify the specific facility that has been compromised.')).toBeVisible();
  });

  test('[RS-001/RS-002/RS1-003/RS1-004/RS1-005] dropdown lists all accounts with type and last 4 digits', async ({ page }) => {
    const select = page.locator('select');
    await expect(select).toBeVisible();

    const options = await select.locator('option').allTextContents();
    expect(options).toContain('Checking (Ending 7890)');
    expect(options).toContain('Savings (Ending 1234)');
    expect(options).toContain('Credit Card (Ending 9921)');

    // First account (Checking) is pre-selected by default
    await expect(select).toHaveValue('acc1-1');
  });

  test('[RS-003/RS1-006/RS1-007] shows "Incident Narrative" label with correct placeholder', async ({ page }) => {
    await expect(page.getByText('Incident Narrative')).toBeVisible();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute(
      'placeholder',
      expect.stringContaining('Briefly describe the nature of the compromise'),
    );
  });

  test('[RS-004/RS1-010] "Authorize Asset Freeze" button is disabled when description is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Authorize Asset Freeze' })).toBeDisabled();
  });

  test('[RS-004] "Authorize Asset Freeze" button enables after entering a description', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await expect(page.getByRole('button', { name: 'Authorize Asset Freeze' })).toBeEnabled();
  });

  test('[RS1-008] "Cancel" navigates to /contact', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('[CU-003] Close (X) button navigates to /contact', async ({ page }) => {
    // The X button is the only button without text — it renders an SVG cross icon
    await page.locator('button:has(svg path[d*="M6 18L18 6"])').click();
    await expect(page).toHaveURL(/\/contact/);
  });

  // --- Step 2: Confirm Asset Freeze ---

  test('[RS-005/RS2-002/RS2-003/RS2-004/RS2-005/RS2-006] confirmation step shows correct content', async ({ page }) => {
    await page.locator('textarea').fill('Suspicious web activity');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();

    await expect(page.getByRole('heading', { name: 'Confirm Asset Freeze' })).toBeVisible();
    // Shows the selected account type (Checking is pre-selected)
    await expect(page.getByText(/You are about to freeze/)).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'Checking' })).toBeVisible();
    await expect(page.getByText(/block all incoming and outgoing electronic authorizations/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Execute Freeze Protocol' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Selection' })).toBeVisible();
  });

  test('[RS2-006] "Back to Selection" returns to step 1', async ({ page }) => {
    await page.locator('textarea').fill('Suspicious activity');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Back to Selection' }).click();
    await expect(page.getByRole('heading', { name: 'Asset Compromise Report' })).toBeVisible();
  });

  test('[CU-001/002] progress bar advances from step 1 (~33%) to step 2 (~67%)', async ({ page }) => {
    const bar = page.locator('[style*="width"]').first();

    // Step 1 → ~33%
    const widthStep1 = await bar.getAttribute('style');
    expect(widthStep1).toContain('33.333');

    await page.locator('textarea').fill('Lost card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();

    // Step 2 → ~67%
    const widthStep2 = await bar.getAttribute('style');
    expect(widthStep2).toContain('66.666');
  });

  // --- Processing state ---

  test('[RS/CU] shows "Provisioning Asset Block" loading text during processing', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();

    await expect(page.getByText('Provisioning Asset Block')).toBeVisible({ timeout: 500 });
    await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible({ timeout: 500 });
  });

  // --- Step 3: Success ---

  test('[RS-006/RS-007/RS3-002/RS3-003] shows "Asset Frozen" success screen with 15-minute message', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();

    await expect(page.getByRole('heading', { name: 'Asset Frozen' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/15 minutes/)).toBeVisible();
    await expect(page.getByText(/fraud prevention squad will contact you/)).toBeVisible();
  });

  test('[CU-004] Close (X) button is hidden on the success step', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();

    await expect(page.getByRole('heading', { name: 'Asset Frozen' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has(svg path[d*="M6 18L18 6"])')).not.toBeVisible();
  });

  test('[RS3-004] "Back to Portfolio" navigates to /dashboard', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();
    await expect(page.getByRole('heading', { name: 'Asset Frozen' })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // --- Acceptance Criterion 1: Simulation — no state change ---

  test('[AC-1] account status is NOT changed after Report (simulation only)', async ({ page }) => {
    await page.locator('textarea').fill('Lost physical card');
    await page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
    await page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();
    await expect(page.getByRole('heading', { name: 'Asset Frozen' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // No "Frozen" badges should be present on the dashboard
    await expect(page.getByText('Frozen')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Freeze All Cards (Cryo-Freeze)
// ---------------------------------------------------------------------------

test.describe('Freeze All Cards (Cryo-Freeze)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSession(page);
    await page.goto('/security/freeze-all');
  });

  // --- Page header / subheader ---

  test('[CU-005/006/FA1-001] shows Security Protocol header and "Cryo-Freeze Protocol" subheader', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Security.*Protocol/i })).toBeVisible();
    await expect(page.getByText('Cryo-Freeze Protocol')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cryo-Freeze Cards' })).toBeVisible();
  });

  // --- Step 1: Confirmation ---

  test('[FA1-002] shows explanation text about suspension scope', async ({ page }) => {
    await expect(
      page.getByText(/temporarily suspend all active cards and digital payment facilities/),
    ).toBeVisible();
    await expect(page.getByText(/External ACH and Savings transfers will remain functional/)).toBeVisible();
  });

  test('[FA-001/FA-002/FA-003/FA1-003/FA1-004] shows only Checking and Credit Card as affected facilities', async ({ page }) => {
    await expect(page.getByText('Affected Facilities:')).toBeVisible();

    // Checking and Credit Card must appear as badges
    const affected = page.locator('span').filter({ hasText: /^(Checking|Credit Card)$/ });
    await expect(affected).toHaveCount(2);

    // Savings must NOT appear in affected list
    const affectedText = await page.locator('[class*="flex flex-wrap"]').textContent();
    expect(affectedText).not.toContain('Savings');
  });

  test('[FA1-005] "Authorize Cryo-Freeze" button is present and clickable', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Authorize Cryo-Freeze' })).toBeEnabled();
  });

  // --- Acceptance Criterion 6: Cancel ---

  test('[FA1-006/AC-6] "Cancel Protocol" navigates to /dashboard without changing account status', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel Protocol' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // No frozen badges on dashboard
    await expect(page.getByText('Frozen')).not.toBeVisible();
  });

  // --- Processing state ---

  test('[FAP-002/FAP-003] shows "Deep-Freezing Card Facilities" loading text during processing', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();

    await expect(page.getByText('Deep-Freezing Card Facilities')).toBeVisible({ timeout: 500 });
    await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible({ timeout: 500 });
  });

  // --- Step 3: Success ---

  test('[FA3-002/FA3-003] shows "Facilities Suspended" success screen with reactivation message', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();

    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/deep-freeze status/)).toBeVisible();
    await expect(page.getByText(/reactivate them individually from the account details ledger/)).toBeVisible();
  });

  test('[FA3-004/FA-006] "Back to Portfolio" navigates to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // --- Dashboard: Frozen accounts (Acceptance Criteria 2 & 3) ---

  test('[FA-004/FA-007/AC-2/AC-3] Checking and Credit Card show "Frozen" badge on dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Exactly 2 "Frozen" badges — one for Checking, one for Credit Card
    await expect(page.getByText('Frozen')).toHaveCount(2);
  });

  test('[FA-003] Savings account does NOT show a "Frozen" badge after Cryo-Freeze', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Three account cards rendered; only 2 frozen badges
    await expect(page.getByText('Frozen')).toHaveCount(2);
  });

  test('[FA-008] frozen account cards have cursor-not-allowed styling', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const frozenCards = page.locator('.cursor-not-allowed');
    await expect(frozenCards).toHaveCount(2);
  });

  test('[FA-008] clicking a frozen account card does not navigate away from /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
    await expect(page.getByRole('heading', { name: 'Facilities Suspended' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const frozenCard = page.locator('.cursor-not-allowed').first();
    await frozenCard.click({ force: true });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

// ---------------------------------------------------------------------------
// Nuclear Lockdown
// ---------------------------------------------------------------------------

test.describe('Nuclear Lockdown', () => {
  test.beforeEach(async ({ page }) => {
    await setupSession(page);
    await page.goto('/security/lockdown');
  });

  // --- Page header / subheader ---

  test('[CU-005/006] shows Security Protocol header and "Critical Action Needed" subheader', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Security.*Protocol/i })).toBeVisible();
    await expect(page.getByText('Critical Action Needed')).toBeVisible();
  });

  // --- Step 1: Initial Warning ---

  test('[NL1-001/NL1-002] shows "Nuclear Lockdown" heading with radiation icon', async ({ page }) => {
    await expect(page.getByText('☢️')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nuclear Lockdown' })).toBeVisible();
  });

  test('[NL-005/NL-006/NL1-003/NL1-004] shows irreversible warning text with red emphasis', async ({ page }) => {
    await expect(
      page.getByText(/terminate all active sessions, invalidate current access tokens/),
    ).toBeVisible();
    await expect(page.getByText('THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE.')).toBeVisible();
    await expect(page.getByText('Authorization Required')).toBeVisible();
  });

  test('[NL1-006] "Abort Procedure" navigates to /contact', async ({ page }) => {
    await page.getByRole('button', { name: 'Abort Procedure' }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  // --- Step 2: Final Warning ---

  test('[NL1-005/NL2-002/NL2-003/NL2-004] "Initiate Global Lockdown" advances to Final Warning step', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();

    await expect(page.getByRole('heading', { name: 'Final Warning' })).toBeVisible();
    await expect(page.getByText('Global ledger freeze will commence upon confirmation.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' })).toBeVisible();
  });

  test('[NL2-005/AC-7] "Back to Safety" returns to Step 1 without initiating lockdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
    await expect(page.getByRole('heading', { name: 'Final Warning' })).toBeVisible();

    await page.getByRole('button', { name: 'Back to Safety' }).click();
    await expect(page.getByRole('heading', { name: 'Nuclear Lockdown' })).toBeVisible();
    // Still logged in — not redirected to /login
    await expect(page).toHaveURL(/\/security\/lockdown/);
  });

  // --- Processing state ---

  test('[NLP-002/NLP-003] "CONFIRM GLOBAL FREEZE" shows "Terminating All Sessions" loading text', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
    await page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' }).click();

    await expect(page.getByText('Terminating All Sessions')).toBeVisible({ timeout: 500 });
    await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible({ timeout: 500 });
  });

  // --- Step 3: System Locked ---

  test('[NL3-002/NL3-003/NL3-004] shows "System Locked" screen with logout countdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
    await page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' }).click();

    await expect(page.getByRole('heading', { name: 'System Locked' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/You will be logged out in 3 seconds/)).toBeVisible();
  });

  // --- Acceptance Criterion 4: auto-logout ---

  test('[NL3-005/NL-002/AC-4] auto-logout redirects to /login within 3 seconds of System Locked screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
    await page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' }).click();

    await expect(page.getByRole('heading', { name: 'System Locked' })).toBeVisible({ timeout: 5000 });

    // 3-second countdown then auto-logout
    await expect(page).toHaveURL(/\/login/, { timeout: 6000 });
  });

  // --- Acceptance Criteria 4 & 5: locked user cannot re-login ---

  test('[NL-001/NL-003/AC-4/AC-5] user is locked and cannot login with regular password after lockdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
    await page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' }).click();

    await expect(page.getByRole('heading', { name: 'System Locked' })).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 6000 });

    // Attempt login with pre-lockdown credentials
    await page.getByLabel('Secure ID').fill('bankinguser123');
    await page.getByLabel('Access Code').fill('notapassword@123');
    await page.getByRole('button', { name: 'Enter Vault Access' }).click();

    // Must see locked error (login has a 1s delay)
    await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
    // Must stay on /login — not navigate to /dashboard
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Navigation Entry Points
// ---------------------------------------------------------------------------

test.describe('Navigation Entry Points', () => {
  test('Dashboard "Freeze All Cards" quick-link navigates to /security/freeze-all', async ({ page }) => {
    await setupSession(page);
    await page.goto('/dashboard');

    await page.getByText('Freeze All Cards').click();
    await expect(page).toHaveURL(/\/security\/freeze-all/);
  });

  test('Contact "Report Stolen Asset" button navigates to /security/report', async ({ page }) => {
    await setupSession(page);
    await page.goto('/contact');

    await page.getByRole('button', { name: 'Report Stolen Asset' }).click();
    await expect(page).toHaveURL(/\/security\/report/);
  });

  test('Contact "Account Lockdown" button navigates to /security/lockdown', async ({ page }) => {
    await setupSession(page);
    await page.goto('/contact');

    await page.getByRole('button', { name: 'Account Lockdown' }).click();
    await expect(page).toHaveURL(/\/security\/lockdown/);
  });
});

// ---------------------------------------------------------------------------
// Login — Locked Account (standalone, no full lockdown flow required)
// ---------------------------------------------------------------------------

test.describe('Login — Locked Account', () => {
  test('[AC-5] pre-locked user sees "Account locked for security reasons." error on login', async ({ page }) => {
    const lockedUser = { ...TEST_USER, locked: true };

    // Set up users list with locked flag but no active session
    await page.goto('/login');
    await page.evaluate((u) => {
      localStorage.setItem('katalian_users_v1', JSON.stringify([u]));
      localStorage.removeItem('katalian_session_v1');
    }, lockedUser);

    await page.goto('/login'); // Reload so React picks up updated users from localStorage

    await page.getByLabel('Secure ID').fill('bankinguser123');
    await page.getByLabel('Access Code').fill('notapassword@123');
    await page.getByRole('button', { name: 'Enter Vault Access' }).click();

    await expect(page.getByText('Account locked for security reasons.')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('invalid credentials show "Authentication failed" error', async ({ page }) => {
    const user = { ...TEST_USER };

    await page.goto('/login');
    await page.evaluate((u) => {
      localStorage.setItem('katalian_users_v1', JSON.stringify([u]));
      localStorage.removeItem('katalian_session_v1');
    }, user);
    await page.goto('/login');

    await page.getByLabel('Secure ID').fill('bankinguser123');
    await page.getByLabel('Access Code').fill('wrongpassword');
    await page.getByRole('button', { name: 'Enter Vault Access' }).click();

    await expect(
      page.getByText('Authentication failed. Check Secure ID and Code.'),
    ).toBeVisible({ timeout: 3000 });
  });
});
