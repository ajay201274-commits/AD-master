import React, { useState, useMemo } from 'react';
import { Ad } from '../types';
import AdCard from './AdCard';
import AdCardSkeleton from './AdCardSkeleton';
import { NoResultsIcon } from './icons/EmptyStateIcons';
import FilterModal from './FilterModal';
import { FilterIcon } from './icons/FilterIcon';
import { LocationIcon } from './icons/LocationIcon';

type AdvancedFilters = {
    location: { country: string; state: string; district: string };
    reward: { min: string; max: string };
    duration: { min: string; max: string };
};

interface AdListProps {
  ads: Ad[];
  isLoading: boolean;
  onWatchAd: (ad: Ad) => void;
  onToggleWatchlist: (adId: string) => void;
  onReportAd: (ad: Ad) => void;
  watchlist: string[];
  watchedAdIds: Set<string>;
  onAddToast: (message: string, type: 'success' | 'info' | 'error') => void;
  advancedFilters: AdvancedFilters;
  onApplyFilters: (filters: AdvancedFilters) => void;
  userLocation: { lat: number; lng: number } | null;
  onSetUserLocation: (location: { lat: number; lng: number } | null) => void;
}

const AdList: React.FC<AdListProps> = ({
  ads,
  isLoading,
  onWatchAd,
  onToggleWatchlist,
  onReportAd,
  watchlist,
  watchedAdIds,
  onAddToast,
  advancedFilters,
  onApplyFilters,
  userLocation,
  onSetUserLocation
}) => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (advancedFilters.location.country !== 'ALL') count++;
        if (advancedFilters.location.state !== 'ALL') count++;
        if (advancedFilters.location.district !== 'ALL') count++;
        if (advancedFilters.reward.min) count++;
        if (advancedFilters.reward.max) count++;
        if (advancedFilters.duration.min) count++;
        if (advancedFilters.duration.max) count++;
        return count;
    }, [advancedFilters]);

    const handleFindNearMe = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    onSetUserLocation(location);
                    setIsLocating(false);
                    onAddToast('Showing ads within a 50km radius.', 'info');
                },
                (error: GeolocationPositionError) => {
                    let errorMessage = "Could not get your location. Please check browser permissions.";
                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            errorMessage = "Location access was denied. Please enable it in your browser settings.";
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            errorMessage = "Location information is unavailable at the moment.";
                            break;
                        case 3: // TIMEOUT
                            errorMessage = "The request to get your location timed out.";
                            break;
                    }
                    console.error("Error getting user location:", `Code ${error.code}: ${error.message}`);
                    onAddToast(errorMessage, 'error');
                    setIsLocating(false);
                }
            );
        } else {
            onAddToast("Geolocation is not supported by your browser.", 'info');
        }
    };
    
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <AdCardSkeleton key={i} />)}
        </div>
      );
    }
    if (ads.length === 0) {
      return (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <NoResultsIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">No Ads Found</h2>
            <p>Try adjusting your search or filter criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
        {ads.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            onWatchAd={onWatchAd}
            onToggleWatchlist={onToggleWatchlist}
            onReportAd={onReportAd}
            isInWatchlist={watchlist.includes(ad.id)}
            isWatched={watchedAdIds.has(ad.id)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Available Ads</h2>
            <div className="flex items-center space-x-2">
                 {userLocation ? (
                    <button 
                        onClick={() => onSetUserLocation(null)}
                        className="flex items-center space-x-2 py-2.5 px-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95"
                        aria-label="Clear location filter"
                    >
                        <LocationIcon className="w-4 h-4" />
                        <span>Showing Near Me</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                ) : (
                    <button 
                        onClick={handleFindNearMe}
                        disabled={isLocating}
                        className="flex items-center space-x-2 py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <LocationIcon className="w-4 h-4" />
                        <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
                    </button>
                )}
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`relative p-2.5 rounded-lg border transition-all transform hover:scale-105 active:scale-95 ${
                        activeFilterCount > 0
                        ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    aria-label="Open filters"
                >
                    <FilterIcon className="w-5 h-5" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium ring-2 ring-white dark:ring-slate-950 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
        {renderContent()}
        {isFilterModalOpen && (
            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={onApplyFilters}
                currentFilters={advancedFilters}
            />
        )}
    </section>
  );
};

export default AdList;