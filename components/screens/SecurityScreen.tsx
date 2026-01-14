
import React, { useState } from 'react';
import { User, ViewType } from '../../types';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface SecurityScreenProps {
    user: User;
    action: 'report' | 'lockdown';
    onNavigate: (view: ViewType) => void;
    onActionComplete: (action: 'report' | 'lockdown') => void;
}

const SecurityScreen: React.FC<SecurityScreenProps> = ({ user, action, onNavigate, onActionComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(user.accounts[0]?.id || '');
    const [incidentDescription, setIncidentDescription] = useState('');

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3); // Success step
        }, 2500);
    };

    const handleFinalize = () => {
        onActionComplete(action);
    };

    const renderReportFlow = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight italic">Asset Compromise Report</h3>
                            <p className="text-slate-500 text-sm font-medium">Identify the specific facility that has been compromised.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Affected Facility</label>
                                <select 
                                    value={selectedAssetId} 
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium focus:border-red-500/50 outline-none transition-all"
                                >
                                    {user.accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.type} (Ending {acc.accountNumber.slice(-4)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Incident Narrative</label>
                                <textarea 
                                    value={incidentDescription}
                                    onChange={(e) => setIncidentDescription(e.target.value)}
                                    placeholder="Briefly describe the nature of the compromise (e.g. Lost physical card, suspicious web activity)..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium h-32 focus:border-red-500/50 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={() => onNavigate({name: 'contact'})} variant="secondary" className="px-8 !rounded-full">Cancel</Button>
                            <Button onClick={() => setStep(2)} disabled={!incidentDescription.trim()} className="bg-red-600 hover:bg-red-500 text-white !rounded-full flex-1">Authorize Asset Freeze</Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500 text-center">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="text-4xl">🔒</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight italic">Confirm Asset Freeze</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                                You are about to freeze <strong>{user.accounts.find(a => a.id === selectedAssetId)?.type}</strong>. 
                                This will block all incoming and outgoing electronic authorizations immediately.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-500 text-white py-4 !rounded-full text-lg">Execute Freeze Protocol</Button>
                            <Button onClick={() => setStep(1)} variant="ghost" className="text-slate-500">Back to Selection</Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center space-y-10 py-16 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white tracking-tighter italic">Asset Frozen</h3>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                Technical block applied. Our fraud prevention squad will contact you within 15 minutes at your registered mobile number.
                            </p>
                        </div>
                        <Button onClick={handleFinalize} variant="primary" className="px-12 py-4 !rounded-full">Back to Portfolio</Button>
                    </div>
                );
            default: return null;
        }
    };

    const renderLockdownFlow = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="bg-red-500/10 border-2 border-red-500/30 p-8 rounded-[2rem] space-y-4">
                            <div className="flex items-center gap-4 text-red-500">
                                <span className="text-4xl animate-pulse">☢️</span>
                                <h3 className="text-2xl font-black tracking-tight uppercase italic">Nuclear Lockdown</h3>
                            </div>
                            <p className="text-slate-300 text-sm font-bold leading-relaxed">
                                This procedure will terminate all active sessions, invalidate current access tokens, and freeze ALL financial facilities tied to this identity. 
                                <span className="block mt-4 text-red-400 font-black italic">THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE.</span>
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">Authorization Required</p>
                            <Button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-500 text-white w-full py-5 !rounded-full text-xl font-black shadow-[0_15px_30px_rgba(239,68,68,0.3)]">Initiate Global Lockdown</Button>
                            <Button onClick={() => onNavigate({name: 'contact'})} variant="ghost" className="w-full text-slate-500 hover:text-white py-4">Abort Procedure</Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-10 animate-in fade-in duration-500 text-center">
                        <div className="relative inline-block">
                             <div className="w-32 h-32 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
                             <span className="absolute inset-0 flex items-center justify-center text-5xl">⚠️</span>
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Final Warning</h3>
                             <p className="text-slate-500 text-sm font-medium">Global ledger freeze will commence upon confirmation.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                             <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-500 text-white py-5 !rounded-full text-xl font-black border-2 border-red-400/20">CONFIRM GLOBAL FREEZE</Button>
                             <Button onClick={() => setStep(1)} variant="secondary" className="!rounded-full py-4 bg-white/5">Back to Safety</Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center space-y-10 py-16 animate-in fade-in scale-90 duration-1000">
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto animate-ping opacity-25 absolute left-1/2 -translate-x-1/2"></div>
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-[0_0_80px_rgba(239,68,68,0.4)]">
                            <span className="text-4xl text-white">🔒</span>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">System Locked</h3>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                All digital facilities have been severed. You will be logged out in 3 seconds.
                            </p>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 animate-[progress_3s_linear_forwards]"></div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    // Effect for lockdown logout
    React.useEffect(() => {
        if (action === 'lockdown' && step === 3) {
            const timer = setTimeout(() => {
                handleFinalize();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, action]);

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className={`bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden ${action === 'lockdown' && step >= 2 ? 'ring-4 ring-red-600/20' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div 
                        className={`h-full transition-all duration-700 ease-in-out ${action === 'lockdown' ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-red-500'}`} 
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center mb-16">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Security <span className="text-slate-500 font-normal">Protocol</span>
                        </h2>
                        <p className={`text-xs font-black uppercase tracking-[0.3em] ${action === 'lockdown' ? 'text-red-600' : 'text-red-500'}`}>
                            {loading ? 'Establishing Block' : step === 3 ? 'Operation Complete' : action === 'lockdown' ? 'Critical Action Needed' : 'Incident Management'}
                        </p>
                    </div>
                    {step < 3 && !loading && (
                        <button 
                            onClick={() => onNavigate({name: 'contact'})} 
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 text-center">
                        <Spinner />
                        <div className="space-y-2">
                            <h4 className={`text-xl font-black uppercase tracking-widest ${action === 'lockdown' ? 'text-red-600' : 'text-red-500'}`}>
                                {action === 'lockdown' ? 'Terminating All Sessions' : 'Provisioning Asset Block'}
                            </h4>
                            <p className="text-slate-500 text-sm font-medium">Validating security signatures and notifying central bank...</p>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[350px] flex flex-col justify-center">
                        {action === 'report' ? renderReportFlow() : renderLockdownFlow()}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}} />
        </div>
    );
};

export default SecurityScreen;
