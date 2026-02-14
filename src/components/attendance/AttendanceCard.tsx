import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit2, Eye } from 'lucide-react';
import type { AttendanceWithDetails } from '@/hooks/useAttendance';

interface AttendanceCardProps {
  attendance: AttendanceWithDetails;
  onEdit?: (attendance: AttendanceWithDetails) => void;
  onViewClass?: (classId: string) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  present: { label: 'Present', variant: 'default' },
  absent: { label: 'Absent', variant: 'destructive' },
  late: { label: 'Late', variant: 'secondary' },
  leave: { label: 'Leave', variant: 'outline' },
  no_answer: { label: 'No Answer', variant: 'secondary' },
};

export function AttendanceCard({ attendance, onEdit, onViewClass }: AttendanceCardProps) {
  const config = statusConfig[attendance.status] || statusConfig.present;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {attendance.student?.full_name || 'Unknown Student'}
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{format(new Date(attendance.recorded_at), 'PPp')}</span>
          <div className="flex gap-1">
            {onViewClass && attendance.class_id && (
              <Button variant="ghost" size="sm" onClick={() => onViewClass(attendance.class_id)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(attendance)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {attendance.note && (
          <p className="mt-2 text-sm text-muted-foreground">{attendance.note}</p>
        )}
      </CardContent>
    </Card>
  );
}
