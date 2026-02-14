import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LeaveRequest {
    id: string;
    teacher_id: string;
    leave_type: 'sick' | 'vacation' | 'personal' | 'emergency' | 'other';
    start_date: string;
    end_date: string;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    admin_notes: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    teacher?: {
        full_name: string;
        email: string;
    };
}

export interface CreateLeaveRequest {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
}

export function useTeacherLeave() {
    const { teacher } = useAuth();
    const queryClient = useQueryClient();

    // Fetch leave requests for the current teacher
    const { data: leaveRequests = [], isLoading, error } = useQuery({
        queryKey: ['teacher-leave-requests', teacher?.id],
        queryFn: async () => {
            if (!teacher?.id) return [];

            const { data, error } = await supabase
                .from('teacher_leave_requests')
                .select('*')
                .eq('teacher_id', teacher.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as LeaveRequest[];
        },
        enabled: !!teacher?.id,
    });

    // Create a new leave request
    const createMutation = useMutation({
        mutationFn: async (request: CreateLeaveRequest) => {
            if (!teacher?.id) throw new Error('No teacher ID');

            const { error } = await supabase
                .from('teacher_leave_requests')
                .insert({
                    teacher_id: teacher.id,
                    leave_type: request.leave_type,
                    start_date: request.start_date,
                    end_date: request.end_date,
                    reason: request.reason || null,
                });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Leave request submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['teacher-leave-requests'] });
        },
        onError: (error) => {
            console.error('Failed to submit leave request:', error);
            toast.error('Failed to submit leave request');
        },
    });

    // Cancel a pending leave request
    const cancelMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await supabase
                .from('teacher_leave_requests')
                .update({ status: 'cancelled' })
                .eq('id', requestId);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Leave request cancelled');
            queryClient.invalidateQueries({ queryKey: ['teacher-leave-requests'] });
        },
        onError: () => {
            toast.error('Failed to cancel leave request');
        },
    });

    // Get approved leave dates for checking if on leave
    const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');

    // Check if teacher is on leave for a specific date
    const isTeacherOnLeave = (date: string): boolean => {
        const checkDate = new Date(date);
        return approvedLeaves.some(leave => {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            return checkDate >= start && checkDate <= end;
        });
    };

    return {
        leaveRequests,
        isLoading,
        error,
        createLeaveRequest: createMutation.mutate,
        isCreating: createMutation.isPending,
        cancelLeaveRequest: cancelMutation.mutate,
        isCancelling: cancelMutation.isPending,
        approvedLeaves,
        isTeacherOnLeave,
    };
}

// Hook for admin to manage all leave requests
export function useAdminLeaveRequests() {
    const queryClient = useQueryClient();

    const { data: allRequests = [], isLoading } = useQuery({
        queryKey: ['admin-leave-requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('teacher_leave_requests')
                .select(`
          *,
          teachers!inner (
            id,
            user_id,
            profiles!inner (
              full_name,
              email
            )
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform the data to include teacher info
            return (data || []).map((req: any) => ({
                ...req,
                teacher: {
                    full_name: req.teachers?.profiles?.full_name || 'Unknown',
                    email: req.teachers?.profiles?.email || '',
                },
            })) as LeaveRequest[];
        },
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, status, admin_notes }: { id: string; status: 'approved' | 'rejected'; admin_notes?: string }) => {
            const { error } = await supabase
                .from('teacher_leave_requests')
                .update({
                    status,
                    admin_notes: admin_notes || null,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            toast.success(`Leave request ${variables.status}`);
            queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] });
        },
        onError: () => {
            toast.error('Failed to update leave request');
        },
    });

    return {
        allRequests,
        isLoading,
        reviewRequest: reviewMutation.mutate,
        isReviewing: reviewMutation.isPending,
    };
}
