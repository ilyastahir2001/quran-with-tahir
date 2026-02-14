import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { useWeeklyClasses } from '@/hooks/useStudentClasses';
import { StudentClassCard } from '@/components/student/StudentClassCard';

export default function MySchedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: classes, isLoading } = useWeeklyClasses(weekOffset);

  const baseDate = new Date();
  const currentWeekStart = weekOffset === 0 
    ? startOfWeek(baseDate, { weekStartsOn: 1 })
    : startOfWeek(addWeeks(baseDate, weekOffset), { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getClassesForDay = (day: Date) => {
    return classes?.filter(cls => isSameDay(parseISO(cls.scheduled_date), day)) || [];
  };

  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
        <p className="text-muted-foreground">Your weekly class schedule</p>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <CardTitle className="text-lg">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </CardTitle>
              {weekOffset !== 0 && (
                <Button variant="link" size="sm" onClick={goToCurrentWeek} className="text-xs">
                  Back to this week
                </Button>
              )}
            </div>
            
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Week Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop: Week Grid */}
          <div className="hidden md:grid md:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayClasses = getClassesForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={day.toISOString()} className={isToday ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="p-3 pb-2">
                    <div className={`text-center ${isToday ? 'text-primary font-bold' : ''}`}>
                      <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                      <p className="text-lg font-medium">{format(day, 'd')}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 space-y-2">
                    {dayClasses.length > 0 ? (
                      dayClasses.map((cls) => (
                        <StudentClassCard key={cls.id} classData={cls} compact />
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">No classes</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile: Day List */}
          <div className="md:hidden space-y-4">
            {weekDays.map((day) => {
              const dayClasses = getClassesForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={day.toISOString()} className={isToday ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-base ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'EEEE, MMM d')}
                      {isToday && <span className="ml-2 text-xs font-normal">(Today)</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {dayClasses.length > 0 ? (
                      dayClasses.map((cls) => (
                        <StudentClassCard key={cls.id} classData={cls} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && (!classes || classes.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Classes This Week</h3>
            <p className="text-muted-foreground">
              Your schedule will appear here once you connect with a teacher
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
