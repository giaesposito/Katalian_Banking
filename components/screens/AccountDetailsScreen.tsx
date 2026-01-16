
import React, { useState, useMemo } from 'react';
import { ViewType, Account } from '../../types';
import Button from '../common/Button';

interface AccountDetailsScreenProps {
    account: Account;
    onNavigate: (view: ViewType) => void;
}

const AccountDetailsScreen: React.FC<AccountDetailsScreenProps> = ({ account, onNavigate }) => {
    const [downloading, setDownloading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>('All');

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        account.transactions.forEach(tx => {
            const date = new Date(tx.date);
            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            months.add(monthName);
        });
        return ['All', ...Array.from(months)];
    }, [account.transactions]);

    const filteredTransactions = useMemo(() => {
        if (selectedMonth === 'All') return account.transactions;
        return account.transactions.filter(tx => {
            const date = new Date(tx.date);
            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            return monthName === selectedMonth;
        });
    }, [account.transactions, selectedMonth]);

    const handleDownloadStatement = () => {
        setDownloading(true);
        // Simulated provisioning of financial statement
        setTimeout(() => {
            setDownloading(false);
            alert(`Financial statement for ${selectedMonth === 'All' ? 'Latest Period' : selectedMonth} has been generated and pushed to your secure storage.`);
        }, 2000);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <button 
                        onClick={() => onNavigate({name:'dashboard'})}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors mb-4"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Back to Portfolio
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-4xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            {account.type === 'Checking' ? '💳' : account.type === 'Savings' ? '💰' : account.type === 'Credit Card' ? '💳' : '💎'}
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{account.type} <span className="text-slate-500 font-normal">Ledger</span></h2>
                            <p className="font-mono text-xs text-slate-500 tracking-widest">{account.accountNumber} • SECURE FACILITY</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8 flex items-center gap-12 shadow-2xl">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Available Capital</p>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter">${account.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <Button onClick={handleDownloadStatement} disabled={downloading} variant="secondary" className="!rounded-full px-8 py-4">
                        {downloading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                Provisioning...
                            </div>
                        ) : 'Download Statement'}
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 pb-2 border-b border-white/5">
                {availableMonths.map(month => (
                    <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                            selectedMonth === month 
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_5px_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
                        }`}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {/* Ledger Table */}
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold">No ledger entries detected for this period.</td>
                            </tr>
                        ) : (
                            filteredTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                                <tr key={tx.id} className="group hover:bg-white/5 transition-colors cursor-default">
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-white uppercase tracking-tighter">
                                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{new Date(tx.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-200 group-hover:text-white transition-colors uppercase italic">{tx.description}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 text-right text-lg font-black tabular-nums ${tx.type === 'Credit' ? 'text-emerald-500' : 'text-slate-200'}`}>
                                        {tx.type === 'Credit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-center pt-8">
                <Button variant="ghost" onClick={() => onNavigate({name:'dashboard'})} className="text-slate-600 hover:text-white uppercase tracking-widest text-[10px] font-black italic">End of Ledger Facility</Button>
            </div>
        </div>
    );
};

export default AccountDetailsScreen;
