import React, { useState, useCallback } from 'react';

interface ImageViewerModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, altText, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  }, [onClose]);

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95' 
    : 'opacity-100 scale-100';

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-60 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${altText} poster view`}
    >
      <div
        className={`relative max-w-[90vw] max-h-[90vh] transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt={altText} className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        <button 
          onClick={handleClose} 
          className="absolute -top-3 -right-3 md:-top-4 md:-right-4 p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
          aria-label="Close image viewer"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageViewerModal;