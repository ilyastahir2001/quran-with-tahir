import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVirtualClass } from '@/hooks/useVirtualClass';
import { classService } from '@/services/classService';

import { VideoTile } from '@/components/virtual/VideoTile';
import { VideoControls } from '@/components/virtual/VideoControls';
import { ConnectionStatusBadge } from '@/components/virtual/ConnectionStatus';
import { RecordingIndicator } from '@/components/virtual/RecordingIndicator';
import { ParticipantList } from '@/components/virtual/ParticipantList';
import { ChatBox } from '@/components/virtual/ChatBox';
import { Whiteboard } from '@/components/virtual/Whiteboard';
import { PreJoinModal } from '@/components/virtual/PreJoinModal';
import { JoinNotification } from '@/components/virtual/JoinNotification';

import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, MessageSquare, PenTool, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import type { UserRole } from '@/types/virtual';

type SidePanel = 'chat' | 'whiteboard' | 'participants' | null;

export default function VirtualClass() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { user, teacher, student, profile } = useAuth();

    // Determine role
    const role: UserRole = teacher ? 'teacher' : 'student';
    const isTeacher = role === 'teacher';
    const userName = profile?.full_name ?? user?.email ?? 'User';

    const vc = useVirtualClass({ classId, role });
    const [showPreJoin, setShowPreJoin] = useState(false);
    const [sidePanel, setSidePanel] = useState<SidePanel>(null);

    // ── Handlers ────────────────────────────────────

    const handleBack = () => {
        navigate(isTeacher ? '/teacher/today-classes' : '/student/today');
    };

    const handlePreJoinConfirm = async () => {
        setShowPreJoin(false);
        if (isTeacher) {
            await vc.startSession();
        } else if (vc.session) {
            await vc.joinSession(vc.session.id);
        }
    };

    const handleLeave = () => {
        vc.leaveSession();
        handleBack();
    };

    const handleSaveWhiteboard = useCallback(
        async (blob: Blob) => {
            if (!vc.session) return;
            await classService.saveWhiteboardSnapshot(vc.session.id, blob);
        },
        [vc.session],
    );

    const togglePanel = (panel: SidePanel) => {
        setSidePanel((prev) => (prev === panel ? null : panel));
    };

    // ── Guard: no class ID ──────────────────────────

    if (!classId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Class Not Found</h1>
                    <p className="text-muted-foreground">No class ID was provided.</p>
                    <Button onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            </div>
        );
    }

    // ── Guard: not authenticated ────────────────────

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Authentication Required</h1>
                    <p className="text-muted-foreground">
                        Please log in to access the virtual classroom.
                    </p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    // ── Pre-Join State ──────────────────────────────

    const isIdle = vc.connectionStatus === 'idle';
    const isConnected = vc.connectionStatus === 'connected';

    if (isIdle && !showPreJoin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Virtual Classroom</h1>
                    <p className="text-muted-foreground">
                        {isTeacher
                            ? 'Start a live session with your student. They will be able to join once you begin.'
                            : vc.session
                                ? 'Your teacher has started the session. Click below to join.'
                                : 'Waiting for your teacher to start the session.'}
                    </p>

                    {vc.error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {vc.error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {(isTeacher || vc.session) && (
                            <Button size="lg" onClick={() => setShowPreJoin(true)}>
                                {isTeacher ? 'Start Session' : 'Join Session'}
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </div>
                </div>

                {showPreJoin && (
                    <PreJoinModal
                        isTeacher={isTeacher}
                        onConfirm={handlePreJoinConfirm}
                        onCancel={() => setShowPreJoin(false)}
                    />
                )}
            </div>
        );
    }

    // ── Connected Session Layout ────────────────────

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <ConnectionStatusBadge status={vc.connectionStatus} />
                    <RecordingIndicator isRecording={vc.isRecording} />
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant={sidePanel === 'chat' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => togglePanel('chat')}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={sidePanel === 'whiteboard' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => togglePanel('whiteboard')}
                    >
                        <PenTool className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={sidePanel === 'participants' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => togglePanel('participants')}
                    >
                        <Users className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex min-h-0">
                {/* Video Grid */}
                <div className="flex-1 p-4 flex gap-4 min-w-0">
                    {/* Local Video */}
                    <div className="flex-1">
                        <VideoTile
                            stream={vc.localStream}
                            label={userName}
                            role={role}
                            isMuted={vc.isMuted}
                            isCameraOff={vc.isCameraOff}
                            isSelf
                        />
                    </div>

                    {/* Remote Video */}
                    <div className="flex-1">
                        <VideoTile
                            stream={vc.remoteStream}
                            label={vc.remoteParticipant?.identity ?? 'Waiting…'}
                            role={isTeacher ? 'student' : 'teacher'}
                            isMuted={vc.remoteParticipant?.isMuted}
                            isCameraOff={vc.remoteParticipant?.isCameraOff}
                        />
                    </div>
                </div>

                {/* Side Panel */}
                {sidePanel && (
                    <div className="w-80 border-l bg-card flex flex-col min-h-0">
                        {sidePanel === 'chat' && (
                            <ChatBox
                                messages={vc.chatMessages}
                                currentUserId={user.id}
                                onSend={vc.sendChatMessage}
                                disabled={!isConnected}
                            />
                        )}
                        {sidePanel === 'whiteboard' && (
                            <Whiteboard
                                isTeacher={isTeacher}
                                sessionId={vc.session?.id ?? ''}
                                onSaveSnapshot={handleSaveWhiteboard}
                            />
                        )}
                        {sidePanel === 'participants' && (
                            <div className="p-4">
                                <ParticipantList participants={vc.participants} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center py-3 border-t bg-card">
                <VideoControls
                    isMuted={vc.isMuted}
                    isCameraOff={vc.isCameraOff}
                    isRecording={vc.isRecording}
                    isTeacher={isTeacher}
                    onToggleMute={vc.toggleMute}
                    onToggleCamera={vc.toggleCamera}
                    onStartRecording={vc.startRecording}
                    onStopRecording={vc.stopRecording}
                    onLeave={handleLeave}
                />
            </div>

            {/* Notifications */}
            {vc.joinNotification && (
                <JoinNotification
                    name={vc.joinNotification.name}
                    role={vc.joinNotification.role}
                />
            )}

            {/* Error toast */}
            {vc.error && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg">
                    {vc.error}
                </div>
            )}

            {/* Pre-join modal if triggered while connecting */}
            {showPreJoin && (
                <PreJoinModal
                    isTeacher={isTeacher}
                    onConfirm={handlePreJoinConfirm}
                    onCancel={() => setShowPreJoin(false)}
                />
            )}
        </div>
    );
}
