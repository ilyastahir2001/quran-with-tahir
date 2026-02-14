import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  CheckCircle2,
  Star,
  ListTodo,
  AlertCircle,
  XCircle,
  Phone,
  ArrowRight,
  Clock,
  Users,
  BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardStats, TodayClass } from '@/types/database';
import { ProfileCompletionAlert } from '@/components/dashboard/ProfileCompletionAlert';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { profile, teacher, student, isLoading, displayName } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', teacher?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!teacher?.id) throw new Error('No teacher');

      // Today's classes count
      const { count: todayCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('scheduled_date', today);

      // Completed this week
      const weekStart = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const { count: completedCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('status', 'completed')
        .gte('scheduled_date', weekStart);

      // Average rating
      const { data: ratings } = await supabase
        .from('lessons')
        .select('rating_concentration, rating_revision, rating_progress')
        .eq('teacher_id', teacher.id)
        .not('rating_concentration', 'is', null);

      let avgRating = 0;
      if (ratings && ratings.length > 0) {
        const total = ratings.reduce((sum, r) => {
          const avg = ((r.rating_concentration || 0) + (r.rating_revision || 0) + (r.rating_progress || 0)) / 3;
          return sum + avg;
        }, 0);
        avgRating = total / ratings.length;
      }

      // Pending tasks
      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('status', 'pending');

      // Missed classes (excluding on_leave - those are approved absences)
      const { count: missedCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .in('status', ['missed', 'no_answer'])
        .gte('scheduled_date', weekStart);

      // Completed Total & Duration
      const { data: allCompleted } = await supabase
        .from('classes')
        .select('duration_minutes')
        .eq('teacher_id', teacher.id)
        .eq('status', 'completed');

      const totalClasses = allCompleted?.length || 0;
      const totalMinutes = allCompleted?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
      const totalHours = Math.round(totalMinutes / 60);

      // Monthly Classes
      const monthStart = format(new Date(), 'yyyy-MM-01');
      const { count: monthlyCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('status', 'completed')
        .gte('scheduled_date', monthStart);

      // Attendance Rate (Completed vs (Completed + Missed + No Answer))
      // Note: 'on_leave' is excluded - it's an approved absence
      const { count: unexpectedMissed } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .in('status', ['missed', 'no_answer']);

      const totalScheduled = totalClasses + (unexpectedMissed || 0);
      const attendanceRate = totalScheduled > 0
        ? Math.round((totalClasses / totalScheduled) * 100)
        : 100;

      return {
        todayClassesCount: todayCount || 0,
        completedThisWeek: completedCount || 0,
        averageRating: avgRating,
        pendingTasks: pendingTasks || 0,
        missedClassesCount: missedCount || 0,
        totalClasses,
        totalHours,
        monthlyClasses: monthlyCount || 0,
        attendanceRate
      };
    },
    enabled: !!teacher?.id,
  });

  // Real-time updates for teacher dashboard
  React.useEffect(() => {
    if (!teacher?.id) return;

    const channel = supabase
      .channel(`teacher-dashboard-${teacher.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes', filter: `teacher_id=eq.${teacher.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', teacher.id] });
        queryClient.invalidateQueries({ queryKey: ['next-class', teacher.id] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-classes', teacher.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `teacher_id=eq.${teacher.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', teacher.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons', filter: `teacher_id=eq.${teacher.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', teacher.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacher?.id, queryClient]);

  // Fetch next class
  const { data: nextClass, isLoading: nextClassLoading } = useQuery({
    queryKey: ['next-class', teacher?.id],
    queryFn: async (): Promise<TodayClass | null> => {
      if (!teacher?.id) return null;

      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');

      const { data } = await supabase
        .from('classes')
        .select(`
          *,
          student:students(*)
        `)
        .eq('teacher_id', teacher.id)
        .eq('scheduled_date', today)
        .gte('start_time', currentTime)
        .in('status', ['scheduled', 'in_progress'])
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      return data as TodayClass | null;
    },
    enabled: !!teacher?.id,
  });

  // Fetch upcoming classes
  const { data: upcomingClasses } = useQuery({
    queryKey: ['upcoming-classes', teacher?.id],
    queryFn: async () => {
      if (!teacher?.id) return [];

      const { data } = await supabase
        .from('classes')
        .select(`
          *,
          student:students(*)
        `)
        .eq('teacher_id', teacher.id)
        .eq('scheduled_date', today)
        .eq('status', 'scheduled')
        .order('start_time', { ascending: true })
        .limit(5);

      return (data || []) as TodayClass[];
    },
    enabled: !!teacher?.id,
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {displayName.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <ProfileCompletionAlert />

      {/* Pending Teacher Banner - Guarded with !isLoading to prevent blinks during check */}
      {!isLoading && teacher && teacher.status !== 'approved' && teacher.status !== 'active' && (
        <Card className={teacher.status === 'rejected' ? "border-destructive bg-destructive/10" : "border-warning bg-warning/10"}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${teacher.status === 'rejected' ? "bg-destructive/20" : "bg-warning/20"}`}>
                {teacher.status === 'rejected' ? <XCircle className="h-5 w-5 text-destructive" /> : <AlertCircle className="h-5 w-5 text-warning" />}
              </div>
              <div>
                <h3 className={`font-semibold ${teacher.status === 'rejected' ? "text-destructive" : "text-warning"}`}>
                  {teacher.status === 'rejected' ? 'Application Rejected' : 'Application Pending'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {teacher.status === 'rejected'
                    ? 'Your application to join as a teacher has been rejected. Please contact support for more details.'
                    : 'Your account is pending approval by an administrator. You cannot view students or send messages until approved.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.todayClassesCount || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Classes</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.completedThisWeek || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Classes</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.monthlyClasses || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.totalHours || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 2 */}
        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stats?.attendanceRate || 100}%</p>
                    {/* Absence Count as subtext */}
                    {stats?.missedClassesCount ? (
                      <p className="text-xs text-destructive font-medium">
                        ({stats.missedClassesCount} missed)
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.totalClasses || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">
                    {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.pendingTasks || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <ListTodo className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for missed classes */}
      {stats && stats.missedClassesCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors"
          onClick={() => navigate('/teacher/today-classes?filter=missed')}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  {stats.missedClassesCount} missed class{stats.missedClassesCount > 1 ? 'es' : ''} this week
                </p>
                <p className="text-sm text-muted-foreground">Click to view and reschedule</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Class - Large Card */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Next Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextClassLoading ? (
                <div className="flex items-center gap-6">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ) : nextClass ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={nextClass.student?.avatar_url || ''} alt={nextClass.student?.full_name ?? undefined} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {nextClass.student?.full_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-2xl font-bold">{nextClass.student?.full_name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="secondary">{nextClass.student?.course_level}</Badge>
                        <span>•</span>
                        <span>{nextClass.student?.country}</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-primary">
                      {formatTime(nextClass.start_time)} - {nextClass.duration_minutes || 0} min
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      size="lg"
                      className="flex-1 md:flex-none"
                      onClick={() => navigate(`/teacher/today-classes?action=start&classId=${nextClass.id}`)}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Start Class
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg">No upcoming classes today</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/teacher/schedule')}>
                    View Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/teacher/today-classes')}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Today's Classes
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/teacher/students')}>
                <Users className="mr-2 h-4 w-4" />
                My Students
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/teacher/lessons/add')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/teacher/attendance')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Attendance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Classes List */}
      {upcomingClasses && upcomingClasses.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Today</CardTitle>
              <CardDescription>Your remaining classes for today</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => navigate('/teacher/today-classes')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.slice(0, 4).map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={cls.student?.avatar_url || ''} alt={cls.student?.full_name ?? undefined} />
                    <AvatarFallback>{cls.student?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cls.student?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(cls.start_time)} • {cls.duration_minutes || 0} min
                    </p>
                  </div>
                  <Badge variant="secondary">{cls.student?.course_level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
