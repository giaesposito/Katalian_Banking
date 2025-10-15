
export interface Account {
  id: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Platinum Credit Card';
  accountNumber: string;
  balance: number;
  status?: 'Pending';
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  accounts: Account[];
  canApplyForPlatinum: boolean;
  locked: boolean;
  unlockPasswordHash?: string;
}

export type ViewType =
  | { name: 'login' }
  | { name: 'resetPassword' }
  | { name: 'dashboard' }
  | { name: 'transfer' }
  | { name: 'apply'; for: Account['type'] };

export interface ApplicationData {
    firstName: string;
    middleName: string;
    lastName: string;
    dob: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    initialDeposit?: number;
    depositFromAccountId?: string;
}
