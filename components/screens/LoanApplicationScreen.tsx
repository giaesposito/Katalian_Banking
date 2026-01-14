
import React, { useState } from 'react';
import { Loan, LoanApplicationData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { STATES } from '../../constants';

interface LoanApplicationScreenProps {
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
        await onSubmit(formData as LoanApplicationData, loanType);
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Personal Verification</h3>
                            <p className="text-slate-500 text-sm font-medium">Verify your legal identity for credit assessment.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
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
                            <p className="text-slate-500 text-sm font-medium">Details regarding your recurring income and professional status.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="employer" name="employer" label="Current Employer" value={formData.employer} onChange={handleChange} required />
                            <Input id="jobTitle" name="jobTitle" label="Official Job Title" value={formData.jobTitle} onChange={handleChange} required />
                            <Input id="annualIncome" name="annualIncome" label="Gross Annual Income ($)" type="number" value={formData.annualIncome} onChange={handleChange} required />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Facility Requirements</h3>
                            <p className="text-slate-500 text-sm font-medium">Define your required capital and repayment structure.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="loanAmount" name="loanAmount" label="Required Capital ($)" type="number" value={formData.loanAmount} onChange={handleChange} required />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Proposed Term</label>
                                <select name="loanTerm" value={formData.loanTerm} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium focus:border-emerald-500/50 outline-none transition-all">
                                    <option value="12">12 Months</option>
                                    <option value="24">24 Months</option>
                                    <option value="36">36 Months</option>
                                    <option value="48">48 Months</option>
                                    <option value="60">60 Months</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Capital Utilization Purpose</label>
                                <textarea name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium h-32 focus:border-emerald-500/50 outline-none transition-all" placeholder="Briefly describe the allocation plan for these funds..." />
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-emerald-500/20">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center mb-16">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{loanType} <span className="text-slate-500 font-normal">Facility</span></h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Step {step} of 3</p>
                    </div>
                    <button onClick={() => onNavigate()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
