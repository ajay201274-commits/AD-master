import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
        <path d="M22 16L12 22V10L22 16Z" fill="white"/>
    </svg>
);
