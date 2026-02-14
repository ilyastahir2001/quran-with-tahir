import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type ExaminerRemark = Tables<'examiner_remarks'> & {
  student?: Tables<'students'> | null;
  lesson?: Tables<'lessons'> | null;
};

export function useExaminerRemarks() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const remarksQuery = useQuery({
    queryKey: ['examiner-remarks', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('examiner_remarks')
        .select(`
          *,
          student:students(id, full_name, avatar_url),
          lesson:lessons(id, surah, ayah_from, ayah_to, created_at)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExaminerRemark[];
    },
    enabled: !!teacherId,
  });

  const respondToRemark = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { data, error } = await supabase
        .from('examiner_remarks')
        .update({ teacher_response: response })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examiner-remarks'] });
      toast.success('Response submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit response: ' + error.message);
    },
  });

  // Get unique students from remarks
  const students = remarksQuery.data?.reduce((acc, remark) => {
    if (remark.student && !acc.find(s => s.id === remark.student?.id)) {
      acc.push(remark.student);
    }
    return acc;
  }, [] as Array<{ id: string; full_name: string; avatar_url: string | null }>);

  const stats = {
    total: remarksQuery.data?.length ?? 0,
    pending: remarksQuery.data?.filter(r => !r.teacher_response).length ?? 0,
    responded: remarksQuery.data?.filter(r => r.teacher_response).length ?? 0,
  };

  return {
    remarks: remarksQuery.data ?? [],
    isLoading: remarksQuery.isLoading,
    error: remarksQuery.error,
    students: students ?? [],
    stats,
    respondToRemark,
  };
}
