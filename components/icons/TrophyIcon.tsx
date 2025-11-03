
import React from 'react';

interface IconProps {
    className?: string;
}

export const TrophyIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20l4-2V8l-4 2-4-2-4 2-4-2v10l4 2 4-2 4 2zM17 8V4a2 2 0 00-2-2H9a2 2 0 00-2 2v4M9 12V8m6 4V8" />
    </svg>
);
