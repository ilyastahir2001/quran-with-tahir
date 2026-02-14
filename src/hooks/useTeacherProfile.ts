import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TeacherProfileUpdateData {
    full_name?: string;
    phone?: string;
    country?: string;
    language_pref?: string;
    avatar_url?: string;
}

export function useTeacherProfile() {
    const { teacher, profile, refreshProfile } = useAuth();
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async (updates: TeacherProfileUpdateData) => {
            if (!profile?.user_id) throw new Error('No user ID');

            // Update profile record
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: updates.full_name,
                    phone: updates.phone,
                    country: updates.country,
                    language_pref: updates.language_pref ?? 'english',
                    avatar_url: updates.avatar_url,
                })
                .eq('user_id', profile.user_id);

            if (profileError) throw profileError;
        },
        onSuccess: async () => {
            toast.success('Profile updated successfully');
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['teacher'] });
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
