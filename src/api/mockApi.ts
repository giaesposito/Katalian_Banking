
import { User, Account, ApplicationData } from '../types';
import { USERS } from '../constants';

// Simulated delay to mimic real API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    /**
     * GET /api/users
     */
    async getUsers(): Promise<User[]> {
        await delay(800);
        return [...USERS];
    },

    /**
     * GET /api/users/:id
     */
    async getUserById(id: string): Promise<User | null> {
        await delay(400);
        return USERS.find(u => u.id === id) || null;
    },

    /**
     * POST /api/applications
     * Body: { appData: ApplicationData, accountType: string }
     */
    async submitApplication(userId: string, appData: ApplicationData, accountType: Account['type']): Promise<Account> {
        await delay(2000);
        return {
            id: `acc${userId}-${Math.random().toString(36).substr(2, 5)}`,
            type: accountType,
            accountNumber: `...${Math.floor(1000 + Math.random() * 9000)}`,
            balance: appData.initialDeposit || 0,
            status: accountType.includes('Card') ? 'Pending' : undefined,
        };
    },

    /**
     * POST /api/transfers
     * Body: { fromId: string, toId: string, amount: number }
     */
    async executeTransfer(fromId: string, toId: string, amount: number): Promise<{ success: boolean }> {
        await delay(1200);
        // Logic validation would happen here
        return { success: true };
    },

    /**
     * GET /api/admin/accounts
     */
    async getAllAccounts(): Promise<{ userId: string; username: string; accounts: Account[] }[]> {
        await delay(1000);
        return USERS.map(user => ({
            userId: user.id,
            username: user.username,
            accounts: user.accounts
        }));
    }
};
