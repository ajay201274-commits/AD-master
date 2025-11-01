import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ad, AdType } from '../types';
import { isVideoFile } from '../utils/helpers';
import ImageViewerModal from './ImageViewerModal';
import { ZoomInIcon } from './icons/ZoomInIcon';

interface AdViewerModalProps {
  ad: Ad;
  onClose: () => void;
  onComplete: (adId: string, reward: number) => void;
}

const AdViewerModal: React.FC<AdViewerModalProps> = ({ ad, onClose, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 100 / ad.duration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad.duration]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  }, [onClose]);

  const handleComplete = useCallback(() => {
    onComplete(ad.id, ad.reward);
    handleClose();
  }, [ad.id, ad.reward, onComplete, handleClose]);

  const handleFullScreen = () => {
    if (contentRef.current) {
      if (!document.fullscreenElement) {
        contentRef.current.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
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
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{ad.title}</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={contentRef} className="relative aspect-video bg-black flex-grow overflow-hidden">
          {ad.type === AdType.VIDEO ? (
             ad.contentUrl ? (
                isVideoFile(ad.contentUrl) ? (
                    <video
                        src={ad.contentUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                        loop
                        title={ad.title}
                    />
                ) : (
                    <iframe
                        src={ad.contentUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={ad.title}
                    ></iframe>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex-col p-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 3.75 16.5 16.5" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Video Unavailable</h3>
                  <p>The content for this advertisement could not be loaded.</p>
                </div>
              )
          ) : (
             <div className="w-full h-full object-contain relative group" onClick={() => setIsImageViewerOpen(true)}>
                <img src={ad.contentUrl} alt={ad.title} className="w-full h-full object-contain cursor-zoom-in" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in">
                    <ZoomInIcon className="w-16 h-16 text-white" />
                </div>
            </div>
          )}
           {ad.type === AdType.VIDEO && (
                <button 
                    onClick={handleFullScreen}
                    className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-opacity z-10"
                    aria-label="Toggle Fullscreen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
                    </svg>
                </button>
           )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80">
          <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5 mb-4">
            <div
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            onClick={handleComplete}
            disabled={progress < 100}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/50"
          >
            {progress < 100 ? `Please wait... (${Math.ceil(ad.duration - (ad.duration * progress) / 100)}s)` : `Claim Reward +₹${ad.reward.toFixed(2)}`}
          </button>
        </div>
      </div>
      {isImageViewerOpen && (
        <ImageViewerModal
          imageUrl={ad.contentUrl}
          altText={ad.title}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default AdViewerModal;