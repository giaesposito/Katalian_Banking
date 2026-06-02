import { Page } from '@playwright/test';

interface Account {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
  status: string;
  transactions: never[];
}

interface UserFixture {
  id: string;
  username: string;
  passwordHash: string;
  unlockPasswordHash?: string;
  locked: boolean;
  canApplyForPlatinum: boolean;
  accounts: Account[];
  loans: never[];
}

// Full user objects matching constants.ts in the main app
const USER_STORE: Record<string, UserFixture> = {
  bankinguser123: {
    id: 'user1',
    username: 'bankinguser123',
    passwordHash: 'notapassword@123',
    locked: false,
    canApplyForPlatinum: true,
    accounts: [
      { id: 'acc1-1', type: 'Checking',     accountNumber: '...7890', balance: 5345.54,    status: 'Active', transactions: [] },
      { id: 'acc1-2', type: 'Savings',      accountNumber: '...1234', balance: 104456.67,  status: 'Active', transactions: [] },
      { id: 'acc1-3', type: 'Credit Card',  accountNumber: '...9921', balance: 1250.00,    status: 'Active', transactions: [] },
    ],
    loans: [],
  },
  lockedout25: {
    id: 'user4',
    username: 'lockedout25',
    passwordHash: 'lockedoutpassword343',
    unlockPasswordHash: 'resetpassword@45',
    locked: true,
    canApplyForPlatinum: false,
    accounts: [
      { id: 'acc4-1', type: 'Checking', accountNumber: '...3456', balance: 12.14, status: 'Active', transactions: [] },
    ],
    loans: [],
  },
};

export function getUserFixture(username: string): UserFixture {
  const user = USER_STORE[username];
  if (!user) throw new Error(`No fixture found for username: ${username}`);
  return user;
}

// Convenience exports used by existing tests
export const TEST_USER = USER_STORE['bankinguser123'];
export const LOCKED_USER = { ...USER_STORE['bankinguser123'], locked: true };

/**
 * Injects an authenticated session into localStorage before the page loads.
 * Call this before page.goto().
 */
export async function injectAuth(page: Page, user: UserFixture = TEST_USER) {
  await page.addInitScript(({ sessionUser, allUsers }) => {
    localStorage.setItem('katalian_session_v1', JSON.stringify(sessionUser));
    localStorage.setItem('katalian_users_v1', JSON.stringify(allUsers));
  }, { sessionUser: user, allUsers: Object.values(USER_STORE) });
}

/**
 * Injects user data without a session (unauthenticated state).
 * Used for testing login-gate behavior.
 */
export async function injectUsersOnly(page: Page, users: UserFixture[] = Object.values(USER_STORE)) {
  await page.addInitScript((allUsers) => {
    localStorage.setItem('katalian_users_v1', JSON.stringify(allUsers));
    localStorage.removeItem('katalian_session_v1');
  }, users);
}
