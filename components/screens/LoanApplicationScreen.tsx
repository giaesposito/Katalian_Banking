
import React, { useState } from 'react';
import { User, Loan, LoanApplicationData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { STATES } from '../../constants';

interface LoanApplicationScreenProps {
    user: User;
    loanType: Loan['type'];
    onNavigate: () => void;
    onSubmit: (loanData: LoanApplicationData, type: Loan['type']) => void;
}

const LoanApplicationScreen: React.FC<LoanApplicationScreenProps> = ({ loanType, onNavigate, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<LoanApplicationData>>({
        firstName: '', lastName: '', dob: '', address: '', city: '', state: STATES[0], zip: '',
        employer: '', jobTitle: '', annualIncome: 0, loanAmount: 0, loanTerm: 12, purpose: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (e.target.type === 'number') ? parseFloat(value) : value }));
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(async () => {
            await onSubmit(formData as LoanApplicationData, loanType);
            setLoading(false);
        }, 1500);
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Personal Verification</h3>
                            <p className="text-slate-500 text-sm font-medium">Verify your identity for the lending institution.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                            <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                        <Input id="address" name="address" label="Primary Residence" value={formData.address} onChange={handleChange} required />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Capital & Employment</h3>
                            <p className="text-slate-500 text-sm font-medium">Verify your income sources for risk assessment.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="employer" name="employer" label="Current Employer" value={formData.employer} onChange={handleChange} required />
                            <Input id="jobTitle" name="jobTitle" label="Job Title" value={formData.jobTitle} onChange={handleChange} required />
                            <Input id="annualIncome" name="annualIncome" label="Annual Income ($)" type="number" value={formData.annualIncome} onChange={handleChange} required />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Facility Requirements</h3>
                            <p className="text-slate-500 text-sm font-medium">Define repayment and utilization parameters.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="loanAmount" name="loanAmount" label="Required Amount ($)" type="number" value={formData.loanAmount} onChange={handleChange} required />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Proposed Term</label>
                                <select name="loanTerm" value={formData.loanTerm} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium outline-none">
                                    <option value="12">12 Months</option>
                                    <option value="24">24 Months</option>
                                    <option value="36">36 Months</option>
                                </select>
                            </div>
                            <textarea name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium h-32 focus:border-emerald-500/50 outline-none transition-all resize-none" placeholder="Description of capital utilization..." />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center mb-16">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{loanType} <span className="text-slate-500 font-normal">Facility</span></h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">{loading ? 'Processing' : `Step ${step} of 3`}</p>
                    </div>
                    {!loading && (
                        <button onClick={() => onNavigate()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                        <Spinner />
                        <h4 className="text-xl font-black text-white uppercase tracking-widest">Running Risk Profile</h4>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="min-h-[300px]">{renderStep()}</div>
                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                            <div>{step > 1 && <Button type="button" variant="secondary" onClick={handleBack} className="!rounded-full px-8">Back</Button>}</div>
                            <div className="flex gap-4">
                                {step < 3 ? <Button type="button" onClick={handleNext} className="!rounded-full px-10">Continue</Button> : <Button type="submit" className="!rounded-full px-10">Submit Application</Button>}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoanApplicationScreen;
