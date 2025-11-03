import React, { useState } from 'react';
import { Ad, Feedback, UserRole, Friend } from '../types';
import { ClockIcon, DollarIcon, CategoryIcon } from './icons/DetailIcons';
import { ShareIcon } from './icons/ShareIcon';
import FeedbackModal from './FeedbackModal';
import * as api from '../services/api';
import FeedbackAnalysis from './FeedbackAnalysis';
import ShareFriendModal from './ShareFriendModal';
import { FlagIcon } from './icons/FlagIcon';

// Mock data defined here as new files cannot be added.
const MOCK_FRIENDS: Friend[] = [
    { id: 'user-456', name: 'Priya Patel', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-456', isOnline: true },
    { id: 'user-789', name: 'Amit Kumar', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-789', isOnline: false },
    { id: 'user-101', name: 'Sunita Devi', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-101', isOnline: true },
];

interface AdDetailProps {
    ad: Ad;
    onClose: () => void;
    onReportAd: (ad: Ad) => void;
    userRole: UserRole;
}

const AdDetail: React.FC<AdDetailProps> = ({ ad, onClose, onReportAd, userRole }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    React.useEffect(() => {
        const fetchFeedback = async () => {
            setIsLoadingFeedback(true);
            try {
                const feedback = await api.fetchFeedbackForAd(ad.id);
                setFeedbackList(feedback);
            } catch (error) {
                console.error("Failed to fetch feedback:", error);
            } finally {
                setIsLoadingFeedback(false);
            }
        };
        fetchFeedback();
    }, [ad.id]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleSaveFeedback = async (newFeedback: Omit<Feedback, 'id'>) => {
        const saved = await api.saveFeedback(newFeedback);
        setFeedbackList(prev => [saved, ...prev]);
        setIsFeedbackModalOpen(false);
    };

    const handleShare = (friendId: string) => {
        console.log(`Sharing ad ${ad.id} with friend ${friendId}`);
        // Here you would implement the actual share logic, e.g., sending a notification
        setIsShareModalOpen(false);
    };

    const isOwner = userRole === UserRole.APP_OWNER || userRole === UserRole.UPLOADER;

    const animationClasses = isClosing ? 'opacity-0' : 'opacity-100';

    return (
        <div 
            className={`fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-40 transition-opacity duration-300 ${animationClasses}`}
            onClick={handleClose}
        >
            <div 
                className={`relative w-full max-w-5xl mx-auto h-full bg-white dark:bg-slate-900/80 transform transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
                onClick={e => e.stopPropagation()}
            >
                 <button onClick={handleClose} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="h-full overflow-y-auto">
                    <div className="relative aspect-video bg-black">
                        <img src={ad.thumbnailUrl} alt={ad.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                             <h1 className="text-4xl font-bold">{ad.title}</h1>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <InfoCard icon={<DollarIcon />} title="Reward" value={`₹${ad.reward.toFixed(2)}`} />
                            <InfoCard icon={<ClockIcon />} title="Duration" value={`${ad.duration} seconds`} />
                            <InfoCard icon={<CategoryIcon />} title="Category" value={ad.category} />
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">About this Ad</h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">{ad.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700/70 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    aria-label="Share this ad"
                                >
                                    <ShareIcon />
                                </button>
                                <button
                                    onClick={() => onReportAd(ad)}
                                    className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700/70 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    aria-label="Report this ad"
                                >
                                    <FlagIcon />
                                </button>
                                <button
                                    onClick={() => setIsFeedbackModalOpen(true)}
                                    className="py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors"
                                >
                                    Leave Feedback
                                </button>
                            </div>
                        </div>

                       <FeedbackAnalysis feedback={feedbackList} isLoading={isLoadingFeedback} isOwner={isOwner} />
                    </div>
                </div>
            </div>
            {isFeedbackModalOpen && (
                <FeedbackModal ad={ad} onClose={() => setIsFeedbackModalOpen(false)} onSave={handleSaveFeedback} />
            )}
            {isShareModalOpen && (
                <ShareFriendModal ad={ad} friends={MOCK_FRIENDS} onClose={() => setIsShareModalOpen(false)} onShare={handleShare} />
            )}
        </div>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({ icon, title, value }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);


export default AdDetail;