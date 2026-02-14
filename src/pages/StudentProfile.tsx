import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressIndicator } from '@/components/students/ProgressIndicator';
import { StarRating } from '@/components/lessons/StarRating';
import {
  useStudent,
  useStudentLessons,
  useStudentClasses,
  useUpdateStudentNotes,
} from '@/hooks/useStudents';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Video,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'inactive':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'on_hold':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getClassStatusColor = (status?: string | null) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-600';
    case 'scheduled':
      return 'bg-blue-500/10 text-blue-600';
    case 'in_progress':
      return 'bg-purple-500/10 text-purple-600';
    case 'missed':
    case 'no_answer':
      return 'bg-red-500/10 text-red-600';
    case 'cancelled':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const SharedStats = ({ studentId }: { studentId: string }) => {
  const { teacher, roles } = useAuth();
  const isAdmin = roles.includes('admin');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['shared-stats', teacher?.id, studentId, isAdmin],
    queryFn: async () => {
      // If admin, we can show overall stats or specific stats for any teacher
      // For now, let's just make it robust to missing teacher id
      const targetTeacherId = teacher?.id;
      if (!targetTeacherId && !isAdmin) return null;

      // 1. Shared Class Count
      let classCountQuery = supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'completed');

      if (targetTeacherId) {
        classCountQuery = classCountQuery.eq('teacher_id', targetTeacherId);
      }
      const { count: classCount } = await classCountQuery;

      // 2. Attendance %
      const missedCountQuery = supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .in('status', ['missed', 'no_answer']);

      const { count: missedCount } = await missedCountQuery;

      const totalScheduled = (classCount || 0) + (missedCount || 0);
      const attendanceRate = totalScheduled > 0
        ? Math.round(((classCount || 0) / totalScheduled) * 100)
        : 100;

      // 3. Course-wise count (using lessons history) - Changing to surah breakdown as course_level is not on lessons
      const { data: lessonsData } = await (supabase
        .from('lessons')
        .select('surah')
        .eq('teacher_id', teacher?.id || '')
        .eq('student_id', studentId));

      const lessons = lessonsData as { surah: string | null }[] | null;

      const courseCounts = lessons?.reduce((acc, curr) => {
        const surah = curr.surah || 'General';
        acc[surah] = (acc[surah] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        classCount: classCount || 0,
        attendanceRate,
        courseCounts
      };
    },
    enabled: !!teacher?.id
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-muted/10 p-4 rounded-lg border border-border">
        <p className="text-sm font-medium text-muted-foreground">Classes with You</p>
        <p className="text-2xl font-bold mt-1">{stats?.classCount || 0}</p>
      </div>

      <div className="bg-muted/10 p-4 rounded-lg border border-border">
        <p className="text-sm font-medium text-muted-foreground">Attendance</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold">{stats?.attendanceRate || 100}%</p>
        </div>
      </div>

      <div className="bg-muted/10 p-4 rounded-lg border border-border">
        <p className="text-sm font-medium text-muted-foreground mb-2">Surah Breakdown</p>
        <div className="space-y-1">
          {Object.entries(stats?.courseCounts || {}).map(([surah, count]) => (
            <div key={surah} className="flex justify-between text-xs">
              <span className="capitalize">{surah}</span>
              <span className="font-medium bg-background px-1.5 rounded">{count}</span>
            </div>
          ))}
          {Object.keys(stats?.courseCounts || {}).length === 0 && (
            <p className="text-xs text-muted-foreground italic">No lessons recorded</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes('admin');
  const [notes, setNotes] = useState<string>('');
  const [notesEdited, setNotesEdited] = useState(false);

  const { data: student, isLoading: studentLoading } = useStudent(id);
  const { data: lessons, isLoading: lessonsLoading } = useStudentLessons(id);
  const { data: classes, isLoading: classesLoading } = useStudentClasses(id);
  const updateNotes = useUpdateStudentNotes();

  // Initialize notes when student data loads
  useState(() => {
    if (student?.notes && !notesEdited) {
      setNotes(student.notes);
    }
  });

  if (studentLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-medium">Student not found</h3>
        <Button variant="outline" onClick={() => navigate(isAdmin ? '/admin/students' : '/teacher/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  const initials = (student.full_name || '??')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveNotes = () => {
    updateNotes.mutate({ studentId: student.id, notes });
    setNotesEdited(false);
  };

  const scheduleDays = student.schedule_days?.join(', ') || 'Not set';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(isAdmin ? '/admin/students' : '/teacher/students')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Button>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={student.avatar_url || undefined} alt={student.full_name || 'Student Name'} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{student.full_name || 'Anonymous Student'}</h1>
            <Badge variant="outline" className={cn('capitalize', getStatusColor(student.status))}>
              {student.status || 'Unknown'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            {student.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {student.country}
              </span>
            )}
            <span>•</span>
            <span className="capitalize">{student.course_level || 'Beginner'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isAdmin && (
            <>
              <Button variant="outline" onClick={() => navigate(`/teacher/lessons/add?studentId=${student.id}`)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
              <Button>
                <Video className="h-4 w-4 mr-2" />
                Start Class
              </Button>
            </>
          )}
          {isAdmin && (
            <Button variant="outline" onClick={() => navigate(`/admin/messages?studentId=${student.id}`)}>
              <Mail className="h-4 w-4 mr-2" />
              Message Student
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Schedule */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium capitalize">{scheduleDays}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{student.schedule_time || 'Not set'}</span>
                  <span className="text-muted-foreground">
                    ({student.duration_minutes || 30} min)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{student.timezone || 'UTC'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressIndicator
                  currentJuzz={student.current_juzz || 1}
                  surah={student.current_surah}
                  size="md"
                />
              </CardContent>
            </Card>

            {/* Shared Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shared Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SharedStats studentId={student.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-4">
          {lessonsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !lessons?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No lessons recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {lesson.surah || 'Lesson'} {lesson.ayah_from && `(${lesson.ayah_from}-${lesson.ayah_to})`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                        </p>
                        {/* quran_subject removed as it is not in schema */}
                      </div>
                      <div className="text-right space-y-1">
                        {/* concentration removed as it is not in schema */}
                        {lesson.rating_progress && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Progress:</span>
                            <StarRating value={lesson.rating_progress} readOnly size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                    {lesson.comments && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {lesson.comments}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="mt-4">
          {classesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !classes?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes scheduled yet
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {cls.start_time ? format(new Date(cls.start_time), 'EEEE, MMM d, yyyy') : 'Date not set'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cls.start_time ? format(new Date(cls.start_time), 'HH:mm') : '--:--'} - {cls.end_time ? format(new Date(cls.end_time), 'HH:mm') : '--:--'}
                      </p>
                    </div>
                    <Badge className={cn('capitalize', getClassStatusColor(cls.status as unknown as string))}>
                      {(cls.status as unknown as string)?.replace('_', ' ') || 'scheduled'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Private Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add private notes about this student..."
                value={notes || student.notes || ''}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesEdited(true);
                }}
                rows={6}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Only visible to you
                </p>
                <Button
                  onClick={handleSaveNotes}
                  disabled={updateNotes.isPending || !notesEdited}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
