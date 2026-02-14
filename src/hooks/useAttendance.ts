import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Attendance, AttendanceStatus, Student, Class } from '@/types/database';
import { toast } from 'sonner';

export interface AttendanceWithDetails extends Attendance {
  student: Student;
  class: Class;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  no_answer: number;
}

export interface AttendanceFilters {
  dateFrom?: string;
  dateTo?: string;
  studentId?: string;
  status?: AttendanceStatus | 'all';
}

export interface CreateAttendanceData {
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface UpdateAttendanceData {
  id: string;
  status: AttendanceStatus;
  note?: string;
}

export function useAttendance(filters: AttendanceFilters = {}) {
  const { teacher } = useAuth();
  const queryClient = useQueryClient();

  // Fetch attendance records with filters
  const attendanceQuery = useQuery({
    queryKey: ['attendance', teacher?.id, filters],
    queryFn: async (): Promise<AttendanceWithDetails[]> => {
      if (!teacher?.id) return [];

      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(*),
          class:classes(*)
        `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      // Apply student filter
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as AttendanceWithDetails[];
    },
    enabled: !!teacher?.id,
  });

  // Fetch attendance statistics
  const statsQuery = useQuery({
    queryKey: ['attendance-stats', teacher?.id, filters.dateFrom, filters.dateTo],
    queryFn: async (): Promise<AttendanceStats> => {
      if (!teacher?.id) {
        return { total: 0, present: 0, absent: 0, late: 0, leave: 0, no_answer: 0 };
      }

      let query = supabase
        .from('attendance')
        .select('status')
        .eq('teacher_id', teacher.id);

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats: AttendanceStats = {
        total: data?.length || 0,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        no_answer: 0,
      };

      data?.forEach((record) => {
        if (record.status in stats) {
          stats[record.status as keyof Omit<AttendanceStats, 'total'>]++;
        }
      });

      return stats;
    },
    enabled: !!teacher?.id,
  });

  // Fetch classes that need attendance (completed today without attendance record)
  const classesNeedingAttendanceQuery = useQuery({
    queryKey: ['classes-needing-attendance', teacher?.id],
    queryFn: async () => {
      if (!teacher?.id) return [];

      const today = new Date().toISOString().split('T')[0];

      // Get today's completed classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          student:students(*)
        `)
        .eq('teacher_id', teacher.id)
        .gte('start_time', today + 'T00:00:00')
        .lte('start_time', today + 'T23:59:59')
        .in('status', ['completed', 'missed', 'no_answer']);

      if (classesError) throw classesError;

      // Get existing attendance records for today
      const { data: existingAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('class_id')
        .eq('teacher_id', teacher.id)
        .gte('created_at', today)
        .lte('created_at', today + 'T23:59:59');

      if (attendanceError) throw attendanceError;

      const attendedClassIds = new Set(existingAttendance?.map((a) => a.class_id));

      // Filter to classes without attendance
      return (classes || []).filter((cls) => !attendedClassIds.has(cls.id)) as (Class & { student: Student })[];
    },
    enabled: !!teacher?.id,
  });

  // Create attendance record
  const createAttendance = useMutation({
    mutationFn: async (data: CreateAttendanceData) => {
      if (!teacher?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('attendance').insert({
        class_id: data.classId,
        teacher_id: teacher.id,
        student_id: data.studentId,
        status: data.status,
        notes: data.note || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['classes-needing-attendance'] });
      toast.success('Attendance recorded');
    },
    onError: (error) => {
      toast.error('Failed to record attendance');
      console.error('Create attendance error:', error);
    },
  });

  // Update attendance record
  const updateAttendance = useMutation({
    mutationFn: async (data: UpdateAttendanceData) => {
      if (!teacher?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('attendance')
        .update({
          status: data.status,
          notes: data.note || null,
        })
        .eq('id', data.id)
        .eq('teacher_id', teacher.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
      toast.success('Attendance updated');
    },
    onError: (error) => {
      toast.error('Failed to update attendance');
      console.error('Update attendance error:', error);
    },
  });

  // Bulk mark attendance as present
  const bulkMarkPresent = useMutation({
    mutationFn: async (classes: { id: string; student_id: string }[]) => {
      if (!teacher?.id) throw new Error('Not authenticated');

      const records = classes.map((cls) => ({
        class_id: cls.id,
        teacher_id: teacher.id,
        student_id: cls.student_id,
        status: 'present' as AttendanceStatus,
      }));

      const { error } = await supabase.from('attendance').insert(records);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['classes-needing-attendance'] });
      toast.success('All marked as present');
    },
    onError: (error) => {
      toast.error('Failed to mark attendance');
      console.error('Bulk mark error:', error);
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    refetch: attendanceQuery.refetch,
    stats: statsQuery.data || { total: 0, present: 0, absent: 0, late: 0, leave: 0, no_answer: 0 },
    statsLoading: statsQuery.isLoading,
    classesNeedingAttendance: classesNeedingAttendanceQuery.data || [],
    classesNeedingAttendanceLoading: classesNeedingAttendanceQuery.isLoading,
    createAttendance,
    updateAttendance,
    bulkMarkPresent,
  };
}
