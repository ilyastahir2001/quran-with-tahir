import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export interface StudentClass {
  id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'no_answer' | 'cancelled' | 'on_leave';
  is_recovery: boolean | null;
  notes: string | null;
  call_room_url: string | null;
  teacher: {
    id: string;
    bio: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

type ClassFilter = 'all' | 'upcoming' | 'completed' | 'missed';

interface UseStudentClassesOptions {
  filter?: ClassFilter;
  date?: Date;
  weekOffset?: number;
}

interface RawClassData {
  id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  status: StudentClass['status'];
  is_recovery: boolean | null;
  notes: string | null;
  call_room_url: string | null;
  teacher: {
    id: string;
    bio: string | null;
    profile: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

export function useStudentClasses(options: UseStudentClassesOptions = {}) {
  const { student } = useAuth();
  const studentId = student?.id;

  const { filter = 'all', date, weekOffset = 0 } = options;

  return useQuery({
    queryKey: ['student-classes', studentId, filter, date ? format(date, 'yyyy-MM-dd') : null, weekOffset],
    queryFn: async () => {
      if (!studentId) return [];

      let query = supabase
        .from('classes')
        .select(`
          id,
          scheduled_date,
          start_time,
          end_time,
          duration_minutes,
          status,
          is_recovery,
          notes,
          call_room_url,
          teacher:teachers!inner(
            id,
            bio,
            profile:profiles!inner(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('student_id', studentId);

      // Apply filters
      const today = format(new Date(), 'yyyy-MM-dd');

      if (filter === 'upcoming') {
        query = query
          .gte('scheduled_date', today)
          .eq('status', 'scheduled');
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (filter === 'missed') {
        query = query.in('status', ['missed', 'no_answer', 'cancelled']);
      }

      // Date filter for specific day
      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd');
        query = query.eq('scheduled_date', dateStr);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: filter === 'upcoming' });

      if (error) throw error;

      const rawData = (data || []) as unknown as RawClassData[];

      // Transform the nested data
      return rawData.map((cls) => ({
        ...cls,
        teacher: cls.teacher ? {
          id: cls.teacher.id,
          bio: cls.teacher.bio,
          full_name: cls.teacher.profile?.full_name || null,
          avatar_url: cls.teacher.profile?.avatar_url || null,
        } : null,
      })) as StudentClass[];
    },
    enabled: !!studentId,
  });
}

export function useTodayClasses() {
  return useStudentClasses({ date: new Date() });
}

export function useWeeklyClasses(weekOffset: number = 0) {
  const { student } = useAuth();
  const studentId = student?.id;

  const baseDate = new Date();
  const targetWeek = weekOffset > 0
    ? addWeeks(baseDate, weekOffset)
    : weekOffset < 0
      ? subWeeks(baseDate, Math.abs(weekOffset))
      : baseDate;

  const weekStart = startOfWeek(targetWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(targetWeek, { weekStartsOn: 1 }); // Sunday

  return useQuery({
    queryKey: ['student-classes-weekly', studentId, weekOffset],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          scheduled_date,
          start_time,
          end_time,
          duration_minutes,
          status,
          is_recovery,
          notes,
          call_room_url,
          teacher:teachers!inner(
            id,
            bio,
            profile:profiles!inner(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('student_id', studentId)
        .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const rawData = (data || []) as unknown as RawClassData[];

      return rawData.map((cls) => ({
        ...cls,
        teacher: cls.teacher ? {
          id: cls.teacher.id,
          bio: cls.teacher.bio,
          full_name: cls.teacher.profile?.full_name || null,
          avatar_url: cls.teacher.profile?.avatar_url || null,
        } : null,
      })) as StudentClass[];
    },
    enabled: !!studentId,
  });
}

export function useClassStats() {
  const { student } = useAuth();
  const studentId = student?.id;

  return useQuery({
    queryKey: ['student-class-stats', studentId],
    queryFn: async () => {
      if (!studentId) return { total: 0, completed: 0, missed: 0, upcoming: 0 };

      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch all classes for this student
      const { data, error } = await supabase
        .from('classes')
        .select('status, scheduled_date')
        .eq('student_id', studentId);

      if (error) throw error;

      const classes = data || [];

      return {
        total: classes.length,
        completed: classes.filter(c => c.status === 'completed').length,
        missed: classes.filter(c => ['missed', 'no_answer', 'cancelled'].includes(c.status || '')).length,
        upcoming: classes.filter(c => c.status === 'scheduled' && c.scheduled_date >= today).length,
      };
    },
    enabled: !!studentId,
  });
}

// Helper hook to handle realtime updates for classes
export function useClassRealtimeSubscription() {
  const { student } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!student?.id) return;

    const channel = supabase
      .channel('public:classes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes',
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-classes'] });
          queryClient.invalidateQueries({ queryKey: ['today-classes'] });
          queryClient.invalidateQueries({ queryKey: ['student-class-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id, queryClient]);
}
