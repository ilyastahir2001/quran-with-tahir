import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTodayClasses } from '@/hooks/useStudentClasses';
import { StudentClassCard } from '@/components/student/StudentClassCard';

export default function TodayClasses() {
  const { data: classes, isLoading, error } = useTodayClasses();
  const today = new Date();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Today's Classes</h1>
          <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Failed to load classes. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Today's Classes</h1>
        <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="space-y-4">
          {classes.map((cls) => (
            <StudentClassCard 
              key={cls.id} 
              classData={cls} 
              showCountdown 
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Classes Today</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any classes scheduled for today
            </p>
            <Button variant="outline" asChild>
              <Link to="/student/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                View My Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
