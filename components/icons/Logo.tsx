import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#3730A3" />
            </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
        <path d="M10 22.5L10 9.5L12.5 9.5L19.5 16L12.5 22.5L10 22.5Z" fill="white"/>
        <path d="M23 9.5L16 16L23 22.5V9.5Z" fill="white" fillOpacity="0.7"/>
    </svg>
);