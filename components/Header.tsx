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

export const Header: React.FC<HeaderProps> = ({ 
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
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isSearchOpen]);

    return (
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-4">
                        <Logo />
                        <h1 className="text-xl font-bold tracking-tight">AD revenue</h1>
                    </div>

                    {/* Search Bar (conditionally rendered) */}
                    <div className={`absolute left-0 right-0 top-0 bottom-0 px-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            placeholder="Search for ads..."
                            className="w-full bg-transparent text-lg focus:outline-none dark:text-white"
                        />
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {userRole !== UserRole.APP_OWNER && (
                            <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <SearchIcon className="w-5 h-5" />
                            </button>
                        )}

                        <button onClick={onAiStudioClick} className="hidden sm:flex items-center space-x-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95">
                            <SparklesIcon className="w-4 h-4" />
                            <span>AI Studio</span>
                        </button>
                        
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <MenuIcon className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 animate-fade-in">
                                    <div className="p-2">
                                        <div className="font-semibold text-sm px-2 py-1 text-slate-600 dark:text-slate-300">Change Role</div>
                                        <select value={userRole} onChange={(e) => onUserRoleChange(e.target.value as UserRole)} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md p-2 text-sm text-slate-800 dark:text-slate-200">
                                            <option value={UserRole.VIEWER}>Viewer</option>
                                            <option value={UserRole.UPLOADER}>Uploader</option>
                                            <option value={UserRole.APP_OWNER}>App Owner</option>
                                        </select>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                                    {(userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER) && (
                                        <button onClick={() => { onUploadClick(); setIsMenuOpen(false); }} className="w-full text-left text-sm px-4 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <span>Upload Ad</span>
                                        </button>
                                    )}
                                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                                    <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full text-left text-sm px-4 py-2 flex items-center space-x-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};