import { Page, expect } from '@playwright/test';

export type SecurityAction = 'report' | 'freeze-all' | 'lockdown';

const PROCESSING_TIMEOUT = 5_000;  // 2500ms processing + buffer
const LOCKDOWN_LOGOUT_TIMEOUT = 8_000;  // 2500ms processing + 3000ms countdown + buffer

export class SecurityPage {
  constructor(private page: Page) {}

  async goto(action: SecurityAction) {
    await this.page.goto(`/#/security/${action}`);
  }

  // ── Common Shell ────────────────────────────────────────────────────────────

  async expectHeader() {
    await expect(this.page.getByText('Security Protocol')).toBeVisible();
  }

  async expectSubheader(text: string) {
    await expect(this.page.getByText(text, { exact: false })).toBeVisible();
  }

  get closeButton() {
    // X button rendered as an SVG icon; matched by its path data
    return this.page.locator('button').filter({
      has: this.page.locator('svg path[d*="M6 18L18 6"]'),
    });
  }

  async expectCloseButtonVisible() {
    await expect(this.closeButton).toBeVisible();
  }

  async expectCloseButtonHidden() {
    await expect(this.closeButton).not.toBeVisible();
  }

  async getProgressPercent(): Promise<number> {
    const width = await this.page
      .locator('.transition-all.duration-700')
      .evaluate(el => (el as HTMLElement).style.width);
    return parseFloat(width);
  }

  async expectProgressPercent(expected: number) {
    const actual = await this.getProgressPercent();
    // Allow ±1% for floating-point render
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
  }

  // ── Report Flow ─────────────────────────────────────────────────────────────

  async expectReportStep1() {
    await expect(this.page.getByText('Asset Compromise Report')).toBeVisible();
    await expect(
      this.page.getByText('Identify the specific facility that has been compromised', { exact: false })
    ).toBeVisible();
  }

  async getDropdownOptions(): Promise<string[]> {
    return this.page
      .locator('select[aria-label="Affected Facility"], label:has-text("Affected Facility") + select, select')
      .first()
      .locator('option')
      .allTextContents();
  }

  async selectAffectedFacility(optionText: string) {
    await this.page.locator('select').first().selectOption({ label: optionText });
  }

  async expectAuthorizeButtonDisabled() {
    await expect(
      this.page.getByRole('button', { name: 'Authorize Asset Freeze' })
    ).toBeDisabled();
  }

  async expectAuthorizeButtonEnabled() {
    await expect(
      this.page.getByRole('button', { name: 'Authorize Asset Freeze' })
    ).toBeEnabled();
  }

  async fillIncidentNarrative(text: string) {
    await this.page
      .getByPlaceholder('Briefly describe the nature of the compromise', { exact: false })
      .fill(text);
  }

  async clearIncidentNarrative() {
    await this.page
      .getByPlaceholder('Briefly describe the nature of the compromise', { exact: false })
      .clear();
  }

  async clickAuthorizeAssetFreeze() {
    await this.page.getByRole('button', { name: 'Authorize Asset Freeze' }).click();
  }

  async expectReportStep2(accountType: string) {
    await expect(this.page.getByText('Confirm Asset Freeze')).toBeVisible();
    await expect(
      this.page.getByText(`You are about to freeze ${accountType}`, { exact: false })
    ).toBeVisible();
    await expect(
      this.page.getByText('This will block all incoming and outgoing electronic authorizations immediately', { exact: false })
    ).toBeVisible();
  }

  async clickExecuteFreezeProtocol() {
    await this.page.getByRole('button', { name: 'Execute Freeze Protocol' }).click();
  }

  async clickBackToSelection() {
    await this.page.getByRole('button', { name: 'Back to Selection' }).click();
  }

  async expectReportProcessing() {
    await expect(this.page.getByText('Provisioning Asset Block')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
  }

  async expectReportSuccess() {
    await expect(this.page.getByText('Asset Frozen')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
    await expect(
      this.page.getByText('fraud prevention squad will contact you within 15 minutes', { exact: false })
    ).toBeVisible();
  }

  async clickBackToPortfolio() {
    await this.page.getByRole('button', { name: 'Back to Portfolio' }).click();
  }

  // ── Freeze-All Flow ─────────────────────────────────────────────────────────

  async expectFreezeAllStep1() {
    await expect(this.page.getByText('Cryo-Freeze Cards')).toBeVisible();
    await expect(
      this.page.getByText('temporarily suspend all active cards and digital payment facilities', { exact: false })
    ).toBeVisible();
    await expect(this.page.getByText('Affected Facilities:')).toBeVisible();
  }

  async getAffectedFacilityBadges(): Promise<string[]> {
    return this.page.locator('span.px-3').allTextContents();
  }

  async clickAuthorizeCryoFreeze() {
    await this.page.getByRole('button', { name: 'Authorize Cryo-Freeze' }).click();
  }

  async clickCancelProtocol() {
    await this.page.getByRole('button', { name: 'Cancel Protocol' }).click();
  }

  async expectFreezeAllProcessing() {
    await expect(this.page.getByText('Deep-Freezing Card Facilities')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
  }

  async expectFreezeAllSuccess() {
    await expect(this.page.getByText('Facilities Suspended')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
    await expect(
      this.page.getByText('All identified cards have been moved to deep-freeze status', { exact: false })
    ).toBeVisible();
  }

  // ── Lockdown Flow ───────────────────────────────────────────────────────────

  async expectLockdownStep1() {
    await expect(this.page.getByText('Nuclear Lockdown')).toBeVisible();
    await expect(
      this.page.getByText('THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE', { exact: false })
    ).toBeVisible();
    await expect(
      this.page.getByText('terminate all active sessions', { exact: false })
    ).toBeVisible();
  }

  async clickInitiateGlobalLockdown() {
    await this.page.getByRole('button', { name: 'Initiate Global Lockdown' }).click();
  }

  async clickAbortProcedure() {
    await this.page.getByRole('button', { name: 'Abort Procedure' }).click();
  }

  async expectLockdownStep2() {
    await expect(this.page.getByText('Final Warning')).toBeVisible();
    await expect(
      this.page.getByText('Global ledger freeze will commence upon confirmation', { exact: false })
    ).toBeVisible();
  }

  async clickConfirmGlobalFreeze() {
    await this.page.getByRole('button', { name: 'CONFIRM GLOBAL FREEZE' }).click();
  }

  async clickBackToSafety() {
    await this.page.getByRole('button', { name: 'Back to Safety' }).click();
  }

  async expectLockdownProcessing() {
    await expect(this.page.getByText('Terminating All Sessions')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
  }

  async expectLockdownSuccess() {
    await expect(this.page.getByText('System Locked')).toBeVisible({
      timeout: PROCESSING_TIMEOUT,
    });
    await expect(
      this.page.getByText('You will be logged out in 3 seconds', { exact: false })
    ).toBeVisible();
  }

  async expectAutoLogout() {
    await expect(this.page.getByText('Sign in to your account')).toBeVisible({
      timeout: LOCKDOWN_LOGOUT_TIMEOUT,
    });
  }
}
