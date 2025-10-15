
import React from 'react';
import { User, Account, ViewType } from '../../types';
import Button from '../common/Button';

interface AccountCardProps {
    account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
    const isLowBalance = account.type === 'Checking' && account.balance < 50;
    const isPending = account.status === 'Pending';
    const balanceColor = isLowBalance ? 'text-yellow-400' : 'text-green-400';

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg hover:bg-gray-700/50 transition-all duration-200 ease-in-out flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-white">{account.type}</h3>
                    {isPending && <span className="text-xs font-medium bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full">Pending</span>}
                </div>
                <p className="text-sm text-gray-400 mt-1">Account ending in {account.accountNumber}</p>
            </div>
            <div className="mt-6 text-right">
                <p className="text-sm text-gray-400">Available Balance</p>
                {isPending ? (
                     <p className="text-2xl font-bold text-gray-500">-</p>
                ) : (
                    <p className={`text-3xl font-bold ${balanceColor}`}>
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                )}
                {isLowBalance && !isPending && <p className="text-xs text-yellow-500 mt-1">Low Balance Warning</p>}
            </div>
        </div>
    );
};


interface DashboardScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate }) => {
    const canTransfer = user.accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings').length > 1;

    const applicationOptions: { label: string; type: Account['type']; requiresPlatinum: boolean }[] = [
        { label: 'Apply for a Checking Account', type: 'Checking', requiresPlatinum: false },
        { label: 'Apply for a Savings Account', type: 'Savings', requiresPlatinum: false },
        { label: 'Apply for a Credit Card', type: 'Credit Card', requiresPlatinum: false },
        { label: 'Apply for a Platinum Credit Card', type: 'Platinum Credit Card', requiresPlatinum: true },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Your Accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {user.accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-white">Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
                         <h3 className="text-lg font-semibold mb-4">Transfer Funds</h3>
                        <Button onClick={() => onNavigate({ name: 'transfer' })} disabled={!canTransfer} fullWidth>
                            Transfer Balance
                        </Button>
                        {!canTransfer && <p className="text-xs text-gray-500 mt-2">Requires at least two deposit accounts.</p>}
                    </div>
                    {applicationOptions.map(opt => {
                        if (opt.requiresPlatinum && !user.canApplyForPlatinum) return null;
                        return (
                             <div key={opt.type} className="bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
                                <h3 className="text-lg font-semibold mb-4">{opt.label}</h3>
                                <Button onClick={() => onNavigate({ name: 'apply', for: opt.type })} fullWidth>
                                    Apply Now
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
