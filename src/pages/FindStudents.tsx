import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Search, MessageSquare, MapPin, BookOpen, Loader2, Send, User, Clock, UserPlus, Lock } from 'lucide-react';

interface StudentPublic {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  course_level: string | null;
  language_pref: string | null;
  current_surah: string | null;
  current_juzz: number | null;
  status: string | null;
  teacher_id: string | null;
}

interface Message {
  id: string;
  message: string;
  sender_type: string;
  student_id: string;
  teacher_id: string;
  created_at: string;
  is_read: boolean;
}

export default function FindStudents() {
  const { teacher } = useAuth();

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  const [students, setStudents] = useState<StudentPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentPublic | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<string[]>([]);

  const fetchMessages = React.useCallback(async (studentId: string) => {
    if (!teacher?.id) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('teacher_student_messages')
        .select('*')
        .eq('teacher_id', teacher.id)
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [teacher?.id]);

  const fetchStudents = React.useCallback(async (signal?: AbortSignal) => {
    // Check teacher status - if active, they shouldn't be browsing (assigned directly)
    if (teacher?.status === 'active') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('FindStudents: Fetching students...');
      // Fetch directly from students table instead of the view to avoid any view-specific RLS issues
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, avatar_url, country, course_level, language_pref, current_surah, current_juzz, status, teacher_id')
        .eq('status', 'active')
        .is('teacher_id', null);

      if (error) {
        if (error.code === 'ABORTED' || signal?.aborted) return;
        throw error;
      }

      console.log('FindStudents: Found students:', data?.length);
      setStudents((data || []) as StudentPublic[]);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error instanceof Error && error.name === 'AbortError') return;
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [teacher?.status]);

  useEffect(() => {
    const controller = new AbortController();

    // Only fetch if we're not already loading or if specifically triggered
    // We wait for teacher to be available to avoid RLS/role issues on first mount
    if (teacher?.id && teacher?.status !== 'active') {
      fetchStudents(controller.signal);
    } else {
      // If teacher is not ready or is active, we stop loading
      setLoading(false);
    }

    return () => controller.abort();
  }, [teacher?.id, teacher?.status, fetchStudents]);

  useEffect(() => {
    if (selectedStudent && teacher?.id) {
      fetchMessages(selectedStudent.id);

      // Real-time listener for this specific conversation
      const channel = supabase
        .channel(`messages-${selectedStudent.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'teacher_student_messages',
            filter: `teacher_id=eq.${teacher.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            if (newMessage.student_id === selectedStudent.id) {
              setMessages(prev => [...prev, newMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedStudent, teacher?.id, fetchMessages]);

  // Conditional return AFTER all hooks
  if (teacher?.status === 'active') {
    return (
      <div className="container py-10">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
              <Lock className="h-5 w-5" />
              Access Restricted
            </CardTitle>
            <CardDescription className="text-amber-700/90 dark:text-amber-600/90">
              As an assigned teacher, you cannot browse for new students. You are assigned students directly by the admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!selectedStudent || !teacher?.id || !messageText.trim()) return;

    if (teacher.status !== 'approved') {
      toast.error('You must be an approved teacher to send messages.');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('teacher_student_messages')
        .insert({
          teacher_id: teacher.id,
          student_id: selectedStudent.id,
          sender_type: 'teacher',
          message: messageText.trim(),
        });

      if (error) throw error;

      toast.success('Message sent!');
      setMessageText('');
      fetchMessages(selectedStudent.id);
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedStudent || !teacher?.id) return;

    if (teacher.status !== 'approved') {
      toast.error('You must be an approved teacher to send invitations.');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          teacher_id: teacher.id,
          student_id: selectedStudent.id,
          status: 'pending',
          initiated_by_role: 'teacher',
          message: messageText.trim() || 'I would like to be your teacher.'
        });

      if (error) throw error;

      toast.success('Invitation sent!');
      setPendingInvitations(prev => [...prev, selectedStudent.id]);
      setMessageText('');
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course_level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-600';
      case 'intermediate': return 'bg-blue-500/10 text-blue-600';
      case 'advanced': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Students</h1>
        <p className="text-muted-foreground">Browse students looking for Quran teachers and reach out to them</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, country, or level..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'No students are currently looking for teachers'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const initials = student.full_name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ST';

            return (
              <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={student.avatar_url || undefined} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{student.full_name}</CardTitle>
                      {student.country && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {student.country}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Level */}
                  <div className="flex flex-wrap gap-2">
                    {student.course_level && (
                      <Badge className={getLevelColor(student.course_level)}>
                        {student.course_level}
                      </Badge>
                    )}
                    {student.language_pref && (
                      <Badge variant="outline" className="text-xs">
                        {student.language_pref}
                      </Badge>
                    )}
                  </div>

                  {/* Current Progress */}
                  {(student.current_surah || student.current_juzz) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {student.current_surah && `Surah: ${student.current_surah}`}
                        {student.current_surah && student.current_juzz && ' • '}
                        {student.current_juzz && `Juzz ${student.current_juzz}`}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={pendingInvitations.includes(student.id)}
                      onClick={async () => {
                        setSelectedStudent(student);
                        // We'll let them add a message in the dialog
                      }}
                    >
                      {pendingInvitations.includes(student.id) ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Invited
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedStudent?.avatar_url || undefined} />
                <AvatarFallback>
                  {selectedStudent?.full_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedStudent?.full_name}</span>
                {selectedStudent?.country && (
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedStudent.country}
                  </p>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              Send a message to introduce yourself and your teaching approach
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message History */}
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'teacher' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender_type === 'teacher'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_type === 'teacher' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}

            {/* New Message Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
                className="flex-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Message Only
                  </>
                )}
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={sending || pendingInvitations.includes(selectedStudent?.id || '')}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
