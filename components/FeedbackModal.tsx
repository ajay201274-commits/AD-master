

import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Ad, Feedback, Sentiment } from '../types';
import { ErrorIcon } from './icons/ErrorIcon';
import { SparklesIcon } from './icons/AIIcons';

interface FeedbackModalProps {
  ad: Ad;
  onClose: () => void;
  onSave: (feedback: Omit<Feedback, 'id'>) => void;
}

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const FeedbackModal: React.FC<FeedbackModalProps> = ({ ad, onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(ad.rating || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if(isLoading) return;
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose, isLoading]);

  const handleSubmit = async () => {
    if (!reviewText.trim() || rating === 0) {
      setError('Please provide a rating and a written review.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Analyze the following user review for an advertisement. Provide the sentiment (choose from "Positive", "Negative", or "Neutral") and a concise one-sentence summary.
        
        Review: "${reviewText}"
        
        Return the response as a valid JSON object with the keys "sentiment" and "summary".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] },
                        summary: { type: Type.STRING },
                    },
                    required: ["sentiment", "summary"],
                },
            },
        });
        
        const analysis = JSON.parse(response.text);

        const newFeedback: Omit<Feedback, 'id'> = {
            adId: ad.id,
            userId: 'user-123', // Mocked user
            rating: rating,
            text: reviewText,
            sentiment: analysis.sentiment as Sentiment,
            summary: analysis.summary,
            date: new Date().toISOString()
        };

        onSave(newFeedback);

    } catch (err) {
        console.error('Feedback analysis error:', err);
        setError('Sorry, we could not process your feedback at this time. Please try again.');
        setIsLoading(false);
    }
  };
  
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
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leave Feedback</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
                <img src={ad.thumbnailUrl} alt={ad.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{ad.title}</h3>
            </div>
            
            <div>
                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Your Rating</label>
                {/* Star rating component could go here if needed, or use the one from AdDetail */}
                <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-2.5" />
            </div>

            <div>
                 <label htmlFor="reviewText" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Your Review</label>
                <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500"
                    placeholder="What did you think of this ad?"
                    disabled={isLoading}
                />
            </div>
            {error && <div className="flex items-center text-red-500 dark:text-red-400 text-sm mt-1" role="alert"><ErrorIcon className="w-4 h-4 mr-1.5 flex-shrink-0" /><span>{error}</span></div>}
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 flex justify-between items-center rounded-b-xl">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <SparklesIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Summary & Sentiment by Gemini</span>
            </div>
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-40"
            >
                {isLoading ? <SpinnerIcon /> : 'Submit Feedback'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;