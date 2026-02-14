import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Lesson } from '@/types/database';

export function useLessons() {
  const { teacher } = useAuth();
  const teacherId = teacher?.id;

  const lessonsQuery = useQuery({
    queryKey: ['lessons', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          student:students(id, full_name, avatar_url, course_level),
          class:classes(id, scheduled_date, start_time)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!teacherId,
  });

  // Get unique students from lessons
  const students = lessonsQuery.data?.reduce((acc, lesson) => {
    if (lesson.student && !acc.find(s => s.id === lesson.student?.id)) {
      acc.push(lesson.student);
    }
    return acc;
  }, [] as Array<{ id: string; full_name: string; avatar_url: string | null; course_level: string | null }>);

  // Get unique surahs from lessons
  const surahs = [...new Set(lessonsQuery.data?.filter(l => l.surah).map(l => l.surah))];

  const stats = {
    total: lessonsQuery.data?.length ?? 0,
    thisWeek: lessonsQuery.data?.filter(l => {
      const lessonDate = new Date(l.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lessonDate >= weekAgo;
    }).length ?? 0,
    thisMonth: lessonsQuery.data?.filter(l => {
      const lessonDate = new Date(l.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lessonDate >= monthAgo;
    }).length ?? 0,
  };

  return {
    lessons: lessonsQuery.data ?? [],
    isLoading: lessonsQuery.isLoading,
    error: lessonsQuery.error,
    students: students ?? [],
    surahs: surahs ?? [],
    stats,
  };
}
