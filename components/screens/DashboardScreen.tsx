
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
        <div className="max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in duration-700">
            {/* Asset Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-3xl p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-1">Total Liquidity</h2>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-emerald-500 text-4xl font-medium">$</span>
                                        <span className="text-6xl font-black text-white tracking-tighter tabular-nums">
                                            {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onNavigate({name:'deposit'})} className="p-3 bg-emerald-500 text-slate-950 rounded-xl hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <Stat mini label="Active Accounts" value={user.accounts.length.toString()} />
                                <Stat mini label="Monthly Yield" value="+0.45%" green />
                                <Stat mini label="Credit Utilization" value="12%" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Accounts & Assets</h3>
                            <button onClick={() => onNavigate({name:'loans'})} className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Manage Assets</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.accounts.map(acc => (
                                <div key={acc.id} className="group bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:bg-slate-900 hover:border-white/10 transition-all cursor-pointer">
                                    <div className="flex justify-between mb-6">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                                            <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 uppercase">{acc.accountNumber}</span>
                                    </div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{acc.type}</p>
                                    <p className="text-2xl font-black text-white tabular-nums">${acc.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900/30 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Security & Services</h3>
                        <div className="space-y-3">
                            <ServiceItem icon="💸" label="Transfer Funds" onClick={() => onNavigate({name:'transfer'})} />
                            <ServiceItem icon="📊" label="Request Statements" />
                            <ServiceItem icon="🛡️" label="Identity Protection" active />
                            <ServiceItem icon="📍" label="ATM Finder" />
                        </div>
                    </section>

                    <section className="bg-emerald-500 rounded-3xl p-8 shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
                        <h3 className="text-slate-950 font-black text-xl leading-tight mb-4">You're eligible for a Platinum Upgrade.</h3>
                        <p className="text-slate-900/70 text-sm font-medium mb-6">Unlock concierge service, 0% FX fees, and exclusive lounge access.</p>
                        <Button variant="secondary" className="w-full bg-slate-950 text-white border-none py-3" onClick={() => onNavigate({name:'apply', for: 'Platinum Credit Card'})}>Upgrade Now</Button>
                    </section>
                </div>
            </div>
        </div>
    );
};

const Stat: React.FC<{mini?: boolean, label: string, value: string, green?: boolean}> = ({ label, value, green }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-black ${green ? 'text-emerald-500' : 'text-white'}`}>{value}</span>
    </div>
);

const ServiceItem: React.FC<{icon: string, label: string, active?: boolean, onClick?: () => void}> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group">
        <div className="flex items-center gap-3">
            <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-sm font-bold text-slate-300">{label}</span>
        </div>
        {active ? (
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
        ) : (
            <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        )}
    </button>
);

export default DashboardScreen;
