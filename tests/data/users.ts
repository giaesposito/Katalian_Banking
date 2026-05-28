// Source: katalian_logins.csv
export interface TestUser {
  username: string;
  password: string;
  status: 'Active' | 'Locked';
  notes: string;
}

export const TEST_USERS: TestUser[] = [
  {
    username: 'bankinguser123',
    password: 'notapassword@123',
    status: 'Active',
    notes: 'Platinum eligible',
  },
  {
    username: 'lockedout25',
    password: 'lockedoutpassword343',
    status: 'Locked',
    notes: 'Unlock password: resetpassword@45',
  },
];

export const activeUser = TEST_USERS.find(u => u.status === 'Active')!;
export const lockedUser = TEST_USERS.find(u => u.status === 'Locked')!;
