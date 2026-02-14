import React, { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';

interface RecordingIndicatorProps {
    isRecording: boolean;
}

export function RecordingIndicator({ isRecording }: RecordingIndicatorProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!isRecording) {
            setElapsed(0);
            return;
        }

        const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(interval);
    }, [isRecording]);

    if (!isRecording) return null;

    const mins = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium animate-pulse">
            <Circle className="h-2.5 w-2.5 fill-current" />
            <span>REC</span>
            <span className="font-mono">{mins}:{secs}</span>
        </div>
    );
}
