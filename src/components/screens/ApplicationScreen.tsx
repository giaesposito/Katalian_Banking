import React, { useState, useEffect } from 'react';
import { User, Account, ApplicationData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { STATES } from '../../constants';

interface ApplicationScreenProps {
    user: User;
    accountType: Account['type'];
    onNavigate: () => void;
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
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
            if (!formData.dob) {
                newErrors.dob = 'Date of birth is required.';
            } else {
                const parts = formData.dob.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // month is 0-indexed
                const day = parseInt(parts[2], 10);
                const birthDate = new Date(Date.UTC(year, month, day));

                if (isNaN(birthDate.getTime()) || birthDate.getUTCFullYear() !== year || birthDate.getUTCMonth() !== month || birthDate.getUTCDate() !== day) {
                    newErrors.dob = 'Please enter a valid date.';
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (birthDate > today) {
                        newErrors.dob = 'Date of birth cannot be in the future.';
                    } else {
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        if (age < 18) {
                            newErrors.dob = 'You must be at least 18 years old to open an account.';
                        }
                    }
                }
            }
        } else if (currentStep === 2) {
            if (!formData.address.trim()) newErrors.address = 'Address is required.';
            if (!formData.city.trim()) newErrors.city = 'City is required.';
            if (!/^\d{5}$/.test(formData.zip)) {
                newErrors.zip = 'Please enter a valid 5-digit ZIP code.';
            }
        } else if (currentStep === 3 && isDepositAccount) {
            const deposit = formData.initialDeposit ? parseFloat(String(formData.initialDeposit)) : 0;
            
            if (!formData.initialDeposit || deposit <= 0) {
                newErrors.initialDeposit = 'Please enter a positive deposit amount.';
            } else if (!formData.depositFromAccountId && deposit < 25) {
                 newErrors.initialDeposit = 'A minimum deposit of $25 is required for new funds.';
            } else if (formData.depositFromAccountId) {
                const sourceAccount = user.accounts.find(acc => acc.id === formData.depositFromAccountId);
                if (sourceAccount && deposit > sourceAccount.balance) {
                    newErrors.initialDeposit = `Deposit amount cannot exceed the source account balance of $${sourceAccount.balance.toFixed(2)}.`;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (validate(step)) {
            setStep(s => s + 1);
        }
    };
    const handleBack = () => {
        setErrors({});
        setStep(s => s - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate(step)) {
            setStep(99); // Loading state
        }
    };
    
    useEffect(() => {
        if (step === 99) { // Loading
            const timer = setTimeout(() => {
                setStep(100); // Success
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);
    
    const handleFinish = () => {
        onSubmit(formData, accountType);
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <h3 className="text-xl font-semibold mb-6">Step 1: Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required error={errors.firstName} />
                            <Input id="middleName" name="middleName" label="Middle Name (Optional)" value={formData.middleName} onChange={handleChange} />
                            <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required error={errors.lastName} />
                            <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required error={errors.dob} />
                        </div>
                    </>
                );
            case 2:
                 return (
                    <>
                        <h3 className="text-xl font-semibold mb-6">Step 2: Contact Information</h3>
                        <div className="space-y-4">
                            <Input id="address" name="address" label="Address Line" value={formData.address} onChange={handleChange} required error={errors.address} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} required error={errors.city} />
                               <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">State</label>
                                    <select id="state" name="state" value={formData.state} onChange={handleChange} className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-white">
                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                               </div>
                               <Input id="zip" name="zip" label="Zip Code" value={formData.zip} onChange={handleChange} required error={errors.zip} />
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <h3 className="text-xl font-semibold mb-6">Step 3: Initial Deposit</h3>
                         <div className="space-y-4">
                            <Input id="initialDeposit" name="initialDeposit" label="Amount" type="number" step="0.01" min="0.01" value={formData.initialDeposit || ''} onChange={handleChange} error={errors.initialDeposit} required />
                             <div>
                                <label htmlFor="depositFromAccountId" className="block text-sm font-medium text-gray-300 mb-1">Transfer from</label>
                                <select id="depositFromAccountId" name="depositFromAccountId" value={formData.depositFromAccountId} onChange={handleChange} className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-white">
                                    <option value="">New funds</option>
                                    {user.accounts.filter(a => a.type === 'Checking' || a.type === 'Savings').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNumber})</option>
                                    ))}
                                </select>
                             </div>
                         </div>
                    </>
                );
            case 99: // Loading
                return (
                    <div className="text-center space-y-4 py-12">
                        <Spinner />
                        <p className="text-lg">Submitting your application...</p>
                    </div>
                );
            case 100: // Success
                return (
                    <div className="text-center space-y-4 py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-2xl font-bold">
                            {isDepositAccount ? "Account Opened Successfully!" : "Application Received!"}
                        </h3>
                        <p className="text-gray-400">
                             {isDepositAccount ? "Your new account is now active and ready to use." : "Your application is pending review. We will notify you of our decision soon."}
                        </p>
                        <Button onClick={handleFinish}>Return to Dashboard</Button>
                    </div>
                );
            default: return null;
        }
    }
    
    const maxSteps = isDepositAccount ? 3 : 2;

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-bold text-white">Apply for a {accountType}</h2>
                     <button onClick={onNavigate} className="text-gray-400 hover:text-white transition">&times;</button>
                </div>

                {step <= maxSteps && (
                    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                        <div>{renderStep()}</div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                            <div>
                                {step > 1 && <Button type="button" onClick={handleBack} variant="secondary">Back</Button>}
                            </div>
                            <div>
                                {step < maxSteps && <Button type="button" onClick={handleNext}>Next</Button>}
                                {step === maxSteps && <Button type="submit">Submit Application</Button>}
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