import React from 'react';

const MapView = () => {
    // The map functionality has been removed due to persistent API key errors.
    return (
        <div className="h-[60vh] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800/20">
            <div className="text-center text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l6-3a1 1 0 00.553-1.894L21 12m-6 5V7m3 12l-3-1.5m-9 0L9 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Map View Unavailable</h3>
                <p>This feature has been temporarily disabled.</p>
            </div>
        </div>
    );
};

export default MapView;