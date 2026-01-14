
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
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-6">Personal Verification</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                            <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                        <Input id="address" name="address" label="Home Address" value={formData.address} onChange={handleChange} required />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-6">Financial & Employment</h3>
                        <Input id="employer" name="employer" label="Current Employer" value={formData.employer} onChange={handleChange} required />
                        <Input id="jobTitle" name="jobTitle" label="Job Title" value={formData.jobTitle} onChange={handleChange} required />
                        <Input id="annualIncome" name="annualIncome" label="Gross Annual Income ($)" type="number" value={formData.annualIncome} onChange={handleChange} required />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-6">Loan Details</h3>
                        <Input id="loanAmount" name="loanAmount" label="Requested Amount ($)" type="number" value={formData.loanAmount} onChange={handleChange} required />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Term (Months)</label>
                            <select name="loanTerm" value={formData.loanTerm} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white">
                                <option value="12">12 Months</option>
                                <option value="24">24 Months</option>
                                <option value="36">36 Months</option>
                                <option value="48">48 Months</option>
                                <option value="60">60 Months</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Loan Purpose</label>
                            <textarea name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white h-24" placeholder="Briefly describe what the funds will be used for..." />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white">{loanType} Loan</h2>
                    <p className="text-gray-500 text-sm">Step {step} of 3</p>
                </div>
                <button onClick={() => onNavigate()} className="text-gray-500 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-10">{renderStep()}</div>
                
                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <Button type="button" variant="secondary" onClick={step === 1 ? () => onNavigate() : handleBack}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    {step < 3 ? (
                        <Button type="button" onClick={handleNext}>Continue</Button>
                    ) : (
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : 'Submit Application'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoanApplicationScreen;
