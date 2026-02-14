import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Calendar, Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceRecord {
  id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  created_at: string;
  classes: {
    title: string;
    scheduled_date: string;
  } | null;
}

export default function Attendance() {
  const { student } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!student?.id) return;

      try {
        const { data, error } = await supabase
          .from('attendance')
          .select(`
            id,
            status,
            notes,
            created_at,
            classes:class_id (
              title,
              scheduled_date
            )
          `)
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match interface if needed, relying on Supabase types mostly
        setAttendance(data as unknown as AttendanceRecord[]);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [student?.id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200', icon: CheckCircle };
      case 'absent': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200', icon: XCircle };
      case 'late': return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200', icon: Clock };
      case 'excused': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200', icon: AlertCircle };
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: ClipboardCheck };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Your class attendance record</p>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Your class attendance record</p>
      </div>

      {attendance.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Attendance Records</h3>
            <p className="text-muted-foreground">
              Your attendance history will appear here after attending classes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attendance.map((record) => {
            const config = getStatusConfig(record.status);
            const StatusIcon = config.icon;

            return (
              <Card key={record.id} className="transition-all hover:bg-muted/50">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${config.color.split(' ')[0]}`}>
                      <StatusIcon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{record.classes?.title || 'Unknown Class'}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {record.classes?.scheduled_date
                            ? format(new Date(record.classes.scheduled_date), 'MMM d, yyyy')
                            : 'Date unavailable'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {record.classes?.scheduled_date
                            ? format(new Date(record.classes.scheduled_date), 'h:mm a')
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {record.notes && (
                      <span className="text-sm text-muted-foreground italic hidden md:inline-block max-w-[200px] truncate">
                        "{record.notes}"
                      </span>
                    )}
                    <Badge variant="outline" className={`${config.color} capitalize px-3 py-1`}>
                      {record.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
