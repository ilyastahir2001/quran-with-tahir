import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Circle, StopCircle,
} from 'lucide-react';

interface VideoControlsProps {
    isMuted: boolean;
    isCameraOff: boolean;
    isRecording: boolean;
    isTeacher: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onLeave: () => void;
}

export function VideoControls({
    isMuted,
    isCameraOff,
    isRecording,
    isTeacher,
    onToggleMute,
    onToggleCamera,
    onStartRecording,
    onStopRecording,
    onLeave,
}: VideoControlsProps) {
    return (
        <div className="flex items-center justify-center gap-3 p-3 bg-card rounded-xl border shadow-subtle">
            {/* Mic */}
            <Button
                variant={isMuted ? 'destructive' : 'outline'}
                size="icon"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Camera */}
            <Button
                variant={isCameraOff ? 'destructive' : 'outline'}
                size="icon"
                onClick={onToggleCamera}
                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
                {isCameraOff ? (
                    <VideoOff className="h-4 w-4" />
                ) : (
                    <Video className="h-4 w-4" />
                )}
            </Button>

            {/* Recording (teacher only) */}
            {isTeacher && (
                <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                    {isRecording ? (
                        <StopCircle className="h-4 w-4" />
                    ) : (
                        <Circle className="h-4 w-4 text-red-500" />
                    )}
                </Button>
            )}

            {/* Leave */}
            <Button
                variant="destructive"
                size="icon"
                onClick={onLeave}
                title="Leave Session"
                className="ml-2"
            >
                <PhoneOff className="h-4 w-4" />
            </Button>
        </div>
    );
}
