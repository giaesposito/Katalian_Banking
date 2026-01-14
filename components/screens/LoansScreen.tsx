
import React from 'react';
import { ViewType } from '../../types';
import { LOAN_PRODUCTS } from '../../constants';
import Button from '../common/Button';

interface LoansScreenProps {
    onNavigate: (view: ViewType) => void;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ onNavigate }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-4xl font-extrabold text-white">Smart Financing for Your Future</h2>
                <p className="text-gray-400">Competitive rates, fast approval, and flexible terms. Discover why thousands choose Katalian Bank for their borrowing needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {LOAN_PRODUCTS.map((loan) => (
                    <div key={loan.type} className="bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-xl hover:border-teal-500/50">
                        <div>
                            <span className="text-5xl mb-6 block">{loan.icon}</span>
                            <h3 className="text-2xl font-bold text-white mb-2">{loan.type} Loan</h3>
                            <p className="text-gray-400 text-sm mb-6">{loan.description}</p>
                            <div className="bg-gray-900/50 p-4 rounded-xl mb-8">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Rates starting at</p>
                                <p className="text-3xl font-black text-teal-400">{loan.rate} <span className="text-xs font-medium text-teal-600">APR</span></p>
                            </div>
                        </div>
                        <Button onClick={() => onNavigate({ name: 'applyLoan', loanType: loan.type as any })} fullWidth>Apply Now</Button>
                    </div>
                ))}
            </div>

            <div className="bg-teal-900/30 rounded-2xl p-8 border border-teal-500/20 text-center">
                <h4 className="text-white font-bold mb-2">Need a custom lending solution?</h4>
                <p className="text-gray-400 text-sm mb-4">Contact our commercial lending team for business loans and specialized credit facilities.</p>
                <Button variant="secondary" className="text-xs" onClick={() => onNavigate({name:'contact'})}>Contact Special Lending</Button>
            </div>
        </div>
    );
};

export default LoansScreen;
