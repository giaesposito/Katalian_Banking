
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
// FIX: Added ViewType to imports to support the handleNavigate bridge function
import { User, Account, ApplicationData, ViewType } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import AdminScreen from './components/screens/AdminScreen';
import Header from './components/common/Header';
import AiAssistant from './components/common/AiAssistant';
import { mockApi } from './api/mockApi';

// FIX: Updated ApplicationScreenWrapper props to include onNavigate to fix the prop passing chain
const ApplicationScreenWrapper: React.FC<{
    user: User, 
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void,
    onNavigate: (view: ViewType) => void
}> = ({ user, onSubmit, onNavigate }) => {
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
        onNavigate={onNavigate} 
        onSubmit={onSubmit} 
    />;
}

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initData = async () => {
            const data = await mockApi.getUsers();
            setUsers(data);
        };
        initData();
    }, []);

    // FIX: Implemented handleNavigate bridge to map ViewType navigation objects to React Router route paths
    const handleNavigate = useCallback((view: ViewType) => {
        switch (view.name) {
            case 'login': navigate('/login'); break;
            case 'resetPassword': navigate('/reset-password'); break;
            case 'dashboard': navigate('/dashboard'); break;
            case 'transfer': navigate('/transfer'); break;
            case 'apply': navigate(`/apply/${encodeURIComponent(view.for)}`); break;
        }
    }, [navigate]);

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

    const handleApplicationSubmit = async (appData: ApplicationData, accountType: Account['type']) => {
        if (!currentUser) return;

        const newAccount = await mockApi.submitApplication(currentUser.id, appData, accountType);
        
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

    const handleTransfer = async (fromAccountId: string, toAccountId: string, amount: number) => {
        if (!currentUser) return;

        await mockApi.executeTransfer(fromAccountId, toAccountId, amount);

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
                        {/* FIX: Added missing onNavigate prop to LoginScreen (Error line 129) */}
                        <Route path="/login" element={<LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />} />
                        {/* FIX: Added missing onNavigate prop to PasswordResetScreen (Error line 130) */}
                        <Route path="/reset-password" element={<PasswordResetScreen onNavigate={handleNavigate} />} />
                        
                        <Route element={<ProtectedRoute user={currentUser} />}>
                            {/* FIX: Added missing onNavigate prop to DashboardScreen (Error line 133) */}
                            <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />} />
                            {/* FIX: Added missing onNavigate prop to TransferScreen (Error line 134) */}
                            <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onNavigate={handleNavigate} onTransfer={handleTransfer} />} />
                            {/* FIX: Passed handleNavigate to ApplicationScreenWrapper to resolve nested prop requirement */}
                            <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} onNavigate={handleNavigate} />} />
                            <Route path="/admin" element={<AdminScreen />} />
                        </Route>

                        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
                    </Routes>
                </main>
            </div>
            {currentUser && <AiAssistant allUsers={users} />}
        </div>
    );
};

export default App;
