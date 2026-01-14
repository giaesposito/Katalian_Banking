
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ViewType } from '../../types';
import Button from './Button';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onNavigate: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
    const location = useLocation();

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center py-6 border-b border-slate-800 gap-4">
            <Link to={user ? "/dashboard" : "/login"} className="flex items-center space-x-3 group">
                <div className="bg-teal-500 p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Katalian</h1>
            </Link>
            {user && (
                <div className="flex items-center space-x-1 sm:space-x-4">
                    <button 
                        onClick={() => onNavigate({name: 'dashboard'})}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${location.pathname === '/dashboard' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Accounts
                    </button>
                    <button 
                        onClick={() => onNavigate({name: 'contact'})}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${location.pathname === '/contact' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Support
                    </button>
                    <Link to="/admin" className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${location.pathname === '/admin' ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:text-purple-400'}`}>
                        Admin
                    </Link>
                    <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden sm:block" />
                    <Button onClick={onLogout} variant="secondary" className="px-4 py-2 text-[10px] uppercase tracking-widest border border-slate-700">Logout</Button>
                </div>
            )}
        </header>
    );
};

export default Header;
