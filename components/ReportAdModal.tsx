import React, { useState, useCallback } from 'react';
import { Ad, ReportReason } from '../types';

interface ReportAdModalProps {
  ad: Ad;
  onClose: () => void;
  onSubmit: (adId: string, reason: ReportReason, details?: string) => void;
}

const REPORT_REASONS = Object.values(ReportReason);

const ReportAdModal: React.FC<ReportAdModalProps> = ({ ad, onClose, onSubmit }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [otherDetails, setOtherDetails] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleSubmit = () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }
    if (selectedReason === ReportReason.OTHER && !otherDetails.trim()) {
      setError('Please provide details for your report.');
      return;
    }
    setError('');
    onSubmit(ad.id, selectedReason, otherDetails);
  };
  
  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';
  
  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-ad-title"
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 id="report-ad-title" className="text-xl font-bold text-slate-900 dark:text-white">Report Ad</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center space-x-4 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <img src={ad.thumbnailUrl} alt={ad.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">You are reporting:</p>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{ad.title}</h3>
                </div>
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Reason:</label>
                <fieldset className="space-y-2">
                    <legend className="sr-only">Report Reasons</legend>
                    {REPORT_REASONS.map(reason => (
                        <label key={reason} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/40 has-[:checked]:border-indigo-500 cursor-pointer transition-colors">
                            <input type="radio" name="report_reason" value={reason} checked={selectedReason === reason} onChange={() => {setSelectedReason(reason); setError('')}} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-indigo-500" />
                            <span className="text-slate-800 dark:text-slate-200">{reason}</span>
                        </label>
                    ))}
                </fieldset>
            </div>
            {selectedReason === ReportReason.OTHER && (
                <div className="animate-fade-in">
                    <label htmlFor="otherDetails" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Please provide more details:</label>
                    <textarea
                        id="otherDetails"
                        value={otherDetails}
                        onChange={(e) => setOtherDetails(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500"
                        placeholder="Explain why you are reporting this ad..."
                    />
                </div>
            )}
            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
            <button onClick={handleClose} type="button" className="py-2 px-4 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button onClick={handleSubmit} type="button" className="py-2 px-5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors">Submit Report</button>
        </div>
      </div>
    </div>
  );
};

export default ReportAdModal;
