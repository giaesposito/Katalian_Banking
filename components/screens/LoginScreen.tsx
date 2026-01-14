
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
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // Brief simulation for UX
        setTimeout(() => {
            const result = onLogin(username, password);
            setLoading(false);
            if (result === 'invalid') {
                setError('The credentials provided do not match our records.');
            } else if (result === 'locked') {
                setError('Security Alert: This account has been locked due to suspicious activity.');
            }
        }, 800);
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-2">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Katalian</h2>
                    <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                        Enter your secure access key to manage your assets and accounts.
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-bold text-center leading-relaxed">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <Input
                                id="username"
                                label="Secure ID"
                                type="text"
                                placeholder="e.g. USER_89234"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Input
                                id="password"
                                label="Access Code"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
                            <label className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500" />
                                Save Session
                            </label>
                            <button 
                                type="button"
                                onClick={() => onNavigate({ name: 'resetPassword' })} 
                                className="text-emerald-500 hover:text-emerald-400 transition-colors"
                            >
                                Forgot Code?
                            </button>
                        </div>

                        <Button 
                            type="submit" 
                            fullWidth 
                            disabled={loading}
                            className="py-4 text-base tracking-tight font-black shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                        >
                            {loading ? 'Authenticating...' : 'Authorize Vault Access'}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">
                    Katalian Private Banking &copy; 2024
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
