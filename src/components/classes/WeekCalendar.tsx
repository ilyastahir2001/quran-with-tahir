import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { Video, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClassWithStudent } from '@/hooks/useClasses';

interface WeekCalendarProps {
  weekStart: Date;
  classes: ClassWithStudent[];
  onStartCall: (classData: ClassWithStudent) => void;
  onScheduleRecovery: (classData: ClassWithStudent) => void;
  onDayClick?: (date: Date) => void;
}

interface DayViewProps {
  date: Date;
  classes: ClassWithStudent[];
  onStartCall: (classData: ClassWithStudent) => void;
  onScheduleRecovery: (classData: ClassWithStudent) => void;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30',
  in_progress: 'bg-green-100 border-green-300 dark:bg-green-900/30',
  completed: 'bg-muted',
  missed: 'bg-red-100 border-red-300 dark:bg-red-900/30',
  no_answer: 'bg-orange-100 border-orange-300 dark:bg-orange-900/30',
  cancelled: 'bg-muted',
};

export function WeekCalendar({ weekStart, classes, onStartCall, onScheduleRecovery, onDayClick }: WeekCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), i));

  const getClassesForDay = (date: Date) => {
    return classes.filter(c => isSameDay(new Date(c.scheduled_date), date));
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dayClasses = getClassesForDay(day);
        const dayIsToday = isToday(day);
        
        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-[120px] border rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors',
              dayIsToday && 'border-primary bg-primary/5'
            )}
            onClick={() => onDayClick?.(day)}
          >
            <div className={cn(
              'text-sm font-medium mb-2',
              dayIsToday && 'text-primary'
            )}>
              <div>{format(day, 'EEE')}</div>
              <div className="text-lg">{format(day, 'd')}</div>
            </div>
            <div className="space-y-1">
              {dayClasses.slice(0, 3).map((classData) => (
                <div
                  key={classData.id}
                  className={cn(
                    'text-xs p-1 rounded border truncate',
                    statusColors[classData.status || 'scheduled']
                  )}
                >
                  {classData.start_time} - {classData.student?.full_name}
                </div>
              ))}
              {dayClasses.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayClasses.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DayView({ date, classes, onStartCall, onScheduleRecovery }: DayViewProps) {
  const dayClasses = classes.filter(c => isSameDay(new Date(c.scheduled_date), date));

  return (
    <div className="space-y-3">
      <h3 className="font-medium">{format(date, 'EEEE, MMMM d')}</h3>
      {dayClasses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No classes scheduled for this day.</p>
      ) : (
        dayClasses.map((classData) => {
          const canStart = classData.status === 'scheduled';
          const canRecover = classData.status === 'missed' || classData.status === 'no_answer';
          
          return (
            <Card key={classData.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{classData.student?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{classData.start_time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={classData.status === 'completed' ? 'secondary' : 'outline'}>
                      {classData.status}
                    </Badge>
                    {canStart && (
                      <Button size="sm" onClick={() => onStartCall(classData)}>
                        <Video className="h-4 w-4" />
                      </Button>
                    )}
                    {canRecover && (
                      <Button size="sm" variant="outline" onClick={() => onScheduleRecovery(classData)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
