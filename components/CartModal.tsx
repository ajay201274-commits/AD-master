import React, { useState, useCallback } from 'react';
import { Ad } from '../types';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Ad[];
  onWatchAd: (ad: Ad) => void;
  onRemoveFromWatchlist: (adId: string) => void;
}

const CartModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose, watchlist, onWatchAd, onRemoveFromWatchlist }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';

  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Watchlist ({watchlist.length})</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            {watchlist.length === 0 ? (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                    <h3 className="text-xl font-semibold mb-2">Your Watchlist is Empty</h3>
                    <p>Add ads to your watchlist to view them later.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {watchlist.map(ad => (
                        <li key={ad.id} className="flex items-center space-x-4 bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg">
                            <img src={ad.thumbnailUrl} alt={ad.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ad.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{ad.duration}s | ₹{ad.reward.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={() => onWatchAd(ad)} className="py-1.5 px-3 bg-indigo-600 text-white font-semibold text-xs rounded-md hover:bg-indigo-500 transition-colors">
                                    Watch
                                </button>
                                <button onClick={() => onRemoveFromWatchlist(ad.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
