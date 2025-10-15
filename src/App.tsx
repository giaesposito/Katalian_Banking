import React, { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
import { User, Account, ApplicationData } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import Header from './components/common/Header';

// Wrapper for ApplicationScreen to get URL param
const ApplicationScreenWrapper: React.FC<{
    user: User, 
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void
}> = ({ user, onSubmit }) => {
    const { accountType: accountTypeFromUrl } = useParams<{ accountType: string }>();
    const navigate = useNavigate();

    const accountType = accountTypeFromUrl ? decodeURIComponent(accountTypeFromUrl) as Account['type'] : undefined;
    
    const validAccountTypes: Account['type'][] = ['Checking', 'Savings', 'Credit Card', 'Platinum Credit Card'];
    if (!accountType || !validAccountTypes.includes(accountType)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <ApplicationScreen 
        user={user} 
        accountType={accountType} 
        onNavigate={() => navigate('/dashboard')} 
        onSubmit={onSubmit} 
    />;
}

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const handleLogin = (username: string, password: string):'success' | 'locked' | 'invalid' => {
        const user = users.find(u => u.username === username);
        if (!user) return 'invalid';

        if (user.locked && password === user.unlockPasswordHash) {
             const updatedUsers = users.map(u => u.id === user.id ? { ...u, locked: false } : u);
             setUsers(updatedUsers);
             const loggedInUser = { ...user, locked: false };
             setCurrentUser(loggedInUser);
             navigate('/dashboard');
             return 'success';
        }

        if (user.locked) return 'locked';
        if (user.passwordHash !== password) return 'invalid';

        setCurrentUser(user);
        navigate('/dashboard');
        return 'success';
    };

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        navigate('/login');
    }, [navigate]);

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
        navigate('/dashboard');
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
        navigate('/dashboard');
    };

    const ProtectedRoute: React.FC<{ user: User | null }> = ({ user }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        return <Outlet />;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <Header user={currentUser} onLogout={handleLogout} />
                <main className="mt-8">
                    <Routes>
                        <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
                        <Route path="/reset-password" element={<PasswordResetScreen />} />
                        
                        <Route element={<ProtectedRoute user={currentUser} />}>
                            <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} />} />
                            <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onTransfer={handleTransfer} />} />
                            <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} />} />
                        </Route>

                        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
