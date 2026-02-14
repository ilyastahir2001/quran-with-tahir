import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Phone,
  PlayCircle,
  FileText,
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  PhoneOff,
  RefreshCw,
} from 'lucide-react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TodayClass, ClassStatus } from '@/types/database';
import { cn } from '@/lib/utils';
import { differenceInMinutes, parseISO, isSameDay } from 'date-fns';
import { CancelClassDialog } from '@/components/classes/CancelClassDialog';
import type { ClassCancellationReason } from '@/types/database';

const statusConfig: Record<ClassStatus, { label: string; className: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', className: 'status-scheduled', icon: Clock },
  in_progress: { label: 'In Progress', className: 'status-in-progress', icon: PlayCircle },
  completed: { label: 'Completed', className: 'status-completed', icon: CheckCircle2 },
  missed: { label: 'Missed', className: 'status-missed', icon: XCircle },
  no_answer: { label: 'No Answer', className: 'status-no-answer', icon: PhoneOff },
  cancelled: { label: 'Cancelled', className: 'status-missed', icon: XCircle },
  on_leave: { label: 'On Leave', className: 'status-on-leave', icon: Calendar },
};

export default function TodayClasses() {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>(
    (searchParams.get('filter') as ClassStatus) || 'all'
  );

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedClassForCancel, setSelectedClassForCancel] = useState<TodayClass | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: classes, isLoading, refetch } = useQuery({
    queryKey: ['today-classes', teacher?.id, today],
    queryFn: async (): Promise<TodayClass[]> => {
      if (!teacher?.id) return [];

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          student:students(*)
        `)
        .eq('teacher_id', teacher.id)
        .eq('scheduled_date', today)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data || []) as TodayClass[];
    },
    enabled: !!teacher?.id,
  });

  const updateClassStatus = useMutation({
    mutationFn: async ({
      classId,
      status,
      reason,
      notes
    }: {
      classId: string;
      status: ClassStatus;
      reason?: ClassCancellationReason;
      notes?: string
    }) => {
      const { error } = await supabase
        .from('classes')
        .update({
          status,
          ...(status === 'in_progress' ? { actual_start_time: new Date().toISOString() } : {}),
          ...(status === 'completed' ? { actual_end_time: new Date().toISOString() } : {}),
          ...(reason ? { cancellation_reason: reason } : {}),
          ...(notes ? { notes } : {}),
        } as Database['public']['Tables']['classes']['Update'] & { cancellation_reason?: ClassCancellationReason })
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-classes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleCall = async (cls: TodayClass) => {
    // Navigate to video classroom
    navigate(`/virtual-class/${cls.id}?autoStart=true`);
  };

  const handleStartClass = async (cls: TodayClass) => {
    // Navigate to classroom and start video call
    navigate(`/virtual-class/${cls.id}?autoStart=true`);
  };

  const handleEndClass = async (cls: TodayClass) => {
    try {
      await updateClassStatus.mutateAsync({ classId: cls.id, status: 'completed' });
      toast.success('Class completed!');
      // Would open Quick Lesson modal here
      navigate(`/teacher/lessons/add?classId=${cls.id}`);
    } catch (error) {
      toast.error('Failed to end class');
    }
  };

  const handleMarkNoAnswer = (cls: TodayClass) => {
    setSelectedClassForCancel(cls);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async (reason: ClassCancellationReason, notes?: string) => {
    if (!selectedClassForCancel) return;

    try {
      const status = reason === 'student_absent' ? 'missed' : 'cancelled';
      await updateClassStatus.mutateAsync({
        classId: selectedClassForCancel.id,
        status: status,
        reason,
        notes
      });
      toast.success('Class status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getCountdown = (cls: TodayClass) => {
    if (cls.status !== 'scheduled') return null;

    // Parse date and time (assuming today's classes)
    const [hours, minutes] = cls.start_time.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    const diff = differenceInMinutes(classTime, new Date());

    if (diff <= 0) return null; // Already started or late
    if (diff <= 15) return `Starts in ${diff} min`; // Highlight imminent start
    if (diff < 60) return `In ${diff} min`;
    return null; // Don't show for far future
  };

  const filteredClasses = classes?.filter((cls) => {
    const matchesSearch = cls.student?.full_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Today's Classes</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search students by name"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === 'all' ? 'All Status' : statusConfig[statusFilter].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Status
            </DropdownMenuItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as ClassStatus)}>
                <config.icon className="mr-2 h-4 w-4" />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Class List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClasses && filteredClasses.length > 0 ? (
        <div className="space-y-3">
          {filteredClasses.map((cls) => {
            const status = statusConfig[cls.status];
            const StatusIcon = status.icon;
            return (
              <Card key={cls.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={cls.student?.avatar_url || undefined}
                          alt={cls.student?.full_name || 'Student Name'}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {cls.student?.full_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{cls.student?.full_name || 'Anonymous Student'}</h3>
                          {cls.student?.country_code && (
                            <span className="text-lg">{cls.student.country_code}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {cls.student?.course_level}
                          </Badge>
                          <span>•</span>
                          <span>{formatTime(cls.start_time)}</span>
                          <span>•</span>
                          <span>{(cls.duration_minutes || 0)} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Lesson Added */}
                    <div className="flex items-center gap-3">
                      <div className={cn('status-pill', status.className)}>
                        <StatusIcon className="h-3.5 w-3.5 mr-1" />
                        {status.label}
                      </div>
                      {getCountdown(cls) && (
                        <Badge variant="outline" className="animate-pulse text-amber-600 border-amber-200 bg-amber-50">
                          <Clock className="h-3 w-3 mr-1" />
                          {getCountdown(cls)}
                        </Badge>
                      )}
                      {cls.lesson_added && (
                        <Badge variant="outline" className="text-success border-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Lesson Added
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {(cls.status === 'scheduled' || cls.status === 'no_answer') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCall(cls)}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </Button>
                          <Button size="sm" onClick={() => handleStartClass(cls)}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </>
                      )}
                      {cls.status === 'in_progress' && (
                        <Button size="sm" variant="destructive" onClick={() => handleEndClass(cls)}>
                          End Class
                        </Button>
                      )}
                      {cls.status === 'completed' && !cls.lesson_added && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/teacher/lessons/add?classId=${cls.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/teacher/students/${cls.student_id}`)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/teacher/lessons/add?classId=${cls.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Add Lesson
                          </DropdownMenuItem>
                          {cls.status === 'scheduled' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleMarkNoAnswer(cls)}
                                className="text-destructive"
                              >
                                <PhoneOff className="mr-2 h-4 w-4" />
                                Mark No Answer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedClassForCancel(cls);
                                  setCancelDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Class
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No classes found</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "You don't have any classes scheduled for today"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}


      <CancelClassDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        title="Class Exception"
      />
    </div>
  );
}
