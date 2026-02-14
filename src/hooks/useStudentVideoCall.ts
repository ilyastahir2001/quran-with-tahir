import { useState, useCallback, useEffect, useRef } from 'react';
import DailyIframe, { DailyCall, DailyParticipant, DailyEventObjectParticipant, DailyEventObjectFatalError, DailyEventObjectCameraError } from '@daily-co/daily-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type StudentCallState = 'idle' | 'joining' | 'connected' | 'ended' | 'failed';

interface UseStudentVideoCallOptions {
  classId: string;
  studentId: string;
  studentName: string;
  roomUrl: string | null;
  onCallEnd?: () => void;
}

interface StudentVideoCallState {
  callState: StudentCallState;
  callObject: DailyCall | null;
  localParticipant: DailyParticipant | null;
  remoteParticipant: DailyParticipant | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  error: string | null;
}

export function useStudentVideoCall({
  classId,
  studentId,
  studentName,
  roomUrl,
  onCallEnd,
}: UseStudentVideoCallOptions) {
  const queryClient = useQueryClient();
  const callObjectRef = useRef<DailyCall | null>(null);

  const [state, setState] = useState<StudentVideoCallState>({
    callState: 'idle',
    callObject: null,
    localParticipant: null,
    remoteParticipant: null,
    isMicOn: true,
    isCameraOn: true,
    error: null,
  });

  const logCallEvent = useCallback(async (
    event: 'accepted' | 'rejected' | 'connected' | 'disconnected' | 'timeout',
    extraMetadata?: Record<string, unknown>
  ) => {
    try {
      // Get class data to find teacher_id
      const { data: classData } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', classId)
        .single();

      if (classData) {
        await supabase.from('call_logs').insert({
          class_id: classId,
          student_id: studentId,
          teacher_id: classData.teacher_id,
          event: event as 'accepted' | 'rejected' | 'connected' | 'disconnected' | 'timeout',
          metadata: {
            ...extraMetadata
          } as Json,
        });
      }
    } catch (error) {
      console.error('Failed to log call event:', error);
    }
  }, [classId, studentId]);

  const joinCall = useCallback(async () => {
    if (!roomUrl) {
      setState(prev => ({ ...prev, callState: 'failed', error: 'No room URL provided' }));
      return;
    }

    setState(prev => ({ ...prev, callState: 'joining', error: null }));

    try {
      const callObject = DailyIframe.createCallObject({
        url: roomUrl,
        userName: studentName,
      });

      callObjectRef.current = callObject;

      // Set up event listeners
      callObject.on('joined-meeting', () => {
        setState(prev => ({ ...prev, callState: 'connected' }));
        logCallEvent('connected');
        toast.success('Connected to video call');
      });

      callObject.on('participant-joined', (event: DailyEventObjectParticipant | undefined) => {
        if (event?.participant && !event.participant.local) {
          setState(prev => ({ ...prev, remoteParticipant: event.participant }));
        }
      });

      callObject.on('participant-left', () => {
        setState(prev => ({ ...prev, remoteParticipant: null }));
        toast.info('Teacher has left the call');
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

      // Log acceptance
      await logCallEvent('accepted');

      // Get local participant
      const participants = callObject.participants();
      setState(prev => ({
        ...prev,
        callObject,
        localParticipant: participants.local || null,
        remoteParticipant: Object.values(participants).find(p => !p.local) || null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join call';
      setState(prev => ({ ...prev, callState: 'failed', error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [roomUrl, studentName, logCallEvent]);

  const leaveCall = useCallback(async () => {
    try {
      if (callObjectRef.current) {
        await callObjectRef.current.leave();
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }

      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-today-classes'] });

      setState(prev => ({
        ...prev,
        callState: 'ended',
        callObject: null,
        localParticipant: null,
        remoteParticipant: null,
      }));

      onCallEnd?.();
    } catch (error) {
      console.error('Error leaving call:', error);
      toast.error('Failed to leave call properly');
    }
  }, [queryClient, onCallEnd]);

  const declineCall = useCallback(async () => {
    await logCallEvent('rejected');
    onCallEnd?.();
  }, [logCallEvent, onCallEnd]);

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
    joinCall,
    leaveCall,
    declineCall,
    toggleMic,
    toggleCamera,
  };
}
