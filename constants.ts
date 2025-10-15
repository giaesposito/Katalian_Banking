
import { User } from './types';

export const USERS: User[] = [
  {
    id: 'user1',
    username: 'bankinguser123',
    passwordHash: 'notapassword@123',
    locked: false,
    canApplyForPlatinum: true,
    accounts: [
      { id: 'acc1-1', type: 'Checking', accountNumber: '...7890', balance: 5345.54 },
      { id: 'acc1-2', type: 'Savings', accountNumber: '...1234', balance: 104456.67 },
    ],
  },
  {
    id: 'user2',
    username: 'newuser098',
    passwordHash: 'pass@123not',
    locked: false,
    canApplyForPlatinum: false,
    accounts: [
      { id: 'acc2-1', type: 'Checking', accountNumber: '...5678', balance: 2345.43 },
    ],
  },
  {
    id: 'user3',
    username: 'testuser934',
    passwordHash: 'notpassword_125',
    locked: false,
    canApplyForPlatinum: false,
    accounts: [
      { id: 'acc3-1', type: 'Savings', accountNumber: '...9012', balance: 4234.87 },
    ],
  },
  {
    id: 'user4',
    username: 'lockedout25',
    passwordHash: 'lockedoutpassword343',
    unlockPasswordHash: 'resetpassword@45',
    locked: true,
    canApplyForPlatinum: false,
    accounts: [
      { id: 'acc4-1', type: 'Checking', accountNumber: '...3456', balance: 12.14 },
      { id: 'acc4-2', type: 'Savings', accountNumber: '...7891', balance: 1000.32 },
    ],
  },
];

export const STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];
