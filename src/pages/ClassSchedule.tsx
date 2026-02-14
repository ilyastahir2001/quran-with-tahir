import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid,
} from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameWeek } from 'date-fns';
import { useWeeklyClasses } from '@/hooks/useClasses';
import { WeekCalendar, DayView } from '@/components/classes/WeekCalendar';
import { RecoveryClassDialog } from '@/components/classes/RecoveryClassDialog';
import { ClassCard } from '@/components/classes/ClassCard';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ClassWithStudent } from '@/hooks/useClasses';

export default function ClassSchedule() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const today = new Date();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(today, { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(today);
  const [viewMode, setViewMode] = useState<'week' | 'day'>(isMobile ? 'day' : 'week');
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudent | null>(null);

  const { data: classes = [], isLoading } = useWeeklyClasses(currentWeek);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
    setSelectedDay(subWeeks(selectedDay, 7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
    setSelectedDay(addWeeks(selectedDay, 7));
  };

  const handleToday = () => {
    setCurrentWeek(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDay(today);
  };

  const handlePreviousDay = () => {
    const newDay = addDays(selectedDay, -1);
    setSelectedDay(newDay);
    if (!isSameWeek(newDay, currentWeek, { weekStartsOn: 1 })) {
      setCurrentWeek(startOfWeek(newDay, { weekStartsOn: 1 }));
    }
  };

  const handleNextDay = () => {
    const newDay = addDays(selectedDay, 1);
    setSelectedDay(newDay);
    if (!isSameWeek(newDay, currentWeek, { weekStartsOn: 1 })) {
      setCurrentWeek(startOfWeek(newDay, { weekStartsOn: 1 }));
    }
  };

  const handleScheduleRecovery = (classData: ClassWithStudent) => {
    setSelectedClass(classData);
    setRecoveryDialogOpen(true);
  };

  const handleStartCall = (classData: ClassWithStudent) => {
    navigate(`/virtual-class/${classData.id}`);
  };

  const weekEnd = addDays(currentWeek, 6);
  const weekLabel = `${format(currentWeek, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const isCurrentWeek = isSameWeek(today, currentWeek, { weekStartsOn: 1 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground">
            View your weekly class schedule
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')}>
          <List className="w-4 h-4 mr-2" />
          View All Classes
        </Button>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {viewMode === 'week' ? (
                <>
                  <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant={isCurrentWeek ? 'default' : 'outline'}
                size="sm"
                onClick={handleToday}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold hidden sm:block">{weekLabel}</h2>

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode('week')}
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode('day')}
                >
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Day
                </Button>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-3 sm:hidden">{weekLabel}</h2>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {isLoading ? (
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      ) : viewMode === 'week' ? (
        <WeekCalendar
          weekStart={currentWeek}
          classes={classes}
          onScheduleRecovery={handleScheduleRecovery}
          onStartCall={handleStartCall}
        />
      ) : (
        <DayView
          date={selectedDay}
          classes={classes}
          onScheduleRecovery={handleScheduleRecovery}
          onStartCall={handleStartCall}
        />
      )}

      {/* Day Selector for Day View */}
      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(currentWeek, i);
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                const dayClasses = classes.filter(
                  c => c.scheduled_date === format(day, 'yyyy-MM-dd')
                );

                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? 'default' : 'outline'}
                    className="flex-col h-auto py-2 px-4 min-w-[60px]"
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="text-xs uppercase">{format(day, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(day, 'd')}</span>
                    {dayClasses.length > 0 && (
                      <span className="text-xs mt-1">
                        {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Dialog */}
      <RecoveryClassDialog
        open={recoveryDialogOpen}
        onOpenChange={setRecoveryDialogOpen}
        originalClass={selectedClass}
      />
    </div>
  );
}
