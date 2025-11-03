import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { SunIcon, MoonIcon } from './icons/ThemeIcons';
import { MenuIcon } from './icons/MenuIcon';
import { Logo } from './icons/Logo';
import { SparklesIcon, SearchIcon } from './icons/AIIcons';
import { ProfileIcon } from './icons/NavIcons';

interface HeaderProps {
    userRole: UserRole;
    onUserRoleChange: (role: UserRole) => void;
    onUploadClick: () => void;
    onLogout: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAiStudioClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    userRole, 
    onUserRoleChange, 
    onUploadClick, 
    onLogout,
    searchQuery,
    onSearchChange,
    onAiStudioClick,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // New state for search UI
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearchChange(localQuery);
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [localQuery, onSearchChange]);

    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

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

    // Focus search input when it opens
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

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
    
    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const canUpload = userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER;

    return (
        <header className="sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800/80 z-20">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center gap-4">
                {isSearchOpen ? (
                    <div className="w-full flex items-center gap-2 animate-fade-in">
                        <button onClick={handleCloseSearch} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all transform hover:scale-110 active:scale-95 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search ads by title..."
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            <Logo className="h-8 w-8" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">
                                <span className="font-black">AD</span>
                                <span>Master</span>
                            </span>
                        </div>
                        
                        <div className="flex-1" />

                        <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
                            <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all transform hover:scale-110 active:scale-95">
                                <SearchIcon className="w-5 h-5" />
                            </button>

                            <button onClick={onAiStudioClick} className="p-2 sm:py-2 sm:px-3 rounded-full sm:rounded-lg transition-all transform hover:scale-105 active:scale-95 sm:bg-purple-100 sm:dark:bg-purple-500/20 hover:bg-slate-200 dark:hover:bg-slate-700/70 sm:hover:bg-purple-200 sm:dark:hover:bg-purple-500/30 flex items-center space-x-0 sm:space-x-2">
                                <SparklesIcon className="h-5 w-5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                                <span className="hidden sm:inline font-bold text-sm text-purple-700 dark:text-purple-400">AI Studio</span>
                            </button>

                            {canUpload && (
                                <button onClick={onUploadClick} className="hidden sm:inline-flex items-center space-x-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95 hover:shadow-md hover:shadow-indigo-500/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Upload Ad</span>
                                </button>
                            )}
                            
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all transform hover:scale-110 active:scale-95">
                                    <MenuIcon className="w-5 h-5" />
                                </button>

                                {isMenuOpen && (
                                    <div ref={menuRef} className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-30 animate-fade-in">
                                        <div className="p-2">
                                            <div className="flex items-center space-x-2 px-2 pt-1 pb-2">
                                                <ProfileIcon className="w-4 h-4 text-slate-400" />
                                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">ROLE</p>
                                            </div>
                                            {(Object.values(UserRole) as UserRole[]).map(role => (
                                                <button 
                                                    key={role}
                                                    onClick={() => handleRoleChange(role)}
                                                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${userRole === role ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600'}`}
                                                >
                                                    {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                                            <button onClick={toggleTheme} className="w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 flex items-center justify-between">
                                                <span className="flex items-center space-x-2">
                                                {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                                                <span>Theme</span>
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? 'Light' : 'Dark'}</span>
                                            </button>
                                            <button onClick={handleLogout} className="w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 flex items-center justify-between text-red-600 dark:text-red-400">
                                            <span className="flex items-center space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                </svg>
                                                <span>Logout</span>
                                            </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;