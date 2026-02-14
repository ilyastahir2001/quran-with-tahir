import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Reminder = Tables<'reminders'> & {
  student?: Tables<'students'> | null;
};

type ReminderInsert = Omit<TablesInsert<'reminders'>, 'teacher_id'>;
type ReminderUpdate = TablesUpdate<'reminders'>;

export function useReminders() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({
    queryKey: ['reminders', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          student:students(id, full_name, avatar_url)
        `)
        .eq('teacher_id', teacherId)
        .order('is_completed', { ascending: true })
        .order('remind_at', { ascending: true });

      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!teacherId,
  });

  const createReminder = useMutation({
    mutationFn: async (reminder: ReminderInsert) => {
      if (!teacherId) throw new Error('No teacher ID');

      const insertData = {
        ...reminder,
        teacher_id: teacherId,
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create reminder: ' + error.message);
    },
  });

  const updateReminder = useMutation({
    mutationFn: async ({ id, ...updates }: ReminderUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update reminder: ' + error.message);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ is_completed: isCompleted })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { isCompleted }) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success(isCompleted ? 'Reminder marked as complete' : 'Reminder reopened');
    },
    onError: (error) => {
      toast.error('Failed to update reminder: ' + error.message);
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete reminder: ' + error.message);
    },
  });

  const now = new Date();
  const stats = {
    total: remindersQuery.data?.length ?? 0,
    upcoming: remindersQuery.data?.filter(r => !r.is_completed && new Date(r.remind_at) >= now).length ?? 0,
    overdue: remindersQuery.data?.filter(r => !r.is_completed && new Date(r.remind_at) < now).length ?? 0,
    completed: remindersQuery.data?.filter(r => r.is_completed).length ?? 0,
  };

  return {
    reminders: remindersQuery.data ?? [],
    isLoading: remindersQuery.isLoading,
    error: remindersQuery.error,
    stats,
    createReminder,
    updateReminder,
    toggleComplete,
    deleteReminder,
  };
}
