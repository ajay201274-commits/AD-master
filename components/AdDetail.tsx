import React, { useMemo, useState, useEffect } from 'react';
import { Ad, Feedback, UserRole } from '../types';
import AdCard from './AdCard';
import { DollarIcon, ClockIcon, CategoryIcon } from './icons/DetailIcons';
import * as api from '../services/api';
import FeedbackAnalysis from './FeedbackAnalysis';
import { AddToCartIcon, InCartIcon } from './icons/CartIcons';
import { EditIcon } from './icons/AIIcons';
import { TrashIcon } from './icons/CartIcons';
import { LocationIcon } from './icons/LocationIcon';

interface AdDetailProps {
  ad: Ad;
  userRole: UserRole;
  userAds: Ad[];
  onBack: () => void;
  isWatched: boolean;
  onWatchAd: (ad: Ad) => void;
  onToggleWatchlist: (adId: string) => void;
  isInWatchlist: boolean;
  allAds: Ad[];
  onSelectAd: (ad: Ad) => void;
  onEditAd: (ad: Ad) => void;
  onDeleteAd: (adId: string) => void;
  onLeaveReview: (ad: Ad) => void;
}

const AdDetail: React.FC<AdDetailProps> = ({ 
    ad, 
    userRole,
    userAds,
    onBack, 
    isWatched, 
    onWatchAd,
    onToggleWatchlist,
    isInWatchlist,
    allAds,
    onSelectAd,
    onEditAd,
    onDeleteAd,
    onLeaveReview
}) => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            setIsLoadingFeedback(true);
            try {
                const fetchedFeedback = await api.fetchFeedbackForAd(ad.id);
                setFeedback(fetchedFeedback);
            } catch (error) {
                console.error("Failed to fetch feedback", error);
            } finally {
                setIsLoadingFeedback(false);
            }
        };
        fetchFeedback();
    }, [ad.id]);

    const isOwner = useMemo(() => 
        (userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER) && userAds.some(p => p.id === ad.id),
        [userRole, userAds, ad.id]
    );

    const relatedAds = useMemo(() => {
        return allAds.filter(
            a => a.category === ad.category && a.id !== ad.id
        ).slice(0, 4);
    }, [allAds, ad]);

    const locationParts = [ad.district, ad.state, ad.country].filter(Boolean);
    const locationString = locationParts.join(', ');

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-6 font-semibold">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back to Ads</span>
            </button>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4">
                        <img src={ad.thumbnailUrl} alt={ad.title} className="w-full aspect-video object-cover rounded-lg" />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{ad.title}</h1>
                        <p className="text-slate-600 dark:text-slate-300 my-4">{ad.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 my-4 text-center">
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                                <DollarIcon className="mx-auto w-8 h-8 text-green-500 dark:text-green-400" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reward</p>
                                <p className="text-xl font-bold">₹{ad.reward.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                                <ClockIcon className="mx-auto w-8 h-8 text-blue-500 dark:text-blue-400" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Duration</p>
                                <p className="text-xl font-bold">{ad.duration}s</p>
                            </div>
                             <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                                <CategoryIcon className="mx-auto w-8 h-8 text-purple-500 dark:text-purple-400" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Category</p>
                                <p className="text-lg font-bold">{ad.category}</p>
                            </div>
                            {locationString && (
                                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                                    <LocationIcon className="mx-auto w-8 h-8 text-amber-500 dark:text-amber-400" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Location</p>
                                    <p className="text-md font-bold truncate">{locationString}</p>
                                </div>
                            )}
                        </div>

                        {!isOwner && (
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={() => onWatchAd(ad)}
                                    disabled={isWatched}
                                    className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-indigo-500 transition-all"
                                >
                                    {isWatched ? 'Already Watched' : 'Watch Ad Now'}
                                </button>
                                <button onClick={() => onToggleWatchlist(ad.id)} className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}>
                                    {isInWatchlist ? <InCartIcon className="w-6 h-6 text-indigo-500" /> : <AddToCartIcon className="w-6 h-6" />}
                                </button>
                            </div>
                        )}
                         {isOwner && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                                <button onClick={() => onEditAd(ad)} className="w-full sm:w-auto flex-grow py-3 px-6 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2"><EditIcon className="w-5 h-5" /><span>Edit Ad</span></button>
                                <button onClick={() => onDeleteAd(ad.id)} className="w-full sm:w-auto flex-grow py-3 px-6 bg-red-600/10 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-600/20 transition-colors flex items-center justify-center space-x-2"><TrashIcon className="w-5 h-5" /><span>Delete Ad</span></button>
                            </div>
                         )}
                         {isWatched && !isOwner && <button onClick={() => onLeaveReview(ad)} className="w-full mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Leave a Review</button>}
                    </div>
                </div>
            </div>

            {isOwner && <FeedbackAnalysis feedback={feedback} isLoading={isLoadingFeedback} />}

            {relatedAds.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Related Ads</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedAds.map(a => (
                            <AdCard 
                                key={a.id}
                                ad={a}
                                onSelectAd={onSelectAd}
                                onWatchAd={onWatchAd}
                                isWatched={isWatched} // Simplification for related items
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdDetail;
