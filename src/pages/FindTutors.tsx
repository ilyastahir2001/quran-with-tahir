import React, { useState, useEffect, useCallback } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, UserPlus, Clock, BookOpen, Loader2, CheckCircle2, Sparkles, Star, ShieldCheck, ArrowRight, MessageCircle, Calendar as CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TeacherPublic {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specializations: string[] | null;
  bio: string | null;
  teaching_hours_per_week: number | null;
  status: string | null;
  is_verified: boolean;
}

export default function FindTutors() {
  const { student } = useAuth();
  const [teachers, setTeachers] = useState<TeacherPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPublic | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [activeDialog, setActiveDialog] = useState<'connect' | 'profile' | 'book' | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());

  const fetchPendingRequests = useCallback(async () => {
    if (!student?.id) return;

    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('teacher_id')
        .eq('student_id', student.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data?.map(r => r.teacher_id) || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, [student?.id]);

  useEffect(() => {
    fetchTeachers();
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      console.log('FindTutors: Fetching teachers...');
      // Fetch from teachers and join with profiles explicitly via profile_id
      // We use !inner to ensure we only get teachers with valid profiles
      // Using profile_id explicitly as it's the foreign key to profiles.id
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          specializations,
          bio,
          teaching_hours_per_week,
          status,
          is_verified,
          profile:profiles!profile_id(full_name, avatar_url)
        `)
        .in('status', ['approved', 'cross-level']);

      if (error) {
        console.error('FindTutors: Supabase error:', error);
        throw error;
      }

      console.log('FindTutors: Found teachers:', data?.length);

      // Transform data with safety checks
      const transformedTeachers: TeacherPublic[] = (data || []).map(t => {
        const profile = (t.profile as unknown as { full_name: string; avatar_url: string | null }) || {};
        return {
          id: t.id,
          full_name: profile.full_name || 'Anonymous Teacher',
          avatar_url: profile.avatar_url || null,
          specializations: t.specializations,
          bio: t.bio,
          teaching_hours_per_week: t.teaching_hours_per_week,
          status: t.status,
          is_verified: t.is_verified || false
        };
      });

      setTeachers(transformedTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedTeacher || !student?.id) return;

    setSending(true);
    try {
      let finalMessage = connectionMessage;
      if (activeDialog === 'book' && bookingDate) {
        const dateStr = format(bookingDate, 'PPPP');
        finalMessage = `[BOOKING REQUEST] I would like to book a slot for ${dateStr}. ${connectionMessage}`.trim();
      }

      const { error } = await supabase
        .from('connection_requests')
        .upsert({
          student_id: student.id,
          teacher_id: selectedTeacher.id,
          message: finalMessage || null,
          initiated_by_role: 'student',
          status: 'pending'
        }, { onConflict: 'student_id,teacher_id' });

      if (error) throw error;

      toast.success(activeDialog === 'book' ? 'Booking request sent!' : 'Message sent!');
      setPendingRequests([...pendingRequests, selectedTeacher.id]);
      setSelectedTeacher(null);
      setActiveDialog(null);
      setConnectionMessage('');
    } catch (error: unknown) {
      console.error('Error sending connection request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/10">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BookOpen className="h-64 w-64 text-primary" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Certified Tutors</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Find Your Ideal Teacher</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Connect with world-class Quran scholars and certified teachers for personalized learning.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/50 backdrop-blur-xl border-2 border-primary/5 focus:border-primary/20 rounded-2xl shadow-sm transition-all text-lg"
            />
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Teachers Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'No teachers are currently available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher, index) => {
            const isPending = pendingRequests.includes(teacher.id);
            const initials = teacher.full_name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card
                key={teacher.id}
                className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 p-4">
                  {teacher.is_verified && (
                    <div className="bg-primary/10 backdrop-blur-md p-1.5 rounded-full" title="Verified Teacher">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <AvatarImage src={teacher.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl font-black bg-slate-100 text-slate-400">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white" title="Available Now" />
                    </div>

                    <div className="text-center">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{teacher.full_name}</CardTitle>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="h-4 w-4 fill-amber-500" />
                          4.9
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                          <Clock className="h-3 w-3" />
                          {teacher.teaching_hours_per_week || 0} hrs/wk
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Bio */}
                  {teacher.bio && (
                    <p className="text-sm text-muted-foreground text-center line-clamp-2 px-2 italic leading-relaxed">
                      "{teacher.bio}"
                    </p>
                  )}

                  {/* Specializations */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {teacher.specializations?.slice(0, 3).map((spec, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-50 text-slate-600 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                        {spec}
                      </Badge>
                    ))}
                    {teacher.specializations && teacher.specializations.length > 3 && (
                      <Badge variant="outline" className="rounded-full text-[10px] border-slate-200">
                        +{teacher.specializations.length - 3} More
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl font-bold flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setActiveDialog('profile');
                      }}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl font-bold flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setActiveDialog('connect');
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                    <Button
                      className={cn(
                        "col-span-2 h-11 rounded-xl font-black transition-all duration-300",
                        isPending
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40"
                      )}
                      disabled={isPending}
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setActiveDialog('book');
                      }}
                    >
                      {isPending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Requested
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Time Slot
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

      {/* Multi-Purpose Dialogs */}
      <Dialog open={!!selectedTeacher && activeDialog !== null} onOpenChange={() => {
        setSelectedTeacher(null);
        setActiveDialog(null);
      }}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {activeDialog === 'profile' && selectedTeacher && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                <div className="absolute -bottom-12 left-6">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={selectedTeacher.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl font-black bg-slate-100 text-slate-400">
                      {selectedTeacher.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-16 px-6 pb-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedTeacher.full_name}</h2>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mt-1">
                    <ShieldCheck className="h-4 w-4" />
                    Certified Quran Instructor
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">About Me</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1 bg-primary/5 rounded-r-xl">
                    "{selectedTeacher.bio || 'No bio provided.'}"
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.specializations?.map((spec, i) => (
                      <Badge key={i} className="bg-white border-slate-100 text-slate-600 shadow-sm px-3 rounded-full h-8 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20" onClick={() => setActiveDialog('connect')}>
                  Send Message
                </Button>
              </div>
            </div>
          )}

          {activeDialog === 'connect' && selectedTeacher && (
            <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl">
                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                  <AvatarImage src={selectedTeacher.avatar_url || undefined} />
                  <AvatarFallback className="bg-slate-100 font-bold">{selectedTeacher.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-slate-900">Message {selectedTeacher.full_name}</p>
                  <p className="text-xs text-muted-foreground italic">Start a conversation to learn more</p>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Assalamu Alaikum! I would like to learn Quran with you. My goals are..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  className="min-h-[150px] rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 p-4"
                />
                <Button onClick={handleConnect} disabled={sending} className="w-full h-12 rounded-xl font-black shadow-xl shadow-primary/10">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Message'}
                </Button>
              </div>
            </div>
          )}

          {activeDialog === 'book' && selectedTeacher && (
            <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Book Your First Slot</h2>
                <p className="text-sm text-slate-500">Pick a starting date for your trial class with {selectedTeacher.full_name.split(' ')[0]}.</p>
              </div>

              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-50 justify-between px-6 font-bold text-slate-700 bg-slate-50/50 hover:bg-white transition-all">
                      <span>{bookingDate ? format(bookingDate, 'PPP') : 'Select Date'}</span>
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="center">
                    <Calendar
                      mode="single"
                      selected={bookingDate}
                      onSelect={setBookingDate}
                      initialFocus
                      className="rounded-3xl"
                    />
                  </PopoverContent>
                </Popover>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                  <p className="text-xs text-amber-800 leading-relaxed italic">
                    By booking, you'll send a connection request with your preferred schedule to {selectedTeacher.full_name}.
                  </p>
                </div>

                <Button onClick={handleConnect} disabled={sending} className="w-full h-14 rounded-2xl font-black shadow-2xl shadow-primary/20 bg-primary text-white text-lg">
                  {sending ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Request Booking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
