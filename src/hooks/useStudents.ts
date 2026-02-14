import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Student } from '@/types/database';

export function useStudents() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;

  return useQuery({
    queryKey: ['students', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('No teacher ID');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Student[];
    },
    enabled: !!teacherId,
  });
}

export function useStudent(studentId: string | undefined) {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('No student ID');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!studentId && !!teacherId,
  });
}

export function useStudentLessons(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-lessons', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('No student ID');

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useStudentClasses(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-classes', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('No student ID');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('student_id', studentId)
        .order('scheduled_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useStudentStats() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;

  return useQuery({
    queryKey: ['student-stats', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('No teacher ID');

      const { data: students, error } = await supabase
        .from('students')
        .select('id, status, progress_percentage')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const { data: todayClasses } = await supabase
        .from('classes')
        .select('student_id')
        .eq('teacher_id', teacherId)
        .eq('scheduled_date', today);

      const total = students?.length || 0;
      const active = students?.filter(s => s.status === 'active').length || 0;
      const withClassToday = new Set(todayClasses?.map(c => c.student_id)).size;
      const avgProgress = total > 0
        ? Math.round(students.reduce((acc, s) => acc + (s.progress_percentage || 0), 0) / total)
        : 0;

      return { total, active, withClassToday, avgProgress };
    },
    enabled: !!teacherId,
  });
}

export function useUpdateStudentNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, notes }: { studentId: string; notes: string }) => {
      const { error } = await supabase
        .from('students')
        .update({ notes })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast.success('Notes saved successfully');
    },
    onError: () => {
      toast.error('Failed to save notes');
    },
  });
}
