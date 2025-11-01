
import React, { useState, useCallback, useEffect } from 'react';
import { LOCATIONS } from '../data/locations';

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { country: string; state: string; district: string }) => void;
  currentFilters: { country: string; state: string; district: string };
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(currentFilters.country);
  const [selectedState, setSelectedState] = useState(currentFilters.state);
  const [selectedDistrict, setSelectedDistrict] = useState(currentFilters.district);

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  useEffect(() => {
    if(selectedCountry && selectedCountry !== 'ALL') {
      setStates(Object.keys(LOCATIONS[selectedCountry]));
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if(selectedCountry && selectedCountry !== 'ALL' && selectedState && selectedState !== 'ALL') {
      setDistricts(LOCATIONS[selectedCountry][selectedState] || []);
    } else {
      setDistricts([]);
    }
  }, [selectedCountry, selectedState]);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleApply = () => {
    onApply({
        country: selectedCountry,
        state: selectedState,
        district: selectedDistrict
    });
    handleClose();
  };

  const handleClear = () => {
      setSelectedCountry('ALL');
      setSelectedState('ALL');
      setSelectedDistrict('ALL');
      onApply({ country: 'ALL', state: 'ALL', district: 'ALL' });
      handleClose();
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCountry(e.target.value);
      setSelectedState('ALL');
      setSelectedDistrict('ALL');
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedState(e.target.value);
      setSelectedDistrict('ALL');
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
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filter by Location</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="country-filter" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Country</label>
                <select id="country-filter" value={selectedCountry} onChange={handleCountryChange} className={getInputClass()}>
                    <option value="ALL">All Countries</option>
                    {Object.keys(LOCATIONS).map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="state-filter" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">State</label>
                <select id="state-filter" value={selectedState} onChange={handleStateChange} className={getInputClass(states.length === 0)} disabled={states.length === 0}>
                    <option value="ALL">All States</option>
                     {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="district-filter" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">District</label>
                <select id="district-filter" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className={getInputClass(districts.length === 0)} disabled={districts.length === 0}>
                    <option value="ALL">All Districts</option>
                     {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 flex justify-between items-center rounded-b-xl">
             <button
                type="button"
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold"
                onClick={handleClear}
            >
                Clear Filters
            </button>
            <button
                type="button"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
                onClick={handleApply}
            >
                Apply
            </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFilterModal;