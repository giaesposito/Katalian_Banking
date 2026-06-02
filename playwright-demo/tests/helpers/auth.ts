import { Page } from '@playwright/test';

export const TEST_USER = {
  id: 'user1',
  username: 'bankinguser123',
  passwordHash: 'notapassword@123',
  locked: false,
  canApplyForPlatinum: true,
  accounts: [
    {
      id: 'acc1-1',
      type: 'Checking',
      accountNumber: '...7890',
      balance: 5345.54,
      status: 'Active',
      transactions: [],
    },
    {
      id: 'acc1-2',
      type: 'Savings',
      accountNumber: '...1234',
      balance: 104456.67,
      status: 'Active',
      transactions: [],
    },
    {
      id: 'acc1-3',
      type: 'Credit Card',
      accountNumber: '...9921',
      balance: 1250.00,
      status: 'Active',
      transactions: [],
    },
  ],
  loans: [],
};

export const LOCKED_USER = {
  ...TEST_USER,
  locked: true,
};

/**
 * Injects auth state into localStorage before the page loads.
 * Call this before page.goto().
 */
export async function injectAuth(page: Page, user = TEST_USER) {
  await page.addInitScript(({ sessionUser, allUsers }) => {
    localStorage.setItem('katalian_session_v1', JSON.stringify(sessionUser));
    localStorage.setItem('katalian_users_v1', JSON.stringify(allUsers));
  }, { sessionUser: user, allUsers: [user] });
}

/**
 * Injects user data without a session (unauthenticated state).
 * Used for testing login-gate behavior.
 */
export async function injectUsersOnly(page: Page, users = [TEST_USER]) {
  await page.addInitScript((allUsers) => {
    localStorage.setItem('katalian_users_v1', JSON.stringify(allUsers));
    localStorage.removeItem('katalian_session_v1');
  }, users);
}
