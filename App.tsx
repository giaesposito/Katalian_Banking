
import React, { useState, useCallback } from 'react';
import { User, ViewType, Account, ApplicationData } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import Header from './components/common/Header';

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<ViewType>({ name: 'login' });

    const handleLogin = (username: string, password: string):'success' | 'locked' | 'invalid' => {
        const user = users.find(u => u.username === username);
        if (!user) return 'invalid';

        if (user.locked && password === user.unlockPasswordHash) {
             const updatedUsers = users.map(u => u.id === user.id ? { ...u, locked: false } : u);
             setUsers(updatedUsers);
             setCurrentUser({ ...user, locked: false });
             setView({ name: 'dashboard' });
             return 'success';
        }

        if (user.locked) return 'locked';
        if (user.passwordHash !== password) return 'invalid';

        setCurrentUser(user);
        setView({ name: 'dashboard' });
        return 'success';
    };

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setView({ name: 'login' });
    }, []);

    const handleNavigate = useCallback((newView: ViewType) => {
        setView(newView);
    }, []);

    const handleApplicationSubmit = (appData: ApplicationData, accountType: Account['type']) => {
        if (!currentUser) return;

        const newAccount: Account = {
            id: `acc${currentUser.id}-${currentUser.accounts.length + 1}`,
            type: accountType,
            accountNumber: `...${Math.floor(1000 + Math.random() * 9000)}`,
            balance: appData.initialDeposit || 0,
            status: accountType.includes('Card') ? 'Pending' : undefined,
        };
        
        const updatedUser = {
            ...currentUser,
            accounts: [...currentUser.accounts, newAccount],
        };

        if (appData.depositFromAccountId && appData.initialDeposit) {
            updatedUser.accounts = updatedUser.accounts.map(acc => 
                acc.id === appData.depositFromAccountId 
                ? { ...acc, balance: acc.balance - (appData.initialDeposit || 0) }
                : acc
            );
        }

        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        setView({ name: 'dashboard' });
    };

    const handleTransfer = (fromAccountId: string, toAccountId: string, amount: number) => {
        if (!currentUser) return;

        const updatedAccounts = currentUser.accounts.map(acc => {
            if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
            return acc;
        });

        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        setView({ name: 'dashboard' });
    };

    const renderContent = () => {
        switch (view.name) {
            case 'login':
                return <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />;
            case 'resetPassword':
                return <PasswordResetScreen onNavigate={handleNavigate} />;
            case 'dashboard':
                return currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />;
            case 'transfer':
                 return currentUser && <TransferScreen user={currentUser} onNavigate={handleNavigate} onTransfer={handleTransfer} />;
            case 'apply':
                return currentUser && <ApplicationScreen user={currentUser} accountType={view.for} onNavigate={handleNavigate} onSubmit={handleApplicationSubmit} />;
            default:
                return <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <Header user={currentUser} onLogout={handleLogout} />
                <main className="mt-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
