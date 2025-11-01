import React from 'react';
import { Ad } from '../types';
import { TrashIcon } from './icons/CartIcons';
import { EditIcon } from './icons/AIIcons';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LocationIcon } from './icons/LocationIcon';

interface MyAdCardProps {
    ad: Ad;
    onEdit: (ad: Ad) => void;
    onDelete: (adId: string) => void;
    onToggleSelect: (adId: string) => void;
    onViewDetails: (ad: Ad) => void;
    isSelected: boolean;
    isWatched: boolean;
}

const MyAdCard: React.FC<MyAdCardProps> = ({ ad, onEdit, onDelete, onToggleSelect, onViewDetails, isSelected, isWatched }) => {
    
    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelect(ad.id);
    };

    const locationParts = [ad.district, ad.state, ad.country].filter(Boolean);
    const locationString = locationParts.join(', ');

    return (
        <div 
            onClick={() => onViewDetails(ad)}
            className="group relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
        >
            <div className="relative">
                <img src={ad.thumbnailUrl} alt={ad.title} className="w-full aspect-video object-cover" />

                <button
                    onClick={handleSelectClick}
                    className="absolute top-2 left-2 z-20 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                    style={{ opacity: isSelected ? 1 : undefined }}
                    aria-label={isSelected ? "Deselect ad" : "Select ad"}
                >
                    {isSelected ? (
                        <CheckCircleIcon className="w-6 h-6 text-white bg-indigo-500 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-black/40 border-2 border-white/80 group-hover:bg-white/20 transition-colors" />
                    )}
                </button>
                
                 {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ring-2 ring-white/50 z-10">
                        Watched
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white leading-tight truncate">{ad.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ad.category}</p>
                {locationString && (
                    <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <LocationIcon className="w-3 h-3 flex-shrink-0" />
                        <span>{locationString}</span>
                    </div>
                )}
                
                <p className="text-sm font-bold text-green-600 dark:text-green-400 my-2">Reward: ₹{ad.reward.toFixed(2)}</p>

                <div className="flex items-center space-x-2 mt-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(ad); }} 
                        className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white font-bold text-sm rounded-lg transition-colors"
                    >
                        <EditIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(ad.id); }} 
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyAdCard;
