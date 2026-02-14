import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Mic, Shield } from 'lucide-react';

interface PreJoinModalProps {
    isTeacher: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function PreJoinModal({
    isTeacher,
    onConfirm,
    onCancel,
}: PreJoinModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border rounded-2xl shadow-lg max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">
                        {isTeacher ? 'Start Class Session' : 'Join Class Session'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isTeacher
                            ? 'You are about to start a live session. Your student will be notified.'
                            : 'You are about to join a live session with your teacher.'}
                    </p>
                </div>

                {/* Info */}
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <Mic className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>
                            Your microphone and camera will be enabled. You can toggle them
                            during the session.
                        </span>
                    </div>
                    <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>
                            Chat messages are monitored. Sharing personal contact information
                            is not allowed.
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button className="flex-1" onClick={onConfirm}>
                        {isTeacher ? 'Start Session' : 'Join Session'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
