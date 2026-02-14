import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ConnectionRequest, Teacher, Profile, RescheduleRequest } from '@/types/database';

interface TeacherWithProfile extends Teacher {
  profile: Profile;
}

export function useStudentConnection() {
  const { student, isParent, activeChild, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const displayStudent = isParent && activeChild ? activeChild : student;
  const studentId = displayStudent?.id;

  // Fetch connection requests for the student
  const { data: connectionRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['student-connection-requests', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          *,
          teacher:teachers(
            id,
            bio,
            specializations,
            teaching_hours_per_week,
            is_verified,
            profile:profiles(full_name, avatar_url, email)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (ConnectionRequest & { teacher: TeacherWithProfile })[];
    },
    enabled: !!studentId,
  });

  // Fetch connected teacher details
  const { data: connectedTeacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['connected-teacher', displayStudent?.teacher_id],
    queryFn: async () => {
      if (!displayStudent?.teacher_id) return null;

      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          status,
          bio,
          specializations,
          teaching_hours_per_week,
          is_verified,
          profile:profiles(full_name, avatar_url, email)
        `)
        .eq('id', displayStudent.teacher_id)
        .single();

      if (error) throw error;
      // Transform profile array to object if needed (Supabase returns arrays for some joins)
      const profileData = Array.isArray(data?.profile) ? data.profile[0] : data?.profile;
      return { ...data, profile: profileData } as unknown as TeacherWithProfile;
    },
    enabled: !!displayStudent?.teacher_id,
  });

  // Fetch reschedule requests
  const { data: rescheduleRequests = [], isLoading: rescheduleLoading } = useQuery({
    queryKey: ['student-reschedule-requests', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('reschedule_requests')
        .select(`
          *,
          class:classes(scheduled_date, start_time, duration_minutes)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RescheduleRequest[];
    },
    enabled: !!studentId,
  });

  // Cancel pending connection request
  const cancelRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const sId = studentId;
      if (!sId) throw new Error('Student ID not found');

      const { error } = await supabase
        .from('connection_requests')
        .delete()
        .eq('id', requestId)
        .eq('student_id', sId)
        .eq('status', 'pending');

      if (error) throw error;
      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-connection-requests'] });
      toast.success('Connection request cancelled');
    },
    onError: (error) => {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    },
  });

  // Accept teacher invitation
  const acceptInvitation = useMutation({
    mutationFn: async (request: ConnectionRequest) => {
      const sId = studentId;
      if (!sId) throw new Error('Student ID not found');

      // 1. Update request status
      const { error: requestError } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // 2. Link student to teacher
      const { error: studentError } = await supabase
        .from('students')
        .update({ teacher_id: request.teacher_id })
        .eq('id', sId);

      if (studentError) throw studentError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connected-teacher'] });
      refreshProfile();
      toast.success('Invitation accepted! You are now connected.');
    },
    onError: (error) => {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    },
  });

  // Reject teacher invitation (or student-initiated request rejection if needed)
  const rejectInvitation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-connection-requests'] });
      toast.success('Invitation declined');
    },
    onError: (error) => {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    },
  });

  // Get current pending request
  const pendingRequest = connectionRequests.find(r => r.status === 'pending');
  const hasConnectedTeacher = !!displayStudent?.teacher_id;

  return {
    connectionRequests,
    rescheduleRequests,
    connectedTeacher,
    pendingRequest,
    hasConnectedTeacher,
    isLoading: requestsLoading || teacherLoading || rescheduleLoading,
    cancelRequest,
    acceptInvitation,
    rejectInvitation,
    refreshProfile,
  };
}
