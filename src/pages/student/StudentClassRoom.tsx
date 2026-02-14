import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudentVideoRoom } from '@/components/video/StudentVideoRoom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface TeacherProfile {
  full_name: string;
  avatar_url: string | null;
}

interface TeacherWithProfile {
  id: string;
  profile: TeacherProfile;
}

interface ClassWithTeacher {
  id: string;
  student_id: string;
  teacher_id: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number | null;
  status: string | null;
  call_room_url: string | null;
  call_room_id: string | null;
  teacher: TeacherWithProfile;
}

export default function StudentClassRoom() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoJoin = searchParams.get('autoJoin') === 'true';
  const { student, profile } = useAuth();

  const { data: classData, isLoading, error } = useQuery({
    queryKey: ['student-class-details', classId],
    queryFn: async (): Promise<ClassWithTeacher | null> => {
      if (!classId) return null;

      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          student_id,
          teacher_id,
          scheduled_date,
          start_time,
          duration_minutes,
          status,
          call_room_url,
          call_room_id,
          teacher:teachers!inner(
            id,
            profile:profiles!inner(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;
      return data as unknown as ClassWithTeacher;
    },
    enabled: !!classId,
    refetchInterval: (query) => {
      // Poll for room URL if class is in_progress but no room URL yet
      const data = query.state.data;
      if (data?.status === 'in_progress' && !data?.call_room_url) {
        return 2000;
      }
      return false;
    },
  });

  const handleCallEnd = () => {
    navigate('/student/today');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Skeleton className="w-full h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Class Not Found</h1>
          <p className="text-muted-foreground">
            The class you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate('/student/today')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  if (!student?.id || !profile?.full_name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to access the video classroom.
          </p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Verify this class belongs to the student
  if (classData.student_id !== student.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this class.
          </p>
          <Button onClick={() => navigate('/student/today')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const teacherProfile = classData.teacher?.profile as TeacherProfile;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/today')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Video Classroom</h1>
            <p className="text-sm text-muted-foreground">
              Session with {teacherProfile?.full_name || 'your teacher'}
            </p>
          </div>
        </div>

        {/* Video Room */}
        <div className="h-[calc(100vh-140px)] min-h-[500px]">
          <StudentVideoRoom
            classId={classData.id}
            studentId={student.id}
            studentName={profile.full_name}
            roomUrl={classData.call_room_url}
            teacher={{
              name: teacherProfile?.full_name || 'Teacher Profile',
              avatar_url: teacherProfile?.avatar_url || undefined,
            }}
            onCallEnd={handleCallEnd}
            autoJoin={autoJoin}
          />
        </div>
      </div>
    </div>
  );
}
