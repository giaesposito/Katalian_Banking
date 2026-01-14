
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
        <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">Katalian</span>
                </Link>

                {user && (
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink active={location.pathname === '/dashboard'} onClick={() => onNavigate({name: 'dashboard'})}>Portfolio</NavLink>
                        <NavLink active={location.pathname === '/transfer'} onClick={() => onNavigate({name: 'transfer'})}>Payments</NavLink>
                        <NavLink active={location.pathname === '/loans'} onClick={() => onNavigate({name: 'loans'})}>Lending</NavLink>
                        <NavLink active={location.pathname === '/contact'} onClick={() => onNavigate({name: 'contact'})}>Support</NavLink>
                    </nav>
                )}
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-white leading-none">@{user.username}</span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Premier Member</span>
                    </div>
                    <Button onClick={onLogout} variant="secondary" className="px-4 py-1.5 text-xs bg-white/5 border-white/10 hover:bg-white/10">Sign Out</Button>
                </div>
            )}
        </header>
    );
};

const NavLink: React.FC<{active: boolean, children: React.ReactNode, onClick: () => void}> = ({ active, children, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            active ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
    >
        {children}
    </button>
);

export default Header;
