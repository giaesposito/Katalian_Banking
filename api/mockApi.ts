
import { User, Account, ApplicationData, Loan, LoanApplicationData } from '../types';
import { USERS } from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    async getUsers(): Promise<User[]> {
        await delay(500);
        return [...USERS];
    },

    async submitApplication(userId: string, appData: ApplicationData, accountType: Account['type']): Promise<Account> {
        await delay(1500);
        return {
            id: `acc-${Math.random().toString(36).substr(2, 9)}`,
            type: accountType,
            accountNumber: `...${Math.floor(1000 + Math.random() * 9000)}`,
            balance: appData.initialDeposit || 0,
            status: accountType.includes('Card') ? 'Pending' : 'Active',
        };
    },

    async executeTransfer(fromId: string, toId: string, amount: number): Promise<{ success: boolean }> {
        await delay(800);
        return { success: true };
    },

    async executeDeposit(toId: string, amount: number): Promise<{ success: boolean }> {
        await delay(1200);
        return { success: true };
    },

    async submitLoanApplication(userId: string, loanData: LoanApplicationData, type: Loan['type']): Promise<Loan> {
        await delay(2000);
        return {
            id: `loan-${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            amount: loanData.loanAmount,
            interestRate: type === 'Mortgage' ? 6.45 : type === 'Auto' ? 4.25 : 5.99,
            status: 'Pending',
            termMonths: loanData.loanTerm,
        };
    }
};
