
import React from 'react';
import { ViewType } from '../../types';
import { LOAN_PRODUCTS } from '../../constants';
import Button from '../common/Button';

interface LoansScreenProps {
    onNavigate: (view: ViewType) => void;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ onNavigate }) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-5xl font-black text-white tracking-tighter">Private Credit Solutions</h2>
                <p className="text-slate-400 text-lg leading-relaxed">Sophisticated lending for your primary residence, luxury vehicles, or personal capital requirements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {LOAN_PRODUCTS.map((loan) => (
                    <div key={loan.type} className="bg-slate-900/50 rounded-[2rem] border border-white/5 p-10 flex flex-col justify-between hover:bg-slate-900 transition-all shadow-2xl group border-transparent hover:border-emerald-500/20">
                        <div>
                            <span className="text-6xl mb-8 block group-hover:scale-110 transition-transform origin-left">{loan.icon}</span>
                            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{loan.type}</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{loan.description}</p>
                            
                            <div className="bg-white/5 p-6 rounded-3xl mb-10 border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rates from</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-emerald-500 tracking-tighter tabular-nums">{loan.rate}</span>
                                    <span className="text-xs font-black text-emerald-500/50 uppercase">APR</span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => onNavigate({ name: 'applyLoan', loanType: loan.type as any })} fullWidth className="py-4">Apply for Funding</Button>
                    </div>
                ))}
            </div>

            <div className="bg-emerald-500/10 rounded-[2.5rem] p-12 border border-emerald-500/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full translate-y-1/2"></div>
                <div className="relative z-10 space-y-4">
                    <h4 className="text-white text-2xl font-black tracking-tight">Need a custom lending solution?</h4>
                    <p className="text-slate-400 max-w-xl mx-auto font-medium">Contact our wealth management team for commercial facilities or high-limit liquidity lines.</p>
                    <div className="pt-4">
                        <Button variant="secondary" className="px-10 border-white/20 hover:border-emerald-500/50" onClick={() => onNavigate({name:'contact'})}>Contact Asset Division</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoansScreen;
