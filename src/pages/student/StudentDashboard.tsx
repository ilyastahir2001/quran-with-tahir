import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Student } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Clock,
  GraduationCap,
  Search,
  Video,
  ChevronRight,
  ClipboardList,
  Trophy,
  Sparkles,
  Map as MapIcon,
  Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { HafizPathMap } from '@/components/quran/HafizPathMap';
import { useQuranProgress } from '@/hooks/useQuranProgress';
import { useGamification } from '@/hooks/useGamification';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { TrophyCase } from '@/components/gamification/TrophyCase';
import { AvatarCustomizer } from '@/components/avatars/AvatarCustomizer';
import { GlobalLeaderboard } from '@/components/avatars/GlobalLeaderboard';
import { StudentAvatar, AvatarConfig } from '@/components/avatars/StudentAvatar';
import { TeacherSelectionOverlay } from '@/components/student/TeacherSelectionOverlay';
import { SetAvailabilityOverlay } from '@/components/student/SetAvailabilityOverlay';
import { useStudentConnection } from '@/hooks/useStudentConnection';
import { useStudentClasses } from '@/hooks/useStudentClasses';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useIsMobile } from '@/hooks/use-mobile';
import ParentMobileDashboard from '../parent/ParentMobileDashboard';
import { ProfileCompletionAlert } from '@/components/dashboard/ProfileCompletionAlert';

