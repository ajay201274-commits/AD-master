import React from 'react';

const AdCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="animate-pulse">
                <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="flex-grow space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                         <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                         <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"></div>
                </div>
            </div>
        </div>
    );
};

export default AdCardSkeleton;