
import React, { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
import { User, Account, ApplicationData, Loan, LoanApplicationData, ViewType } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import LoanApplicationScreen from './components/screens/LoanApplicationScreen';
import LoansScreen from './components/screens/LoansScreen';
import ContactScreen from './components/screens/ContactScreen';
import SecurityScreen from './components/screens/SecurityScreen';
import DepositScreen from './components/screens/DepositScreen';
import AdminScreen from './components/screens/AdminScreen';
import Header from './components/common/Header';
import AiAssistant from './components/common/AiAssistant';
import { mockApi } from './api/mockApi';

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
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
        }} 
        onSubmit={onSubmit} 
    />;
}

const LoanApplicationWrapper: React.FC<{
    user: User,
    onSubmit: (loanData: LoanApplicationData, type: Loan['type']) => void
}> = ({ user, onSubmit }) => {
    const { loanType } = useParams<{ loanType: string }>();
    const navigate = useNavigate();
    const type = loanType ? decodeURIComponent(loanType) as Loan['type'] : undefined;
    if (!type) return <Navigate to="/loans" replace />;
    return <LoanApplicationScreen user={user} loanType={type} onNavigate={() => navigate('/loans')} onSubmit={onSubmit} />;
}

const SecurityScreenWrapper: React.FC<{
    user: User,
    onActionComplete: (action: 'report' | 'lockdown') => void
}> = ({ user, onActionComplete }) => {
    const { action } = useParams<{ action: string }>();
    const navigate = useNavigate();
    const validAction = (action === 'report' || action === 'lockdown') ? action : 'report';
    
    return <SecurityScreen 
        user={user} 
        action={validAction} 
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
            if (view.name === 'contact') navigate('/contact');
        }}
        onActionComplete={onActionComplete}
    />;
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
            case 'deposit': navigate('/deposit'); break;
            case 'resetPassword': navigate('/reset-password'); break;
            case 'contact': navigate('/contact'); break;
            case 'loans': navigate('/loans'); break;
            case 'security': navigate(`/security/${view.action}`); break;
            case 'apply': navigate(`/apply/${encodeURIComponent(view.for)}`); break;
            case 'applyLoan': navigate(`/apply-loan/${encodeURIComponent(view.loanType)}`); break;
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

    const handleSecurityAction = (action: 'report' | 'lockdown') => {
        if (!currentUser) return;
        if (action === 'lockdown') {
            const updatedUser = { ...currentUser, locked: true };
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            handleLogout();
        } else {
            // Reporting stolen asset just returns to dashboard in this simulation
            navigate('/dashboard');
        }
    };

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

    const handleDeposit = async (toAccountId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeDeposit(toAccountId, amount);
        const updatedAccounts = currentUser.accounts.map(acc => 
            acc.id === toAccountId ? { ...acc, balance: acc.balance + amount } : acc
        );
        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
            <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
            <main className="px-6 py-12 md:py-20 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/login" element={<LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />} />
                    <Route path="/reset-password" element={<PasswordResetScreen onNavigate={handleNavigate} />} />
                    
                    <Route element={<ProtectedRoute user={currentUser} />}>
                        <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />} />
                        <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onTransfer={handleTransfer} onNavigate={handleNavigate} />} />
                        <Route path="/deposit" element={currentUser && <DepositScreen user={currentUser} onNavigate={handleNavigate} onDeposit={handleDeposit} />} />
                        <Route path="/loans" element={<LoansScreen onNavigate={handleNavigate} />} />
                        <Route path="/contact" element={<ContactScreen onNavigate={handleNavigate} />} />
                        <Route path="/security/:action" element={currentUser && <SecurityScreenWrapper user={currentUser} onActionComplete={handleSecurityAction} />} />
                        <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} />} />
                        <Route path="/apply-loan/:loanType" element={currentUser && <LoanApplicationWrapper user={currentUser} onSubmit={handleLoanSubmit} />} />
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
