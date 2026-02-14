import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Video, Calendar, RefreshCw } from 'lucide-react';
import type { ClassWithStudent } from '@/hooks/useClasses';

interface ClassCardProps {
  classData: ClassWithStudent;
  onStartCall?: (classData: ClassWithStudent) => void;
  onScheduleRecovery?: (classData: ClassWithStudent) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Scheduled', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  missed: { label: 'Missed', variant: 'destructive' },
  no_answer: { label: 'No Answer', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

export function ClassCard({ classData, onStartCall, onScheduleRecovery }: ClassCardProps) {
  const config = statusConfig[classData.status || 'scheduled'] || statusConfig.scheduled;
  const canStartCall = classData.status === 'scheduled';
  const canScheduleRecovery = classData.status === 'missed' || classData.status === 'no_answer';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {classData.student?.full_name || 'Unknown Student'}
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(classData.scheduled_date), 'PPP')} at {classData.start_time}
          </span>
        </div>
        {classData.is_recovery && (
          <Badge variant="outline" className="mb-3">Recovery Class</Badge>
        )}
        <div className="flex gap-2">
          {canStartCall && onStartCall && (
            <Button size="sm" onClick={() => onStartCall(classData)}>
              <Video className="h-4 w-4 mr-1" />
              Start Call
            </Button>
          )}
          {canScheduleRecovery && onScheduleRecovery && (
            <Button size="sm" variant="outline" onClick={() => onScheduleRecovery(classData)}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Schedule Recovery
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
