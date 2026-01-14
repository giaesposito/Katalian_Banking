
import React, { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
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

const ApplicationScreenWrapper: React.FC<{
    user: User, 
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void
}> = ({ user, onSubmit }) => {
    const { accountType } = useParams<{ accountType: string }>();
    const navigate = useNavigate();
    const type = accountType ? decodeURIComponent(accountType) as Account['type'] : undefined;
    if (!type) return <Navigate to="/dashboard" replace />;
    return <ApplicationScreen user={user} accountType={type} onNavigate={() => navigate('/dashboard')} onSubmit={onSubmit} />;
}

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const handleNavigate = useCallback((view: ViewType) => {
        switch (view.name) {
            case 'login': navigate('/login'); break;
            case 'dashboard': navigate('/dashboard'); break;
            case 'transfer': navigate('/transfer'); break;
            case 'resetPassword': navigate('/reset-password'); break;
            case 'contact': navigate('/contact'); break;
            case 'apply': navigate(`/apply/${encodeURIComponent(view.for)}`); break;
        }
    }, [navigate]);

    const handleLogin = (username: string, password: string): 'success' | 'locked' | 'invalid' => {
        const user = users.find(u => u.username === username);
        if (!user) return 'invalid';
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

    const handleTransfer = async (fromId: string, toId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeTransfer(fromId, toId, amount);
        const updatedAccounts = currentUser.accounts.map(acc => {
            if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
            return acc;
        });
        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handleApplicationSubmit = async (appData: ApplicationData, accountType: Account['type']) => {
        if (!currentUser) return;
        const newAcc = await mockApi.submitApplication(currentUser.id, appData, accountType);
        const updatedUser = { ...currentUser, accounts: [...currentUser.accounts, newAcc] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">
            <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
            <main className="px-6 py-12 md:py-20">
                <Routes>
                    <Route path="/login" element={<LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />} />
                    <Route path="/reset-password" element={<PasswordResetScreen onNavigate={handleNavigate} />} />
                    <Route element={<ProtectedRoute user={currentUser} />}>
                        <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />} />
                        <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onTransfer={handleTransfer} onNavigate={handleNavigate} />} />
                        <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} />} />
                        <Route path="/admin" element={<AdminScreen />} />
                    </Route>
                    <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </main>
            {currentUser && <AiAssistant allUsers={users} />}
        </div>
    );
};

const ProtectedRoute: React.FC<{ user: User | null }> = ({ user }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
};

export default App;
