
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Portfolio Summary Card */}
            <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-teal-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
                        <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter flex items-baseline gap-2">
                            <span className="text-slate-500 text-3xl font-medium">$</span>
                            {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                2.4%
                            </span>
                            <span className="text-slate-500 text-xs font-medium">vs last month</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={() => onNavigate({name:'deposit'})} variant="primary" className="!rounded-full px-6 py-3">Quick Deposit</Button>
                        <Button onClick={() => onNavigate({name:'transfer'})} variant="secondary" className="!rounded-full px-6 py-3">Move Money</Button>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            My Accounts
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">{user.accounts.length}</span>
                        </h3>
                    </div>
                    
                    <div className="grid gap-4">
                        {user.accounts.map(acc => (
                            <div key={acc.id} className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 rounded-2xl p-6 transition-all duration-300 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {acc.type === 'Checking' ? '💳' : acc.type === 'Savings' ? '📈' : '💎'}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold group-hover:text-teal-400 transition-colors">{acc.type}</h4>
                                        <p className="text-xs text-slate-500 font-mono">{acc.accountNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white font-mono">${acc.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                    <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-1">Available Now</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Button onClick={() => onNavigate({name:'loans'})} variant="ghost" className="w-full border-2 border-dashed border-slate-800 hover:border-teal-500/50 py-8 !rounded-2xl text-slate-500 hover:text-teal-400 flex items-center justify-center gap-2">
                        <span className="text-xl">+</span> Open New Product
                    </Button>
                </div>

                {/* Sidebar / Recent Activity */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-xl font-bold text-white mb-6">Financial Insights</h3>
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-slate-400">Savings Goal</span>
                                    <span className="text-teal-400">75%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500 w-[75%] shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    "You've saved 12% more than last month. At this rate, you'll reach your vacation goal by August."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-white mb-6">Security Hub</h3>
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800">
                            <div className="py-3 flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🛡️</span>
                                    <span className="text-xs text-slate-300 font-medium">Fraud Protection</span>
                                </div>
                                <span className="text-[10px] text-green-500 font-bold">ACTIVE</span>
                            </div>
                            <div className="py-3 flex items-center justify-between group cursor-pointer" onClick={() => onNavigate({name:'contact'})}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📱</span>
                                    <span className="text-xs text-slate-300 font-medium">Freeze Cards</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
