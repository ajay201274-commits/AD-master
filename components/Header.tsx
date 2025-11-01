import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { SunIcon, MoonIcon } from './icons/ThemeIcons';
import { MenuIcon } from './icons/MenuIcon';
import { Logo } from './icons/Logo';

interface HeaderProps {
    userRole: UserRole;
    onUserRoleChange: (role: UserRole) => void;
    balance: number;
    onUploadClick: () => void;
    onAccountClick: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    userRole, 
    onUserRoleChange, 
    balance, 
    onUploadClick, 
    onAccountClick, 
    onLogout,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newIsDarkMode = !prev;
            localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
            return newIsDarkMode;
        });
    };

    const handleRoleChange = (role: UserRole) => {
        onUserRoleChange(role);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsMenuOpen(false);
    }

    const canUpload = userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER;

    return (
        <header className="sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800/80 z-20">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center gap-2">
                <div className="flex items-center space-x-3 flex-shrink-0">
                    <Logo className="h-8 w-8" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">
                        <span className="font-black">AD</span>
                        <span>Master</span>
                    </span>
                </div>

                <div className="flex items-center justify-end space-x-2 sm:space-x-4 flex-shrink-0">
                   {userRole !== UserRole.APP_OWNER && (
                     <div onClick={onAccountClick} className="text-sm font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg cursor-pointer">
                        <span>Balance: ₹{balance.toFixed(2)}</span>
                    </div>
                   )}

                    {canUpload && (
                         <button onClick={onUploadClick} className="hidden sm:inline-flex items-center space-x-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-all hover:shadow-md hover:shadow-indigo-500/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>Upload Ad</span>
                        </button>
                    )}
                    
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
                            <MenuIcon className="w-5 h-5" />
                        </button>

                        {isMenuOpen && (
                            <div ref={menuRef} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-30">
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-2 pt-1 pb-2">ROLE</p>
                                    {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map(key => (
                                        <button 
                                            key={key}
                                            onClick={() => handleRoleChange(UserRole[key])}
                                            className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${userRole === UserRole[key] ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        >
                                            {UserRole[key].charAt(0) + UserRole[key].slice(1).toLowerCase().replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                                     <button onClick={toggleTheme} className="w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between">
                                        <span>Theme</span>
                                        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                                            {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                                            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                                        </div>
                                    </button>
                                    <button onClick={handleLogout} className="w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-red-600 dark:text-red-400">
                                        <span>Logout</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;