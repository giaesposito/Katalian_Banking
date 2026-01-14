
import React, { useState } from 'react';
import { User, ViewType } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';

interface DepositScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
    onDeposit: (toAccountId: string, amount: number) => void;
}

const DepositScreen: React.FC<DepositScreenProps> = ({ user, onNavigate, onDeposit }) => {
    const [toAccountId, setToAccountId] = useState(user.accounts[0]?.id || '');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        const depAmount = parseFloat(amount);
        if (isNaN(depAmount) || depAmount <= 0) return;

        setLoading(true);
        await onDeposit(toAccountId, depAmount);
        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
                <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl text-green-400">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Deposit Initiated</h2>
                <p className="text-gray-400">Your deposit of <span className="text-white font-bold">${parseFloat(amount).toFixed(2)}</span> has been processed and your balance has been updated.</p>
                <Button onClick={() => onNavigate({name:'dashboard'})} fullWidth>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Deposit Funds</h2>
            <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Destination Account</label>
                    <select 
                        value={toAccountId} 
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                        {user.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.type} - {acc.accountNumber} (${acc.balance.toFixed(2)})</option>
                        ))}
                    </select>
                </div>

                <Input 
                    id="amount" 
                    label="Amount to Deposit" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                />

                <div className="bg-teal-900/20 p-4 rounded-xl border border-teal-500/30 flex items-start gap-3">
                    <span className="text-teal-400 text-xl">ℹ</span>
                    <p className="text-xs text-teal-100 italic">Funds will be pulled from your linked external account ending in *5542. Standard processing times apply, but balance reflects immediately in this simulation.</p>
                </div>

                <div className="flex gap-4">
                    <Button type="button" variant="secondary" fullWidth onClick={() => onNavigate({name:'dashboard'})}>Cancel</Button>
                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? <Spinner /> : 'Deposit Funds'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DepositScreen;
