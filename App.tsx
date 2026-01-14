
import React, { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
import { User, Account, ApplicationData, ViewType, Loan, LoanApplicationData } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import DepositScreen from './components/screens/DepositScreen';
import LoansScreen from './components/screens/LoansScreen';
import LoanApplicationScreen from './components/screens/LoanApplicationScreen';
import ContactScreen from './components/screens/ContactScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import AdminScreen from './components/screens/AdminScreen';
import Header from './components/common/Header';
import AiAssistant from './components/common/AiAssistant';
import { mockApi } from './api/mockApi';

const ApplicationScreenWrapper: React.FC<{
    user: User, 
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void,
    onNavigate: (view: ViewType) => void
}> = ({ user, onSubmit, onNavigate }) => {
    const { accountType: accountTypeFromUrl } = useParams<{ accountType: string }>();
    const accountType = accountTypeFromUrl ? decodeURIComponent(accountTypeFromUrl) as Account['type'] : undefined;
    if (!accountType) return <Navigate to="/dashboard" replace />;
    return <ApplicationScreen user={user} accountType={accountType} onNavigate={onNavigate} onSubmit={onSubmit} />;
}

const LoanApplicationWrapper: React.FC<{
    user: User, 
    onSubmit: (loanData: LoanApplicationData, type: Loan['type']) => void,
    onNavigate: (view: ViewType) => void
}> = ({ user, onSubmit, onNavigate }) => {
    const { loanType } = useParams<{ loanType: string }>();
    const type = loanType as Loan['type'];
    if (!type) return <Navigate to="/loans" replace />;
    return <LoanApplicationScreen _user={user} loanType={type} onNavigate={() => onNavigate({ name: 'loans' })} onSubmit={onSubmit} />;
}

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const handleNavigate = useCallback((view: ViewType) => {
        switch (view.name) {
            case 'login': navigate('/login'); break;
            case 'resetPassword': navigate('/reset-password'); break;
            case 'dashboard': navigate('/dashboard'); break;
            case 'transfer': navigate('/transfer'); break;
            case 'deposit': navigate('/deposit'); break;
            case 'loans': navigate('/loans'); break;
            case 'contact': navigate('/contact'); break;
            case 'apply': navigate(`/apply/${encodeURIComponent(view.for)}`); break;
            case 'applyLoan': navigate(`/apply-loan/${view.loanType}`); break;
        }
    }, [navigate]);

    const handleLogin = (username: string, password: string):'success' | 'locked' | 'invalid' => {
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

    const handleApplicationSubmit = async (appData: ApplicationData, accountType: Account['type']) => {
        if (!currentUser) return;
        const newAccount = await mockApi.submitApplication(currentUser.id, appData, accountType);
        const updatedUser = { ...currentUser, accounts: [...currentUser.accounts, newAccount] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handleLoanSubmit = async (loanData: LoanApplicationData, type: Loan['type']) => {
        if (!currentUser) return;
        const newLoan = await mockApi.submitLoanApplication(currentUser.id, loanData, type);
        const updatedUser = { ...currentUser, loans: [...(currentUser.loans || []), newLoan] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handleDeposit = async (toAccountId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeDeposit(toAccountId, amount);
        const updatedAccounts = currentUser.accounts.map(acc => acc.id === toAccountId ? { ...acc, balance: acc.balance + amount } : acc);
        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

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

    const ProtectedRoute: React.FC<{ user: User | null }> = ({ user }) => {
        if (!user) return <Navigate to="/login" replace />;
        return <Outlet />;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
                <main className="mt-8">
                    <Routes>
                        <Route path="/login" element={<LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />} />
                        <Route path="/reset-password" element={<PasswordResetScreen onNavigate={handleNavigate} />} />
                        <Route element={<ProtectedRoute user={currentUser} />}>
                            <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />} />
                            <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onNavigate={handleNavigate} onTransfer={handleTransfer} />} />
                            <Route path="/deposit" element={currentUser && <DepositScreen user={currentUser} onNavigate={handleNavigate} onDeposit={handleDeposit} />} />
                            <Route path="/loans" element={currentUser && <LoansScreen onNavigate={handleNavigate} />} />
                            <Route path="/apply-loan/:loanType" element={currentUser && <LoanApplicationWrapper user={currentUser} onNavigate={handleNavigate} onSubmit={handleLoanSubmit} />} />
                            <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} onNavigate={handleNavigate} />} />
                            <Route path="/contact" element={<ContactScreen onNavigate={handleNavigate} />} />
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
