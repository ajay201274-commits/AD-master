

import React, { useMemo } from 'react';
import { Ad } from '../types';
import AdCard from './AdCard';
import AdCardSkeleton from './AdCardSkeleton';
import { NoResultsIcon } from './icons/EmptyStateIcons';
import { LOCATIONS } from '../data/locations';
import { LocationIcon } from './icons/LocationIcon';
import MapView from './MapView';
import ViewModeToggle from './ViewModeToggle';

interface AdListProps {
    ads: Ad[];
    isLoading: boolean;
    onSelectAd: (ad: Ad) => void;
    onWatchAd: (ad: Ad) => void;
    watchedAdIds: Set<string>;
    locationFilters: { country: string; state: string; district: string };
    onLocationChange: (filters: { country: string; state: string; district: string }) => void;
    viewMode: 'list' | 'map';
    onViewModeChange: (mode: 'list' | 'map') => void;
}

const AdList: React.FC<AdListProps> = ({ 
    ads, 
    isLoading, 
    onSelectAd, 
    onWatchAd, 
    watchedAdIds, 
    locationFilters, 
    onLocationChange,
    viewMode,
    onViewModeChange 
}) => {
    
    const availableStates = useMemo(() => {
        const country = locationFilters.country;
        if (country !== 'ALL' && country in LOCATIONS) {
            return Object.keys(LOCATIONS[country as keyof typeof LOCATIONS]);
        }
        return [];
    }, [locationFilters.country]);

    const availableDistricts = useMemo(() => {
        const { country, state } = locationFilters;
        if (country !== 'ALL' && country in LOCATIONS && state !== 'ALL') {
            const countryData = LOCATIONS[country as keyof typeof LOCATIONS];
            if (state in countryData) {
                return countryData[state as keyof typeof countryData] || [];
            }
        }
        return [];
    }, [locationFilters.country, locationFilters.state]);


    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onLocationChange({
            ...locationFilters,
            [name]: value,
            ...(name === 'country' && { state: 'ALL', district: 'ALL' }),
            ...(name === 'state' && { district: 'ALL' }),
        });
    };

    const getSelectClass = (disabled = false) =>
        `w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <AdCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    const renderContent = () => {
         if (ads.length === 0) {
            return (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                    <NoResultsIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Ads Found</h2>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            );
        }

        if (viewMode === 'map') {
            return <MapView ads={ads} onSelectAd={onSelectAd} />;
        }
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ads.map(ad => (
                    <AdCard 
                        key={ad.id} 
                        ad={ad} 
                        onSelectAd={onSelectAd}
                        onWatchAd={onWatchAd}
                        isWatched={watchedAdIds.has(ad.id)}
                    />
                ))}
            </div>
        )
    }
    
    return (
        <>
            <div className="mb-8 p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                  <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                    <LocationIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-md font-semibold text-slate-800 dark:text-white">Filter by Location</h3>
                  </div>
                  <ViewModeToggle viewMode={viewMode} setViewMode={onViewModeChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="country-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Country</label>
                  <select id="country-filter" name="country" value={locationFilters.country} onChange={handleFilterChange} className={getSelectClass()}>
                    <option value="ALL">All Countries</option>
                    {Object.keys(LOCATIONS).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="state-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">State</label>
                  <select id="state-filter" name="state" value={locationFilters.state} onChange={handleFilterChange} className={getSelectClass(availableStates.length === 0)} disabled={availableStates.length === 0}>
                    <option value="ALL">All States</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district-filter" className="block mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">District</label>
                  <select id="district-filter" name="district" value={locationFilters.district} onChange={handleFilterChange} className={getSelectClass(availableDistricts.length === 0)} disabled={availableDistricts.length === 0}>
                    <option value="ALL">All Districts</option>
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {renderContent()}
        </>
    );
};

export default AdList;