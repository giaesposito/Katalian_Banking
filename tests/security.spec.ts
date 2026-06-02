import { test, expect, Page } from '@playwright/test';

// Test credentials from constants.ts
const ACTIVE_USER = { username: 'bankinguser123', password: 'notapassword@123' };
const LOCKED_USER = { username: 'lockedout25', password: 'lockedoutpassword343' };

async function login(page: Page, username: string, password: string) {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL('**/dashboard');
}

// ---------------------------------------------------------------------------
// SCENARIO 1: Report Stolen Asset (simulated — no state change)
// ---------------------------------------------------------------------------

test.describe('Report Stolen Asset', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    });

    test('navigates to /security/report from Contact screen', async ({ page }) => {
        await page.goto('/contact');
        await page.getByRole('button', { name: /report stolen asset/i }).click();
        await expect(page).toHaveURL(/\/security\/report/);
    });

    test('Step 1 renders correct labels and initial state', async ({ page }) => {
        await page.goto('/security/report');

        await expect(page.getByText('Security Protocol', { exact: false })).toBeVisible();
        await expect(page.getByText('Incident Management')).toBeVisible();
        await expect(page.getByText('Asset Compromise Report')).toBeVisible();
        await expect(page.getByText('Identify the specific facility that has been compromised.')).toBeVisible();
        await expect(page.getByText('Affected Facility')).toBeVisible();
        await expect(page.getByText('Incident Narrative')).toBeVisible();
        await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeDisabled();
    });

    test('Affected Facility dropdown shows all accounts with type and last 4 digits', async ({ page }) => {
        await page.goto('/security/report');

        const dropdown = page.locator('select');
        await expect(dropdown).toBeVisible();
        const options = await dropdown.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
        for (const opt of options) {
            expect(opt).toMatch(/\(Ending \d{4}\)/);
        }
    });

    test('first account is pre-selected in dropdown', async ({ page }) => {
        await page.goto('/security/report');

        const dropdown = page.locator('select');
        const firstOption = await dropdown.locator('option').first().getAttribute('value');
        await expect(dropdown).toHaveValue(firstOption!);
    });

    test('"Authorize Asset Freeze" button enables after typing incident description', async ({ page }) => {
        await page.goto('/security/report');

        const btn = page.getByRole('button', { name: /authorize asset freeze/i });
        await expect(btn).toBeDisabled();

        await page.locator('textarea').fill('Lost physical card');
        await expect(btn).toBeEnabled();
    });

    test('"Authorize Asset Freeze" button stays disabled when description is whitespace only', async ({ page }) => {
        await page.goto('/security/report');

        await page.locator('textarea').fill('   ');
        await expect(page.getByRole('button', { name: /authorize asset freeze/i })).toBeDisabled();
    });

    test('Cancel navigates to /contact', async ({ page }) => {
        await page.goto('/security/report');
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page).toHaveURL(/\/contact/);
    });

    test('X button navigates to /contact', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('button[aria-label], button:has(svg)').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();
        await expect(page).toHaveURL(/\/contact/);
    });

    test('Step 2: Confirm Asset Freeze screen shows selected account type', async ({ page }) => {
        await page.goto('/security/report');

        const dropdown = page.locator('select');
        const selectedText = await dropdown.locator('option:checked').textContent();
        const accountType = selectedText!.split(' (Ending')[0];

        await page.locator('textarea').fill('Suspicious activity');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();

        await expect(page.getByText('Confirm Asset Freeze')).toBeVisible();
        await expect(page.getByText(new RegExp(`You are about to freeze ${accountType}`))).toBeVisible();
        await expect(page.getByText('This will block all incoming and outgoing electronic authorizations immediately.')).toBeVisible();
        await expect(page.getByRole('button', { name: /execute freeze protocol/i })).toBeVisible();
        await expect(page.getByText('Back to Selection')).toBeVisible();
    });

    test('"Back to Selection" returns to Step 1', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();

        await page.getByText('Back to Selection').click();
        await expect(page.getByText('Asset Compromise Report')).toBeVisible();
    });

    test('progress bar advances from step 1 to step 2', async ({ page }) => {
        await page.goto('/security/report');
        const bar = page.locator('[style*="width"]').first();
        const widthStep1 = await bar.getAttribute('style');

        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        const widthStep2 = await bar.getAttribute('style');

        expect(widthStep1).not.toEqual(widthStep2);
    });

    test('processing state is shown after "Execute Freeze Protocol"', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();

        await expect(page.getByText('Provisioning Asset Block')).toBeVisible();
        await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible();
    });

    test('X button is hidden during processing and success states', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();

        // During processing the close button should be hidden
        const closeBtn = page.locator('button:has(path[d*="M6 18L18 6"])');
        await expect(closeBtn).not.toBeVisible();
    });

    test('Step 3: success screen shows "Asset Frozen" and fraud contact message', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();

        await expect(page.getByText('Asset Frozen')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/fraud prevention squad will contact you within 15 minutes/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /back to portfolio/i })).toBeVisible();
    });

    test('account status is NOT changed after completing report flow', async ({ page }) => {
        await page.goto('/security/report');

        // Get the selected account type from dropdown
        const dropdown = page.locator('select');
        const selectedText = await dropdown.locator('option:checked').textContent();
        const accountType = selectedText!.split(' (Ending')[0];

        await page.locator('textarea').fill('Test incident');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();
        await expect(page.getByText('Asset Frozen')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        await expect(page).toHaveURL(/\/dashboard/);
        // Frozen badge must NOT appear on the reported account
        const accountCard = page.locator('div').filter({ hasText: new RegExp(accountType) }).first();
        await expect(accountCard.getByText('Frozen')).not.toBeVisible();
    });

    test('"Operation Complete" subheader shown on success step', async ({ page }) => {
        await page.goto('/security/report');
        await page.locator('textarea').fill('Lost card');
        await page.getByRole('button', { name: /authorize asset freeze/i }).click();
        await page.getByRole('button', { name: /execute freeze protocol/i }).click();
        await expect(page.getByText('Operation Complete')).toBeVisible({ timeout: 5000 });
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 2: Freeze All Cards (Cryo-Freeze)
// ---------------------------------------------------------------------------

test.describe('Freeze All Cards (Cryo-Freeze)', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    });

    test('navigates to /security/freeze-all from Dashboard "Freeze All Cards" link', async ({ page }) => {
        await page.goto('/dashboard');
        await page.getByRole('button', { name: /freeze all cards/i }).click();
        await expect(page).toHaveURL(/\/security\/freeze-all/);
    });

    test('Step 1 renders Cryo-Freeze confirmation screen', async ({ page }) => {
        await page.goto('/security/freeze-all');

        await expect(page.getByText('Security Protocol', { exact: false })).toBeVisible();
        await expect(page.getByText('Cryo-Freeze Protocol')).toBeVisible();
        await expect(page.getByText('Cryo-Freeze Cards')).toBeVisible();
        await expect(page.getByText(/temporarily suspend all active cards and digital payment facilities/i)).toBeVisible();
        await expect(page.getByText(/External ACH and Savings transfers will remain functional/i)).toBeVisible();
        await expect(page.getByText('Affected Facilities:')).toBeVisible();
    });

    test('Affected Facilities shows Cards and Checking accounts only (not Savings)', async ({ page }) => {
        await page.goto('/security/freeze-all');

        const badges = page.locator('span.rounded-full').filter({ hasText: /Checking|Card/ });
        await expect(badges.first()).toBeVisible();

        // Savings should NOT appear in the affected list
        const savingsBadge = page.locator('span.rounded-full').filter({ hasText: /^Savings$/ });
        await expect(savingsBadge).not.toBeVisible();
    });

    test('"Authorize Cryo-Freeze" button is visible and enabled', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await expect(page.getByRole('button', { name: /authorize cryo-freeze/i })).toBeEnabled();
    });

    test('"Cancel Protocol" navigates to /dashboard', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByText('Cancel Protocol').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('processing state is shown after "Authorize Cryo-Freeze"', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();

        await expect(page.getByText('Deep-Freezing Card Facilities')).toBeVisible();
        await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible();
    });

    test('Step 3: success screen shows "Facilities Suspended"', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();

        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/deep-freeze status/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /back to portfolio/i })).toBeVisible();
    });

    test('"Operation Complete" subheader shown on success step', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Operation Complete')).toBeVisible({ timeout: 5000 });
    });

    test('Checking and Credit Card show "Frozen" badge on Dashboard after freeze', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        await expect(page).toHaveURL(/\/dashboard/);
        const frozenBadges = page.getByText('Frozen');
        await expect(frozenBadges.first()).toBeVisible();
        const count = await frozenBadges.count();
        expect(count).toBeGreaterThanOrEqual(2); // At least Checking + Credit Card
    });

    test('Savings account does NOT show "Frozen" badge after freeze', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        const savingsCard = page.locator('div').filter({ hasText: /^Savings$/ }).first();
        await expect(savingsCard.getByText('Frozen')).not.toBeVisible();
    });

    test('frozen account cards are not clickable on Dashboard', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        // Frozen cards should have cursor-not-allowed style
        const frozenCards = page.locator('[class*="cursor-not-allowed"]');
        await expect(frozenCards.first()).toBeVisible();
    });

    test('clicking a frozen account does not navigate to account details', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        const frozenCard = page.locator('[class*="cursor-not-allowed"]').first();
        await frozenCard.click();
        await expect(page).toHaveURL(/\/dashboard/); // Should not navigate away
    });

    test('Savings account remains clickable after freeze', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /back to portfolio/i }).click();

        const savingsCard = page.locator('div').filter({ hasText: /^Savings$/ }).first().locator('..');
        await expect(savingsCard).not.toHaveClass(/cursor-not-allowed/);
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 3: Nuclear Lockdown
// ---------------------------------------------------------------------------

