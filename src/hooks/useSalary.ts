import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type SalaryRecord = Tables<'salary_records'>;
type Deduction = Tables<'deductions'>;

export function useSalary() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const salaryQuery = useQuery({
    queryKey: ['salary', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('month', { ascending: false });

      if (error) throw error;
      return data as SalaryRecord[];
    },
    enabled: !!teacherId,
  });

  const deductionsQuery = useQuery({
    queryKey: ['deductions', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('deductions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('deduction_date', { ascending: false });

      if (error) throw error;
      return data as Deduction[];
    },
    enabled: !!teacherId,
  });

  const requestReview = useMutation({
    mutationFn: async (deductionId: string) => {
      const { data, error } = await supabase
        .from('deductions')
        .update({ review_requested: true, review_status: 'pending' })
        .eq('id', deductionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Review request submitted');
    },
    onError: (error) => {
      toast.error('Failed to request review: ' + error.message);
    },
  });

  // Current month salary
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentSalary = salaryQuery.data?.find(s => s.month.startsWith(currentMonth));

  // Deduction stats
  const deductionStats = {
    total: deductionsQuery.data?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0,
    count: deductionsQuery.data?.length ?? 0,
    pendingReview: deductionsQuery.data?.filter(d => d.review_status === 'pending').length ?? 0,
  };

  return {
    salaryRecords: salaryQuery.data ?? [],
    deductions: deductionsQuery.data ?? [],
    currentSalary,
    isLoading: salaryQuery.isLoading || deductionsQuery.isLoading,
    error: salaryQuery.error || deductionsQuery.error,
    deductionStats,
    requestReview,
  };
}
