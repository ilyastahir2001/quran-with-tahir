import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  language_pref?: string;
}

export function useStudentProfile() {
  const { student, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: ProfileUpdateData) => {
      if (!student?.id) throw new Error('No student ID');

      // Update student record
      const { error: studentError } = await supabase
        .from('students')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          country: updates.country,
          timezone: updates.timezone,
          language_pref: updates.language_pref,
        })
        .eq('id', student.id);

      if (studentError) throw studentError;

      // Also update profile if user_id exists
      if (student.user_id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: updates.full_name,
            phone: updates.phone,
            country: updates.country,
          })
          .eq('user_id', student.user_id);

        if (profileError) {
          console.warn('Profile update failed:', profileError);
          // Don't throw - student update succeeded
        }
      }
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully');
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    },
  });

  return {
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
