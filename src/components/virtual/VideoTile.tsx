import React, { useRef, useEffect } from 'react';

interface VideoTileProps {
    stream: MediaStream | null;
    label: string;
    role: 'teacher' | 'student';
    isMuted?: boolean;
    isCameraOff?: boolean;
    isSelf?: boolean;
}

export function VideoTile({
    stream,
    label,
    role,
    isMuted,
    isCameraOff,
    isSelf = false,
}: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const roleBadgeColor =
        role === 'teacher'
            ? 'bg-emerald-600 text-white'
            : 'bg-sky-600 text-white';

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 shadow-raised">
            {stream && !isCameraOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isSelf}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-400">
                            {label.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom bar overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor}`}>
                        {role}
                    </span>
                    <span className="text-white text-sm font-medium truncate">
                        {label} {isSelf && '(You)'}
                    </span>
                    {isMuted && (
                        <span className="ml-auto text-red-400 text-xs">🔇 Muted</span>
                    )}
                </div>
            </div>
        </div>
    );
}
