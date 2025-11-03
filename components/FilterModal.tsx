import React, { useState, useCallback, useEffect } from 'react';
import { LOCATIONS } from '../data/locations';
import { LocationIcon } from './icons/LocationIcon';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { 
      location: { country: string; state: string; district: string };
      reward: { min: string; max: string };
      duration: { min: string; max: string };
   }) => void;
  currentFilters: { 
      location: { country: string; state: string; district: string };
      reward: { min: string; max: string };
      duration: { min: string; max: string };
  };
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Local state for filters
  const [localLocation, setLocalLocation] = useState(currentFilters.location);
  const [localReward, setLocalReward] = useState(currentFilters.reward);
  const [localDuration, setLocalDuration] = useState(currentFilters.duration);

  // Location dropdown dependencies
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  useEffect(() => {
    if(localLocation.country && localLocation.country !== 'ALL' && localLocation.country in LOCATIONS) {
      setStates(Object.keys(LOCATIONS[localLocation.country as keyof typeof LOCATIONS]));
    } else {
      setStates([]);
    }
  }, [localLocation.country]);

  useEffect(() => {
    if(localLocation.country && localLocation.country !== 'ALL' && localLocation.state && localLocation.state !== 'ALL' && localLocation.country in LOCATIONS && localLocation.state in LOCATIONS[localLocation.country as keyof typeof LOCATIONS]) {
      setDistricts(LOCATIONS[localLocation.country as keyof typeof LOCATIONS][localLocation.state as keyof typeof LOCATIONS[keyof typeof LOCATIONS]] || []);
    } else {
      setDistricts([]);
    }
  }, [localLocation.country, localLocation.state]);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleApply = () => {
    onApply({
        location: localLocation,
        reward: localReward,
        duration: localDuration
    });
    handleClose();
  };

  const handleClear = () => {
      const clearedFilters = {
          location: { country: 'ALL', state: 'ALL', district: 'ALL' },
          reward: { min: '', max: '' },
          duration: { min: '', max: '' },
      };
      setLocalLocation(clearedFilters.location);
      setLocalReward(clearedFilters.reward);
      setLocalDuration(clearedFilters.duration);
      onApply(clearedFilters);
      handleClose();
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalLocation({ country: e.target.value, state: 'ALL', district: 'ALL' });
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalLocation(prev => ({ ...prev, state: e.target.value, district: 'ALL' }));
  }

  if (!isOpen && !isClosing) return null;

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';

  const getInputClass = (disabled = false) => 
    `w-full bg-slate-100 dark:bg-slate-800/60 border text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500 border-slate-300 dark:border-slate-600/80 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 id="filter-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Filter Ads</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            <fieldset>
                <legend className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2"><LocationIcon className="w-5 h-5"/><span>Location</span></legend>
                <div className="space-y-3">
                     <div>
                        <label htmlFor="country-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Country</label>
                        <select id="country-filter" value={localLocation.country} onChange={handleCountryChange} className={getInputClass()}>
                            <option value="ALL">All Countries</option>
                            {Object.keys(LOCATIONS).map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="state-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">State</label>
                        <select id="state-filter" value={localLocation.state} onChange={handleStateChange} className={getInputClass(states.length === 0)} disabled={states.length === 0}>
                            <option value="ALL">All States</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="district-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">District</label>
                        <select id="district-filter" value={localLocation.district} onChange={(e) => setLocalLocation(prev => ({...prev, district: e.target.value}))} className={getInputClass(districts.length === 0)} disabled={districts.length === 0}>
                            <option value="ALL">All Districts</option>
                            {districts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

             <fieldset>
                <legend className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Reward Range (₹)</legend>
                <div className="flex items-center space-x-2">
                    <input type="number" placeholder="Min" value={localReward.min} onChange={e => setLocalReward(p => ({...p, min: e.target.value}))} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-2 text-sm" />
                    <span className="text-slate-400">-</span>
                    <input type="number" placeholder="Max" value={localReward.max} onChange={e => setLocalReward(p => ({...p, max: e.target.value}))} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-2 text-sm" />
                </div>
            </fieldset>

             <fieldset>
                <legend className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Duration Range (seconds)</legend>
                <div className="flex items-center space-x-2">
                    <input type="number" placeholder="Min" value={localDuration.min} onChange={e => setLocalDuration(p => ({...p, min: e.target.value}))} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-2 text-sm" />
                    <span className="text-slate-400">-</span>
                    <input type="number" placeholder="Max" value={localDuration.max} onChange={e => setLocalDuration(p => ({...p, max: e.target.value}))} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-2 text-sm" />
                </div>
            </fieldset>

        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 flex justify-between items-center rounded-b-xl">
             <button
                type="button"
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold"
                onClick={handleClear}
            >
                Clear All
            </button>
            <button
                type="button"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
                onClick={handleApply}
            >
                Apply Filters
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
