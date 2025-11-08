import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818CF8" /> 
                <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#logoGradient)"/>
        <path d="M12 22V10L23 16L12 22Z" fill="white"/>
        <path d="M12 10L18 13.5L12 17V10Z" fill="white" fillOpacity="0.5" />
    </svg>
);
