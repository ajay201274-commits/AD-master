
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { LeaderboardUser } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

const Spinner = () => (
     <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [sortBy, setSortBy] = useState<'earnings' | 'watched'>('earnings');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await api.fetchLeaderboardData();
                setLeaderboardData(data);
            } catch (err) {
                setError("Failed to load leaderboard data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedData = useMemo(() => {
        const data = [...leaderboardData];
        if (sortBy === 'earnings') {
            return data.sort((a, b) => b.totalEarnings - a.totalEarnings);
        } else {
            return data.sort((a, b) => b.adsWatched - a.adsWatched);
        }
    }, [leaderboardData, sortBy]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const getRankStyles = (rank: number) => {
        if (rank === 1) return 'bg-amber-400 border-amber-500 text-amber-900';
        if (rank === 2) return 'bg-slate-300 border-slate-400 text-slate-800';
        if (rank === 3) return 'bg-yellow-600 border-yellow-700 text-yellow-100';
        return 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300';
    };

    const animationClasses = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex items-center justify-center h-full"><Spinner /></div>;
        }
        if (error) {
            return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
        }
        return (
            <ul className="space-y-2 pr-2">
                {sortedData.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === 'user-123';
                    const isTopThree = rank <= 3;

                    return (
                        <li key={user.id} className={`flex items-center p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-indigo-100 dark:bg-indigo-900/40 border-l-4 border-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankStyles(rank)} ${isTopThree ? 'shadow-md' : ''}`}>
                                {rank}
                            </div>
                            <img src={user.profilePictureUrl} alt={user.name} className={`w-10 h-10 rounded-full mx-4 ${isTopThree ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800' : ''} ${rank === 1 ? 'ring-amber-400' : rank === 2 ? 'ring-slate-300' : rank === 3 ? 'ring-yellow-600' : ''}`} />
                            <div className="flex-grow min-w-0">
                                <p className={`font-semibold truncate ${isCurrentUser ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{user.name} {isCurrentUser && '(You)'}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2 w-24">
                                <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                    {sortBy === 'earnings' ? `₹${user.totalEarnings.toFixed(0)}` : `${user.adsWatched}`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {sortBy === 'earnings' ? `${user.adsWatched} ads` : `₹${user.totalEarnings.toFixed(2)}`}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50" onClick={handleClose}>
            <div className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <TrophyIcon className="w-6 h-6 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-4 flex-shrink-0">
                    <div className="flex bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg">
                        <button onClick={() => setSortBy('earnings')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${sortBy === 'earnings' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                            Top Earners
                        </button>
                        <button onClick={() => setSortBy('watched')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${sortBy === 'watched' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                            Most Ads Watched
                        </button>
                    </div>
                </div>

                <div className="flex-grow p-4 pt-0 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
