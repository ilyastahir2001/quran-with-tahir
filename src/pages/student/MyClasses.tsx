import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookCheck, AlertCircle, CalendarCheck } from 'lucide-react';
import { useStudentClasses, useClassStats } from '@/hooks/useStudentClasses';
import { StudentClassCard } from '@/components/student/StudentClassCard';

type ClassFilter = 'all' | 'upcoming' | 'completed' | 'missed';

export default function MyClasses() {
  const [filter, setFilter] = useState<ClassFilter>('all');
  const { data: classes, isLoading } = useStudentClasses({ filter });
  const { data: stats } = useClassStats();

  const statCards = [
    { label: 'Total Classes', value: stats?.total || 0, icon: GraduationCap, color: 'text-primary' },
    { label: 'Completed', value: stats?.completed || 0, icon: BookCheck, color: 'text-green-600' },
    { label: 'Upcoming', value: stats?.upcoming || 0, icon: CalendarCheck, color: 'text-blue-600' },
    { label: 'Missed', value: stats?.missed || 0, icon: AlertCircle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">Your class history and upcoming sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ClassFilter)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : classes && classes.length > 0 ? (
            <div className="space-y-4">
              {classes.map((cls) => (
                <StudentClassCard key={cls.id} classData={cls} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">
                  {filter === 'all' && 'No Classes Yet'}
                  {filter === 'upcoming' && 'No Upcoming Classes'}
                  {filter === 'completed' && 'No Completed Classes'}
                  {filter === 'missed' && 'No Missed Classes'}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Your class history will appear here once you start taking lessons'
                    : `You don't have any ${filter} classes`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
