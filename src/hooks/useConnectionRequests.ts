import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ConnectionRequest, Student, Profile } from '@/types/database';

type ConnectionRequestWithStudent = ConnectionRequest & {
  student: (Student & {
    profile: Pick<Profile, 'email' | 'avatar_url' | 'country'> | null;
  }) | null;
};

export function useConnectionRequests() {
  const { teacher } = useAuth();
  const queryClient = useQueryClient();
  const teacherId = teacher?.id;

  // Fetch connection requests for the teacher
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['connection-requests', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          *,
          student:students(
            id, 
            full_name, 
            course_level,
            profile:profiles(email, avatar_url, country)
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        ...r,
        student: r.student ? {
          ...r.student,
          email: r.student.profile?.email || r.student.email,
          avatar_url: r.student.profile?.avatar_url || r.student.avatar_url,
          country: r.student.profile?.country || r.student.country,
        } : null
      })) as ConnectionRequest[];
    },
    enabled: !!teacherId,
  });

  // Get pending count for badge
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Accept connection request
  const acceptRequest = useMutation({
    mutationFn: async ({ requestId, studentId }: { requestId: string; studentId: string }) => {
      // Update request status
      const { error: requestError } = await supabase
        .from('connection_requests')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update student's teacher_id
      const { error: studentError } = await supabase
        .from('students')
        .update({ teacher_id: teacherId })
        .eq('id', studentId);

      if (studentError) throw studentError;

      // Get student details for notification
      const student = requests.find(r => r.id === requestId)?.student;

      // Create notification for student
      if (student) {
        const { data: studentData } = await supabase
          .from('students')
          .select('user_id')
          .eq('id', studentId)
          .single();

        if (studentData?.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: studentData.user_id,
              type: 'system',
              title: 'Connection Request Accepted',
              message: 'Your teacher connection request has been accepted. You can now schedule classes.',
            });
        }
      }

      return { requestId, studentId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success('Connection request accepted');
    },
    onError: (error) => {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    },
  });

  // Reject connection request
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('connection_requests')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Get request details for notification
      const request = requests.find(r => r.id === requestId);
      if (request?.student) {
        const { data: studentData } = await supabase
          .from('students')
          .select('user_id')
          .eq('id', request.student_id)
          .single();

        if (studentData?.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: studentData.user_id,
              type: 'system',
              title: 'Connection Request Update',
              message: 'Your teacher connection request was not accepted. You can try connecting with another teacher.',
            });
        }
      }

      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success('Connection request rejected');
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    },
  });

  return {
    requests,
    pendingCount,
    isLoading,
    error,
    acceptRequest,
    rejectRequest,
  };
}
