import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'> & { is_read?: boolean };

export function useAnnouncements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ['announcements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or('target_role.is.null,target_role.eq.teacher')
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Fetch read status
      const { data: reads, error: readsError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.announcement_id) ?? []);

      // Merge read status and filter expired
      const now = new Date();
      return (announcements ?? [])
        .filter(a => !a.expires_at || new Date(a.expires_at) > now)
        .map(a => ({
          ...a,
          is_read: readIds.has(a.id),
        })) as Announcement[];
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (announcementId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          announcement_id: announcementId,
          user_id: user.id,
        }, {
          onConflict: 'announcement_id,user_id',
          ignoreDuplicates: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const unreadCount = announcementsQuery.data?.filter(a => !a.is_read).length ?? 0;

  return {
    announcements: announcementsQuery.data ?? [],
    isLoading: announcementsQuery.isLoading,
    error: announcementsQuery.error,
    unreadCount,
    markAsRead,
  };
}
