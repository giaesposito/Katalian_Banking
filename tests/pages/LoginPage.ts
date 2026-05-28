import { Page, expect } from '@playwright/test';
import { TestUser } from '../data/users';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/#/login');
  }

  async login(user: TestUser) {
    await this.page.getByLabel('Username').fill(user.username);
    await this.page.getByLabel('Password').fill(user.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async expectLockedError() {
    await expect(
      this.page.getByText('Your account is locked', { exact: false })
    ).toBeVisible();
  }

  async expectInvalidError() {
    await expect(
      this.page.getByText('Invalid username or password', { exact: false })
    ).toBeVisible();
  }

  async expectSignInPageVisible() {
    await expect(
      this.page.getByText('Sign in to your account')
    ).toBeVisible();
  }
}
