import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TeacherStudentMessage {
  id: string;
  teacher_id: string;
  student_id: string;
  sender_type: 'teacher' | 'student';
  message: string;
  is_read: boolean | null;
  created_at: string;
}

export interface AdminTeacherMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string; // Admin messages use 'content' instead of 'message'
  is_read: boolean | null;
  created_at: string;
  sender_type?: never; // Admin messages don't have sender_type, they have sender_id
}

export type Message = TeacherStudentMessage | AdminTeacherMessage;

export interface StudentContact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  lastMessage?: Message;
  unreadCount: number;
  type: 'student' | 'admin';
}

export function useTeacherMessaging() {
  const { teacher, profile, user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time listener
  useEffect(() => {
    if (!teacher?.id) return;

    const channel = supabase
      .channel('teacher-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_student_messages',
          filter: `teacher_id=eq.${teacher.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['teacher-message-contacts'] });
          queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
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
          queryClient.invalidateQueries({ queryKey: ['teacher-message-contacts'] });
          queryClient.invalidateQueries({ queryKey: ['admin-teacher-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacher?.id, user?.id, queryClient]);

  // Fetch all contacts (Students + Admin Support)
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['teacher-message-contacts', teacher?.id],
    queryFn: async () => {
      if (!teacher?.id) return [];

      // 1. Fetch Students who have messaged or are connected
      const { data: messages, error: msgError } = await supabase
        .from('teacher_student_messages')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      const studentIds = [...new Set(messages?.map(m => m.student_id) || [])];
      
      let students: { id: string; full_name: string | null; avatar_url: string | null }[] = [];
      if (studentIds.length > 0) {
        // Use the secure RPC function to fetch user details (bypassing RLS)
        const { data: studentData, error: studentError } = await supabase
          .rpc('get_chat_users_details', { target_ids: studentIds });

        if (!studentError && studentData) {
          students = studentData.map(s => ({
              id: s.id,
              full_name: s.full_name,
              avatar_url: s.avatar_url
            }));
        }
      }

      const studentContacts: StudentContact[] = students.map(s => {
        const sMsgs = (messages?.filter(m => m.student_id === s.id) || []) as TeacherStudentMessage[];
        return {
          id: s.id,
          full_name: s.full_name || 'Unknown Student',
          avatar_url: s.avatar_url,
          lastMessage: sMsgs[0],
          unreadCount: sMsgs.filter(m => !m.is_read && m.sender_type === 'student').length,
          type: 'student'
        };
      });

      // 2. Add Academy Support (Admin)
      // We look for the main Admin account
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
        
        // Filter purely between these two
        const filteredAdminMsgs = (adminMsgs || []).filter(m => 
            (m.sender_id === user?.id && m.recipient_id === adminAuthUid) ||
            (m.sender_id === adminAuthUid && m.recipient_id === user?.id)
        );

        studentContacts.push({
          id: adminProfile.id,
          full_name: 'Academy Support',
          avatar_url: adminProfile.avatar_url,
          lastMessage: filteredAdminMsgs[0] as AdminTeacherMessage,
          unreadCount: filteredAdminMsgs.filter(m => !m.is_read && m.recipient_id === user?.id).length,
          type: 'admin'
        });
      }

      return studentContacts.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || '';
        const bTime = b.lastMessage?.created_at || '';
        return bTime.localeCompare(aTime);
      });
    },
    enabled: !!teacher?.id && !!user?.id,
  });

  // Fetch messages
  const useMessages = (contactId: string | null, type: 'student' | 'admin') => {
    return useQuery<Message[]>({
      queryKey: [type === 'student' ? 'teacher-messages' : 'admin-teacher-messages', teacher?.id, contactId],
      queryFn: async () => {
        if (!contactId) return [];

        if (type === 'student') {
          const { data, error } = await supabase
            .from('teacher_student_messages')
            .select('*')
            .eq('teacher_id', teacher!.id)
            .eq('student_id', contactId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return (data || []) as TeacherStudentMessage[];
        } else {
          // contactId is the admin's profile ID, we need to look up their auth UID
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
            .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          
          // Safety filter for Admin messages
          return (data || []).filter(m => 
            (m.sender_id === user?.id && m.recipient_id === adminAuthUid) ||
            (m.sender_id === adminAuthUid && m.recipient_id === user?.id)
          ) as AdminTeacherMessage[];
        }
      },
      enabled: !!teacher?.id && !!contactId,
    });
  };

  const sendMessage = useMutation({
    mutationFn: async ({ contactId, message, type }: { contactId: string; message: string; type: 'student' | 'admin' }) => {
      if (type === 'student') {
        // Teacher can only message if approved (User's requirement)
        if (teacher?.status !== 'approved' && teacher?.status !== 'active' && teacher?.status !== 'cross-level') {
            throw new Error('Your account must be approved before you can message students.');
        }

        const { data, error } = await supabase
          .from('teacher_student_messages')
          .insert({
            teacher_id: teacher!.id,
            student_id: contactId,
            sender_type: 'teacher',
            message,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // For admin messages, contactId is profile ID — look up auth UID
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
      queryClient.invalidateQueries({ queryKey: [variables.type === 'student' ? 'teacher-messages' : 'admin-teacher-messages'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-message-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  const markAsRead = useMutation({
    mutationFn: async ({ contactId, type }: { contactId: string, type: 'student' | 'admin' }) => {
        if (type === 'student') {
            await supabase
                .from('teacher_student_messages')
                .update({ is_read: true })
                .eq('teacher_id', teacher!.id)
                .eq('student_id', contactId)
                .eq('sender_type', 'student')
                .eq('is_read', false);
        } else {
            // contactId is profile ID, look up auth UID
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
      queryClient.invalidateQueries({ queryKey: ['teacher-message-contacts'] });
    }
  });

  return {
    contacts,
    contactsLoading,
    useMessages,
    sendMessage,
    markAsRead
  };
}
