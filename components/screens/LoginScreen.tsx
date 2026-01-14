
import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { ViewType } from '../../types';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => 'success' | 'locked' | 'invalid';
    onNavigate: (view: ViewType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = onLogin(username, password);
        if (result === 'invalid') {
            setError('Account credentials not recognized.');
        } else if (result === 'locked') {
            setError('Access suspended. Reset required.');
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Welcome</h2>
                        <p className="text-slate-400 text-sm font-medium">Securely access your Katalian accounts</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center font-bold animate-pulse">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <Input
                                id="username"
                                label="Username"
                                type="text"
                                placeholder="e.g. jdoe_financial"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Input
                                id="password"
                                label="Access Key"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500" />
                                Remember access
                            </label>
                            <button 
                                type="button"
                                onClick={() => onNavigate({ name: 'resetPassword' })} 
                                className="font-bold text-teal-500 hover:text-teal-400 transition-colors"
                            >
                                Recover credentials
                            </button>
                        </div>

                        <Button type="submit" fullWidth className="py-4 text-base tracking-tight font-black">
                            Authorize Access
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">
                            End-to-End Encryption Enabled
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
