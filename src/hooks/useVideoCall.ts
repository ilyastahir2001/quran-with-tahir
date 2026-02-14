import { useState, useCallback, useEffect, useRef } from 'react';
import DailyIframe, { DailyCall, DailyParticipant, DailyEventObjectParticipant, DailyEventObjectFatalError, DailyEventObjectCameraError } from '@daily-co/daily-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type CallState = 'idle' | 'creating' | 'joining' | 'connected' | 'ended' | 'failed';

interface UseVideoCallOptions {
  classId: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  onCallEnd?: () => void;
  isObserver?: boolean;
}

interface VideoCallState {
  callState: CallState;
  roomUrl: string | null;
  roomId: string | null;
  callObject: DailyCall | null;
  localParticipant: DailyParticipant | null;
  remoteParticipant: DailyParticipant | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  error: string | null;
}

export function useVideoCall({
  classId,
  teacherId,
  studentId,
  teacherName,
  onCallEnd,
  isObserver = false,
}: UseVideoCallOptions) {
  const queryClient = useQueryClient();
  const callObjectRef = useRef<DailyCall | null>(null);

  const [state, setState] = useState<VideoCallState>({
    callState: 'idle',
    roomUrl: null,
    roomId: null,
    callObject: null,
    localParticipant: null,
    remoteParticipant: null,
    isMicOn: !isObserver,
    isCameraOn: !isObserver,
    error: null,
  });

  const logCallEvent = useCallback(async (
    event: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'failed' | 'connected' | 'disconnected' | 'timeout',
    extraMetadata?: Record<string, unknown>
  ) => {
    try {
      await supabase.from('call_logs').insert({
        class_id: classId,
        teacher_id: teacherId,
        student_id: studentId,
        event: event,
        room_id: state.roomId || null,
        room_url: state.roomUrl || null,
        metadata: {
          ...extraMetadata
        } as Json,
      });
    } catch (error) {
      console.error('Failed to log call event:', error);
    }
  }, [classId, teacherId, studentId, state.roomId, state.roomUrl]);

  const createRoom = useCallback(async () => {
    setState(prev => ({ ...prev, callState: 'creating', error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: {
          class_id: classId,
          teacher_id: teacherId,
          student_id: studentId,
        },
      });

      if (error) {
        console.error('create-video-room Edge Function failed:', {
          message: error.message,
          name: error.name,
          details: error
        });
        throw error;
      }

      setState(prev => ({
        ...prev,
        roomUrl: data.room_url,
        roomId: data.room_id,
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setState(prev => ({ ...prev, callState: 'failed', error: errorMessage }));
      await logCallEvent('failed', { error: errorMessage });
      throw error;
    }
  }, [classId, teacherId, studentId, logCallEvent]);

  const joinCall = useCallback(async (roomUrl: string) => {
    setState(prev => ({ ...prev, callState: 'joining' }));

    try {
      const callObject = DailyIframe.createCallObject({
        url: roomUrl,
        userName: isObserver ? `${teacherName} (Observer)` : teacherName,
      });



      callObjectRef.current = callObject;

      // Set up event listeners
      callObject.on('joined-meeting', () => {
        setState(prev => ({ ...prev, callState: 'connected' }));
        logCallEvent('connected');
        toast.success('Connected to video room');
      });

      callObject.on('participant-joined', (event: DailyEventObjectParticipant | undefined) => {
        if (event?.participant && !event.participant.local) {
          setState(prev => ({ ...prev, remoteParticipant: event.participant }));
          toast.success('Student has joined the call');
        }
      });

      callObject.on('participant-left', () => {
        setState(prev => ({ ...prev, remoteParticipant: null }));
        toast.info('Student has left the call');
      });

      callObject.on('participant-updated', (event: DailyEventObjectParticipant | undefined) => {
        if (event?.participant) {
          if (event.participant.local) {
            setState(prev => ({ ...prev, localParticipant: event.participant }));
          } else {
            setState(prev => ({ ...prev, remoteParticipant: event.participant }));
          }
        }
      });

      callObject.on('error', (event: DailyEventObjectFatalError | undefined) => {
        console.error('Daily.co error:', event);
        setState(prev => ({
          ...prev,
          callState: 'failed',
          error: event?.errorMsg || 'Connection error'
        }));
        logCallEvent('failed', { error: event?.errorMsg });
      });

      callObject.on('camera-error', (event: DailyEventObjectCameraError | undefined) => {
        toast.error('Camera/microphone access denied. Please check your browser permissions.');
        console.error('Camera error:', event);
      });

      callObject.on('left-meeting', () => {
        setState(prev => ({ ...prev, callState: 'ended' }));
        logCallEvent('disconnected');
      });

      await callObject.join();

      // Get local participant
      const participants = callObject.participants();
      setState(prev => ({
        ...prev,
        callObject,
        localParticipant: participants.local || null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join call';
      setState(prev => ({ ...prev, callState: 'failed', error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [teacherName, logCallEvent, isObserver]);

  const startCall = useCallback(async () => {
    try {
      const roomData = await createRoom();
      await joinCall(roomData.room_url);
    } catch (error) {
      toast.error('Failed to start video call');
    }
  }, [createRoom, joinCall]);

  const endCall = useCallback(async () => {
    try {
      if (callObjectRef.current) {
        await callObjectRef.current.leave();
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }

      if (!isObserver) {
        // Update class status to completed
        await supabase
          .from('classes')
          .update({
            status: 'completed',
            actual_end_time: new Date().toISOString(),
          })
          .eq('id', classId);

        queryClient.invalidateQueries({ queryKey: ['today-classes'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }

      setState(prev => ({
        ...prev,
        callState: 'ended',
        callObject: null,
        localParticipant: null,
        remoteParticipant: null,
      }));

      onCallEnd?.();
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call properly');
    }
  }, [classId, queryClient, onCallEnd, isObserver]);

  const toggleMic = useCallback(() => {
    if (callObjectRef.current) {
      const newMicState = !state.isMicOn;
      callObjectRef.current.setLocalAudio(newMicState);
      setState(prev => ({ ...prev, isMicOn: newMicState }));
    }
  }, [state.isMicOn]);

  const toggleCamera = useCallback(() => {
    if (callObjectRef.current) {
      const newCameraState = !state.isCameraOn;
      callObjectRef.current.setLocalVideo(newCameraState);
      setState(prev => ({ ...prev, isCameraOn: newCameraState }));
    }
  }, [state.isCameraOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
    };
  }, []);

  return {
    ...state,
    startCall,
    endCall,
    joinCall,
    toggleMic,
    toggleCamera,
  };
}