export default function StudentDashboard() {
  const { student, profile, isParent, activeChild, achievements, refreshProfile } = useAuth();
  const [showAvailability, setShowAvailability] = React.useState(false);
  const displayStudent: Student | null = isParent && activeChild ? activeChild : student;

  const { data: quranProgress, isLoading: progressLoading } = useQuranProgress(displayStudent?.id);
  const { connectedTeacher } = useStudentConnection();
  const { data: upcomingClasses, isLoading: upcomingLoading } = useStudentClasses({ filter: 'upcoming' });
  const nextClass = upcomingClasses?.[0];

  // Fetch Student Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats', displayStudent?.id],
    queryFn: async () => {
      if (!displayStudent?.id) return null;

      // 1. Total Completed Classes & Duration
      const { data: completedClasses } = await supabase
        .from('classes')
        .select('duration_minutes')
        .eq('student_id', displayStudent.id)
        .eq('status', 'completed');

      const totalClasses = completedClasses?.length || 0;
      const totalMinutes = completedClasses?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
      const totalHours = Math.round(totalMinutes / 60);

      // 2. Weekly Attendance (Count of completed classes this week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const { count: weeklyCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', displayStudent.id)
        .eq('status', 'completed')
        .gte('scheduled_date', weekStart.toISOString().split('T')[0]);

      // 3. Monthly Attendance
      const monthStart = new Date();
      monthStart.setDate(1);
      const { count: monthlyCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', displayStudent.id)
        .eq('status', 'completed')
        .gte('scheduled_date', monthStart.toISOString().split('T')[0]);

      // 4. Attendance Rate
      const { count: missedCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', displayStudent.id)
        .in('status', ['missed', 'no_answer']);

      const totalScheduled = totalClasses + (missedCount || 0);
      const attendanceRate = totalScheduled > 0
        ? Math.round((totalClasses / totalScheduled) * 100)
        : 100;

      return {
        totalClasses,
        totalHours,
        weeklyAttendance: weeklyCount || 0,
        monthlyAttendance: monthlyCount || 0,
        attendanceRate
      };
    },
    enabled: !!displayStudent?.id
  });

  // Calculate XP based on progress (demo: 100 XP per surah, 500 per juz)
  const calculatedXp = ((quranProgress?.completedSurahs.length || 0) * 100) +
    ((quranProgress?.completedJuz.length || 0) * 500);

  const { level, currentRank, nextRank, progressToNext, xp } = useGamification(calculatedXp);

  const displayName = displayStudent?.full_name || profile?.full_name || 'Student';
  const currentSurah = displayStudent?.current_surah || 'Al-Fatiha';
  const currentJuzz = displayStudent?.current_juzz || 1;
  const progress = displayStudent?.progress_percentage || 0;

  const isMobile = useIsMobile();

  const showSelectionOverlay = !isParent && student && !student.teacher_id && !student.teacher_selection_mode;

  if (isMobile && isParent) {
    return <ParentMobileDashboard />;
  }

  return (
    <div className="space-y-6">
      {showSelectionOverlay && (
        <TeacherSelectionOverlay
          studentId={student.id}
          onSelectionComplete={refreshProfile}
        />
      )}

      <ProfileCompletionAlert />

      {showAvailability && !isParent && student && (
        <SetAvailabilityOverlay
          studentId={student.id}
          onComplete={() => {
            setShowAvailability(false);
            refreshProfile();
          }}
          onClose={() => setShowAvailability(false)}
        />
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl p-8 md:p-10 border border-primary/10">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <StudentAvatar config={(profile?.metadata as { avatar_config?: AvatarConfig })?.avatar_config} size={100} className="relative ring-4 ring-background" />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-background">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tight">
                  Assalamu Alaikum, <span className="text-primary">{displayName}</span>! 👋
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl">
                  {isParent
                    ? `Your child is making great progress. ${activeChild?.full_name} has completed ${quranProgress?.lessonCount || 0} lessons so far.`
                    : 'Your Quranic journey is a path of light. Continue your progress and master the word of Allah today.'
                  }
                </p>
              </div>
            </div>
            <StreakCounter streak={displayStudent?.current_streak || 0} />
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20" asChild>
              <Link to="/student/classes">
                <Video className="h-5 w-5 mr-2" />
                Join Class
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 bg-background/50 backdrop-blur-sm" asChild>
              <Link to="/student/exams">
                <ClipboardList className="h-5 w-5 mr-2" />
                Take Exam
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Classes */}
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Classes</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black">{stats?.totalClasses || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">Lifetime sessions</p>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Hours</CardTitle>
            <Clock className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black">{stats?.totalHours || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">Hours learned</p>
          </CardContent>
        </Card>

        {/* Weekly Attendance */}
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">This Week</CardTitle>
            <CalendarDays className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black">{stats?.weeklyAttendance || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">Classes attended</p>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Attendance</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black">{stats?.attendanceRate || 100}%</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Hub */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <TrophyCase achievements={achievements} />
        </div>
        {!isParent && (
          <div id="avatar-section" className="lg:col-span-7">
            <AvatarCustomizer />
          </div>
        )}
        <div className={!isParent ? "lg:col-span-5" : "lg:col-span-12"}>
          <GlobalLeaderboard />
        </div>
      </div>

      {/* Real-time Quran Master Component */}
      <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <MapIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Path to Hafiz</CardTitle>
                <CardDescription className="text-base">Your interactive journey through the 114 Holy Surahs.</CardDescription>
              </div>
            </div>
            <Link to="/student/progress">
              <Button variant="ghost" className="rounded-full group font-bold">
                View Full Adventure
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-muted/5 p-6 border-b border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-2 bg-background rounded-2xl border-2 border-primary/10 shadow-sm">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Rank</div>
                  <div className={cn("text-lg font-black flex items-center gap-2", currentRank.color)}>
                    <span>{currentRank.icon}</span>
                    {currentRank.name}
                  </div>
                </div>
                <div className="text-center px-6 py-2 bg-background rounded-2xl border-2 border-primary/10 shadow-sm">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Level</div>
                  <div className="text-lg font-black text-primary">{level}</div>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mastery XP: {xp.toLocaleString()}</span>
                  {nextRank && (
                    <span className="text-xs font-bold text-primary italic">Next: {nextRank.name}</span>
                  )}
                </div>
                <Progress value={progressToNext} className="h-3 bg-primary/5 ring-1 ring-primary/10" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-slate-700/50 relative overflow-hidden">
            <HafizPathMap
              completedSurahIds={quranProgress?.completedSurahs}
              currentSurahId={114 - (quranProgress?.completedSurahs.length || 0)} // Temporary logic to show progress
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Next Class Card */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Video className="h-6 w-6 text-primary" />
              Upcoming Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="py-10 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-10 w-48 mx-auto rounded-full" />
              </div>
            ) : nextClass ? (
              <div className="text-center py-6">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-16 w-16 ring-4 ring-primary/5">
                    <AvatarImage src={nextClass.teacher?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                      {nextClass.teacher?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-bold text-lg mb-1">{nextClass.teacher?.full_name || 'Your Teacher'}</h3>
                <div className="flex flex-col items-center gap-1 mb-6">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-full">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(parseISO(nextClass.scheduled_date), 'EEE, MMM d')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {nextClass.start_time.slice(0, 5)}
                  </div>
                </div>
                <Button className="rounded-full px-8 shadow-md" asChild>
                  <Link to="/student/classes">Go to Classroom</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                <GraduationCap className="h-14 w-14 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">No Scheduled Sessions</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto mb-6">
                  Your learning path is waiting. Connect with your teacher to book your next slot.
                </p>
                <Button className="rounded-full px-8" asChild>
                  <Link to={displayStudent?.teacher_id ? "/student/schedule" : "/student/find-tutors"}>
                    {displayStudent?.teacher_id ? "Check My Schedule" : "Find a Teacher"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Teacher Card */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">My Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            {displayStudent?.teacher_id ? (
              <div className="text-center py-6">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/5">
                    <AvatarImage src={connectedTeacher?.status === 'approved' ? (connectedTeacher?.profile?.avatar_url || '') : ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                      {connectedTeacher?.profile?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{connectedTeacher?.profile?.full_name || 'Your Connected Teacher'}</h3>
                <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold px-4 py-0.5 rounded-full uppercase tracking-widest text-[9px]">
                  Assigned Teacher
                </Badge>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="rounded-full h-9 text-xs" asChild>
                    <Link to="/student/messages">Message</Link>
                  </Button>
                  <Button className="rounded-full h-9 text-xs" asChild>
                    <Link to="/student/my-teacher">View Info</Link>
                  </Button>
                </div>
              </div>
            ) : displayStudent?.teacher_selection_mode === 'academy' ? (
              <div className="text-center py-6">
                {!displayStudent?.schedule_days?.length ? (
                  <div className="bg-amber-50 rounded-2xl p-6 border-2 border-dashed border-amber-200">
                    <Clock className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-amber-900">Set Your Learning Hours</h3>
                    <p className="text-amber-700 text-sm mb-6">
                      We need your available days and time to find the perfect teacher for you.
                    </p>
                    <Button
                      className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 border-none"
                      onClick={() => setShowAvailability(true)}
                    >
                      Set Availability
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 animate-pulse">
                    <GraduationCap className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Matching in Progress...</h3>
                    <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mb-4">
                      Our experts are assigning the best teacher for your schedule.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <Badge variant="secondary" className="bg-white/80 border-primary/10">
                        {displayStudent.schedule_days.join(', ')}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/80 border-primary/10">
                        {displayStudent.schedule_time}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary font-bold decoration-2"
                      onClick={() => setShowAvailability(true)}
                    >
                      Update Schedule
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                <Search className="h-14 w-14 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Find Your Ideal Teacher</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto mb-6">
                  Browse over 50+ certified Quran teachers worldwide.
                </p>
                <Button className="rounded-full px-8" asChild>
                  <Link to="/student/find-tutors">Browse Teachers</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
