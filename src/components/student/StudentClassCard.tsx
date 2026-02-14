import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Video, Calendar, RefreshCw, BookOpen } from 'lucide-react';
import { format, parseISO, differenceInMinutes, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { StudentClass } from '@/hooks/useStudentClasses';

interface StudentClassCardProps {
  classData: StudentClass;
  compact?: boolean;
  showCountdown?: boolean;
}

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'outline' as const, color: 'text-blue-600' },
  in_progress: { label: 'In Progress', variant: 'default' as const, color: 'text-green-600' },
  completed: { label: 'Completed', variant: 'secondary' as const, color: 'text-muted-foreground' },
  missed: { label: 'Missed', variant: 'destructive' as const, color: 'text-destructive' },
  no_answer: { label: 'No Answer', variant: 'destructive' as const, color: 'text-destructive' },
  cancelled: { label: 'Cancelled', variant: 'outline' as const, color: 'text-muted-foreground' },
};

export function StudentClassCard({ classData, compact = false, showCountdown = false }: StudentClassCardProps) {
  const navigate = useNavigate();
  const status = classData.status || 'scheduled';
  const config = statusConfig[status];

  const teacherName = classData.teacher?.full_name || 'Unknown Teacher';
  const teacherInitials = teacherName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate countdown for today's classes
  const getCountdown = () => {
    if (!showCountdown || status !== 'scheduled') return null;

    const classDate = parseISO(classData.scheduled_date);
    if (!isSameDay(classDate, new Date())) return null;

    const [hours, minutes] = classData.start_time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    const diff = differenceInMinutes(classTime, new Date());

    if (diff <= 15) return null; // Don't show countdown if within 15 mins (Join Early window)
    if (diff < 60) return `Starts in ${diff} min`;
    if (diff < 120) return `Starts in ${Math.floor(diff / 60)} hr ${diff % 60} min`;
    return `Starts in ${Math.floor(diff / 60)} hours`;
  };

  const countdown = getCountdown();

  // Check if class is joinable (started or within 15 mins of start)
  const isJoinable = (() => {
    if (status === 'in_progress') return true;
    if (status !== 'scheduled') return false;

    // Parse date and time
    const classDate = parseISO(classData.scheduled_date);
    if (!isSameDay(classDate, new Date())) return false;

    const [hours, minutes] = classData.start_time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    // Allow joining 15 minutes early
    const diff = differenceInMinutes(classTime, new Date());
    return diff <= 15;
  })();

  const handleJoinClass = () => {
    // Navigate to student classroom
    navigate(`/virtual-class/${classData.id}?autoJoin=${status === 'in_progress'}`);
  };

  if (compact) {
    return (
      <div className="p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium">{classData.start_time.slice(0, 5)}</span>
            <span className="text-xs text-muted-foreground truncate">{teacherName}</span>
          </div>
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={classData.teacher?.avatar_url || undefined} />
              <AvatarFallback>{teacherInitials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium truncate">{teacherName}</h4>
                {classData.is_recovery && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Recovery
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(parseISO(classData.scheduled_date), 'EEE, MMM d')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{classData.start_time.slice(0, 5)}</span>
                  {classData.duration_minutes && (
                    <span className="text-xs">({classData.duration_minutes} min)</span>
                  )}
                </div>
              </div>

              {countdown && (
                <p className="mt-2 text-sm font-medium text-primary">{countdown}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={config.variant}>{config.label}</Badge>

            {(status === 'scheduled' || status === 'in_progress') && (
              <Button
                size="sm"
                onClick={handleJoinClass}
                disabled={!isJoinable}
                variant={status === 'in_progress' ? 'default' : (isJoinable ? 'secondary' : 'outline')}
              >
                <Video className="h-4 w-4 mr-1" />
                {status === 'in_progress' ? 'Join Class' : (isJoinable ? 'Join Early' : 'Scheduled')}
              </Button>
            )}

            {status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/student/lessons')}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                View Lesson
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
