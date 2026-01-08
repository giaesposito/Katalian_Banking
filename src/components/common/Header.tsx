
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../../types';
import Button from './Button';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    const location = useLocation();

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-700 gap-4">
            <Link to={user ? "/dashboard" : "/login"} className="flex items-center space-x-3 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400 group-hover:rotate-12 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-1.992 0l-2 4A1 1 0 008 7.618V18a1 1 0 001 1h2a1 1 0 001-1V7.618a1 1 0 00.504-1.486l-2-4zM10 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    <path d="M3 10a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zM13 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                </svg>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Katalian Bank</h1>
            </Link>
            {user && (
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Link to="/admin" className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${location.pathname === '/admin' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:text-teal-400'}`}>
                        Admin View
                    </Link>
                    <span className="hidden md:inline text-gray-500">|</span>
                    <span className="hidden sm:inline text-gray-400 font-medium">@{user.username}</span>
                    <Button onClick={onLogout} variant="secondary" className="px-3 py-1 text-sm">Logout</Button>
                </div>
            )}
        </header>
    );
};

export default Header;
