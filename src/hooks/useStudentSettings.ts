import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StudentSettings {
  id: string;
  student_id: string;
  timezone: string;
  notification_prefs: {
    email: boolean;
    push: boolean;
    sms: boolean;
    reminder_minutes?: number;
  };
  video_pref: boolean;
  low_bandwidth_mode: boolean;
  accessibility_mode: 'standard' | 'senior' | 'high-contrast';
}

const defaultSettings: Omit<StudentSettings, 'id' | 'student_id'> = {
  timezone: 'UTC',
  notification_prefs: { email: true, push: true, sms: false, reminder_minutes: 15 },
  video_pref: true,
  low_bandwidth_mode: false,
  accessibility_mode: 'standard',
};

export function useStudentSettings() {
  const { student } = useAuth();
  const studentId = student?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['student-settings', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from('student_settings')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          notification_prefs: data.notification_prefs as StudentSettings['notification_prefs'],
          accessibility_mode: (data.accessibility_mode || 'standard') as StudentSettings['accessibility_mode'],
        } as StudentSettings;
      }

      // Return defaults if no settings exist
      return null;
    },
    enabled: !!studentId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<StudentSettings, 'id' | 'student_id'>>) => {
      if (!studentId) throw new Error('No student ID');

      const { error } = await supabase
        .from('student_settings')
        .upsert({
          student_id: studentId,
          ...defaultSettings,
          ...query.data,
          ...updates,
        }, { onConflict: 'student_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      toast.error('Failed to save settings');
    },
  });

  return {
    settings: (query.data || defaultSettings) as StudentSettings,
    isLoading: query.isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
