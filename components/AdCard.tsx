import React from 'react';
import { Ad, AdType } from '../types';
import { VideoIcon, PosterIcon } from './icons/AdIcons';
import { LocationIcon } from './icons/LocationIcon';
import { isVideoFile } from '../utils/helpers';

interface AdCardProps {
    ad: Ad;
    onSelectAd: (ad: Ad) => void;
    onWatchAd: (ad: Ad) => void;
    isWatched: boolean;
}

const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const AdCard: React.FC<AdCardProps> = ({ ad, onSelectAd, onWatchAd, isWatched }) => {
    const canShowVideoPreview = ad.type === AdType.VIDEO && isVideoFile(ad.contentUrl);

    // Gracefully build the location string, omitting any missing parts.
    const locationString = [ad.district, ad.state, ad.country]
        .filter(part => part && part.trim()) // Filter out null, undefined, and empty/whitespace strings
        .join(', ');
        
    const hasCoords = ad.lat && ad.lng;
    const mapsUrl = hasCoords 
        ? `https://www.google.com/maps/search/?api=1&query=${ad.lat},${ad.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationString)}`;

    const staticMapUrl = hasCoords
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${ad.lat},${ad.lng}&zoom=14&size=256x160&markers=color:red%7C${ad.lat},${ad.lng}&key=${process.env.API_KEY}`
        : null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onSelectAd(ad);
        }
    };

    return (
        <div 
            onClick={() => onSelectAd(ad)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${ad.title}`}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-500 ease-in-out flex flex-col cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
        >
            <div className="relative">
                {/* The thumbnail fades out on hover */}
                <img src={ad.thumbnailUrl} alt={ad.title} className="w-full aspect-video object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0" />

                {/* The preview content fades in on hover, positioned on top of the thumbnail */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out delay-75">
                     {(canShowVideoPreview || ad.type === AdType.IMAGE) && (
                        <>
                            {canShowVideoPreview ? (
                                <video 
                                    src={ad.contentUrl} 
                                    title={`${ad.title} preview`}
                                    className="w-full h-full object-cover"
                                    autoPlay 
                                    muted 
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img 
                                    src={ad.contentUrl} 
                                    alt={`${ad.title} preview`} 
                                    className="w-full h-full object-cover" 
                                />
                            )}
                            {/* A subtle overlay to ensure UI elements are readable on bright content */}
                            <div className="absolute inset-0 bg-black/30"></div>
                        </>
                     )}
                </div>
                
                 {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ring-2 ring-white/50 z-10">
                        Watched
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <div className="flex items-start space-x-3">
                    {ad.type === AdType.VIDEO ? <VideoIcon /> : <PosterIcon />}
                    <div className="flex-grow min-w-0">
                        <h3 
                            onClick={(e) => { 
                                e.stopPropagation(); // Prevent parent div's onClick from firing
                                onSelectAd(ad); 
                            }}
                            className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors cursor-pointer hover:underline truncate"
                            title={ad.title}
                        >
                            {ad.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{ad.category}</p>
                    </div>
                </div>
                
                {locationString && (
                    <div className="relative mt-2 min-w-0 group">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <LocationIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate" title={locationString}>{locationString}</span>
                             <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex-shrink-0 hover:underline"
                                aria-label={`Open location in Google Maps: ${locationString}`}
                                title="Open in Google Maps"
                            >
                                <ExternalLinkIcon />
                            </a>
                        </div>
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 w-64 invisible opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                           {hasCoords && staticMapUrl ? (
                                <a 
                                    href={mapsUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="block w-full h-40 rounded-lg overflow-hidden shadow-lg border border-slate-300 dark:border-slate-600"
                                >
                                    <img src={staticMapUrl} alt={`Map of ${locationString}`} className="w-full h-full object-cover" />
                                </a>
                           ) : (
                               <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md px-3 py-1.5 shadow-lg max-w-xs">
                                   {locationString}
                               </div>
                           )}
                        </div>
                    </div>
                )}


                <div className="flex-grow"></div>

                <div className="flex justify-between items-center text-sm mt-3 text-slate-500 dark:text-slate-400">
                    <span>Duration: <span className="font-bold text-slate-800 dark:text-slate-200">{ad.duration}s</span></span>
                    <span className="font-bold text-green-600 dark:text-green-400">Reward: ₹{ad.reward.toFixed(2)}</span>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onWatchAd(ad); }}
                    disabled={isWatched}
                    aria-label={isWatched ? `Ad already watched: ${ad.title}` : `Earn reward for watching ${ad.title}`}
                    className="w-full mt-3 py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all"
                >
                    {isWatched ? 'Watched' : 'Earn Reward'}
                </button>
            </div>
        </div>
    );
};

export default AdCard;