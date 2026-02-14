import React from 'react';

export interface AvatarConfig {
    base: 'boy' | 'girl' | 'neutral';
    skinColor: string;
    clothingColor: string;
    headwearColor: string;
    accessory: 'none' | 'glasses' | 'book' | 'tasbih';
}

interface StudentAvatarProps {
    config?: AvatarConfig;
    size?: number;
    className?: string;
}

export function StudentAvatar({ config, size = 120, className = "" }: StudentAvatarProps) {
    // Default config if none provided
    const avatar = config || {
        base: 'neutral',
        skinColor: '#f3d6b1',
        clothingColor: '#2563eb',
        headwearColor: '#ffffff',
        accessory: 'none'
    };

    const viewBoxSize = 200;
    const scale = size / viewBoxSize;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className={`rounded-full shadow-inner bg-muted/20 ${className}`}
        >
            {/* Background Circle */}
            <circle cx="100" cy="100" r="95" fill="white" stroke="#e2e8f0" strokeWidth="2" />

            {/* Clothing/Shoulders */}
            <path
                d="M40 180 C40 140 60 130 100 130 C140 130 160 140 160 180 L160 200 L40 200 Z"
                fill={avatar.clothingColor}
            />

            {/* Neck */}
            <rect x="85" y="120" width="30" height="20" fill={avatar.skinColor} filter="brightness(0.9)" />

            {/* Face/Head */}
            <circle cx="100" cy="85" r="45" fill={avatar.skinColor} />

            {/* Eyes */}
            <circle cx="85" cy="85" r="4" fill="#333" />
            <circle cx="115" cy="85" r="4" fill="#333" />

            {/* Smile */}
            <path d="M85 105 Q100 115 115 105" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />

            {/* Headwear */}
            {avatar.base === 'boy' && (
                <path d="M55 75 Q100 45 145 75 L145 85 Q100 75 55 85 Z" fill={avatar.headwearColor} stroke="#e2e8f0" strokeWidth="1" />
            )}

            {avatar.base === 'girl' && (
                <path d="M50 70 Q100 30 150 70 L160 140 Q100 150 40 140 Z" fill={avatar.headwearColor} stroke="#e2e8f0" strokeWidth="1" opacity="0.9" />
            )}

            {/* Accessories */}
            {avatar.accessory === 'glasses' && (
                <g fill="none" stroke="#333" strokeWidth="1.5">
                    <circle cx="85" cy="85" r="8" />
                    <circle cx="115" cy="85" r="8" />
                    <line x1="93" y1="85" x2="107" y2="85" />
                    <line x1="77" y1="85" x2="70" y2="85" />
                    <line x1="123" y1="85" x2="130" y2="85" />
                </g>
            )}

            {avatar.accessory === 'book' && (
                <g transform="translate(130, 140) rotate(15)">
                    <rect width="40" height="30" rx="2" fill="#d97706" />
                    <rect x="5" y="2" width="30" height="26" fill="white" opacity="0.8" />
                    <line x1="10" y1="8" x2="30" y2="8" stroke="#333" strokeWidth="1" />
                    <line x1="10" y1="15" x2="30" y2="15" stroke="#333" strokeWidth="1" />
                    <line x1="10" y1="22" x2="25" y2="22" stroke="#333" strokeWidth="1" />
                </g>
            )}
        </svg>
    );
}
