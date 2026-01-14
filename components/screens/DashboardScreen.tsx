
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
        <div className="max-w-6xl mx-auto space-y-10 animate-[fadeIn_0.5s_ease-out]">
            {/* Total Balance Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4">Net Liquidity</p>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-2">
                                <span className="text-emerald-500 text-3xl md:text-4xl font-normal">$</span>
                                {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="flex gap-4 mt-6">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active Assets</span>
                                <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">Member since 2021</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => onNavigate({name:'transfer'})} variant="primary" className="!rounded-full px-8">Move Funds</Button>
                            <Button onClick={() => onNavigate({name:'deposit'})} variant="secondary" className="!rounded-full px-8">Add Cash</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        Accounts & Cards
                        <span className="w-8 h-[1px] bg-slate-800"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.accounts.map(acc => (
                            <div key={acc.id} className="group bg-slate-900/50 border border-white/5 rounded-3xl p-6 hover:bg-slate-900 hover:border-emerald-500/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {acc.type === 'Checking' ? '💳' : acc.type === 'Savings' ? '💰' : '💎'}
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-500 tracking-widest">{acc.accountNumber}</span>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{acc.type}</p>
                                <p className="text-2xl font-black text-white tabular-nums">${acc.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Quick Links */}
                <div className="space-y-8">
                    <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Security Services</h4>
                        <div className="space-y-2">
                           <QuickLink label="Freeze All Cards" icon="❄️" />
                           <QuickLink label="Fraud Reports" icon="🛡️" />
                           <QuickLink label="ATM Locations" icon="📍" />
                           <QuickLink label="Contact Advisor" icon="📞" onClick={() => onNavigate({name:'contact'})} />
                        </div>
                    </section>

                    <div className="bg-emerald-500 rounded-3xl p-8 relative overflow-hidden group cursor-pointer" onClick={() => onNavigate({name:'loans'})}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h4 className="text-slate-950 font-black text-xl mb-2">Private Lending</h4>
                        <p className="text-slate-900/60 text-sm font-bold mb-4">Rates starting at 3.2% APR for premier members.</p>
                        <span className="text-slate-950 font-black text-xs uppercase tracking-widest border-b-2 border-slate-950/20">Explore Products →</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink: React.FC<{label: string, icon: string, onClick?: () => void}> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
        <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white">{label}</span>
        </div>
        <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
);

export default DashboardScreen;
