import React, { useState, useRef, useEffect } from 'react';
import { Ad, AdType } from '../types';
import { AddToCartIcon, InCartIcon } from './icons/CartIcons';
import { ClockIcon, EyeIcon } from './icons/InfoIcons';
import { LocationIcon } from './icons/LocationIcon';
import { MoreOptionsIcon } from './icons/MoreOptionsIcon';
import { FlagIcon } from './icons/FlagIcon';
import { isVideoFile } from '../utils/helpers';

interface AdCardProps {
    ad: Ad;
    onWatchAd: (ad: Ad) => void;
    onToggleWatchlist: (adId: string) => void;
    onReportAd: (ad: Ad) => void;
    isInWatchlist: boolean;
    isWatched: boolean;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onWatchAd, onToggleWatchlist, onReportAd, isInWatchlist, isWatched }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [videoError, setVideoError] = useState(false);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleWatchlist(ad.id);
    };
    
    const handleReportClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onReportAd(ad);
        setIsMenuOpen(false);
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    }

    const locationParts = [ad.district, ad.state, ad.country].filter(Boolean);
    const locationString = locationParts.join(', ');

    return (
        <div 
            onClick={() => onWatchAd(ad)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setVideoError(false);
            }}
            className="group relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-2 hover:scale-[1.05]"
        >
            <div className="relative">
                {isHovering && !videoError && ad.type === AdType.VIDEO && isVideoFile(ad.contentUrl) ? (
                    <video
                        src={ad.contentUrl}
                        className="w-full aspect-video object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => setVideoError(true)}
                    />
                ) : (
                    <img src={ad.thumbnailUrl} alt={ad.title} className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

                {videoError && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 3.75 16.5 16.5" />
                        </svg>
                        <p className="text-xs font-semibold text-center">Video preview unavailable</p>
                    </div>
                )}
                
                {isWatched && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ring-2 ring-white/50 z-10 flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3"/>
                        <span>Watched</span>
                    </div>
                )}

                <div className="absolute top-2 right-2 z-10">
                    <div className="relative" ref={menuRef}>
                        <button onClick={handleMenuToggle} className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                            <MoreOptionsIcon className="w-4 h-4" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 animate-fade-in">
                                <button onClick={handleReportClick} className="w-full text-left text-sm px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <FlagIcon className="w-4 h-4" />
                                    <span>Report Ad</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="font-bold text-white text-lg leading-tight truncate">{ad.title}</h3>
                    {locationString && (
                        <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-200">
                            <LocationIcon className="w-3 h-3 flex-shrink-0" />
                            <span>{locationString}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 h-10 overflow-hidden text-ellipsis">{ad.description}</p>
                
                <div className="flex justify-between items-center mt-3 text-sm text-slate-500 dark:text-slate-400">
                     <div className="flex items-center space-x-1.5">
                        <ClockIcon className="w-4 h-4"/>
                        <span>{ad.duration}s</span>
                    </div>
                     <div className="text-amber-500 dark:text-amber-400 font-bold flex items-center space-x-1">
                        <span>{'★'.repeat(Math.round(ad.rating || 0))}{'☆'.repeat(5 - Math.round(ad.rating || 0))}</span>
                        <span>({ad.rating?.toFixed(1) || 'N/A'})</span>
                     </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Reward: ₹{ad.reward.toFixed(2)}</p>
                    <button 
                        onClick={handleToggleClick}
                        className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 border-2 transform hover:scale-105 active:scale-95 ${isInWatchlist ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-transparent hover:bg-indigo-200 dark:hover:bg-indigo-900/70' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
                        aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    >
                        {isInWatchlist ? <InCartIcon /> : <AddToCartIcon />}
                        <span>{isInWatchlist ? "Added" : "Watchlist"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdCard;