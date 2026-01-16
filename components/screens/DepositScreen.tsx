
import React, { useState, useRef } from 'react';
import { User, ViewType } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';

interface DepositScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
    onDeposit: (toAccountId: string, amount: number) => void;
}

type DepositMethod = 'ACH' | 'Check';

const DepositScreen: React.FC<DepositScreenProps> = ({ user, onNavigate, onDeposit }) => {
    const [step, setStep] = useState(1);
    const [depositMethod, setDepositMethod] = useState<DepositMethod>('ACH');
    const [toAccountId, setToAccountId] = useState(user.accounts[0]?.id || '');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Check Deposit States
    const [checkFront, setCheckFront] = useState<string | null>(null);
    const [checkBack, setCheckBack] = useState<string | null>(null);
    
    const fileInputFront = useRef<HTMLInputElement>(null);
    const fileInputBack = useRef<HTMLInputElement>(null);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') setCheckFront(reader.result as string);
                else setCheckBack(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        const depAmount = parseFloat(amount);
        if (isNaN(depAmount) || depAmount <= 0) return;

        setLoading(true);
        // Simulate real API provisioning and OCR for checks
        setTimeout(async () => {
            await onDeposit(toAccountId, depAmount);
            setLoading(false);
            setStep(4);
        }, 2500);
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Deposit Configuration</h3>
                            <p className="text-slate-500 text-sm font-medium">Define your funding source and capital amount.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setDepositMethod('ACH')}
                                className={`p-6 rounded-3xl border transition-all text-center group ${depositMethod === 'ACH' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950 border-white/5 hover:border-white/10'}`}
                            >
                                <span className="text-3xl block mb-2">🏛️</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${depositMethod === 'ACH' ? 'text-emerald-400' : 'text-slate-500'}`}>Electronic Transfer</span>
                            </button>
                            <button 
                                onClick={() => setDepositMethod('Check')}
                                className={`p-6 rounded-3xl border transition-all text-center group ${depositMethod === 'Check' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950 border-white/5 hover:border-white/10'}`}
                            >
                                <span className="text-3xl block mb-2">📄</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${depositMethod === 'Check' ? 'text-emerald-400' : 'text-slate-500'}`}>Check Deposit</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Destination Facility</label>
                                <select 
                                    value={toAccountId} 
                                    onChange={(e) => setToAccountId(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium focus:border-emerald-500/50 outline-none transition-all"
                                >
                                    {user.accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.type} - {acc.accountNumber} (${acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <Input 
                                id="amount" 
                                label="Provision Amount ($)" 
                                type="number" 
                                placeholder="0.00" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                required 
                                className="font-mono text-lg"
                            />
                        </div>
                    </div>
                );
            case 2:
                if (depositMethod === 'ACH') {
                    return (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">Funding Source</h3>
                                <p className="text-slate-500 text-sm font-medium">Verify the linked external account for this transaction.</p>
                            </div>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Entity</span>
                                    <span className="text-sm font-bold text-white">EXTERNAL PARTNER BANK</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account ID</span>
                                    <span className="text-sm font-mono text-white">********5542</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Availability</span>
                                    <span className="text-sm font-bold text-emerald-500 italic">Immediate Provisioning</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center uppercase font-black tracking-widest leading-relaxed">
                                Authorizing ACH transfer via linked liquidity source.
                            </p>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">Mobile Check Capture</h3>
                                <p className="text-slate-500 text-sm font-medium">Upload high-resolution images of the check instrument.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Check Front</label>
                                    <div 
                                        onClick={() => fileInputFront.current?.click()}
                                        className={`aspect-[1.8/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${checkFront ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-slate-950 hover:border-white/20'}`}
                                    >
                                        {checkFront ? (
                                            <>
                                                <img src={checkFront} alt="Front" className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">Replace Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-3xl mb-2">📸</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Capture Front</span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputFront} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Check Back</label>
                                    <div 
                                        onClick={() => fileInputBack.current?.click()}
                                        className={`aspect-[1.8/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${checkBack ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-slate-950 hover:border-white/20'}`}
                                    >
                                        {checkBack ? (
                                            <>
                                                <img src={checkBack} alt="Back" className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">Replace Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-3xl mb-2">📸</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Capture Back</span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputBack} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'back')} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-center">
                                    Ensure the back of the check is endorsed with "For Mobile Deposit at Katalian Bank Only".
                                </p>
                            </div>
                        </div>
                    );
                }
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-black text-white tracking-tight">Final Authorization</h3>
                            <p className="text-slate-500 text-sm font-medium">Review asset allocation before ledger commitment.</p>
                        </div>
                        <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 space-y-6 shadow-inner">
                            <div className="text-center pb-6 border-b border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Ledger Amount</p>
                                <p className="text-5xl font-black text-white tracking-tighter tabular-nums">${parseFloat(amount || "0").toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Target Facility</span>
                                    <span className="text-xs font-bold text-white">
                                        {user.accounts.find(a => a.id === toAccountId)?.type} (..{user.accounts.find(a => a.id === toAccountId)?.accountNumber.slice(-4)})
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Submission Method</span>
                                    <span className="text-xs font-bold text-emerald-500 italic font-mono uppercase">
                                        {depositMethod === 'ACH' ? 'Priority ACH' : 'Remote Image Capture'}
                                    </span>
                                </div>
                                {depositMethod === 'Check' && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Image Verification</span>
                                        <span className="text-xs font-bold text-emerald-500">Passed (Simulated)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center space-y-10 py-16 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <svg className="h-12 w-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white tracking-tighter">Deposit Confirmed</h3>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                                {depositMethod === 'Check' 
                                    ? "Your check image has been queued for clearing. Funds will be provisioned following standard verification protocols." 
                                    : `Funds have been successfully provisioned to your ${user.accounts.find(a => a.id === toAccountId)?.type} account.`}
                            </p>
                        </div>
                        <Button onClick={() => onNavigate({name:'dashboard'})} variant="primary" className="px-12 py-4 !rounded-full">Return to Portfolio</Button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center mb-16">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Deposit <span className="text-slate-500 font-normal">Facility</span></h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
                            {loading ? 'Authorizing Request' : step === 4 ? 'Transaction Complete' : `Step ${step} of 3`}
                        </p>
                    </div>
                    {step < 4 && !loading && (
                        <button onClick={() => onNavigate({name: 'dashboard'})} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                        <Spinner />
                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-black text-white uppercase tracking-widest">
                                {depositMethod === 'Check' ? 'Processing Image Data' : 'Validating Liquidity Source'}
                            </h4>
                            <p className="text-slate-500 text-sm font-medium">
                                {depositMethod === 'Check' ? 'Extracting metadata and routing numbers...' : 'Establishing secure handshake with external institution...'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="min-h-[300px] flex flex-col justify-center">
                            {renderStep()}
                        </div>
                        {step < 4 && (
                            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                <div>{step > 1 && <Button type="button" variant="secondary" onClick={handleBack} className="!rounded-full px-8">Back</Button>}</div>
                                <div className="flex gap-4">
                                    {step < 3 ? (
                                        <Button 
                                            type="button" 
                                            onClick={handleNext} 
                                            disabled={
                                                !amount || parseFloat(amount) <= 0 || 
                                                (step === 2 && depositMethod === 'Check' && (!checkFront || !checkBack))
                                            } 
                                            className="!rounded-full px-10"
                                        >
                                            Continue
                                        </Button>
                                    ) : (
                                        <Button onClick={handleDeposit} className="!rounded-full px-10">Authorize Deposit</Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepositScreen;
