
import React, { useState, useEffect } from 'react';
import { User, ViewType, Account, ApplicationData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { STATES } from '../../constants';

interface ApplicationScreenProps {
    user: User;
    accountType: Account['type'];
    onNavigate: (view: ViewType) => void;
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void;
}

const ApplicationScreen: React.FC<ApplicationScreenProps> = ({ user, accountType, onNavigate, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ApplicationData>({
        firstName: '', middleName: '', lastName: '', dob: '',
        address: '', city: '', state: STATES[0], zip: '',
        initialDeposit: undefined, depositFromAccountId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isDepositAccount = accountType === 'Checking' || accountType === 'Savings';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumberInput = (e.target as HTMLInputElement).type === 'number';

        setFormData(prev => ({
            ...prev,
            [name]: isNumberInput ? (value === '' ? undefined : parseFloat(value)) : value
        }));

        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const validate = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Legal first name required.';
            if (!formData.lastName.trim()) newErrors.lastName = 'Legal last name required.';
            if (!formData.dob) newErrors.dob = 'Date of birth required.';
        } else if (currentStep === 2) {
            if (!formData.address.trim()) newErrors.address = 'Primary residence required.';
            if (!formData.city.trim()) newErrors.city = 'City required.';
            if (!/^\d{5}$/.test(formData.zip)) newErrors.zip = 'Valid 5-digit ZIP code required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (validate(step)) setStep(s => s + 1);
    };
    const handleBack = () => {
        setErrors({});
        setStep(s => s - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate(step)) setStep(99);
    };
    
    useEffect(() => {
        if (step === 99) {
            const timer = setTimeout(() => setStep(100), 2000);
            return () => clearTimeout(timer);
        }
    }, [step]);
    
    const handleFinish = () => onSubmit(formData, accountType);

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Identity Verification</h3>
                            <p className="text-slate-500 text-sm font-medium">Please provide your legal credentials as they appear on official documents.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input id="firstName" name="firstName" label="Legal First Name" value={formData.firstName} onChange={handleChange} required error={errors.firstName} />
                            <Input id="middleName" name="middleName" label="Middle Name" value={formData.middleName} onChange={handleChange} />
                            <Input id="lastName" name="lastName" label="Legal Last Name" value={formData.lastName} onChange={handleChange} required error={errors.lastName} />
                            <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required error={errors.dob} />
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Residence Information</h3>
                            <p className="text-slate-500 text-sm font-medium">Your primary physical address for regulatory compliance.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="address" name="address" label="Primary Address Line" value={formData.address} onChange={handleChange} required error={errors.address} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} required error={errors.city} />
                               <div className="space-y-2">
                                    <label htmlFor="state" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">State</label>
                                    <select id="state" name="state" value={formData.state} onChange={handleChange} className="block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner focus:outline-none focus:border-emerald-500/50 transition-all text-sm text-white font-medium">
                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                               </div>
                               <Input id="zip" name="zip" label="Zip Code" value={formData.zip} onChange={handleChange} required error={errors.zip} />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Initial Asset Allocation</h3>
                            <p className="text-slate-500 text-sm font-medium">Set your starting liquidity for this new facility.</p>
                        </div>
                         <div className="space-y-6">
                            <Input id="initialDeposit" name="initialDeposit" label="Funding Amount ($)" type="number" step="0.01" min="0" value={formData.initialDeposit || ''} onChange={handleChange} error={errors.initialDeposit} />
                             <div className="space-y-2">
                                <label htmlFor="depositFromAccountId" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Transfer From Existing Account</label>
                                <select id="depositFromAccountId" name="depositFromAccountId" value={formData.depositFromAccountId} onChange={handleChange} className="block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner focus:outline-none focus:border-emerald-500/50 transition-all text-sm text-white font-medium">
                                    <option value="">External Wire / New Funds</option>
                                    {user.accounts.filter(a => a.type === 'Checking' || a.type === 'Savings').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.type} (Ending {acc.accountNumber.slice(-4)})</option>
                                    ))}
                                </select>
                             </div>
                         </div>
                    </div>
                );
            case 99: // Loading
                return (
                    <div className="text-center space-y-8 py-20 animate-in fade-in duration-500">
                        <div className="relative inline-block">
                            <Spinner />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Processing Credentials</h3>
                            <p className="text-slate-500 text-sm font-medium">Running regulatory background checks and risk assessment...</p>
                        </div>
                    </div>
                );
            case 100: // Success
                return (
                    <div className="text-center space-y-10 py-16 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <svg className="h-12 w-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white tracking-tighter">
                                Facility Approved
                            </h3>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                Your {accountType} has been successfully provisioned and is now available in your portfolio.
                            </p>
                        </div>
                        <Button onClick={handleFinish} variant="primary" className="px-10 py-4 !rounded-full">Enter Facility Dashboard</Button>
                    </div>
                );
            default: return null;
        }
    }
    
    const maxSteps = isDepositAccount ? 3 : 2;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-emerald-500/20">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / maxSteps) * 100}%` }}></div>
                </div>

                <div className="flex items-center justify-between mb-16">
                     <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Katalian <span className="text-slate-500 font-normal">Products</span></h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Provisioning {accountType}</p>
                     </div>
                     {step <= maxSteps && <button onClick={() => onNavigate({name:'dashboard'})} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">&times;</button>}
                </div>

                {step <= maxSteps && (
                    <form onSubmit={handleSubmit} className="space-y-12" noValidate>
                        <div className="min-h-[250px]">{renderStep()}</div>
                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                            <div>
                                {step > 1 && <Button type="button" onClick={handleBack} variant="secondary" className="!rounded-full px-8">Back</Button>}
                            </div>
                            <div className="flex gap-4">
                                {step < maxSteps ? (
                                    <Button type="button" onClick={handleNext} className="!rounded-full px-10">Continue</Button>
                                ) : (
                                    <Button type="submit" className="!rounded-full px-10">Authorize Provisioning</Button>
                                )}
                            </div>
                        </div>
                    </form>
                )}
                {step > maxSteps && renderStep()}
            </div>
        </div>
    );
};

export default ApplicationScreen;
