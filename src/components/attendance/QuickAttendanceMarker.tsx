import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Loader2, Users } from 'lucide-react';
import type { AttendanceStatus } from '@/types/database';

interface ClassNeedingAttendance {
  id: string;
  student_id: string;
  student?: { full_name?: string | null } | null;
  start_time: string;
}

interface QuickAttendanceMarkerProps {
  classes?: ClassNeedingAttendance[];
  isLoading?: boolean;
  onMarkAttendance: (classId: string, studentId: string, status: AttendanceStatus) => void;
  onMarkAllPresent?: () => void;
}

export function QuickAttendanceMarker({
  classes,
  isLoading,
  onMarkAttendance,
  onMarkAllPresent
}: QuickAttendanceMarkerProps) {
  const [selectedClass, setSelectedClass] = React.useState<string>('');
  const [status, setStatus] = React.useState<AttendanceStatus>('present');

  const handleMark = () => {
    const classData = classes?.find(c => c.id === selectedClass);
    if (classData) {
      onMarkAttendance(classData.id, classData.student_id, status);
      setSelectedClass('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No classes need attendance marking right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Mark Attendance
          </CardTitle>
          {onMarkAllPresent && classes.length > 1 && (
            <Button variant="outline" size="sm" onClick={onMarkAllPresent}>
              Mark All Present
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.student?.full_name || 'Unknown'} - {c.start_time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleMark} disabled={!selectedClass}>
            Mark
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
