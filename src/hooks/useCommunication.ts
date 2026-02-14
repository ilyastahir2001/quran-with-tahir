import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Suggestion, Complaint, Feedback, Improvement } from '@/types/database';

// ============ COMPLAINTS ============
export function useComplaints() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: ['complaints', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((c) => ({
        ...c,
        subject: c.subject, // Map DB subject to UI subject
      })) as Complaint[];
    },
    enabled: !!teacherId,
  });

  const createComplaint = useMutation({
    mutationFn: async (complaint: { subject: string; description: string; category: string; attachments?: string[] }) => {
      if (!teacherId) throw new Error('No teacher ID');

      const { data, error } = await supabase
        .from('complaints')
        .insert({
          subject: complaint.subject,
          description: complaint.description,
          category: complaint.category,
          teacher_id: teacherId,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit complaint: ' + error.message);
    },
  });

  return {
    complaints: complaintsQuery.data ?? [],
    isLoading: complaintsQuery.isLoading,
    error: complaintsQuery.error,
    createComplaint,
  };
}

// ============ SUGGESTIONS ============
export function useSuggestions(): {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: unknown;
  createSuggestion: UseMutationResult<Suggestion, Error, Pick<Suggestion, 'title' | 'description'>, unknown>;
} {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const suggestionsQuery = useQuery({
    queryKey: ['suggestions', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Suggestion[];
    },
    enabled: !!teacherId,
  });

  const createSuggestion = useMutation({
    mutationFn: async (suggestion: Pick<Suggestion, 'title' | 'description'>) => {
      if (!teacherId) throw new Error('No teacher ID');

      const { data, error } = await supabase
        .from('suggestions')
        .insert({ ...suggestion, teacher_id: teacherId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion submitted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit suggestion: ' + error.message);
    },
  });

  return {
    suggestions: suggestionsQuery.data ?? [],
    isLoading: suggestionsQuery.isLoading,
    error: suggestionsQuery.error,
    createSuggestion,
  };
}

// ============ FEEDBACK ============
export function useFeedback() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const feedbackQuery = useQuery({
    queryKey: ['feedback', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((f) => {
        const row = f as Record<string, unknown>;
        return {
          ...f,
          message: (row.message as string) || (row.comment as string) || '',
          comment: (row.comment as string) || (row.message as string) || '',
          from_type: (row.from_type as string) || ((row.booking_id as string) ? 'student' : 'admin'),
        } as Feedback;
      });
    },
    enabled: !!teacherId,
  });

  const respondToFeedback = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ teacher_response: response })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Response submitted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit response: ' + error.message);
    },
  });

  return {
    feedback: feedbackQuery.data ?? [],
    isLoading: feedbackQuery.isLoading,
    error: feedbackQuery.error,
    respondToFeedback,
  };
}

// ============ IMPROVEMENTS ============
export function useImprovements() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const improvementsQuery = useQuery({
    queryKey: ['improvements', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('improvements')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Improvement[];
    },
    enabled: !!teacherId,
  });

  const markComplete = useMutation({
    mutationFn: async ({ id, evidenceUrl }: { id: string; evidenceUrl?: string }) => {
      const { data, error } = await supabase
        .from('improvements')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          evidence_url: evidenceUrl || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['improvements'] });
      toast.success('Improvement marked as complete');
    },
    onError: (error: Error) => {
      toast.error('Failed to update improvement: ' + error.message);
    },
  });

  const stats = {
    total: improvementsQuery.data?.length ?? 0,
    pending: improvementsQuery.data?.filter(i => !i.is_completed).length ?? 0,
    completed: improvementsQuery.data?.filter(i => i.is_completed).length ?? 0,
  };

  return {
    improvements: improvementsQuery.data ?? [],
    isLoading: improvementsQuery.isLoading,
    error: improvementsQuery.error,
    stats,
    markComplete,
  };
}
