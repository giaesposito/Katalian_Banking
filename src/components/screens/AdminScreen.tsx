
import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { mockApi } from '../../api/mockApi';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import ApiDocs from '../admin/ApiDocs';
import { useNavigate } from 'react-router-dom';

const AdminScreen: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'api'>('users');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await mockApi.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to retrieve users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-20"><Spinner /></div>;

    const totalBankBalance = users.reduce((sum, user) => 
        sum + user.accounts.reduce((uSum, acc) => uSum + acc.balance, 0), 0
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Bank Administration</h2>
                    <p className="text-gray-400 mt-1">System-wide diagnostic and API control center</p>
                </div>
                <div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-xl text-right w-full md:w-auto">
                    <p className="text-xs text-teal-400 uppercase font-bold tracking-wider">Total Bank Assets</p>
                    <p className="text-2xl font-mono font-bold text-white">
                        ${totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="flex border-b border-gray-700">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'users' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    User Management
                </button>
                <button 
                    onClick={() => setActiveTab('api')}
                    className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'api' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    API Reference
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    {users.map(user => (
                        <div key={user.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl hover:border-gray-600 transition-colors">
                            <div className="bg-gray-700/50 px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center font-bold text-white uppercase">
                                        {user.username.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{user.username}</h3>
                                        <p className="text-xs text-gray-400">UID: {user.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {user.locked && <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs border border-red-500/50">LOCKED</span>}
                                    {user.canApplyForPlatinum && <span className="bg-purple-900/50 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/50">PLATINUM ELIGIBLE</span>}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {user.accounts.map(acc => (
                                        <div key={acc.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{acc.type}</p>
                                            <p className="text-lg font-mono font-bold text-white">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            <p className="text-[10px] text-gray-600 mt-1"># {acc.accountNumber}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <ApiDocs />
            )}
            
            <div className="flex justify-center pt-4">
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        </div>
    );
};

export default AdminScreen;
