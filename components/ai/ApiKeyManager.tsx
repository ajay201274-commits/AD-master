import React from 'react';
import { KeyIcon } from '../icons/AIIcons';

interface ApiKeyManagerProps {
    status: 'checking' | 'configured' | 'unconfigured';
    onManageKey: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ status, onManageKey }) => {
    const StatusIndicator = () => {
        switch (status) {
            case 'checking':
                return (
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Checking...</span>
                    </div>
                );
            case 'configured':
                return (
                    <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Key Configured</span>
                    </div>
                );
            case 'unconfigured':
                return (
                    <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Key Required</span>
                    </div>
                );
        }
    };
    
    const buttonText = status === 'configured' ? 'Manage' : 'Configure';

    return (
        <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                    <KeyIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">API Key</p>
                </div>
                <StatusIndicator />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                An API key is required for some features like video generation.
            </p>
            <button
                onClick={onManageKey}
                className="w-full mt-2 py-1.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
            >
                {buttonText}
            </button>
        </div>
    );
};

export default ApiKeyManager;