test.describe('Nuclear Lockdown', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    });

    test('navigates to /security/lockdown from Contact screen', async ({ page }) => {
        await page.goto('/contact');
        await page.getByRole('button', { name: /account lockdown/i }).click();
        await expect(page).toHaveURL(/\/security\/lockdown/);
    });

    test('Step 1 renders Nuclear Lockdown warning screen', async ({ page }) => {
        await page.goto('/security/lockdown');

        await expect(page.getByText('Security Protocol', { exact: false })).toBeVisible();
        await expect(page.getByText('Critical Action Needed')).toBeVisible();
        await expect(page.getByText('Nuclear Lockdown')).toBeVisible();
        await expect(page.getByText(/terminate all active sessions.*invalidate current access tokens.*freeze ALL financial facilities/i)).toBeVisible();
        await expect(page.getByText('THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE.')).toBeVisible();
        await expect(page.getByRole('button', { name: /initiate global lockdown/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /abort procedure/i })).toBeVisible();
    });

    test('"Abort Procedure" navigates to /contact', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /abort procedure/i }).click();
        await expect(page).toHaveURL(/\/contact/);
    });

    test('Step 2: Final Warning screen is shown after "Initiate Global Lockdown"', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();

        await expect(page.getByText('Final Warning')).toBeVisible();
        await expect(page.getByText(/global ledger freeze will commence upon confirmation/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /confirm global freeze/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /back to safety/i })).toBeVisible();
    });

    test('"Back to Safety" returns to Step 1 without triggering lockdown', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /back to safety/i }).click();

        await expect(page.getByText('Nuclear Lockdown')).toBeVisible();
        // User should still be logged in — dashboard reachable
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('processing state is shown after "CONFIRM GLOBAL FREEZE"', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();

        await expect(page.getByText('Terminating All Sessions')).toBeVisible();
        await expect(page.getByText('Validating security signatures and notifying central bank...')).toBeVisible();
    });

    test('Step 3: "System Locked" screen with countdown message', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();

        await expect(page.getByText('System Locked')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/you will be logged out in 3 seconds/i)).toBeVisible();
    });

    test('user is automatically redirected to /login after 3-second countdown', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();

        await expect(page.getByText('System Locked')).toBeVisible({ timeout: 5000 });
        await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });

    test('locked user cannot log in with regular password', async ({ page }) => {
        // Complete lockdown
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();
        await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

        // Attempt re-login with normal credentials
        await page.getByLabel(/username/i).fill(ACTIVE_USER.username);
        await page.getByLabel(/password/i).fill(ACTIVE_USER.password);
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        await expect(page.getByText(/account locked for security reasons/i)).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('pre-locked user cannot log in with regular password', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/username/i).fill(LOCKED_USER.username);
        await page.getByLabel(/password/i).fill(LOCKED_USER.password);
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        await expect(page.getByText(/account locked for security reasons/i)).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('X button is hidden during processing and success/lockdown steps', async ({ page }) => {
        await page.goto('/security/lockdown');
        await page.getByRole('button', { name: /initiate global lockdown/i }).click();
        await page.getByRole('button', { name: /confirm global freeze/i }).click();

        const closeBtn = page.locator('button:has(path[d*="M6 18L18 6"])');
        await expect(closeBtn).not.toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 4: Common UI elements across all security flows
// ---------------------------------------------------------------------------

test.describe('Common UI elements', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ACTIVE_USER.username, ACTIVE_USER.password);
    });

    test('progress bar starts at ~33% on step 1 of report flow', async ({ page }) => {
        await page.goto('/security/report');
        const bar = page.locator('[style*="width: 33"]').or(page.locator('[style*="width:33"]'));
        await expect(bar.first()).toBeVisible();
    });

    test('progress bar reaches 100% on step 3 of freeze-all flow', async ({ page }) => {
        await page.goto('/security/freeze-all');
        await page.getByRole('button', { name: /authorize cryo-freeze/i }).click();
        await expect(page.getByText('Facilities Suspended')).toBeVisible({ timeout: 5000 });

        const bar = page.locator('[style*="width: 100"]').or(page.locator('[style*="width:100"]'));
        await expect(bar.first()).toBeVisible();
    });

    test('"Security Protocol" header is present on all three action pages', async ({ page }) => {
        for (const action of ['report', 'freeze-all', 'lockdown']) {
            await page.goto(`/security/${action}`);
            await expect(page.getByText('Security Protocol', { exact: false })).toBeVisible();
        }
    });

    test('correct subheader text is shown per action type on step 1', async ({ page }) => {
        const cases: Array<[string, string]> = [
            ['report', 'Incident Management'],
            ['freeze-all', 'Cryo-Freeze Protocol'],
            ['lockdown', 'Critical Action Needed'],
        ];
        for (const [action, expectedSubheader] of cases) {
            await page.goto(`/security/${action}`);
            await expect(page.getByText(expectedSubheader)).toBeVisible();
        }
    });

    test('unauthenticated user is redirected away from security routes', async ({ page }) => {
        // Not logged in — fresh page context
        await page.goto('/security/freeze-all');
        await expect(page).not.toHaveURL(/\/security/);
    });
});
