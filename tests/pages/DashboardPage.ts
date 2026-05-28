import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByText('Your Accounts')).toBeVisible();
  }

  accountCard(accountType: string) {
    return this.page.locator('.bg-gray-800').filter({ hasText: accountType }).first();
  }

  async expectAccountFrozen(accountType: string) {
    await expect(this.accountCard(accountType).getByText('Frozen')).toBeVisible();
  }

  async expectAccountNotFrozen(accountType: string) {
    await expect(this.accountCard(accountType).getByText('Frozen')).not.toBeVisible();
  }

  async expectAccountBalance(accountType: string, balance: string) {
    await expect(this.accountCard(accountType).getByText(balance, { exact: false })).toBeVisible();
  }
}
