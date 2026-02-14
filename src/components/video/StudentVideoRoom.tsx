import React, { useState, useEffect, useRef } from 'react';
import { VideoTile } from './VideoTile';
import { CallControls } from './CallControls';
import { ClassTimer } from './ClassTimer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, Loader2, AlertCircle } from 'lucide-react';
import { useStudentVideoCall, StudentCallState } from '@/hooks/useStudentVideoCall';
import { cn } from '@/lib/utils';
import { SharedQuranViewer } from './SharedQuranViewer';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { QuranSyncState } from './VideoRoom';

interface TeacherInfo {
  name: string;
  avatar_url?: string;
  course_level?: string;
}

interface StudentVideoRoomProps {
  classId: string;
  studentId: string;
  studentName: string;
  roomUrl: string | null;
  teacher?: TeacherInfo;
  onCallEnd?: () => void;
  autoJoin?: boolean;
}

export function StudentVideoRoom({
  classId,
  studentId,
  studentName,
  roomUrl,
  teacher,
  onCallEnd,
  autoJoin = false,
}: StudentVideoRoomProps) {
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [syncState, setSyncState] = useState<QuranSyncState>({
    activeSurahId: 1,
    activeVerse: 1,
    scrollOffset: 0
  });

  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  const {
    callState,
    localParticipant,
    remoteParticipant,
    isMicOn,
    isCameraOn,
    error,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCamera,
  } = useStudentVideoCall({
    classId,
    studentId,
    studentName,
    roomUrl,
    onCallEnd,
  });

  // Set up Realtime Sync for Classroom (Listener)
  useEffect(() => {
    const channel = supabaseClient.channel(`classroom:${classId}`);

    channel
      .on('broadcast', { event: 'quran_sync' }, ({ payload }) => {
        setSyncState(payload);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [classId]);

  // Auto-join if specified
  useEffect(() => {
    if (autoJoin && callState === 'idle' && roomUrl) {
      joinCall();
    }
  }, [autoJoin, callState, roomUrl, joinCall]);

  // Set call start time when connected
  useEffect(() => {
    if (callState === 'connected' && !callStartTime) {
      setCallStartTime(new Date());
    }
  }, [callState, callStartTime]);

  const renderCallState = () => {
    switch (callState) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Join</h2>
              <p className="text-muted-foreground">
                Click the button below to join the video call with {teacher?.name || 'your teacher'}
              </p>
            </div>
            <Button size="lg" onClick={joinCall} disabled={!roomUrl}>
              Join Video Call
            </Button>
            {!roomUrl && (
              <p className="text-sm text-muted-foreground">
                Waiting for teacher to start the call...
              </p>
            )}
          </div>
        );

      case 'joining':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">Joining Call...</h2>
              <p className="text-muted-foreground">Connecting to the video room</p>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-destructive">Connection Failed</h2>
              <p className="text-muted-foreground max-w-md">
                {error || 'Unable to connect to the video call. Please check your internet connection and try again.'}
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg max-w-md">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check your internet connection</li>
                <li>Allow camera and microphone permissions</li>
                <li>Try refreshing the page</li>
                <li>Close other video call applications</li>
              </ul>
            </div>
            <Button onClick={joinCall} disabled={!roomUrl}>Try Again</Button>
          </div>
        );

      case 'ended':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Call Ended</h2>
              <p className="text-muted-foreground">The video call has ended</p>
            </div>
          </div>
        );

      case 'connected':
        return null; // Will show the video interface

      default:
        return null;
    }
  };

  if (callState !== 'connected') {
    return (
      <div className="w-full h-full min-h-[400px] bg-background rounded-xl border">
        {renderCallState()}
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-xl shadow-lg p-3">
        <div className="flex items-center gap-3">
          <VideoTile
            participant={localParticipant}
            isLocal
            isMini
            fallbackName={studentName}
          />
          <div className="flex flex-col gap-2">
            <ClassTimer startTime={callStartTime || undefined} />
            <CallControls
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              isMinimized={isMinimized}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onEndCall={leaveCall}
              onToggleMinimize={() => setIsMinimized(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Wifi className="h-3 w-3 mr-1" />
            Live
          </Badge>
          <span className="font-medium">
            {teacher?.name || 'Teacher'}
          </span>
          {teacher?.course_level && (
            <Badge variant="secondary">{teacher.course_level}</Badge>
          )}
        </div>
        <ClassTimer startTime={callStartTime || undefined} />
      </div>

      {/* Split View: Video + Quran */}
      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-4 min-h-0 bg-background/50">
        {/* Left Side: Shared Quran (View Only) */}
        <div className="flex-1 h-full min-h-[400px]">
          <SharedQuranViewer
            isTeacher={false}
            activeSurahId={syncState.activeSurahId}
            activeVerse={syncState.activeVerse}
            scrollOffset={syncState.scrollOffset}
          />
        </div>

        {/* Right Side: Participant Videos */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Remote participant (teacher) - main feed */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
            {remoteParticipant ? (
              <VideoTile
                participant={remoteParticipant}
                fallbackName={teacher?.name || 'Teacher'}
                fallbackAvatar={teacher?.avatar_url}
                className="h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground bg-muted/30">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for teacher...</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase">
              Teacher
            </div>
          </div>

          {/* Local participant (student) */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border shadow-inner">
            <VideoTile
              participant={localParticipant}
              isLocal
              fallbackName={studentName}
              className="h-full"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase">
              You
            </div>
          </div>

          {/* Session Info */}
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                  <span>CONNECTION</span>
                  <span className="text-green-500">EXCELLENT</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your view is automatically synced with your teacher's progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div
        className="px-4 py-4 border-t bg-muted/50"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <CallControls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          isMinimized={isMinimized}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onEndCall={leaveCall}
          onToggleMinimize={() => setIsMinimized(true)}
        />
      </div>
    </div>
  );
}
