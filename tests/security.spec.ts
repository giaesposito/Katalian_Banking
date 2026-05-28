/**
 * Acceptance tests for KB-15: Security Actions — Card Freeze & Account Protection
 *
 * Covers all 7 acceptance-criteria scenarios from the requirement.
 * Test data is sourced from katalian_logins.csv via tests/data/users.ts.
 *
 * NOTE: The security routes (/security/report, /security/freeze-all, /security/lockdown)
 * must be registered in App.tsx and SecurityScreen must be integrated before these tests pass.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SecurityPage } from './pages/SecurityPage';
import { TEST_USERS, activeUser, lockedUser } from './data/users';

// ── Shared login helper ──────────────────────────────────────────────────────

async function loginAndGoTo(
  loginPage: LoginPage,
  dashboardPage: DashboardPage,
  securityPage: SecurityPage,
  action: 'report' | 'freeze-all' | 'lockdown'
) {
  await loginPage.goto();
  await loginPage.login(activeUser);
  await dashboardPage.expectLoaded();
  await securityPage.goto(action);
  await securityPage.expectHeader();
}

// ── Scenario 5: Locked user login (data-driven from CSV) ────────────────────

test.describe('Login — locked account', () => {
  TEST_USERS.filter(u => u.status === 'Locked').forEach(user => {
    test(`shows locked error for "${user.username}" (${user.notes})`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user);
      await loginPage.expectLockedError();
      // Must remain on login page
      await loginPage.expectSignInPageVisible();
    });
  });
});

// ── Scenario 1: Report Stolen Asset (simulated) ─────────────────────────────

test.describe('Scenario 1 — Report Stolen Asset', () => {
  test('RS1: step 1 — header and dropdown visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.expectReportStep1();
    await securityPage.expectSubheader('Incident Management');
  });

  test('RS1-004/RS1-010: "Authorize Asset Freeze" disabled until narrative is entered', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.expectAuthorizeButtonDisabled();

    await securityPage.fillIncidentNarrative('Lost card at airport.');
    await securityPage.expectAuthorizeButtonEnabled();

    await securityPage.clearIncidentNarrative();
    await securityPage.expectAuthorizeButtonDisabled();
  });

  test('RS1-002/RS1-004: dropdown lists all user accounts with type and last 4 digits', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');

    const options = await securityPage.getDropdownOptions();
    // bankinguser123 has Checking (...7890) and Savings (...1234)
    expect(options).toContain('Checking (Ending 7890)');
    expect(options).toContain('Savings (Ending 1234)');
  });

  test('RS2: step 2 — confirm screen shows selected account type', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.fillIncidentNarrative('Suspicious web activity detected.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.expectReportStep2('Checking');
  });

  test('RS2-006/RS2-002: "Back to Selection" returns to step 1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.fillIncidentNarrative('Test incident.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.expectReportStep2('Checking');

    await securityPage.clickBackToSelection();
    await securityPage.expectReportStep1();
  });

  test('RS3: processing state then success screen shown', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.fillIncidentNarrative('Lost physical card.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.clickExecuteFreezeProtocol();

    await securityPage.expectReportProcessing();
    await securityPage.expectReportSuccess();
  });

  test('RS3-004 / Scenario 1 AC: account status unchanged after report', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.fillIncidentNarrative('Suspicious online transaction.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.clickExecuteFreezeProtocol();
    await securityPage.expectReportSuccess();

    await securityPage.clickBackToPortfolio();
    await dashboardPage.expectLoaded();

    // Report is simulation only — no status change expected
    await dashboardPage.expectAccountNotFrozen('Checking');
    await dashboardPage.expectAccountNotFrozen('Savings');
  });
});

// ── Scenario 2 & 3: Freeze All Cards ────────────────────────────────────────

test.describe('Scenario 2 & 3 — Freeze All Cards', () => {
  test('FA1-003/FA1-004: affected facilities shown, Savings excluded', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'freeze-all');
    await securityPage.expectFreezeAllStep1();
    await securityPage.expectSubheader('Cryo-Freeze Protocol');

    const badges = await securityPage.getAffectedFacilityBadges();
    expect(badges).toContain('Checking');
    expect(badges).not.toContain('Savings');
  });

  test('FAP / FA3: processing state then "Facilities Suspended" shown', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'freeze-all');
    await securityPage.clickAuthorizeCryoFreeze();

    await securityPage.expectFreezeAllProcessing();
    await securityPage.expectFreezeAllSuccess();
  });

  test('Scenario 2 & 3 AC: Checking frozen, Savings unchanged on Dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'freeze-all');
    await securityPage.clickAuthorizeCryoFreeze();
    await securityPage.expectFreezeAllSuccess();

    await securityPage.clickBackToPortfolio();
    await dashboardPage.expectLoaded();

    await dashboardPage.expectAccountFrozen('Checking');
    await dashboardPage.expectAccountNotFrozen('Savings');
  });
});

// ── Scenario 6: Cancel Freeze-All ───────────────────────────────────────────

test.describe('Scenario 6 — Cancel Freeze-All', () => {
  test('FA1-006: "Cancel Protocol" navigates to Dashboard with no state change', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'freeze-all');
    await securityPage.clickCancelProtocol();

    await dashboardPage.expectLoaded();
    await dashboardPage.expectAccountNotFrozen('Checking');
    await dashboardPage.expectAccountNotFrozen('Savings');
  });
});

// ── Scenario 4: Nuclear Lockdown ─────────────────────────────────────────────

test.describe('Scenario 4 — Nuclear Lockdown', () => {
  test('NL1: initial warning screen displayed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'lockdown');
    await securityPage.expectLockdownStep1();
    await securityPage.expectSubheader('Critical Action Needed');
  });

  test('NL1-006: "Abort Procedure" leaves lockdown screen without triggering lockdown', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'lockdown');
    await securityPage.clickAbortProcedure();
    // Should navigate away (to /contact per spec); verify lockdown step 1 is gone
    await expect(page.getByText('Nuclear Lockdown')).not.toBeVisible();
  });

  test('NL2: "Initiate Global Lockdown" advances to Final Warning (step 2)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'lockdown');
    await securityPage.clickInitiateGlobalLockdown();
    await securityPage.expectLockdownStep2();
  });

  test('NL2-005 / Scenario 7 AC: "Back to Safety" returns to step 1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'lockdown');
    await securityPage.clickInitiateGlobalLockdown();
    await securityPage.expectLockdownStep2();

    await securityPage.clickBackToSafety();
    await securityPage.expectLockdownStep1();
  });

  test('NL3 / Scenario 4 AC: full lockdown — processing, System Locked, auto-logout', async ({ page }) => {
    test.setTimeout(20_000); // extra time for 2500ms processing + 3000ms countdown

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'lockdown');
    await securityPage.clickInitiateGlobalLockdown();
    await securityPage.expectLockdownStep2();
    await securityPage.clickConfirmGlobalFreeze();

    await securityPage.expectLockdownProcessing();
    await securityPage.expectLockdownSuccess();

    // NL3-005/NL3-006: auto-logout after 3-second countdown
    await securityPage.expectAutoLogout();
  });
});

// ── Common UI elements ───────────────────────────────────────────────────────

test.describe('Common UI — progress bar and close button', () => {
  test('CU-001/CU-002: progress bar advances through Report flow steps', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.expectProgressPercent(100 / 3); // step 1 = ~33%

    await securityPage.fillIncidentNarrative('Test narrative.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.expectProgressPercent((2 / 3) * 100); // step 2 = ~67%
  });

  test('CU-003/CU-004: close button hidden during processing and success', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    await loginAndGoTo(loginPage, dashboardPage, securityPage, 'report');
    await securityPage.expectCloseButtonVisible();

    await securityPage.fillIncidentNarrative('Test.');
    await securityPage.clickAuthorizeAssetFreeze();
    await securityPage.clickExecuteFreezeProtocol();

    // Hidden during processing
    await securityPage.expectCloseButtonHidden();

    // Hidden on success
    await securityPage.expectReportSuccess();
    await securityPage.expectCloseButtonHidden();
  });

  test('CU-005/CU-006: header shows "Security Protocol" with correct subheader per action', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const securityPage = new SecurityPage(page);

    const cases: Array<{ action: 'report' | 'freeze-all' | 'lockdown'; subheader: string }> = [
      { action: 'report',     subheader: 'Incident Management' },
      { action: 'freeze-all', subheader: 'Cryo-Freeze Protocol' },
      { action: 'lockdown',   subheader: 'Critical Action Needed' },
    ];

    for (const { action, subheader } of cases) {
      await loginPage.goto();
      await loginPage.login(activeUser);
      await dashboardPage.expectLoaded();
      await securityPage.goto(action);
      await securityPage.expectHeader();
      await securityPage.expectSubheader(subheader);
    }
  });
});
