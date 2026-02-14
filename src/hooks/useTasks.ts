import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import type { Task } from '@/types/database';

type TaskStatus = 'pending' | 'in_progress' | 'completed';

type TaskInsert = {
  title: string;
  description?: string | null;
  due_date?: string | null;
  status?: TaskStatus;
  is_personal?: boolean;
  assigned_by?: string | null;
  proof_url?: string | null;
  completed_at?: string | null;
};
type TaskUpdate = Partial<TaskInsert>;

export function useTasks() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('status', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!teacherId,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<TaskInsert, 'teacher_id'>) => {
      if (!teacherId) throw new Error('No teacher ID');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, teacher_id: teacherId, is_personal: true })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task: ' + error.message);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message);
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updates: TaskUpdate = { 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Task marked as ${status.replace('_', ' ')}`);
    },
    onError: (error) => {
      toast.error('Failed to update task status: ' + error.message);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete task: ' + error.message);
    },
  });

  // Computed stats
  const stats = {
    total: tasksQuery.data?.length ?? 0,
    pending: tasksQuery.data?.filter(t => t.status === 'pending').length ?? 0,
    inProgress: tasksQuery.data?.filter(t => t.status === 'in_progress').length ?? 0,
    completed: tasksQuery.data?.filter(t => t.status === 'completed').length ?? 0,
    overdue: tasksQuery.data?.filter(t => 
      t.status !== 'completed' && 
      t.due_date && 
      new Date(t.due_date) < new Date()
    ).length ?? 0,
  };

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    stats,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}
