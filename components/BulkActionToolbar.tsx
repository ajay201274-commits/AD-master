
import React from 'react';
import { TrashIcon } from './icons/CartIcons';

interface BulkActionToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDelete: () => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ selectedCount, onClearSelection, onDelete }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="sticky bottom-20 sm:bottom-4 z-10 mx-auto max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between bg-slate-800 text-white rounded-lg shadow-2xl p-3 mx-4 sm:mx-0">
                <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                        {selectedCount}
                    </span>
                    <span className="font-semibold">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onDelete} 
                        className="p-2 rounded-md hover:bg-red-500/80 transition-colors"
                        title="Delete Selected"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onClearSelection} 
                        className="p-2 rounded-md hover:bg-white/20 transition-colors"
                        title="Clear Selection"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionToolbar;
