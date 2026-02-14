// useVirtualClass — central hook for the 1-to-1 virtual classroom
//
// Manages: video provider, chat (Supabase Realtime), recording, session
// lifecycle, mic/camera toggles, reconnection, and participant tracking.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { classService } from '@/services/classService';
import { getVideoProvider } from '@/integrations/videoProviders';
import { playJoinSound, playLeaveSound } from '@/lib/notificationSound';
import type {
  UserRole,
  ConnectionStatus,
  ClassSession,
  SessionChat,
  SessionParticipant,
  VideoProviderAdapter,
  VideoParticipantInfo,
} from '@/types/virtual';

export interface UseVirtualClassOptions {
  classId: string | undefined;
  role: UserRole;
}

export interface UseVirtualClassReturn {
  // State
  connectionStatus: ConnectionStatus;
  session: ClassSession | null;
  participants: SessionParticipant[];
  chatMessages: SessionChat[];
  isMuted: boolean;
  isCameraOff: boolean;
  isRecording: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteParticipant: VideoParticipantInfo | null;
  joinNotification: { name: string; role: string } | null;
  error: string | null;

  // Actions
  startSession: () => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
}

export function useVirtualClass({
  classId,
  role,
}: UseVirtualClassOptions): UseVirtualClassReturn {
  const { user } = useAuth();

  // ── State ───────────────────────────────────────
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [session, setSession] = useState<ClassSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<SessionChat[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<VideoParticipantInfo | null>(null);
  const [joinNotification, setJoinNotification] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<VideoProviderAdapter | null>(null);
  const joinNotifTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Video Provider Setup ────────────────────────

  const connectToRoom = useCallback(
    async (url: string, token: string) => {
      try {
        setConnectionStatus('connecting');
        const provider = getVideoProvider();
        providerRef.current = provider;

        // Wire up events
        provider.on('connectionStateChanged', setConnectionStatus);

        provider.on('participantJoined', (p: VideoParticipantInfo) => {
          setRemoteParticipant(p);
          playJoinSound();
          setJoinNotification({ name: p.identity, role: 'participant' });
          clearTimeout(joinNotifTimerRef.current);
          joinNotifTimerRef.current = setTimeout(
            () => setJoinNotification(null),
            4000,
          );
        });

        provider.on('participantLeft', () => {
          setRemoteParticipant(null);
          setRemoteStream(null);
          playLeaveSound();
        });

        provider.on('trackSubscribed', (track) => {
          if (track.kind === 'video' && track.stream) {
            setRemoteStream(track.stream);
          }
        });

        provider.on('trackUnsubscribed', (track) => {
          if (track.kind === 'video') {
            setRemoteStream(null);
          }
        });

        await provider.connect(url, token);
        setConnectionStatus('connected');

        // Grab local stream
        const ls = provider.getLocalVideoStream();
        setLocalStream(ls);
      } catch (err) {
        setConnectionStatus('failed');
        setError(
          err instanceof Error ? err.message : 'Failed to connect to room',
        );
      }
    },
    [],
  );

  // ── Session Lifecycle ───────────────────────────

  const startSession = useCallback(async () => {
    if (!classId) return;
    try {
      setError(null);
      const res = await classService.createSession({ class_id: classId });
      setSession({
        id: res.session_id,
        class_id: classId,
        status: 'live',
        livekit_room_name: res.room_name,
        recording_url: null,
        whiteboard_snapshot_url: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
      });
      await connectToRoom(res.livekit_url, res.livekit_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  }, [classId, connectToRoom]);

  const joinSessionAction = useCallback(
    async (sessionId: string) => {
      try {
        setError(null);
        const res = await classService.joinSession({ session_id: sessionId });
        setSession(res.session);
        await connectToRoom(res.livekit_url, res.livekit_token);

        // Load existing chat
        const chats = await classService.getChatHistory(sessionId);
        setChatMessages(chats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join session');
      }
    },
    [connectToRoom],
  );

  const leaveSession = useCallback(() => {
    providerRef.current?.disconnect();
    setConnectionStatus('disconnected');
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteParticipant(null);
  }, []);

  // ── Media Toggles ──────────────────────────────

  const toggleMute = useCallback(async () => {
    const newVal = !isMuted;
    await providerRef.current?.setMicEnabled(!newVal);
    setIsMuted(newVal);
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    const newVal = !isCameraOff;
    await providerRef.current?.setCameraEnabled(!newVal);
    setIsCameraOff(newVal);
    if (!newVal) {
      const ls = providerRef.current?.getLocalVideoStream() ?? null;
      setLocalStream(ls);
    }
  }, [isCameraOff]);

  // ── Recording ──────────────────────────────────

  const startRecordingAction = useCallback(async () => {
    if (!session) return;
    try {
      await classService.startRecording({ session_id: session.id });
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [session]);

  const stopRecordingAction = useCallback(async () => {
    if (!session) return;
    try {
      await classService.stopRecording({ session_id: session.id });
      setIsRecording(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  }, [session]);

  // ── Chat ───────────────────────────────────────

  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!session) return;
      try {
        const res = await classService.sendMessage({
          session_id: session.id,
          message,
        });
        // Add to local state immediately (optimistic)
        setChatMessages((prev) => [...prev, res.chat]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [session],
  );

  // ── Realtime Chat Subscription ─────────────────

  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-chat:${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_chats',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const newChat = payload.new as SessionChat;
          // Avoid duplicates (optimistic update already added it if we sent it)
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newChat.id)) return prev;
            return [...prev, newChat];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // ── Load active session on mount ───────────────

  useEffect(() => {
    if (!classId) return;

    classService.getActiveSession(classId).then((activeSession) => {
      if (activeSession) {
        setSession(activeSession);
      }
    });
  }, [classId]);

  // ── Cleanup ────────────────────────────────────

  useEffect(() => {
    return () => {
      providerRef.current?.disconnect();
      clearTimeout(joinNotifTimerRef.current);
    };
  }, []);

  return {
    connectionStatus,
    session,
    participants,
    chatMessages,
    isMuted,
    isCameraOff,
    isRecording,
    localStream,
    remoteStream,
    remoteParticipant,
    joinNotification,
    error,
    startSession,
    joinSession: joinSessionAction,
    leaveSession,
    toggleMute,
    toggleCamera,
    startRecording: startRecordingAction,
    stopRecording: stopRecordingAction,
    sendChatMessage,
  };
}
