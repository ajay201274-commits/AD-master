import React, { useState, useCallback, useEffect } from 'react';
import { SortBy, AdCategory } from '../types';
import { CATEGORIES } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
  selectedCategory: AdCategory | 'ALL';
  onSelectCategory: (category: AdCategory | 'ALL') => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
    isOpen, 
    onClose,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
        onSearchChange(localSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearchQuery, onSearchChange]);
  

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;

  const animationClasses = isClosing 
    ? 'opacity-0 translate-y-full' 
    : 'opacity-100 translate-y-0';
    
  const getSelectClass = (disabled = false) => 
    `w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col justify-end z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/80 backdrop-blur-2xl w-full rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search for ads..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    autoFocus
                />
            </div>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
             <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Sort By</h3>
                <select value={sortBy} onChange={(e) => onSortChange(e.target.value as SortBy)} className={getSelectClass()}>
                    <option value="default">Relevance</option>
                    <option value="reward-desc">Reward: High to Low</option>
                    <option value="reward-asc">Reward: Low to High</option>
                    <option value="duration-desc">Duration: Long to Short</option>
                    <option value="duration-asc">Duration: Short to Long</option>
                </select>
            </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-t-xl">
             <button onClick={handleClose} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;