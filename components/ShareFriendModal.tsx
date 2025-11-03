
import React, { useState, useCallback } from 'react';
import { Ad, Friend } from '../types';

interface ShareFriendModalProps {
    ad: Ad;
    friends: Friend[];
    onClose: () => void;
    onShare: (friendId: string) => void;
}

const ShareFriendModal: React.FC<ShareFriendModalProps> = ({ ad, friends, onClose, onShare }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handleShareClick = (friendId: string) => {
        onShare(friendId);
    };

    const animationClasses = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';

    return (
        <div
            className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            onClick={handleClose}
        >
            <div
                className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Share with a Friend</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select a friend to share "<span className="font-semibold">{ad.title}</span>" with:</p>
                    {friends.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">You don't have any friends yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {friends.map(friend => (
                                <li key={friend.id}>
                                    <button
                                        onClick={() => handleShareClick(friend.id)}
                                        className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                    >
                                        <img src={friend.profilePictureUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{friend.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareFriendModal;
