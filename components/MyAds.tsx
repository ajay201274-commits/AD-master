import React, { useState } from 'react';
import { Ad } from '../types';
import MyAdCard from './MyAdCard';
import BulkActionToolbar from './BulkActionToolbar';
import ConfirmationModal from './ConfirmationModal';
import { UploadFirstAdIcon } from './icons/EmptyStateIcons';

interface MyAdsProps {
    userAds: Ad[];
    onEditAd: (ad: Ad) => void;
    onDeleteAds: (adIds: string[]) => void;
    onUploadClick: () => void;
    onSelectAd: (ad: Ad) => void;
    watchedAdIds: Set<string>;
}

const MyAds: React.FC<MyAdsProps> = ({ userAds, onEditAd, onDeleteAds, onUploadClick, onSelectAd, watchedAdIds }) => {
    const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleToggleSelectAd = (adId: string) => {
        setSelectedAdIds(prev =>
            prev.includes(adId)
                ? prev.filter(id => id !== adId)
                : [...prev, adId]
        );
    };

    const handleClearSelection = () => {
        setSelectedAdIds([]);
    };

    const handleDeleteClick = () => {
        if (selectedAdIds.length > 0) {
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        onDeleteAds(selectedAdIds);
        setSelectedAdIds([]);
        setIsDeleteConfirmOpen(false);
    };

    const handleDeleteSingle = (adId: string) => {
        setSelectedAdIds([adId]);
        setIsDeleteConfirmOpen(true);
    };

    if (userAds.length === 0) {
        return (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <UploadFirstAdIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">You haven't uploaded any ads.</h2>
                <p className="mb-6">Click the button below to upload your first ad and start earning.</p>
                <button
                    onClick={onUploadClick}
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all hover:shadow-md hover:shadow-indigo-500/50 inline-flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Upload First Ad</span>
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Uploaded Ads</h1>
                <button onClick={onUploadClick} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-sm inline-flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Create New Ad</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userAds.map(ad => (
                    <MyAdCard
                        key={ad.id}
                        ad={ad}
                        onEdit={onEditAd}
                        onDelete={handleDeleteSingle}
                        onToggleSelect={handleToggleSelectAd}
                        onViewDetails={onSelectAd}
                        isSelected={selectedAdIds.includes(ad.id)}
                        isWatched={watchedAdIds.has(ad.id)}
                    />
                ))}
            </div>
            <BulkActionToolbar
                selectedCount={selectedAdIds.length}
                onClearSelection={handleClearSelection}
                onDelete={handleDeleteClick}
            />
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Delete ${selectedAdIds.length > 1 ? `${selectedAdIds.length} Ads` : 'Ad'}`}
                message={`Are you sure you want to permanently delete the selected ad(s)?`}
                confirmText="Delete"
                confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            />
        </div>
    );
};

export default MyAds;
