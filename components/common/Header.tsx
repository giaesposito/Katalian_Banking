
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
        <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-gray-800 gap-4">
            <Link to={user ? "/dashboard" : "/login"} className="flex items-center space-x-3 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-400 group-hover:rotate-12 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-1.992 0l-2 4A1 1 0 008 7.618V18a1 1 0 001 1h2a1 1 0 001-1V7.618a1 1 0 00.504-1.486l-2-4zM10 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    <path d="M3 10a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zM13 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                </svg>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Katalian Bank</h1>
            </Link>
            {user && (
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button 
                        onClick={() => onNavigate({name: 'contact'})}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${location.pathname === '/contact' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-teal-400'}`}
                    >
                        Support
                    </button>
                    <Link to="/admin" className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${location.pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-purple-400'}`}>
                        Admin
                    </Link>
                    <span className="hidden md:inline text-gray-700">|</span>
                    <Button onClick={onLogout} variant="secondary" className="px-4 py-2 text-xs">Logout</Button>
                </div>
            )}
        </header>
    );
};

export default Header;
