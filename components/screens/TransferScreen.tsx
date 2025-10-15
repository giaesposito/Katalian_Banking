import React, { useState, useMemo } from 'react';
import { User, ViewType } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface TransferScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
    onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
}

const TransferScreen: React.FC<TransferScreenProps> = ({ user, onNavigate, onTransfer }) => {
    const depositAccounts = useMemo(() => user.accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings'), [user.accounts]);

    const initialFromId = depositAccounts[0]?.id || '';
    const initialToId = depositAccounts.find(acc => acc.id !== initialFromId)?.id || '';

    const [fromAccountId, setFromAccountId] = useState(initialFromId);
    const [toAccountId, setToAccountId] = useState(initialToId);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const fromAccount = useMemo(() => depositAccounts.find(acc => acc.id === fromAccountId), [depositAccounts, fromAccountId]);
    const toAccount = useMemo(() => depositAccounts.find(acc => acc.id === toAccountId), [depositAccounts, toAccountId]);

    const handleFromAccountChange = (newFromId: string) => {
        if (newFromId === toAccountId) {
            setToAccountId(fromAccountId); // Swap
        }
        setFromAccountId(newFromId);
    };

    const handleToAccountChange = (newToId: string) => {
        if (newToId === fromAccountId) {
            setFromAccountId(toAccountId); // Swap
        }
        setToAccountId(newToId);
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const transferAmount = parseFloat(amount);

        if (!fromAccountId || !toAccountId) {
            setError('Please select both accounts.');
            return;
        }
        if (fromAccountId === toAccountId) {
            setError('Cannot transfer to the same account.');
            return;
        }
        if (isNaN(transferAmount) || transferAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (fromAccount && transferAmount > fromAccount.balance) {
            setError('Insufficient funds for this transfer.');
            return;
        }
        
        setIsConfirming(true);
    };

    const handleConfirm = () => {
        onTransfer(fromAccountId, toAccountId, parseFloat(amount));
    };

    const SelectAccount: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}> = ({ id, label, value, onChange }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-white"
            >
                <option value="" disabled>Select an account</option>
                {depositAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                        {acc.type} ({acc.accountNumber}) - Balance: ${acc.balance.toFixed(2)}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-white">{isConfirming ? 'Confirm Your Transfer' : 'Transfer Funds'}</h2>
                     <button onClick={() => onNavigate({ name: 'dashboard' })} className="text-gray-400 hover:text-white transition">&times;</button>
                </div>

                {isConfirming ? (
                    <div className="space-y-6">
                        <div className="space-y-4 text-gray-300 p-4 bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-400">From</p>
                                <p className="text-lg font-medium">{fromAccount?.type} ({fromAccount?.accountNumber})</p>
                            </div>
                            <div className="border-t border-gray-600 my-2"></div>
                            <div>
                                <p className="text-sm text-gray-400">To</p>
                                <p className="text-lg font-medium">{toAccount?.type} ({toAccount?.accountNumber})</p>
                            </div>
                            <div className="border-t border-gray-600 my-2"></div>
                             <div>
                                <p className="text-sm text-gray-400">Amount to Transfer</p>
                                <p className="text-3xl font-bold text-teal-400">${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <Button onClick={() => setIsConfirming(false)} variant="secondary" fullWidth>Back</Button>
                            <Button onClick={handleConfirm} fullWidth>Confirm Transfer</Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleReview} className="space-y-6">
                        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
                        <SelectAccount id="fromAccount" label="From" value={fromAccountId} onChange={(e) => handleFromAccountChange(e.target.value)} />
                        <SelectAccount id="toAccount" label="To" value={toAccountId} onChange={(e) => handleToAccountChange(e.target.value)} />
                        <Input 
                            id="amount"
                            label="Amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                        />
                        <div className="flex gap-4">
                            <Button onClick={() => onNavigate({ name: 'dashboard' })} variant="secondary" fullWidth>Cancel</Button>
                            <Button type="submit" fullWidth>Review Transfer</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TransferScreen;