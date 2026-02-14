import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import type { TodayClass } from '@/types/database';

const RING_TIMEOUT_MS = 40000; // 40 seconds

export interface IncomingCall {
  classId: string;
  roomUrl: string;
  roomId: string;
  teacherName: string;
  teacherAvatar?: string;
  scheduledTime: string;
}

export function useIncomingCall() {
  const { student } = useAuth();
  const queryClient = useQueryClient();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Subscribe to realtime changes on classes table
  useEffect(() => {
    if (!student?.id) return;

    const channel = supabase
      .channel(`incoming-calls-${student.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classes',
          filter: `student_id=eq.${student.id}`,
        },
        async (payload) => {
          const newData = payload.new as {
            id: string;
            status: string;
            call_room_url: string | null;
            call_room_id: string | null;
            start_time: string;
            teacher_id: string;
          };

          // Check if class is now in_progress with a room URL (teacher started call)
          if (
            newData.status === 'in_progress' &&
            newData.call_room_url &&
            !incomingCall
          ) {
            // Fetch teacher details
            const { data: teacherData } = await supabase
              .from('teachers')
              .select(`
                id,
                profile:profiles!inner(full_name, avatar_url)
              `)
              .eq('id', newData.teacher_id)
              .single();

            const profileData = teacherData?.profile;
            const profile = Array.isArray(profileData) ? profileData[0] : profileData as { full_name: string; avatar_url: string | null } | undefined;

            setIncomingCall({
              classId: newData.id,
              roomUrl: newData.call_room_url,
              roomId: newData.call_room_id || '',
              teacherName: profile?.full_name || 'Your Teacher',
              teacherAvatar: profile?.avatar_url || undefined,
              scheduledTime: newData.start_time,
            });
            setIsRinging(true);

            // Log ringing event
            await supabase.from('call_logs').insert({
              class_id: newData.id,
              teacher_id: newData.teacher_id,
              student_id: student.id,
              event: 'ringing' as const,
              room_id: newData.call_room_id,
              room_url: newData.call_room_url,
            });

            // Start timeout for no answer
            timeoutRef.current = setTimeout(async () => {
              // Mark as no_answer if still ringing
              setIsRinging(false);
              setIncomingCall(null);

              await supabase
                .from('classes')
                .update({ status: 'no_answer' })
                .eq('id', newData.id);

              await supabase.from('call_logs').insert({
                class_id: newData.id,
                teacher_id: newData.teacher_id,
                student_id: student.id,
                event: 'timeout' as const,
                room_id: newData.call_room_id,
                room_url: newData.call_room_url,
              });

              queryClient.invalidateQueries({ queryKey: ['student-classes'] });
              queryClient.invalidateQueries({ queryKey: ['student-today-classes'] });
            }, RING_TIMEOUT_MS);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id, incomingCall, queryClient]);

  const acceptCall = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRinging(false);
    // Keep incomingCall data for navigation
  }, []);

  const declineCall = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (incomingCall && student?.id) {
      // Log rejection
      const { data: classData } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', incomingCall.classId)
        .maybeSingle();

      if (classData?.teacher_id) {
        await supabase.from('call_logs').insert({
          class_id: incomingCall.classId,
          teacher_id: classData.teacher_id,
          student_id: student.id,
          event: 'rejected',
          room_id: incomingCall.roomId,
          room_url: incomingCall.roomUrl,
          metadata: {
            reason: 'student_declined',
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    setIsRinging(false);
    setIncomingCall(null);
  }, [incomingCall, student?.id]);

  const clearCall = useCallback(() => {
    setIncomingCall(null);
    setIsRinging(false);
  }, []);

  return {
    incomingCall,
    isRinging,
    acceptCall,
    declineCall,
    clearCall,
  };
}
