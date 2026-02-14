import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  teacher_id?: string;
  student_id?: string;
  sender_id?: string;
  recipient_id?: string;
  sender_type?: 'teacher' | 'student' | 'admin';
  message?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

export interface TeacherContact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  lastMessage?: Message;
  unreadCount: number;
  type: 'teacher' | 'admin';
}

interface PublicTeacher {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useStudentMessages() {
  const { student, profile, user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time listener for new messages
  useEffect(() => {
    if (!student?.id) return;

    const channel = supabase
      .channel('student-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_student_messages',
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-message-contacts'] });
          queryClient.invalidateQueries({ queryKey: ['student-messages'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user?.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-message-contacts'] });
          queryClient.invalidateQueries({ queryKey: ['admin-student-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id, user?.id, queryClient]);

  // Fetch all contacts (Teachers who messaged + Academy Support)
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['student-message-contacts', student?.id],
    queryFn: async () => {
      if (!student?.id || !user?.id) return [];

      // 1. Get Teacher messages
      const { data: messages, error } = await supabase
        .from('teacher_student_messages')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const teacherIds = [...new Set(messages?.map(m => m.teacher_id) || [])];
      
      let teachers: PublicTeacher[] = [];
      if (teacherIds.length > 0) {
        // Use the secure RPC function to fetch user details (bypassing RLS)
        const { data: teacherData, error: teacherError } = await supabase
          .rpc('get_chat_users_details', { target_ids: teacherIds });

        if (!teacherError && teacherData) {
          teachers = teacherData.map(t => ({
              id: t.id,
              full_name: t.full_name,
              avatar_url: t.avatar_url
            }));
        }
      }

      const contactsMap: TeacherContact[] = teachers.map(teacher => {
        const teacherMessages = messages?.filter(m => m.teacher_id === teacher.id) || [];
        return {
          id: teacher.id,
          full_name: teacher.full_name || 'Unknown Teacher',
          avatar_url: teacher.avatar_url,
          lastMessage: teacherMessages[0] as Message | undefined,
          unreadCount: teacherMessages.filter(m => !m.is_read && m.sender_type === 'teacher').length,
          type: 'teacher'
        };
      });

      // 2. Add Academy Support (Admin)
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_id')
        .eq('id', '3f4e8549-3af5-4270-8499-16cf8a2c6af8') // Known Admin profile ID
        .single();

      if (adminProfile) {
        const adminAuthUid = adminProfile.user_id; // Admin's auth UID for messages table
        const { data: adminMsgs } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
          .or(`sender_id.eq.${adminAuthUid},recipient_id.eq.${adminAuthUid}`)
          .order('created_at', { ascending: false });
        
        const filteredAdminMsgs = (adminMsgs || []).filter(m => 
            (m.sender_id === user?.id && m.recipient_id === adminAuthUid) ||
            (m.sender_id === adminAuthUid && m.recipient_id === user?.id)
        );

        contactsMap.push({
          id: adminProfile.id,
          full_name: 'Academy Support',
          avatar_url: adminProfile.avatar_url,
          lastMessage: filteredAdminMsgs[0] as Message | undefined,
          unreadCount: filteredAdminMsgs.filter(m => !m.is_read && m.recipient_id === user?.id).length,
          type: 'admin'
        });
      }

      return contactsMap.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || '';
        const bTime = b.lastMessage?.created_at || '';
        return bTime.localeCompare(aTime);
      });
    },
    enabled: !!student?.id && !!user?.id,
  });

  // Fetch messages with a specific contact
  const useMessages = (contactId: string | null, type: 'teacher' | 'admin') => {
    return useQuery<Message[]>({
      queryKey: [type === 'teacher' ? 'student-messages' : 'admin-student-messages', student?.id, contactId],
      queryFn: async () => {
        if (!contactId || !student?.id) return [];

        if (type === 'teacher') {
            const { data, error } = await supabase
                .from('teacher_student_messages')
                .select('*')
                .eq('student_id', student.id)
                .eq('teacher_id', contactId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return (data || []) as Message[];
        } else {
            // contactId is admin's profile ID — look up auth UID
            const { data: adminProfile } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('id', contactId)
                .single();
            
            const adminAuthUid = adminProfile?.user_id;
            if (!adminAuthUid) return [];

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            return (data || []).filter(m => 
                (m.sender_id === user!.id && m.recipient_id === adminAuthUid) ||
                (m.sender_id === adminAuthUid && m.recipient_id === user!.id)
            ) as Message[];
        }
      },
      enabled: !!student?.id && !!contactId,
    });
  };

  // Archive old name for compatibility
  const useTeacherMessages = (teacherId: string | null) => useMessages(teacherId, 'teacher');

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ contactId, message, type }: { contactId: string; message: string; type: 'teacher' | 'admin' }) => {
      if (!student?.id || !user?.id) throw new Error('Not authenticated');

      if (type === 'teacher') {
          // Check for academy restriction
          if (student.teacher_selection_mode === 'academy' && student.teacher_id === contactId) {
            throw new Error('Messaging is restricted for academy-assigned teachers');
          }

          const { data: teacherData } = await supabase
            .from('teachers')
            .select('status')
            .eq('id', contactId)
            .single();

          if (teacherData?.status !== 'approved' && teacherData?.status !== 'active' && teacherData?.status !== 'cross-level') {
            throw new Error('You can only message approved teachers');
          }

          const { data, error } = await supabase
            .from('teacher_student_messages')
            .insert({
              teacher_id: contactId,
              student_id: student.id,
              sender_type: 'student',
              message,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
      } else {
        // contactId is admin's profile ID — look up auth UID
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', contactId)
          .single();
        
        const adminAuthUid = adminProfile?.user_id;
        if (!adminAuthUid) throw new Error('Could not find admin account');

        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender_id: user!.id,
            recipient_id: adminAuthUid,
            content: message,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'teacher' ? 'student-messages' : 'admin-student-messages'] });
      queryClient.invalidateQueries({ queryKey: ['student-message-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async ({ contactId, type }: { contactId: string, type: 'teacher' | 'admin' }) => {
      if (!student?.id || !user?.id) return;

      if (type === 'teacher') {
          await supabase
            .from('teacher_student_messages')
            .update({ is_read: true })
            .eq('student_id', student.id)
            .eq('teacher_id', contactId)
            .eq('sender_type', 'teacher')
            .eq('is_read', false);
      } else {
          // contactId is admin profile ID — look up auth UID
          const { data: adminProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', contactId)
            .single();
          
          if (adminProfile?.user_id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('recipient_id', user!.id)
              .eq('sender_id', adminProfile.user_id)
              .eq('is_read', false);
          }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-message-contacts'] });
    },
  });

  return {
    contacts,
    contactsLoading,
    useMessages,
    useTeacherMessages,
    sendMessage,
    markAsRead,
  };
}
