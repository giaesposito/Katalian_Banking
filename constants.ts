
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
    loans: [],
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
    ],
    loans: [],
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

export const LOAN_PRODUCTS = [
    { type: 'Personal', rate: '5.99%', description: 'Flexible funds for life\'s unexpected moments.', icon: '💰' },
    { type: 'Auto', rate: '4.25%', description: 'Get behind the wheel of your dream car faster.', icon: '🚗' },
    { type: 'Mortgage', rate: '6.45%', description: 'Your journey to home ownership starts here.', icon: '🏠' },
];
