
import React from 'react';
import { ListIcon, MapIcon } from './icons/ViewModeIcons';

interface ViewModeToggleProps {
  viewMode: 'list' | 'map';
  setViewMode: (mode: 'list' | 'map') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg">
      <button
        onClick={() => setViewMode('list')}
        aria-pressed={viewMode === 'list'}
        className={`flex items-center space-x-2 w-full justify-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow'
            : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <ListIcon className="w-4 h-4" />
        <span>List</span>
      </button>
      <button
        onClick={() => setViewMode('map')}
        aria-pressed={viewMode === 'map'}
        className={`flex items-center space-x-2 w-full justify-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
          viewMode === 'map'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow'
            : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <MapIcon className="w-4 h-4" />
        <span>Map</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;