
import { User, Account } from '../types';
import { USERS } from '../constants';

// Simulated delay to mimic real API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    /**
     * Retrieves all users in the system.
     */
    async getUsers(): Promise<User[]> {
        await delay(800);
        // In a real app, this would fetch from a database
        return [...USERS];
    },

    /**
     * Retrieves a specific user by ID.
     */
    async getUserById(id: string): Promise<User | null> {
        await delay(400);
        return USERS.find(u => u.id === id) || null;
    },

    /**
     * Retrieves all accounts for all users.
     */
    async getAllAccounts(): Promise<{ userId: string; username: string; accounts: Account[] }[]> {
        await delay(1000);
        return USERS.map(user => ({
            userId: user.id,
            username: user.username,
            accounts: user.accounts
        }));
    },

    /**
     * A simulated "search" endpoint.
     */
    async searchUsers(query: string): Promise<User[]> {
        await delay(600);
        const lowerQuery = query.toLowerCase();
        return USERS.filter(u => 
            u.username.toLowerCase().includes(lowerQuery) || 
            u.id.toLowerCase().includes(lowerQuery)
        );
    }
};
