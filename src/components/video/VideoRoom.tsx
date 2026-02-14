import React, { useState, useEffect, useRef } from 'react';
import { VideoTile } from './VideoTile';
import { CallControls } from './CallControls';
import { ClassTimer } from './ClassTimer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useVideoCall, CallState } from '@/hooks/useVideoCall';
import type { Student } from '@/types/database';
import { cn } from '@/lib/utils';
import { SharedQuranViewer } from './SharedQuranViewer';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export interface QuranSyncState {
  activeSurahId: number;
  activeVerse: number;
  scrollOffset: number;
}

interface VideoRoomProps {
  classId: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  student?: Student;
  onCallEnd?: () => void;
  autoStart?: boolean;
  isObserver?: boolean;
}

export function VideoRoom({
  classId,
  teacherId,
  studentId,
  teacherName,
  student,
  onCallEnd,
  autoStart = false,
  isObserver = false,
}: VideoRoomProps) {
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
    startCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useVideoCall({
    classId,
    teacherId,
    studentId,
    teacherName,
    onCallEnd,
    isObserver,
  });

  // Auto-start call if specified
  useEffect(() => {
    if (autoStart && callState === 'idle') {
      startCall();
    }
  }, [autoStart, callState, startCall]);

  // Set up Realtime Sync for Classroom
  useEffect(() => {
    const channel = supabaseClient.channel(`classroom:${classId}`);

    channel
      .on('broadcast', { event: 'quran_sync' }, ({ payload }) => {
        // As teacher, we usually broadcast, but we might receive if multiple teachers?
        // For now, teacher is the source of truth.
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [classId]);

  const handleSyncUpdate = (update: Partial<QuranSyncState>) => {
    const newState = { ...syncState, ...update };
    setSyncState(newState);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'quran_sync',
        payload: newState
      });
    }
  };

  // Set call start time when connected

  const renderCallState = () => {
    switch (callState) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Start</h2>
              <p className="text-muted-foreground">
                Click the button below to start the video call with {student?.full_name || 'your student'}
              </p>
            </div>
            <Button size="lg" onClick={startCall}>
              Start Video Call
            </Button>
          </div>
        );

      case 'creating':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">Creating Room...</h2>
              <p className="text-muted-foreground">Setting up the video connection</p>
            </div>
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
            <Button onClick={startCall}>Try Again</Button>
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
            fallbackName={teacherName}
          />
          <div className="flex flex-col gap-2">
            <ClassTimer startTime={callStartTime || undefined} />
            <CallControls
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              isMinimized={isMinimized}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onEndCall={endCall}
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
          {isObserver && (
            <Badge variant="destructive" className="animate-pulse">
              Observation Mode
            </Badge>
          )}
          <span className="font-medium">
            {student?.full_name || 'Student'}
          </span>
          {student?.course_level && (
            <Badge variant="secondary">{student.course_level}</Badge>
          )}
        </div>
        <ClassTimer startTime={callStartTime || undefined} />
      </div>

      {/* Split View: Video + Quran */}
      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-4 min-h-0 bg-background/50">
        {/* Left Side: Shared Quran (Teacher Controls) */}
        <div className="flex-1 h-full min-h-[400px]">
          <SharedQuranViewer
            isTeacher={true}
            activeSurahId={syncState.activeSurahId}
            activeVerse={syncState.activeVerse}
            scrollOffset={syncState.scrollOffset}
            onSyncUpdate={handleSyncUpdate}
          />
        </div>

        {/* Right Side: Participant Videos */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Local participant (teacher) */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
            <VideoTile
              participant={localParticipant}
              isLocal
              fallbackName={teacherName}
              className="h-full"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase">
              You (Teacher)
            </div>
          </div>

          {/* Remote participant (student) */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border shadow-inner">
            {remoteParticipant ? (
              <VideoTile
                participant={remoteParticipant}
                fallbackName={student?.full_name || 'Student'}
                fallbackAvatar={student?.avatar_url || undefined}
                className="h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground bg-muted/30">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for student...</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase">
              Student
            </div>
          </div>

          {/* In-call Stats/Tools */}
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                <span>STRENGTH</span>
                <div className="flex gap-0.5">
                  <div className="h-2 w-1 bg-primary rounded-full" />
                  <div className="h-2 w-1 bg-primary rounded-full" />
                  <div className="h-2 w-1 bg-primary rounded-full" />
                  <div className="h-2 w-1 bg-muted rounded-full" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold border-primary/10 hover:bg-primary/10">
                Open Chat
              </Button>
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
          onEndCall={endCall}
          onToggleMinimize={() => setIsMinimized(true)}
        />
      </div>
    </div>
  );
}
