
import React, { useMemo } from 'react';
import { Feedback } from '../types';
import { PositiveIcon, NegativeIcon, NeutralIcon } from './icons/FeedbackIcons';

interface FeedbackAnalysisProps {
  feedback: Feedback[];
  isLoading: boolean;
}

const FeedbackAnalysis: React.FC<FeedbackAnalysisProps> = ({ feedback, isLoading }) => {

    const sentimentCounts = useMemo(() => {
        return feedback.reduce((acc, f) => {
            acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [feedback]);

    const totalFeedback = feedback.length;
    const positivePercentage = totalFeedback > 0 ? (sentimentCounts['Positive'] || 0) / totalFeedback * 100 : 0;
    const neutralPercentage = totalFeedback > 0 ? (sentimentCounts['Neutral'] || 0) / totalFeedback * 100 : 0;
    const negativePercentage = totalFeedback > 0 ? (sentimentCounts['Negative'] || 0) / totalFeedback * 100 : 0;
    
    const getSentimentPill = (sentiment: 'Positive' | 'Negative' | 'Neutral') => {
        const styles = {
            Positive: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
            Negative: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
            Neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        };
        const icons = {
            Positive: <PositiveIcon />,
            Negative: <NegativeIcon />,
            Neutral: <NeutralIcon />,
        };
        return (
            <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${styles[sentiment]}`}>
                {icons[sentiment]}
                <span>{sentiment}</span>
            </span>
        );
    }
    
    if (isLoading) {
        return (
            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-center">
                 <p className="text-slate-500 dark:text-slate-400">Loading feedback...</p>
            </div>
        )
    }

    return (
        <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Feedback Analysis</h2>
            
            {totalFeedback === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No feedback has been submitted for this ad yet.</p>
            ) : (
                <>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Overall Sentiment</h3>
                        <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                            <div className="bg-green-500" style={{ width: `${positivePercentage}%` }} title={`Positive: ${positivePercentage.toFixed(1)}%`}></div>
                            <div className="bg-slate-400" style={{ width: `${neutralPercentage}%` }} title={`Neutral: ${neutralPercentage.toFixed(1)}%`}></div>
                            <div className="bg-red-500" style={{ width: `${negativePercentage}%` }} title={`Negative: ${negativePercentage.toFixed(1)}%`}></div>
                        </div>
                         <div className="flex justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>Positive ({sentimentCounts['Positive'] || 0})</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>Neutral ({sentimentCounts['Neutral'] || 0})</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>Negative ({sentimentCounts['Negative'] || 0})</span>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">All Reviews ({totalFeedback})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {feedback.map(f => (
                                <div key={f.id} className="bg-white dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700/80">
                                    <div className="flex justify-between items-center mb-2">
                                        {getSentimentPill(f.sentiment)}
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(f.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold italic text-slate-600 dark:text-slate-300 mb-2">"{f.summary}"</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
                                    <div className="text-xs text-amber-500 mt-2">Rating: {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FeedbackAnalysis;
