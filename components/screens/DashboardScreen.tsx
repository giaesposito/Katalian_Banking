
import React from 'react';
import { User, ViewType } from '../../types';
import Button from '../common/Button';

interface DashboardScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate }) => {
    const totalBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Portfolio Summary */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-teal-100 text-sm font-bold uppercase tracking-widest">Total Portfolio Value</h2>
                <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-5xl font-extrabold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-teal-200 font-medium">USD</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction icon="📥" label="Deposit" onClick={() => onNavigate({name:'deposit'})} />
                <QuickAction icon="💸" label="Transfer" onClick={() => onNavigate({name:'transfer'})} />
                <QuickAction icon="📉" label="Loans" onClick={() => onNavigate({name:'loans'})} />
                <QuickAction icon="📞" label="Support" onClick={() => onNavigate({name:'contact'})} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-teal-500 rounded-full"></span> Your Accounts
                    </h3>
                    <div className="space-y-3">
                        {user.accounts.map(acc => (
                            <div key={acc.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all flex justify-between items-center group">
                                <div>
                                    <p className="text-white font-bold">{acc.type}</p>
                                    <p className="text-xs text-gray-500">{acc.accountNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-mono font-bold text-teal-400">${acc.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Available</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applications and Side Info */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Active Loans</h3>
                    {user.loans && user.loans.length > 0 ? (
                        user.loans.map(loan => (
                            <div key={loan.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-white font-bold">{loan.type} Loan</p>
                                    <span className="bg-yellow-900/50 text-yellow-400 text-[10px] px-2 py-1 rounded font-bold uppercase">{loan.status}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">${loan.amount.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{loan.interestRate}% APR • {loan.termMonths} Months</p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-700 text-center">
                            <p className="text-sm text-gray-500 italic">No active loans found.</p>
                            <Button variant="secondary" className="mt-4 text-xs" onClick={() => onNavigate({name:'loans'})}>Explore Loans</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuickAction: React.FC<{icon: string, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all flex flex-col items-center justify-center gap-2 group">
        <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">{label}</span>
    </button>
);

export default DashboardScreen;
